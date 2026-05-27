import { vi, describe, it, expect } from 'vitest';
import { OrderItemStatus } from '~/generated/prisma/client';
import { TRPCError } from '@trpc/server';
import { createCallerFactory } from '~/server/api/trpc';
import { orderItemRouter } from '../orderItem';

vi.mock('~/utils/dataNormalization', () => ({
    normalizeOrderItem: vi.fn((item: any) => item),
}));

vi.mock('~/utils/sengrid', () => ({
    sendOrderStatusEmail: vi.fn().mockResolvedValue(undefined),
}));

const createCaller = createCallerFactory(orderItemRouter);

const mockSession = {
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    expires: '2099-01-01',
};

function makeDb(overrides: Record<string, any> = {}) {
    return {
        orderItem: {
            findUnique: vi.fn().mockResolvedValue(null),
            findUniqueOrThrow: vi.fn().mockResolvedValue({ status: OrderItemStatus.Pending, orderId: 'order-1' }),
            update: vi.fn().mockResolvedValue({
                id: 'item-1',
                status: OrderItemStatus.Press,
                description: 'Business cards',
                Order: null,
            }),
            ...overrides.orderItem,
        },
        orderItemVersion: {
            create: vi.fn().mockResolvedValue({}),
            ...overrides.orderItemVersion,
        },
    };
}

// ─── updateStatus ─────────────────────────────────────────────────────────────

describe('orderItemRouter.updateStatus', () => {
    it('creates an OrderItemVersion with previousStatus, newStatus, orderId, and changedById', async () => {
        const db = makeDb({
            orderItem: {
                findUniqueOrThrow: vi.fn().mockResolvedValue({ status: OrderItemStatus.Pending, orderId: 'order-1' }),
                update: vi.fn().mockResolvedValue({ id: 'item-1', status: OrderItemStatus.Press, description: 'cards', Order: null }),
            },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await caller.updateStatus({ id: 'item-1', status: OrderItemStatus.Press });

        expect(db.orderItemVersion.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    orderItemId: 'item-1',
                    orderId: 'order-1',
                    changedById: 'user-1',
                    previousStatus: OrderItemStatus.Pending,
                    newStatus: OrderItemStatus.Press,
                }),
            }),
        );
    });

    it('returns the updated item regardless of version write', async () => {
        const updatedItem = { id: 'item-1', status: OrderItemStatus.Press, description: 'cards', Order: null };
        const db = makeDb({
            orderItem: { update: vi.fn().mockResolvedValue(updatedItem) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        const result = await caller.updateStatus({ id: 'item-1', status: OrderItemStatus.Press });

        expect(result).toStrictEqual(updatedItem);
    });

    it('throws NOT_FOUND when the order item does not exist', async () => {
        const notFound = new TRPCError({ code: 'NOT_FOUND', message: 'Record not found' });
        const db = makeDb({
            orderItem: { findUniqueOrThrow: vi.fn().mockRejectedValue(notFound) },
        });
        const caller = createCaller({ db: db as any, session: mockSession, headers: new Headers() });

        await expect(
            caller.updateStatus({ id: 'nonexistent', status: OrderItemStatus.Press }),
        ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
});
