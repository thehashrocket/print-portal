import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OrderStatus, WorkOrderStatus, WorkOrderItemStatus } from '~/generated/prisma/client';
import { TRPCError } from '@trpc/server';
import { convertWorkOrderToOrder } from '../workOrderToOrderService';

vi.mock('~/utils/dataNormalization', () => ({
    normalizeWorkOrder: vi.fn((wo: any) => ({
        ...wo,
        WorkOrderItems: wo.WorkOrderItems ?? [],
    })),
    normalizeWorkOrderItem: vi.fn((item: any) => item),
}));

vi.mock('~/server/db', () => ({ db: {} }));

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeItem(overrides: Record<string, any> = {}) {
    return {
        id: 'woi-1',
        workOrderId: 'wo-1',
        amount: '100.00',
        cost: '80.00',
        shippingAmount: '10.00',
        description: 'Test item',
        expectedDate: new Date('2026-02-01').toISOString(),
        ink: 'CMYK',
        quantity: 100,
        size: '8.5x11',
        status: 'Pending',
        createdById: 'user-1',
        paperProductId: null,
        ProductType: null,
        ShippingInfo: null,
        artwork: [],
        ProcessingOptions: [],
        WorkOrderItemStock: [],
        Typesetting: [],
        ...overrides,
    };
}

function makeRawWorkOrder(overrides: Record<string, any> = {}) {
    return {
        id: 'wo-1',
        officeId: 'office-1',
        status: 'Pending',
        dateIn: new Date('2026-01-01'),
        inHandsDate: new Date('2026-02-01'),
        invoicePrintEmail: 'Print',
        purchaseOrderNumber: null,
        contactPersonId: null,
        shippingInfoId: null,
        isWalkIn: false,
        walkInCustomerId: null,
        createdById: 'user-1',
        version: 1,
        estimateNumber: null,
        workOrderNumber: null,
        WorkOrderItems: [],
        contactPerson: null,
        createdBy: { id: 'user-1', name: 'Test', email: 'test@example.com' },
        Office: { id: 'office-1', name: 'Main', isWalkInOffice: false, Company: { name: 'Co' } },
        ShippingInfo: null,
        Orders: [],
        WorkOrderNotes: [],
        WorkOrderVersions: [],
        WalkInCustomer: null,
        ...overrides,
    };
}

function makeUpdatedWorkOrder() {
    return {
        ...makeRawWorkOrder(),
        status: WorkOrderStatus.Approved,
        Orders: [{ id: 'order-1' }],
    };
}

function makeTx(overrides: Record<string, any> = {}) {
    return {
        workOrder: {
            findUnique: vi.fn().mockResolvedValue(makeRawWorkOrder()),
            update: vi.fn().mockResolvedValue(makeUpdatedWorkOrder()),
            ...overrides.workOrder,
        },
        order: {
            create: vi.fn().mockResolvedValue({ id: 'order-1' }),
            ...overrides.order,
        },
        orderItem: {
            create: vi.fn().mockResolvedValue({ id: 'oi-1' }),
            ...overrides.orderItem,
        },
        orderItemArtwork: {
            create: vi.fn().mockResolvedValue({}),
            ...overrides.orderItemArtwork,
        },
        shippingInfo: {
            create: vi.fn().mockResolvedValue({ id: 'si-new' }),
            ...overrides.shippingInfo,
        },
        shippingPickup: {
            create: vi.fn().mockResolvedValue({}),
            ...overrides.shippingPickup,
        },
        typesetting: {
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
            ...overrides.typesetting,
        },
        processingOptions: {
            findMany: vi.fn().mockResolvedValue([]),
            createMany: vi.fn().mockResolvedValue({}),
            ...overrides.processingOptions,
        },
        workOrderItemStock: {
            findMany: vi.fn().mockResolvedValue([]),
            ...overrides.workOrderItemStock,
        },
        orderItemStock: {
            createMany: vi.fn().mockResolvedValue({}),
            ...overrides.orderItemStock,
        },
    };
}

function makePrismaClient(tx: ReturnType<typeof makeTx>) {
    return {
        $transaction: vi.fn((fn: (tx: any) => Promise<any>) => fn(tx)),
    } as any;
}

// ─── WO not found ─────────────────────────────────────────────────────────────

describe('convertWorkOrderToOrder — WO not found', () => {
    it('throws NOT_FOUND TRPCError when work order does not exist', async () => {
        const tx = makeTx({ workOrder: { findUnique: vi.fn().mockResolvedValue(null) } });
        const prisma = makePrismaClient(tx);

        await expect(
            convertWorkOrderToOrder('nonexistent', 'office-1', prisma)
        ).rejects.toThrow(TRPCError);

        await expect(
            convertWorkOrderToOrder('nonexistent', 'office-1', prisma)
        ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
});

// ─── Happy path ───────────────────────────────────────────────────────────────

describe('convertWorkOrderToOrder — happy path', () => {
    let tx: ReturnType<typeof makeTx>;
    let prisma: ReturnType<typeof makePrismaClient>;

    beforeEach(() => {
        tx = makeTx();
        prisma = makePrismaClient(tx);
    });

    it('creates an Order with status Pending and correct officeId', async () => {
        await convertWorkOrderToOrder('wo-1', 'office-1', prisma);
        expect(tx.order.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                officeId: 'office-1',
                status: OrderStatus.Pending,
                workOrderId: 'wo-1',
                createdById: 'user-1',
            }),
        }));
    });

    it('updates WorkOrder to Approved and connects the new Order', async () => {
        await convertWorkOrderToOrder('wo-1', 'office-1', prisma);
        expect(tx.workOrder.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'wo-1' },
            data: expect.objectContaining({
                status: WorkOrderStatus.Approved,
                Orders: { connect: { id: 'order-1' } },
                WorkOrderItems: expect.objectContaining({
                    updateMany: expect.objectContaining({
                        data: { status: WorkOrderItemStatus.Approved },
                    }),
                }),
            }),
        }));
    });

    it('returns void', async () => {
        const result = await convertWorkOrderToOrder('wo-1', 'office-1', prisma);
        expect(result).toBeUndefined();
    });
});

// ─── createOrderItems: artwork ────────────────────────────────────────────────

describe('convertWorkOrderToOrder — item artwork', () => {
    it('creates orderItemArtwork for each artwork entry', async () => {
        const tx = makeTx({
            workOrder: {
                findUnique: vi.fn().mockResolvedValue(makeRawWorkOrder({
                    WorkOrderItems: [makeItem({
                        artwork: [
                            { fileUrl: 'http://example.com/art1.pdf', description: 'Logo' },
                            { fileUrl: 'http://example.com/art2.pdf', description: 'Header' },
                        ],
                    })],
                })),
            },
        });
        const prisma = makePrismaClient(tx);

        await convertWorkOrderToOrder('wo-1', 'office-1', prisma);

        expect(tx.orderItemArtwork.create).toHaveBeenCalledTimes(2);
        expect(tx.orderItemArtwork.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ fileUrl: 'http://example.com/art1.pdf', orderItemId: 'oi-1' }),
        }));
    });

    it('does not call orderItemArtwork.create when item has no artwork', async () => {
        const tx = makeTx({
            workOrder: {
                findUnique: vi.fn().mockResolvedValue(makeRawWorkOrder({
                    WorkOrderItems: [makeItem({ artwork: [] })],
                })),
            },
        });
        const prisma = makePrismaClient(tx);

        await convertWorkOrderToOrder('wo-1', 'office-1', prisma);

        expect(tx.orderItemArtwork.create).not.toHaveBeenCalled();
    });
});

// ─── createOrderItems: ShippingInfo duplication ───────────────────────────────

describe('convertWorkOrderToOrder — item ShippingInfo duplication', () => {
    const shippingInfo = {
        id: 'si-orig',
        officeId: 'office-1',
        instructions: 'Handle with care',
        shippingMethod: 'Ground',
        shippingCost: '15.00',
        shippingDate: null,
        shippingNotes: null,
        shippingOther: null,
        shipToSameAsBillTo: false,
        attentionTo: null,
        addressId: null,
        numberOfPackages: null,
        estimatedDelivery: null,
        trackingNumber: [],
        ShippingPickup: null,
    };

    it('creates a new ShippingInfo record for the order item', async () => {
        const tx = makeTx({
            workOrder: {
                findUnique: vi.fn().mockResolvedValue(makeRawWorkOrder({
                    WorkOrderItems: [makeItem({ ShippingInfo: shippingInfo })],
                })),
            },
        });
        const prisma = makePrismaClient(tx);

        await convertWorkOrderToOrder('wo-1', 'office-1', prisma);

        expect(tx.shippingInfo.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ instructions: 'Handle with care' }),
        }));
        expect(tx.orderItem.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ shippingInfoId: 'si-new' }),
        }));
    });

    it('creates ShippingPickup when item ShippingInfo has one', async () => {
        const tx = makeTx({
            workOrder: {
                findUnique: vi.fn().mockResolvedValue(makeRawWorkOrder({
                    WorkOrderItems: [makeItem({
                        ShippingInfo: {
                            ...shippingInfo,
                            ShippingPickup: {
                                pickupDate: new Date('2026-02-10').toISOString(),
                                pickupTime: '14:00',
                                contactName: 'Alice',
                                contactPhone: '555-9999',
                                notes: null,
                                createdById: 'user-1',
                            },
                        },
                    })],
                })),
            },
        });
        const prisma = makePrismaClient(tx);

        await convertWorkOrderToOrder('wo-1', 'office-1', prisma);

        expect(tx.shippingPickup.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ shippingInfoId: 'si-new', contactName: 'Alice' }),
        }));
    });

    it('does not create ShippingInfo when item has none', async () => {
        const tx = makeTx({
            workOrder: {
                findUnique: vi.fn().mockResolvedValue(makeRawWorkOrder({
                    WorkOrderItems: [makeItem({ ShippingInfo: null })],
                })),
            },
        });
        const prisma = makePrismaClient(tx);

        await convertWorkOrderToOrder('wo-1', 'office-1', prisma);

        expect(tx.shippingInfo.create).not.toHaveBeenCalled();
    });
});

// ─── createOrderItems: processingOptions ─────────────────────────────────────

describe('convertWorkOrderToOrder — item processingOptions', () => {
    it('creates processingOptions for the order item', async () => {
        const option = {
            id: 'po-1', cutting: true, padding: false, drilling: false, folding: false,
            other: null, numberingStart: null, numberingEnd: null, numberingColor: null,
            createdById: 'user-1', description: null, stitching: false, binderyTime: null,
            binding: null, workOrderItemId: 'woi-1', orderItemId: null,
        };
        const tx = makeTx({
            workOrder: { findUnique: vi.fn().mockResolvedValue(makeRawWorkOrder({ WorkOrderItems: [makeItem()] })) },
            processingOptions: { findMany: vi.fn().mockResolvedValue([option]), createMany: vi.fn().mockResolvedValue({}) },
        });
        const prisma = makePrismaClient(tx);

        await convertWorkOrderToOrder('wo-1', 'office-1', prisma);

        expect(tx.processingOptions.createMany).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.arrayContaining([expect.objectContaining({ cutting: true, orderItemId: 'oi-1' })]),
        }));
    });

    it('skips createMany when no processingOptions exist', async () => {
        const tx = makeTx({
            workOrder: { findUnique: vi.fn().mockResolvedValue(makeRawWorkOrder({ WorkOrderItems: [makeItem()] })) },
            processingOptions: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn() },
        });
        const prisma = makePrismaClient(tx);

        await convertWorkOrderToOrder('wo-1', 'office-1', prisma);

        expect(tx.processingOptions.createMany).not.toHaveBeenCalled();
    });
});

// ─── createOrderItems: WorkOrderItemStock ────────────────────────────────────

describe('convertWorkOrderToOrder — item WorkOrderItemStock', () => {
    it('creates orderItemStock for the order item', async () => {
        const stock = {
            id: 'stock-1', workOrderItemId: 'woi-1', stockQty: 500,
            costPerM: '10.00', totalCost: '5.00', from: 'Vendor',
            expectedDate: null, orderedDate: null, received: false, receivedDate: null,
            notes: null, stockStatus: 'Ordered', createdById: 'user-1', paperProductId: null,
        };
        const tx = makeTx({
            workOrder: { findUnique: vi.fn().mockResolvedValue(makeRawWorkOrder({ WorkOrderItems: [makeItem()] })) },
            workOrderItemStock: { findMany: vi.fn().mockResolvedValue([stock]) },
        });
        const prisma = makePrismaClient(tx);

        await convertWorkOrderToOrder('wo-1', 'office-1', prisma);

        expect(tx.orderItemStock.createMany).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.arrayContaining([expect.objectContaining({ stockQty: 500, orderItemId: 'oi-1' })]),
        }));
    });
});

// ─── typesetting migration ────────────────────────────────────────────────────

describe('convertWorkOrderToOrder — typesetting migration', () => {
    it('updates typesetting records to point at the new order item', async () => {
        const tx = makeTx({
            workOrder: { findUnique: vi.fn().mockResolvedValue(makeRawWorkOrder({ WorkOrderItems: [makeItem()] })) },
        });
        const prisma = makePrismaClient(tx);

        await convertWorkOrderToOrder('wo-1', 'office-1', prisma);

        expect(tx.typesetting.updateMany).toHaveBeenCalledWith({
            where: { workOrderItemId: 'woi-1' },
            data: { orderItemId: 'oi-1' },
        });
    });
});
