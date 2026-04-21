import { vi, describe, it, expect } from 'vitest';
import { Prisma, OrderStatus, ShippingMethod } from '~/generated/prisma/client';
import { TRPCError } from '@trpc/server';
import { createCallerFactory } from '~/server/api/trpc';
import { orderRouter } from '../order';

vi.mock('~/utils/dataNormalization', () => ({
    normalizeOrder: vi.fn((order: any) => order),
    normalizeOrderPayment: vi.fn((p: any) => ({ ...p, amount: p.amount?.toNumber?.() ?? p.amount })),
    normalizeWalkInCustomer: vi.fn((c: any) => c),
}));

vi.mock('~/utils/sengrid', () => ({
    sendOrderEmail: vi.fn().mockResolvedValue(undefined),
    sendOrderStatusEmail: vi.fn().mockResolvedValue(undefined),
}));

const createCaller = createCallerFactory(orderRouter);

const mockSession = {
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    expires: '2099-01-01',
};

function makeUpdatedOrder(status: string) {
    return {
        id: 'order-1',
        orderNumber: 1001,
        status,
        contactPerson: null,
        createdBy: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        Office: { id: 'office-1', Company: { id: 'co-1', name: 'Test Co' } },
        WorkOrder: null,
        WalkInCustomer: null,
        OrderItems: [],
        OrderPayments: [],
        ShippingInfo: null,
        Invoice: null,
        OrderNotes: [],
    };
}

function makeDb(overrides: Record<string, any> = {}) {
    return {
        order: {
            findMany: vi.fn().mockResolvedValue([]),
            findUnique: vi.fn().mockResolvedValue(null),
            update: vi.fn(),
            ...overrides.order,
        },
        orderItem: {
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
            ...overrides.orderItem,
        },
    };
}

const baseStatusInput = {
    id: 'order-1',
    sendEmail: false,
    emailOverride: '',
};

// ─── updateStatus: item cascade ──────────────────────────────────────────────

describe('orderRouter.updateStatus — item cascade', () => {
    it('cascades Cancelled status to all order items', async () => {
        const db = makeDb({
            order: { update: vi.fn().mockResolvedValue(makeUpdatedOrder('Cancelled')) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.updateStatus({ ...baseStatusInput, status: OrderStatus.Cancelled });

        expect(db.orderItem.updateMany).toHaveBeenCalledWith({
            where: { orderId: 'order-1' },
            data: { status: 'Cancelled' },
        });
    });

    it('cascades Completed status to all order items', async () => {
        const db = makeDb({
            order: { update: vi.fn().mockResolvedValue(makeUpdatedOrder('Completed')) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.updateStatus({ ...baseStatusInput, status: OrderStatus.Completed });

        expect(db.orderItem.updateMany).toHaveBeenCalledWith({
            where: { orderId: 'order-1' },
            data: { status: 'Completed' },
        });
    });

    it('cascades Invoiced status to all order items', async () => {
        const db = makeDb({
            order: { update: vi.fn().mockResolvedValue(makeUpdatedOrder('Invoiced')) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.updateStatus({ ...baseStatusInput, status: OrderStatus.Invoiced });

        expect(db.orderItem.updateMany).toHaveBeenCalledWith({
            where: { orderId: 'order-1' },
            data: { status: 'Invoiced' },
        });
    });

    it('does not cascade for Pending status', async () => {
        const db = makeDb({
            order: { update: vi.fn().mockResolvedValue(makeUpdatedOrder('Pending')) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.updateStatus({ ...baseStatusInput, status: OrderStatus.Pending });

        expect(db.orderItem.updateMany).not.toHaveBeenCalled();
    });
});

// ─── updateStatus: order.update is called correctly ──────────────────────────

describe('orderRouter.updateStatus — order.update', () => {
    it('updates the order with the given status', async () => {
        const db = makeDb({
            order: { update: vi.fn().mockResolvedValue(makeUpdatedOrder('Pending')) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.updateStatus({ ...baseStatusInput, status: OrderStatus.Pending });

        expect(db.order.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'order-1' },
                data: expect.objectContaining({ status: OrderStatus.Pending }),
            }),
        );
    });
});

// ─── updateStatus: ShippingInfo missing ──────────────────────────────────────

describe('orderRouter.updateStatus — ShippingInfo missing', () => {
    it('throws NOT_FOUND when the nested ShippingInfo update fails', async () => {
        // withPrismaErrors re-throws TRPCErrors as-is; Prisma P2025 is converted to NOT_FOUND
        // by handlePrismaError before it reaches the procedure caller. Either path produces NOT_FOUND.
        const notFound = new TRPCError({ code: 'NOT_FOUND', message: 'Record not found' });
        const db = makeDb({
            order: { update: vi.fn().mockRejectedValue(notFound) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await expect(
            caller.updateStatus({ ...baseStatusInput, status: OrderStatus.Pending })
        ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
});

// ─── getByID ──────────────────────────────────────────────────────────────────

describe('orderRouter.getByID', () => {
    it('returns null when the order does not exist', async () => {
        const db = makeDb({ order: { findUnique: vi.fn().mockResolvedValue(null) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.getByID('nonexistent-id');

        expect(result).toBeNull();
    });
});
