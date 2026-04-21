import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Prisma, InvoiceStatus, PaymentMethod } from '~/generated/prisma/client';
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
            update: vi.fn(),
            ...overrides.order,
        },
        invoicePayment: {
            create: vi.fn(),
            ...overrides.invoicePayment,
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
