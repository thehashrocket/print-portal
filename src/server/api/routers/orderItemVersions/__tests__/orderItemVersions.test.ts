import { vi, describe, it, expect } from 'vitest';
import { OrderItemStatus } from '~/generated/prisma/client';
import { createCallerFactory } from '~/server/api/trpc';
import { orderItemVersionsRouter } from '../index';

const createCaller = createCallerFactory(orderItemVersionsRouter);

const mockSession = {
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    expires: '2099-01-01',
};

const mockVersion = (overrides = {}) => ({
    id: 'v-1',
    orderItemId: 'item-1',
    orderId: 'order-1',
    changedById: 'user-1',
    changedAt: new Date('2026-01-01'),
    previousStatus: null,
    newStatus: OrderItemStatus.Press,
    changedFields: null,
    changedBy: { id: 'user-1', name: 'Test User' },
    ...overrides,
});

function makeDb(overrides: Record<string, any> = {}) {
    return {
        orderItemVersion: {
            findMany: vi.fn().mockResolvedValue([]),
            ...overrides.orderItemVersion,
        },
    };
}

// ─── getStatusHistory ────────────────────────────────────────────────────────

describe('orderItemVersionsRouter.getStatusHistory', () => {
    it('returns rows matching orderItemId', async () => {
        const rows = [mockVersion()];
        const db = makeDb({ orderItemVersion: { findMany: vi.fn().mockResolvedValue(rows) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.getStatusHistory({ orderItemId: 'item-1' });

        expect(db.orderItemVersion.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { orderItemId: 'item-1' } }),
        );
        expect(result).toBe(rows);
    });

    it('filters by statuses when provided', async () => {
        const db = makeDb({ orderItemVersion: { findMany: vi.fn().mockResolvedValue([]) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.getStatusHistory({
            orderItemId: 'item-1',
            statuses: [OrderItemStatus.Press, OrderItemStatus.Completed],
        });

        expect(db.orderItemVersion.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    orderItemId: 'item-1',
                    newStatus: { in: [OrderItemStatus.Press, OrderItemStatus.Completed] },
                },
            }),
        );
    });

    it('returns all rows when no statuses filter provided', async () => {
        const rows = [mockVersion(), mockVersion({ id: 'v-2', newStatus: OrderItemStatus.Shipping })];
        const db = makeDb({ orderItemVersion: { findMany: vi.fn().mockResolvedValue(rows) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.getStatusHistory({ orderItemId: 'item-1' });

        expect(result).toHaveLength(2);
    });

    it('includes changedBy user fields', async () => {
        const db = makeDb({ orderItemVersion: { findMany: vi.fn().mockResolvedValue([]) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.getStatusHistory({ orderItemId: 'item-1' });

        expect(db.orderItemVersion.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                include: { changedBy: { select: { id: true, name: true } } },
            }),
        );
    });

    it('returns an empty array when no versions exist for the item', async () => {
        const db = makeDb({ orderItemVersion: { findMany: vi.fn().mockResolvedValue([]) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.getStatusHistory({ orderItemId: 'item-no-history' });

        expect(result).toEqual([]);
    });

    it('applies no status filter when statuses is an empty array', async () => {
        const db = makeDb({ orderItemVersion: { findMany: vi.fn().mockResolvedValue([]) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.getStatusHistory({ orderItemId: 'item-1', statuses: [] });

        expect(db.orderItemVersion.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { orderItemId: 'item-1' } }),
        );
        // newStatus should NOT appear in where clause for empty array
        const call = (db.orderItemVersion.findMany as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
        expect(call.where).not.toHaveProperty('newStatus');
    });

    it('orders results by changedAt ascending', async () => {
        const db = makeDb({ orderItemVersion: { findMany: vi.fn().mockResolvedValue([]) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.getStatusHistory({ orderItemId: 'item-1' });

        expect(db.orderItemVersion.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ orderBy: { changedAt: 'asc' } }),
        );
    });
});

// ─── getByOrderId ─────────────────────────────────────────────────────────────

describe('orderItemVersionsRouter.getByOrderId', () => {
    it('returns all versions for the given orderId', async () => {
        const rows = [mockVersion(), mockVersion({ id: 'v-2', orderItemId: 'item-2' })];
        const db = makeDb({ orderItemVersion: { findMany: vi.fn().mockResolvedValue(rows) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.getByOrderId({ orderId: 'order-1' });

        expect(db.orderItemVersion.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { orderId: 'order-1' } }),
        );
        expect(result).toBe(rows);
    });

    it('returns an empty array when no versions exist for the order', async () => {
        const db = makeDb({ orderItemVersion: { findMany: vi.fn().mockResolvedValue([]) } });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.getByOrderId({ orderId: 'order-no-history' });

        expect(result).toEqual([]);
    });
});
