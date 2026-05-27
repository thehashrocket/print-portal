import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WorkOrderStatus, WorkOrderItemStatus } from '~/generated/prisma/client';
import { TRPCError } from '@trpc/server';
import { createCallerFactory } from '~/server/api/trpc';
import { workOrderRouter } from '../workOrder';
import { convertWorkOrderToOrder as mockConvertService } from '~/services/workOrderToOrderService';

vi.mock('~/utils/dataNormalization', () => ({
    normalizeWorkOrder: vi.fn((wo: any) => wo),
}));

vi.mock('~/services/workOrderToOrderService', () => ({
    convertWorkOrderToOrder: vi.fn().mockResolvedValue(undefined),
}));

const createCaller = createCallerFactory(workOrderRouter);

const mockSession = {
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    expires: '2099-01-01',
};

function makeWorkOrder(overrides: Record<string, any> = {}) {
    return {
        id: 'wo-1',
        status: 'Pending',
        officeId: 'office-1',
        contactPersonId: null,
        contactPerson: null,
        createdById: 'user-1',
        createdBy: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        Office: { id: 'office-1', name: 'Main', isWalkInOffice: false, Company: { name: 'Test Co' } },
        Orders: [],
        ShippingInfo: null,
        WorkOrderItems: [],
        WorkOrderNotes: [],
        WorkOrderVersions: [],
        WalkInCustomer: null,
        ...overrides,
    };
}

function makeDb(overrides: Record<string, any> = {}) {
    const workOrderMock = {
        findUnique: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockResolvedValue(makeWorkOrder()),
        create: vi.fn().mockResolvedValue(makeWorkOrder()),
        ...overrides.workOrder,
    };
    const workOrderItemMock = {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        ...overrides.workOrderItem,
    };
    return {
        workOrder: workOrderMock,
        workOrderItem: workOrderItemMock,
        $transaction: vi.fn((fn: (tx: any) => Promise<any>) =>
            fn({ workOrder: workOrderMock, workOrderItem: workOrderItemMock }),
        ),
    };
}

// ─── getByID ────────────────────────────────────────────────────────────────

describe('workOrderRouter.getByID', () => {
    it('returns null when WO not found', async () => {
        const db = makeDb();
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        const result = await caller.getByID('nonexistent');
        expect(result).toBeNull();
    });

    it('returns normalized WO with calculateItemTotals applied', async () => {
        const wo = makeWorkOrder({
            WorkOrderItems: [
                { amount: '100.00', cost: '80.00', shippingAmount: '10.00', status: 'Pending' },
            ],
        });
        const db = makeDb({ workOrder: { findUnique: vi.fn().mockResolvedValue(wo) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        const result = await caller.getByID('wo-1');
        expect(result).not.toBeNull();
        expect(db.workOrder.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'wo-1' } }));
    });

    it('uses fallback contactPerson when null on WO', async () => {
        const wo = makeWorkOrder({ contactPerson: null, contactPersonId: 'cp-1' });
        const db = makeDb({ workOrder: { findUnique: vi.fn().mockResolvedValue(wo) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        const result = await caller.getByID('wo-1') as any;
        expect(result?.contactPerson).toEqual({ id: 'cp-1', name: null, email: null });
    });
});

// ─── createWorkOrder ─────────────────────────────────────────────────────────

const baseCreateInput = {
    dateIn: new Date('2026-01-01'),
    officeId: 'office-1',
    inHandsDate: new Date('2026-02-01'),
    invoicePrintEmail: 'Print' as const,
    status: 'Draft' as const,
};

describe('workOrderRouter.createWorkOrder', () => {
    it('throws UNAUTHORIZED when no session', async () => {
        const db = makeDb();
        const caller = createCaller({ db: db as any, session: null, headers: new Headers() });
        await expect(caller.createWorkOrder(baseCreateInput)).rejects.toThrow(TRPCError);
    });

    it('creates with required fields only', async () => {
        const created = makeWorkOrder();
        const db = makeDb({ workOrder: { create: vi.fn().mockResolvedValue(created) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await caller.createWorkOrder(baseCreateInput);
        const callArg = db.workOrder.create.mock.calls[0][0].data;
        expect(callArg.contactPerson).toBeUndefined();
        expect(callArg.ShippingInfo).toBeUndefined();
        expect(callArg.WalkInCustomer).toBeUndefined();
    });

    it('connects contactPerson when contactPersonId provided', async () => {
        const db = makeDb({ workOrder: { create: vi.fn().mockResolvedValue(makeWorkOrder()) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await caller.createWorkOrder({ ...baseCreateInput, contactPersonId: 'cp-1' });
        const callArg = db.workOrder.create.mock.calls[0][0].data;
        expect(callArg.contactPerson).toEqual({ connect: { id: 'cp-1' } });
    });

    it('connects ShippingInfo when shippingInfoId provided', async () => {
        const db = makeDb({ workOrder: { create: vi.fn().mockResolvedValue(makeWorkOrder()) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await caller.createWorkOrder({ ...baseCreateInput, shippingInfoId: 'si-1' });
        const callArg = db.workOrder.create.mock.calls[0][0].data;
        expect(callArg.ShippingInfo).toEqual({ connect: { id: 'si-1' } });
    });

    it('connects WalkInCustomer when walkInCustomerId provided', async () => {
        const db = makeDb({ workOrder: { create: vi.fn().mockResolvedValue(makeWorkOrder()) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await caller.createWorkOrder({ ...baseCreateInput, walkInCustomerId: 'wic-1' });
        const callArg = db.workOrder.create.mock.calls[0][0].data;
        expect(callArg.WalkInCustomer).toEqual({ connect: { id: 'wic-1' } });
    });
});

// ─── getAll ──────────────────────────────────────────────────────────────────

describe('workOrderRouter.getAll', () => {
    it('returns empty array when no WOs exist', async () => {
        const db = makeDb();
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        const result = await caller.getAll();
        expect(result).toEqual([]);
    });

    it('returns normalized array for multiple WOs', async () => {
        const wo1 = makeWorkOrder({ id: 'wo-1' });
        const wo2 = makeWorkOrder({ id: 'wo-2' });
        const db = makeDb({ workOrder: { findMany: vi.fn().mockResolvedValue([wo1, wo2]) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        const result = await caller.getAll();
        expect(result).toHaveLength(2);
    });
});

// ─── updateStatus: Cancelled cascade ─────────────────────────────────────────

describe('workOrderRouter.updateStatus — Cancelled cascade', () => {
    it('cascades Cancelled status to all work order items', async () => {
        const db = makeDb({
            workOrder: { update: vi.fn().mockResolvedValue(makeWorkOrder({ status: 'Cancelled' })) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await caller.updateStatus({ id: 'wo-1', status: WorkOrderStatus.Cancelled });
        expect(db.workOrderItem.updateMany).toHaveBeenCalledWith({
            where: { workOrderId: 'wo-1' },
            data: { status: WorkOrderItemStatus.Cancelled },
        });
    });

    it('does NOT cascade for Approved status', async () => {
        const db = makeDb({
            workOrder: { update: vi.fn().mockResolvedValue(makeWorkOrder({ status: 'Approved' })) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await caller.updateStatus({ id: 'wo-1', status: WorkOrderStatus.Approved });
        expect(db.workOrderItem.updateMany).not.toHaveBeenCalled();
    });

    it('does NOT cascade for Draft status', async () => {
        const db = makeDb({
            workOrder: { update: vi.fn().mockResolvedValue(makeWorkOrder({ status: 'Draft' })) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await caller.updateStatus({ id: 'wo-1', status: WorkOrderStatus.Draft });
        expect(db.workOrderItem.updateMany).not.toHaveBeenCalled();
    });

    it('returns normalized WO with totals after status update', async () => {
        const wo = makeWorkOrder({
            status: 'Pending',
            WorkOrderItems: [{ amount: '50.00', cost: '40.00', shippingAmount: '5.00', status: 'Pending' }],
        });
        const db = makeDb({ workOrder: { update: vi.fn().mockResolvedValue(wo) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        const result = await caller.updateStatus({ id: 'wo-1', status: WorkOrderStatus.Pending });
        expect(result).toBeDefined();
    });
});

// ─── addShippingInfo ──────────────────────────────────────────────────────────

describe('workOrderRouter.addShippingInfo', () => {
    it('connects ShippingInfo and returns normalized WO', async () => {
        const wo = makeWorkOrder({ ShippingInfo: { id: 'si-1' } });
        const db = makeDb({ workOrder: { update: vi.fn().mockResolvedValue(wo) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        const result = await caller.addShippingInfo({ id: 'wo-1', shippingInfoId: 'si-1' });
        expect(db.workOrder.update).toHaveBeenCalledWith(expect.objectContaining({
            data: { ShippingInfo: { connect: { id: 'si-1' } } },
        }));
        expect(result).toBeDefined();
    });
});

// ─── convertWorkOrderToOrder ──────────────────────────────────────────────────

describe('workOrderRouter.convertWorkOrderToOrder', () => {
    const mockConvert = vi.mocked(mockConvertService);

    beforeEach(() => {
        vi.clearAllMocks();
        mockConvert.mockResolvedValue(undefined);
    });

    it('calls service then re-fetches and returns normalized WO', async () => {
        const wo = makeWorkOrder();
        const db = makeDb({ workOrder: { findUnique: vi.fn().mockResolvedValue(wo) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        const result = await caller.convertWorkOrderToOrder({ id: 'wo-1', officeId: 'office-1' });
        expect(mockConvert).toHaveBeenCalledWith('wo-1', 'office-1');
        expect(db.workOrder.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'wo-1' } }));
        expect(result).toBeDefined();
    });

    it('throws NOT_FOUND when WO not found after service call', async () => {
        const db = makeDb({ workOrder: { findUnique: vi.fn().mockResolvedValue(null) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(
            caller.convertWorkOrderToOrder({ id: 'wo-1', officeId: 'office-1' })
        ).rejects.toThrow(TRPCError);
    });
});

// ─── updateContactPerson ──────────────────────────────────────────────────────

describe('workOrderRouter.updateContactPerson', () => {
    it('updates contactPersonId on the work order', async () => {
        const updated = makeWorkOrder({ contactPersonId: 'cp-2' });
        const db = makeDb({ workOrder: { update: vi.fn().mockResolvedValue(updated) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await caller.updateContactPerson({ workOrderId: 'wo-1', contactPersonId: 'cp-2' });
        expect(db.workOrder.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'wo-1' },
            data: { contactPersonId: 'cp-2' },
        }));
    });
});

// ─── updateShippingInfo ───────────────────────────────────────────────────────

describe('workOrderRouter.updateShippingInfo', () => {
    const baseShippingInput = {
        workOrderId: 'wo-1',
        shippingInfo: {
            shippingMethod: 'Delivery' as const,
        },
    };

    it('throws NOT_FOUND when work order does not exist', async () => {
        const db = makeDb({ workOrder: { findUnique: vi.fn().mockResolvedValue(null) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(caller.updateShippingInfo(baseShippingInput)).rejects.toThrow(TRPCError);
    });

    it('upserts ShippingInfo on the work order', async () => {
        const wo = makeWorkOrder();
        const db = makeDb({
            workOrder: {
                findUnique: vi.fn().mockResolvedValue({ officeId: 'office-1' }),
                update: vi.fn().mockResolvedValue(wo),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await caller.updateShippingInfo(baseShippingInput);
        expect(db.workOrder.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'wo-1' },
        }));
        const updateData = db.workOrder.update.mock.calls[0][0].data;
        expect(updateData.ShippingInfo.upsert).toBeDefined();
    });

    it('REGRESSION: update arm uses deleteMany before create for ShippingPickup (no duplicates)', async () => {
        const db = makeDb({
            workOrder: {
                findUnique: vi.fn().mockResolvedValue({ officeId: 'office-1' }),
                update: vi.fn().mockResolvedValue(makeWorkOrder()),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await caller.updateShippingInfo({
            workOrderId: 'wo-1',
            shippingInfo: {
                shippingMethod: 'Delivery' as const,
                ShippingPickup: {
                    pickupDate: new Date('2026-02-01'),
                    pickupTime: '09:00',
                    contactName: 'Jane',
                    contactPhone: '555-1234',
                },
            },
        });
        const updateData = db.workOrder.update.mock.calls[0][0].data;
        const pickupInUpdate = updateData.ShippingInfo.upsert.update.ShippingPickup;
        expect(pickupInUpdate.deleteMany).toBeDefined();
        expect(pickupInUpdate.create).toBeDefined();
        expect(pickupInUpdate.create).not.toBeUndefined();
    });

    it('clears existing ShippingPickup when none provided in update', async () => {
        const db = makeDb({
            workOrder: {
                findUnique: vi.fn().mockResolvedValue({ officeId: 'office-1' }),
                update: vi.fn().mockResolvedValue(makeWorkOrder()),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await caller.updateShippingInfo(baseShippingInput);
        const updateData = db.workOrder.update.mock.calls[0][0].data;
        const pickupInUpdate = updateData.ShippingInfo.upsert.update.ShippingPickup;
        expect(pickupInUpdate).toEqual({ deleteMany: {} });
    });

    it('rejects invalid shippingMethod values not in ShippingMethod enum', async () => {
        const db = makeDb({ workOrder: { findUnique: vi.fn().mockResolvedValue({ officeId: 'office-1' }) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });
        await expect(
            caller.updateShippingInfo({
                workOrderId: 'wo-1',
                shippingInfo: { shippingMethod: 'Ground' as any },
            }),
        ).rejects.toThrow();
    });
});
