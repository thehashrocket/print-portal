import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { createCallerFactory } from '~/server/api/trpc';
import { qbSyncCustomerRouter } from '../qbSyncCustomer';

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

const createCaller = createCallerFactory(qbSyncCustomerRouter);

const mockSession = {
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    expires: '2099-01-01',
};

function makeDb(overrides: Record<string, any> = {}) {
    return {
        user: {
            findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: 'realm-1' }),
            upsert: vi.fn(),
            ...overrides.user,
        },
        company: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({ id: 'co-1', name: 'Acme', quickbooksId: '1', syncToken: '1' }),
            update: vi.fn(),
            ...overrides.company,
        },
        office: {
            upsert: vi.fn().mockResolvedValue({ id: 'off-1', name: 'Acme', companyId: 'co-1', quickbooksCustomerId: '1' }),
            ...overrides.office,
        },
        address: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn(),
            update: vi.fn(),
            ...overrides.address,
        },
    };
}

// ─── getCustomers ─────────────────────────────────────────────────────────────

describe('qbSyncCustomerRouter.getCustomers', () => {
    beforeEach(() => vi.clearAllMocks());

    it('throws UNAUTHORIZED when user has no quickbooksRealmId', async () => {
        const db = makeDb({ user: { findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: null }) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.getCustomers({})).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('returns zero count when QB reports no customers', async () => {
        // totalCount="0" means no pagination loop runs
        const countXml = `<?xml version="1.0"?><IntuitResponse><QueryResponse totalCount="0"/></IntuitResponse>`;
        vi.mocked(axios.get).mockResolvedValueOnce({ data: countXml });

        const db = makeDb();
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.getCustomers({});
        expect(result).toEqual({
            totalCustomers: 0,
            message: 'Successfully synced 0 customers from QuickBooks.',
        });
    });

    it('syncs paginated customers and returns count', async () => {
        const countXml = `<?xml version="1.0"?><IntuitResponse><QueryResponse totalCount="1"/></IntuitResponse>`;
        const dataXml = `<?xml version="1.0"?><IntuitResponse><QueryResponse><Customer><Id>1</Id><FullyQualifiedName>Acme Corp</FullyQualifiedName><DisplayName>Acme Corp</DisplayName><SyncToken>1</SyncToken></Customer></QueryResponse></IntuitResponse>`;

        vi.mocked(axios.get)
            .mockResolvedValueOnce({ data: countXml })
            .mockResolvedValueOnce({ data: dataXml });

        const mockOffice = { id: 'off-1', name: 'Acme Corp', companyId: 'co-1', quickbooksCustomerId: '1' };
        const db = makeDb({
            company: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ id: 'co-1', name: 'Acme Corp', quickbooksId: '1', syncToken: '1' }),
            },
            office: { upsert: vi.fn().mockResolvedValue(mockOffice) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.getCustomers({});
        expect(result).toEqual({
            totalCustomers: 1,
            message: 'Successfully synced 1 customers from QuickBooks.',
        });
    });

    it('updates syncToken when existing company is found', async () => {
        const countXml = `<?xml version="1.0"?><IntuitResponse><QueryResponse totalCount="1"/></IntuitResponse>`;
        const dataXml = `<?xml version="1.0"?><IntuitResponse><QueryResponse><Customer><Id>1</Id><FullyQualifiedName>Acme Corp</FullyQualifiedName><DisplayName>Acme Corp</DisplayName><SyncToken>2</SyncToken></Customer></QueryResponse></IntuitResponse>`;

        vi.mocked(axios.get)
            .mockResolvedValueOnce({ data: countXml })
            .mockResolvedValueOnce({ data: dataXml });

        const existingCompany = { id: 'co-1', name: 'Acme Corp', quickbooksId: '1', syncToken: '1' };
        const db = makeDb({
            company: {
                findFirst: vi.fn().mockResolvedValue(existingCompany),
                update: vi.fn().mockResolvedValue({ ...existingCompany, syncToken: '2' }),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.getCustomers({});
        // Existing company → update path, not create
        expect(db.company.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ syncToken: '2' }),
            }),
        );
    });

    it('handles sub-location customer (FullyQualifiedName with colon)', async () => {
        const countXml = `<?xml version="1.0"?><IntuitResponse><QueryResponse totalCount="1"/></IntuitResponse>`;
        // Sub-location: "Parent:Office" shape — company must already exist for sub-location lookup
        const dataXml = `<?xml version="1.0"?><IntuitResponse><QueryResponse><Customer><Id>2</Id><FullyQualifiedName>Acme Corp:Chicago Office</FullyQualifiedName><DisplayName>Chicago Office</DisplayName><SyncToken>1</SyncToken></Customer></QueryResponse></IntuitResponse>`;

        vi.mocked(axios.get)
            .mockResolvedValueOnce({ data: countXml })
            .mockResolvedValueOnce({ data: dataXml });

        const existingCompany = { id: 'co-1', name: 'Acme Corp', quickbooksId: '1', syncToken: '1' };
        const mockOffice = { id: 'off-2', name: 'Chicago Office', companyId: 'co-1', quickbooksCustomerId: '2' };
        const db = makeDb({
            company: { findFirst: vi.fn().mockResolvedValue(existingCompany) },
            office: { upsert: vi.fn().mockResolvedValue(mockOffice) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.getCustomers({});
        expect(result.totalCustomers).toBe(1);
        // office.upsert called with the sub-location's QB ID
        expect(db.office.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { quickbooksCustomerId: '2' },
            }),
        );
    });

    it('updates existing address instead of creating when address already exists', async () => {
        const countXml = `<?xml version="1.0"?><IntuitResponse><QueryResponse totalCount="1"/></IntuitResponse>`;
        const dataXml = `<?xml version="1.0"?><IntuitResponse><QueryResponse><Customer><Id>1</Id><FullyQualifiedName>Acme Corp</FullyQualifiedName><DisplayName>Acme Corp</DisplayName><SyncToken>1</SyncToken><BillAddr><Id>addr-qb-1</Id><Line1>123 Main</Line1><City>Chicago</City><CountrySubDivisionCode>IL</CountrySubDivisionCode><PostalCode>60601</PostalCode><Country>USA</Country></BillAddr></Customer></QueryResponse></IntuitResponse>`;

        vi.mocked(axios.get)
            .mockResolvedValueOnce({ data: countXml })
            .mockResolvedValueOnce({ data: dataXml });

        const existingAddress = { id: 'addr-1', quickbooksId: 'addr-qb-1' };
        const db = makeDb({
            company: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ id: 'co-1', name: 'Acme Corp', quickbooksId: '1', syncToken: '1' }),
            },
            address: {
                findFirst: vi.fn().mockResolvedValue(existingAddress),
                update: vi.fn(),
                create: vi.fn(),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.getCustomers({});
        expect(db.address.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'addr-1' } }),
        );
        expect(db.address.create).not.toHaveBeenCalled();
    });
});
