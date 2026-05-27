import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { createCallerFactory } from '~/server/api/trpc';
import { qbInvoiceRouter } from '../qbInvoice';

vi.mock('~/services/quickbooksService', () => ({
    refreshTokenIfNeeded: vi.fn().mockResolvedValue('mock-access-token'),
}));

vi.mock('axios', () => {
    const mockFn = vi.fn();
    Object.assign(mockFn, {
        get: vi.fn(),
        post: vi.fn(),
        isAxiosError: vi.fn().mockReturnValue(false),
    });
    return { default: mockFn };
});

const createCaller = createCallerFactory(qbInvoiceRouter);

const mockSession = {
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    expires: '2099-01-01',
};

function makeDb(overrides: Record<string, any> = {}) {
    return {
        user: {
            findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: 'realm-1' }),
            ...overrides.user,
        },
        invoice: {
            findUnique: vi.fn().mockResolvedValue(null),
            update: vi.fn(),
            ...overrides.invoice,
        },
        order: {
            findUnique: vi.fn().mockResolvedValue(null),
            update: vi.fn(),
            ...overrides.order,
        },
        office: {
            findUnique: vi.fn().mockResolvedValue(null),
            findMany: vi.fn().mockResolvedValue([]),
            ...overrides.office,
        },
    };
}

// ─── createQbInvoiceFromInvoice ──────────────────────────────────────────────

describe('qbInvoiceRouter.createQbInvoiceFromInvoice', () => {
    beforeEach(() => vi.clearAllMocks());

    it('throws UNAUTHORIZED when user has no quickbooksRealmId', async () => {
        const db = makeDb({ user: { findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: null }) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.createQbInvoiceFromInvoice({ invoiceId: 'inv-1' })).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('throws NOT_FOUND when invoice does not exist', async () => {
        const db = makeDb({ invoice: { findUnique: vi.fn().mockResolvedValue(null), update: vi.fn() } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.createQbInvoiceFromInvoice({ invoiceId: 'inv-1' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('throws BAD_REQUEST when office has no quickbooksCustomerId', async () => {
        const db = makeDb({
            invoice: {
                findUnique: vi.fn().mockResolvedValue({
                    id: 'inv-1',
                    InvoiceItems: [],
                    Order: { id: 'o-1', Office: { quickbooksCustomerId: null }, ShippingInfo: null },
                }),
                update: vi.fn(),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.createQbInvoiceFromInvoice({ invoiceId: 'inv-1' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('calls axios.post with invoice payload and updates invoice on success', async () => {
        const mockInvoice = {
            id: 'inv-1',
            InvoiceItems: [{ description: 'Cards', quantity: 10, total: { toNumber: () => 100 } }],
            Order: { id: 'o-1', Office: { quickbooksCustomerId: 'qb-c-1' }, ShippingInfo: null },
        };
        vi.mocked(axios.post).mockResolvedValueOnce({ data: { Invoice: { Id: 'qb-inv-1' } } });

        const db = makeDb({
            invoice: { findUnique: vi.fn().mockResolvedValue(mockInvoice), update: vi.fn() },
            order: { update: vi.fn() },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.createQbInvoiceFromInvoice({ invoiceId: 'inv-1' });

        expect(axios.post).toHaveBeenCalled();
        expect(db.invoice.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { quickbooksId: 'qb-inv-1' } }),
        );
        expect(db.order.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { quickbooksInvoiceId: 'qb-inv-1' } }),
        );
    });
});

// ─── createQbInvoiceFromOrder ────────────────────────────────────────────────

describe('qbInvoiceRouter.createQbInvoiceFromOrder', () => {
    beforeEach(() => vi.clearAllMocks());

    it('throws UNAUTHORIZED when user has no quickbooksRealmId', async () => {
        const db = makeDb({ user: { findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: null }) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.createQbInvoiceFromOrder({ orderId: 'o-1' })).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('throws NOT_FOUND when order does not exist', async () => {
        const db = makeDb({ order: { findUnique: vi.fn().mockResolvedValue(null), update: vi.fn() } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.createQbInvoiceFromOrder({ orderId: 'o-1' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('throws BAD_REQUEST when office has no quickbooksCustomerId', async () => {
        const db = makeDb({
            order: {
                findUnique: vi.fn().mockResolvedValue({
                    id: 'o-1',
                    Office: { quickbooksCustomerId: null },
                    OrderItems: [],
                    ShippingInfo: null,
                }),
                update: vi.fn(),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.createQbInvoiceFromOrder({ orderId: 'o-1' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('calls axios.post with order payload and updates order on success', async () => {
        const mockOrder = {
            id: 'o-1',
            Office: { quickbooksCustomerId: 'qb-c-1' },
            OrderItems: [
                { description: 'Flyers', quantity: 500, amount: { toNumber: () => 250 }, OrderItemStock: [], ProcessingOptions: [], Typesetting: [] },
            ],
            ShippingInfo: null,
        };
        vi.mocked(axios.post).mockResolvedValueOnce({ data: { Invoice: { Id: 'qb-inv-2' } } });

        const db = makeDb({
            order: { findUnique: vi.fn().mockResolvedValue(mockOrder), update: vi.fn() },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.createQbInvoiceFromOrder({ orderId: 'o-1' });

        expect(axios.post).toHaveBeenCalled();
        expect(db.order.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { quickbooksInvoiceId: 'qb-inv-2' } }),
        );
    });
});

// ─── getInvoicePdf ───────────────────────────────────────────────────────────

describe('qbInvoiceRouter.getInvoicePdf', () => {
    beforeEach(() => vi.clearAllMocks());

    it('throws when user has no quickbooksRealmId', async () => {
        const db = makeDb({ user: { findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: null }) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.getInvoicePdf({ quickbooksId: 'qb-1' })).rejects.toThrow();
    });

    it('returns base64-encoded PDF on success', async () => {
        const pdfBytes = Buffer.from('%PDF-1.4 fake pdf content');
        vi.mocked(axios as any).mockResolvedValueOnce({ data: pdfBytes });

        const db = makeDb();
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.getInvoicePdf({ quickbooksId: 'qb-1' });
        expect(typeof result).toBe('string');
        expect(result).toBe(pdfBytes.toString('base64'));
    });
});

// ─── sendInvoiceEmail ────────────────────────────────────────────────────────

describe('qbInvoiceRouter.sendInvoiceEmail', () => {
    beforeEach(() => vi.clearAllMocks());

    it('throws UNAUTHORIZED when user has no quickbooksRealmId', async () => {
        const db = makeDb({ user: { findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: null }) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(
            caller.sendInvoiceEmail({ quickbooksId: 'qb-1', recipientEmail: 'test@example.com' }),
        ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('calls axios.post and returns response data on success', async () => {
        vi.mocked(axios.post).mockResolvedValueOnce({ data: { status: 'sent' } });

        const db = makeDb();
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.sendInvoiceEmail({ quickbooksId: 'qb-1', recipientEmail: 'test@example.com' });
        expect(axios.post).toHaveBeenCalled();
        expect(result).toEqual({ status: 'sent' });
    });
});

// ─── syncInvoice ─────────────────────────────────────────────────────────────

describe('qbInvoiceRouter.syncInvoice', () => {
    beforeEach(() => vi.clearAllMocks());

    it('throws UNAUTHORIZED when user has no quickbooksRealmId', async () => {
        const db = makeDb({ user: { findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: null }) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.syncInvoice({ orderId: 'o-1' })).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('throws NOT_FOUND when order does not exist', async () => {
        const db = makeDb({ order: { findUnique: vi.fn().mockResolvedValue(null), update: vi.fn() } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.syncInvoice({ orderId: 'missing-order' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('throws BAD_REQUEST when office has no quickbooksCustomerId', async () => {
        const db = makeDb({
            order: {
                findUnique: vi.fn().mockResolvedValue({
                    id: 'o-1',
                    Office: { quickbooksCustomerId: null },
                }),
                update: vi.fn(),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.syncInvoice({ orderId: 'o-1' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('calls axios.get and returns invoices for office on success', async () => {
        const xmlResponse = `<?xml version="1.0"?><IntuitResponse><QueryResponse><Invoice><Id>1</Id></Invoice></QueryResponse></IntuitResponse>`;
        vi.mocked(axios.get).mockResolvedValueOnce({ data: xmlResponse });

        const db = makeDb({
            order: {
                findUnique: vi.fn().mockResolvedValue({
                    id: 'o-1',
                    Office: { quickbooksCustomerId: 'qb-c-1' },
                }),
                update: vi.fn(),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.syncInvoice({ orderId: 'o-1' });
        expect(axios.get).toHaveBeenCalled();
        expect(result).toHaveProperty('Id', 1);
    });
});

// ─── syncInvoices ────────────────────────────────────────────────────────────

describe('qbInvoiceRouter.syncInvoices', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns empty array when no offices have quickbooksCustomerId', async () => {
        const db = makeDb({ office: { findMany: vi.fn().mockResolvedValue([]) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.syncInvoices();
        expect(result).toEqual([]);
    });

    it('fetches invoices for each office with quickbooksCustomerId', async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: { Invoice: [] } });

        const db = makeDb({
            office: {
                findMany: vi.fn().mockResolvedValue([{ id: 'off-1', quickbooksCustomerId: 'qb-c-1' }]),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.syncInvoices();
        expect(axios.get).toHaveBeenCalled();
    });
});

// ─── syncInvoicesForOffice ───────────────────────────────────────────────────

describe('qbInvoiceRouter.syncInvoicesForOffice', () => {
    beforeEach(() => vi.clearAllMocks());

    it('throws UNAUTHORIZED when user has no quickbooksRealmId', async () => {
        const db = makeDb({ user: { findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: null }) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.syncInvoicesForOffice({ officeId: 'off-1' })).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('throws BAD_REQUEST when office has no quickbooksCustomerId', async () => {
        const db = makeDb({
            office: { findUnique: vi.fn().mockResolvedValue({ quickbooksCustomerId: null }) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.syncInvoicesForOffice({ officeId: 'off-1' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('calls axios.get and returns invoices for office on success', async () => {
        const xmlResponse = `<?xml version="1.0"?><IntuitResponse><QueryResponse><Invoice><Id>1</Id></Invoice></QueryResponse></IntuitResponse>`;
        vi.mocked(axios.get).mockResolvedValueOnce({ data: xmlResponse });

        const db = makeDb({
            office: { findUnique: vi.fn().mockResolvedValue({ quickbooksCustomerId: 'qb-c-1' }) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.syncInvoicesForOffice({ officeId: 'off-1' });
        expect(result).toBeDefined();
    });
});
