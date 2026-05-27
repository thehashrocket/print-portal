import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { createCallerFactory } from '~/server/api/trpc';
import { qbCustomerRouter } from '../qbCustomer';

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

const createCaller = createCallerFactory(qbCustomerRouter);

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
        company: {
            findUnique: vi.fn().mockResolvedValue(null),
            upsert: vi.fn(),
            update: vi.fn(),
            create: vi.fn(),
            ...overrides.company,
        },
        office: {
            findUnique: vi.fn().mockResolvedValue(null),
            create: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn(),
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

const createCustomerInput = {
    companyName: 'Acme Corp',
    officeName: 'Main Office',
    billAddr: {
        line1: '123 Main St',
        city: 'Chicago',
        country: 'USA',
        countrySubDivisionCode: 'IL',
        postalCode: '60601',
    },
};

// ─── createCustomer ──────────────────────────────────────────────────────────

describe('qbCustomerRouter.createCustomer', () => {
    beforeEach(() => vi.clearAllMocks());

    it('throws UNAUTHORIZED when user has no quickbooksRealmId', async () => {
        const db = makeDb({ user: { findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: null }) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.createCustomer(createCustomerInput)).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('throws INTERNAL_SERVER_ERROR when axios.post fails', async () => {
        vi.mocked(axios.post).mockRejectedValueOnce(new Error('network error'));

        const db = makeDb();
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.createCustomer(createCustomerInput)).rejects.toMatchObject({ code: 'INTERNAL_SERVER_ERROR' });
    });

    it('calls axios.post, upserts company, and creates office on success', async () => {
        const mockQbCustomer = {
            Id: 'qb-1',
            CompanyName: 'Acme Corp',
            SyncToken: '0',
            BillAddr: { Line1: '123 Main St', City: 'Chicago', CountrySubDivisionCode: 'IL', PostalCode: '60601', Country: 'USA' },
            PrimaryPhone: { FreeFormNumber: '555-1234' },
        };
        vi.mocked(axios.post).mockResolvedValueOnce({ data: { Customer: mockQbCustomer } });

        const mockCompany = { id: 'co-1', name: 'Acme Corp', quickbooksId: 'qb-1', syncToken: '0' };
        const mockOffice = { id: 'off-1', name: 'Main Office', companyId: 'co-1', quickbooksCustomerId: 'qb-1' };

        const db = makeDb({
            company: { upsert: vi.fn().mockResolvedValue(mockCompany) },
            office: { create: vi.fn().mockResolvedValue(mockOffice) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.createCustomer(createCustomerInput);
        expect(axios.post).toHaveBeenCalled();
        expect(db.company.upsert).toHaveBeenCalled();
        expect(db.office.create).toHaveBeenCalled();
        expect(result).toEqual({ company: mockCompany, office: mockOffice });
    });
});

// ─── updateCustomer ──────────────────────────────────────────────────────────

describe('qbCustomerRouter.updateCustomer', () => {
    beforeEach(() => vi.clearAllMocks());

    const updateInput = {
        companyId: 'co-1',
        displayName: 'Acme Corp Updated',
        billAddr: {
            line1: '456 New Ave',
            city: 'Chicago',
            country: 'USA',
            countrySubDivisionCode: 'IL',
            postalCode: '60602',
        },
    };

    it('throws UNAUTHORIZED when user has no quickbooksRealmId', async () => {
        const db = makeDb({ user: { findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: null }) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.updateCustomer(updateInput)).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('throws NOT_FOUND when company does not exist or is not synced with QuickBooks', async () => {
        const db = makeDb({
            company: { findUnique: vi.fn().mockResolvedValue(null) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.updateCustomer(updateInput)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('throws NOT_FOUND when company has no quickbooksId', async () => {
        const db = makeDb({
            company: {
                findUnique: vi.fn().mockResolvedValue({
                    id: 'co-1',
                    name: 'Acme',
                    quickbooksId: null,
                    syncToken: null,
                    Offices: [{ id: 'off-1', name: 'HQ', Addresses: [] }],
                }),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.updateCustomer(updateInput)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('calls axios.post and updates company and office on success', async () => {
        const mockQbCustomer = {
            Id: 'qb-1',
            CompanyName: 'Acme Corp',
            SyncToken: '1',
            BillAddr: { Line1: '456 New Ave', City: 'Chicago', CountrySubDivisionCode: 'IL', PostalCode: '60602', Country: 'USA' },
            PrimaryPhone: { FreeFormNumber: '' },
        };
        vi.mocked(axios.post).mockResolvedValueOnce({ data: { Customer: mockQbCustomer } });

        const mockCompany = {
            id: 'co-1',
            name: 'Acme Corp',
            quickbooksId: 'qb-1',
            syncToken: '0',
            Offices: [
                { id: 'off-1', name: 'Main Office', Addresses: [{ id: 'addr-1' }] },
            ],
        };
        const updatedCompany = { ...mockCompany, syncToken: '1' };
        const updatedOffice = { id: 'off-1', name: 'Main Office' };

        const db = makeDb({
            company: {
                findUnique: vi.fn().mockResolvedValue(mockCompany),
                update: vi.fn().mockResolvedValue(updatedCompany),
            },
            office: { update: vi.fn().mockResolvedValue(updatedOffice) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.updateCustomer(updateInput);
        expect(axios.post).toHaveBeenCalled();
        expect(db.company.update).toHaveBeenCalled();
        expect(db.office.update).toHaveBeenCalled();
        expect(result).toEqual({ company: updatedCompany, office: updatedOffice });
    });
});

// ─── syncOffice ──────────────────────────────────────────────────────────────

describe('qbCustomerRouter.syncOffice', () => {
    beforeEach(() => vi.clearAllMocks());

    it('throws UNAUTHORIZED when user has no quickbooksRealmId', async () => {
        const db = makeDb({ user: { findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: null }) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.syncOffice({ officeId: 'off-1' })).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('pulls QB data and updates local DB when office already has quickbooksCustomerId', async () => {
        const mockQbCustomer = {
            Id: 'qb-1',
            CompanyName: 'Acme:Main',
            SyncToken: '2',
            BillAddr: { Line1: '123 Main St', City: 'Chicago', CountrySubDivisionCode: 'IL', PostalCode: '60601', Country: 'USA' },
            PrimaryPhone: { FreeFormNumber: '555-0000' },
        };
        vi.mocked(axios.get).mockResolvedValueOnce({ data: { Customer: mockQbCustomer } });

        const mockOffice = {
            id: 'off-1',
            name: 'Main',
            quickbooksCustomerId: 'qb-1',
            companyId: 'co-1',
            Company: { id: 'co-1', name: 'Acme', quickbooksId: 'qb-co-1', syncToken: '1', createdAt: new Date(), updatedAt: new Date() },
            Addresses: [{ id: 'addr-1', quickbooksId: null, city: 'Chicago', country: 'USA', line1: '123 Main St', line2: null, officeId: 'off-1', telephoneNumber: '', zipCode: '60601', state: 'IL', addressType: 'Billing' as const, createdAt: new Date(), updatedAt: new Date() }],
        };
        const updatedCompany = { id: 'co-1' };
        const updatedOffice = { id: 'off-1' };

        const db = makeDb({
            office: { findUnique: vi.fn().mockResolvedValue(mockOffice), update: vi.fn().mockResolvedValue(updatedOffice) },
            company: { update: vi.fn().mockResolvedValue(updatedCompany) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.syncOffice({ officeId: 'off-1' });
        expect(axios.get).toHaveBeenCalled();
        expect(result).toEqual({ company: updatedCompany, office: updatedOffice });
    });
});

// ─── syncCompany ─────────────────────────────────────────────────────────────

describe('qbCustomerRouter.syncCompany', () => {
    beforeEach(() => vi.clearAllMocks());

    it('throws UNAUTHORIZED when user has no quickbooksRealmId', async () => {
        const db = makeDb({
            company: {
                findUnique: vi.fn().mockResolvedValue({
                    id: 'co-1',
                    name: 'Acme',
                    quickbooksId: null,
                    syncToken: null,
                    updatedAt: new Date(),
                    Offices: [],
                }),
            },
            user: { findUnique: vi.fn().mockResolvedValue({ quickbooksRealmId: null }) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.syncCompany({ companyId: 'co-1' })).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('throws NOT_FOUND when company does not exist in local DB', async () => {
        const db = makeDb({
            company: { findUnique: vi.fn().mockResolvedValue(null) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.syncCompany({ companyId: 'missing-co' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('creates new company in QB when not found there yet', async () => {
        // QB returns no customer → triggers createCustomerInQB path; no offices so loop doesn't run
        vi.mocked(axios.get).mockResolvedValue({
            data: { QueryResponse: { Customer: [] } },
        });
        const createdQbCustomer = { Id: 'qb-new', SyncToken: '0' };
        vi.mocked(axios.post).mockResolvedValue({ data: { Customer: createdQbCustomer } });

        const db = makeDb({
            company: {
                findUnique: vi.fn().mockResolvedValue({
                    id: 'co-1',
                    name: 'NewCo',
                    quickbooksId: null,
                    syncToken: null,
                    updatedAt: new Date(),
                    Offices: [],
                }),
                update: vi.fn(),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.syncCompany({ companyId: 'co-1' });
        expect(axios.post).toHaveBeenCalled();
        expect(db.company.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { quickbooksId: 'qb-new', syncToken: '0' } }),
        );
        expect(result).toEqual({ message: 'Company and offices synced successfully' });
    });

    it('returns success message when company is in sync with QB', async () => {
        const mockQbCompany = {
            Id: 'qb-co-1',
            SyncToken: '1',
            MetaData: { LastUpdatedTime: new Date('2099-01-01').toISOString() },
        };
        vi.mocked(axios.get).mockResolvedValue({
            data: { QueryResponse: { Customer: [mockQbCompany] } },
        });

        const db = makeDb({
            company: {
                findUnique: vi.fn().mockResolvedValue({
                    id: 'co-1',
                    name: 'Acme',
                    quickbooksId: 'qb-co-1',
                    syncToken: '1',
                    updatedAt: new Date('2020-01-01'),
                    Offices: [],
                }),
                update: vi.fn(),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.syncCompany({ companyId: 'co-1' });
        expect(result).toEqual({ message: 'Company and offices synced successfully' });
    });
});
