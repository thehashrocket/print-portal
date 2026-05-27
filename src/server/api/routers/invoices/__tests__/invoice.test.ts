import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Prisma, InvoiceStatus, OrderStatus, PaymentMethod } from '~/generated/prisma/client';
import { generateInvoiceNumber, formatItemDescription } from '../invoice';
import { createCallerFactory } from '~/server/api/trpc';
import { invoiceRouter } from '../invoice';
import { TRPCError } from '@trpc/server';

vi.mock('~/utils/dataNormalization', () => ({
    normalizeInvoice: vi.fn((inv: any) => inv),
    normalizeInvoicePayment: vi.fn((p: any) => ({ id: p.id, invoiceId: p.invoiceId, amount: p.amount.toNumber() })),
}));

const createCaller = createCallerFactory(invoiceRouter);

const mockSession = {
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    expires: '2099-01-01',
};

function makeDb(overrides: Record<string, any> = {}) {
    return {
        invoice: {
            findFirst: vi.fn().mockResolvedValue(null),
            findMany: vi.fn().mockResolvedValue([]),
            findUnique: vi.fn().mockResolvedValue(null),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            ...overrides.invoice,
        },
        order: {
            findUnique: vi.fn().mockResolvedValue(null),
            findUniqueOrThrow: vi.fn().mockResolvedValue({ status: 'Pending' }),
            update: vi.fn(),
            ...overrides.order,
        },
        invoicePayment: {
            create: vi.fn(),
            ...overrides.invoicePayment,
        },
        orderVersion: {
            create: vi.fn().mockResolvedValue({}),
            ...overrides.orderVersion,
        },
    };
}

// ─── generateInvoiceNumber ───────────────────────────────────────────────────

describe('generateInvoiceNumber', () => {
    const year = new Date().getFullYear();

    it('generates INV-YYYY-00001 when no prior invoices exist', async () => {
        const ctx = { db: { invoice: { findFirst: vi.fn().mockResolvedValue(null) } } };
        const result = await generateInvoiceNumber(ctx);
        expect(result).toBe(`INV-${year}-00001`);
    });

    it('increments from the last invoice number', async () => {
        const ctx = {
            db: {
                invoice: {
                    findFirst: vi.fn().mockResolvedValue({ invoiceNumber: `INV-${year}-00042` }),
                },
            },
        };
        const result = await generateInvoiceNumber(ctx);
        expect(result).toBe(`INV-${year}-00043`);
    });

    it('pads the sequence number to 5 digits', async () => {
        const ctx = {
            db: {
                invoice: {
                    findFirst: vi.fn().mockResolvedValue({ invoiceNumber: `INV-${year}-00009` }),
                },
            },
        };
        const result = await generateInvoiceNumber(ctx);
        expect(result).toBe(`INV-${year}-00010`);
    });
});

// ─── formatItemDescription ───────────────────────────────────────────────────

describe('formatItemDescription', () => {
    it('returns the base description when no extra fields are present', () => {
        const result = formatItemDescription({ description: 'Business cards' });
        expect(result).toBe('Business cards');
    });

    it('appends paper stock details', () => {
        const item = {
            description: 'Flyer',
            OrderItemStock: [
                { PaperProduct: { brand: 'Sappi', paperType: 'Coated', finish: 'Gloss', weightLb: 100 } },
            ],
        };
        const result = formatItemDescription(item);
        expect(result).toContain('Paper: Sappi Coated Gloss 100 lbs');
    });

    it('appends processing, typesetting, and quantity', () => {
        const item = {
            description: 'Postcard',
            OrderItemStock: [],
            ProcessingOptions: [{ description: 'Die cut' }],
            Typesetting: [{ description: 'Full layout' }],
            quantity: 500,
        };
        const result = formatItemDescription(item);
        expect(result).toContain('Processing: Die cut');
        expect(result).toContain('Typesetting: Full layout');
        expect(result).toContain('Quantity: 500');
    });
});

// ─── invoice router: create ──────────────────────────────────────────────────

describe('invoiceRouter.create — OrderVersion', () => {
    const baseInput = {
        orderId: 'order-1',
        dateIssued: new Date('2026-01-01'),
        dateDue: new Date('2026-02-01'),
        subtotal: 100,
        taxRate: 0.08,
        taxAmount: 8,
        total: 108,
        status: InvoiceStatus.Sent,
        items: [],
    };

    it('creates an OrderVersion record with newStatus Invoiced', async () => {
        const mockOrder = { id: 'order-1', status: OrderStatus.Pending, OrderItems: [] };
        const mockInvoice = { id: 'inv-1', InvoiceItems: [], InvoicePayments: [], Order: { Office: { Company: {} } }, createdBy: {} };
        const db = makeDb({
            order: {
                findUnique: vi.fn().mockResolvedValue(mockOrder),
                findUniqueOrThrow: vi.fn().mockResolvedValue({ status: OrderStatus.Pending }),
                update: vi.fn().mockResolvedValue(mockOrder),
            },
            invoice: { create: vi.fn().mockResolvedValue(mockInvoice) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.create(baseInput);

        expect(db.orderVersion.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    orderId: 'order-1',
                    changedById: 'user-1',
                    previousStatus: OrderStatus.Pending,
                    newStatus: OrderStatus.Invoiced,
                }),
            }),
        );
    });

    it('throws NOT_FOUND when the order does not exist', async () => {
        const notFound = new TRPCError({ code: 'NOT_FOUND', message: 'Record not found' });
        const db = makeDb({
            order: { findUniqueOrThrow: vi.fn().mockRejectedValue(notFound) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await expect(caller.create(baseInput)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
});

// ─── invoice router: create (InvoiceItems mapping) ──────────────────────────

describe('invoiceRouter.create — InvoiceItems mapping', () => {
    const baseInput = {
        orderId: 'order-1',
        dateIssued: new Date('2026-01-01'),
        dateDue: new Date('2026-02-01'),
        subtotal: 100,
        taxRate: 0.08,
        taxAmount: 8,
        total: 108,
        status: InvoiceStatus.Sent,
        items: [],
    };

    const mockInvoice = {
        id: 'inv-1',
        InvoiceItems: [],
        InvoicePayments: [],
        Order: { Office: { Company: {} } },
        createdBy: {},
    };

    it('maps OrderItems to InvoiceItems with calculated unitPrice', async () => {
        const mockOrderItem = { id: 'item-1', description: 'Business Cards', quantity: 10, amount: new Prisma.Decimal(100) };
        const mockOrder = { id: 'order-1', status: OrderStatus.Pending, OrderItems: [mockOrderItem] };

        const db = makeDb({
            order: {
                findUnique: vi.fn().mockResolvedValue(mockOrder),
                findUniqueOrThrow: vi.fn().mockResolvedValue({ status: OrderStatus.Pending }),
                update: vi.fn().mockResolvedValue(mockOrder),
            },
            invoice: { create: vi.fn().mockResolvedValue(mockInvoice) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.create(baseInput);

        expect(db.invoice.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    InvoiceItems: {
                        create: expect.arrayContaining([
                            expect.objectContaining({
                                quantity: 10,
                                unitPrice: 10,
                                total: 100,
                            }),
                        ]),
                    },
                }),
            }),
        );
    });

    it('uses amount as unitPrice when quantity is 0 (avoids division by zero)', async () => {
        const mockOrderItem = { id: 'item-1', description: 'Setup Fee', quantity: 0, amount: new Prisma.Decimal(50) };
        const mockOrder = { id: 'order-1', status: OrderStatus.Pending, OrderItems: [mockOrderItem] };

        const db = makeDb({
            order: {
                findUnique: vi.fn().mockResolvedValue(mockOrder),
                findUniqueOrThrow: vi.fn().mockResolvedValue({ status: OrderStatus.Pending }),
                update: vi.fn().mockResolvedValue(mockOrder),
            },
            invoice: { create: vi.fn().mockResolvedValue(mockInvoice) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.create(baseInput);

        expect(db.invoice.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    InvoiceItems: {
                        create: expect.arrayContaining([
                            expect.objectContaining({ unitPrice: 50 }),
                        ]),
                    },
                }),
            }),
        );
    });

    it('creates invoice with empty InvoiceItems when order has no OrderItems', async () => {
        const mockOrder = { id: 'order-1', status: OrderStatus.Pending, OrderItems: [] };

        const db = makeDb({
            order: {
                findUnique: vi.fn().mockResolvedValue(mockOrder),
                findUniqueOrThrow: vi.fn().mockResolvedValue({ status: OrderStatus.Pending }),
                update: vi.fn().mockResolvedValue(mockOrder),
            },
            invoice: { create: vi.fn().mockResolvedValue(mockInvoice) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.create(baseInput);

        expect(db.invoice.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    InvoiceItems: { create: [] },
                }),
            }),
        );
    });
});

// ─── invoice router: addPayment ──────────────────────────────────────────────

describe('invoiceRouter.addPayment', () => {
    const invoiceId = 'inv-1';
    const baseInput = {
        invoiceId,
        amount: 100,
        paymentDate: new Date('2026-01-15'),
        paymentMethod: PaymentMethod.CreditCard,
    };

    it('sets status to Paid when totalPaid meets the invoice total', async () => {
        const mockPayment = { id: 'pay-1', invoiceId, amount: new Prisma.Decimal(100) };
        const mockInvoice = {
            id: invoiceId,
            total: new Prisma.Decimal(100),
            InvoicePayments: [{ amount: new Prisma.Decimal(100) }],
        };

        const db = makeDb({
            invoicePayment: { create: vi.fn().mockResolvedValue(mockPayment) },
            invoice: {
                findUnique: vi.fn().mockResolvedValue(mockInvoice),
                update: vi.fn().mockResolvedValue(mockInvoice),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.addPayment(baseInput);

        expect(db.invoice.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { status: InvoiceStatus.Paid } }),
        );
    });

    it('sets status to Sent when totalPaid is less than the invoice total', async () => {
        const mockPayment = { id: 'pay-1', invoiceId, amount: new Prisma.Decimal(50) };
        const mockInvoice = {
            id: invoiceId,
            total: new Prisma.Decimal(100),
            InvoicePayments: [{ amount: new Prisma.Decimal(50) }],
        };

        const db = makeDb({
            invoicePayment: { create: vi.fn().mockResolvedValue(mockPayment) },
            invoice: {
                findUnique: vi.fn().mockResolvedValue(mockInvoice),
                update: vi.fn().mockResolvedValue(mockInvoice),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.addPayment({ ...baseInput, amount: 50 });

        expect(db.invoice.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { status: InvoiceStatus.Sent } }),
        );
    });
});

// ─── invoice router: getById ─────────────────────────────────────────────────

describe('invoiceRouter.getById', () => {
    it('throws NOT_FOUND when the invoice does not exist', async () => {
        const db = makeDb({ invoice: { findUnique: vi.fn().mockResolvedValue(null) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await expect(caller.getById('nonexistent-id')).rejects.toMatchObject({
            code: 'NOT_FOUND',
        });
    });
});
