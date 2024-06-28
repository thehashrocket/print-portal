import { PrismaClient, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const prisma = new PrismaClient();

type WorkOrderWithRelations = Prisma.WorkOrderGetPayload<{
    include: {
        WorkOrderItems: {
            include: {
                Typesetting: {
                    include: {
                        TypesettingOptions: true,
                        TypesettingProofs: true,
                    },
                },
                ProcessingOptions: true,
                WorkOrderItemStock: true,
            },
        },
        ShippingInfo: true,
    }
}>;

export async function convertWorkOrderToOrder(workOrderId: string, officeId: string) {
    console.log('Converting Work Order to Order');

    return await prisma.$transaction(async (tx) => {
        const workOrder = await getWorkOrder(tx, workOrderId);
        const order = await createOrder(tx, workOrder, officeId);
        await createOrderItems(tx, workOrder, order.id);
        await updateWorkOrder(tx, workOrderId, order.id);

        return order;
    });
}

async function getWorkOrder(tx: Prisma.TransactionClient, workOrderId: string): Promise<WorkOrderWithRelations> {
    const workOrder = await tx.workOrder.findUnique({
        where: { id: workOrderId },
        include: {
            WorkOrderItems: {
                include: {
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: true,
                        },
                    },
                    ProcessingOptions: true,
                    WorkOrderItemStock: true,
                },
            },
            ShippingInfo: true,
        },
    });

    if (!workOrder) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Work Order not found',
        });
    }

    return workOrder;
}

async function createOrder(tx: Prisma.TransactionClient, workOrder: WorkOrderWithRelations, officeId: string) {
    const order = await tx.order.create({
        data: {
            deposit: workOrder.deposit,
            description: workOrder.description,
            expectedDate: workOrder.expectedDate,
            officeId,
            shippingInfoId: workOrder.shippingInfoId ?? undefined,
            specialInstructions: workOrder.specialInstructions,
            status: "Pending",
            totalCost: workOrder.totalCost,
            createdById: workOrder.createdById,
            workOrderId: workOrder.id,
            version: 1,
        },
    });

    console.log('Order created:', order.id);
    return order;
}

async function createOrderItems(tx: Prisma.TransactionClient, workOrder: WorkOrderWithRelations, orderId: string) {
    console.log('Converting work order items to order items');

    for (const workOrderItem of workOrder.WorkOrderItems) {
        const orderItem = await createOrderItem(tx, workOrderItem, orderId);
        await updateTypesetting(tx, workOrderItem, orderItem.id);
        await createProcessingOptions(tx, workOrderItem, orderItem.id);
        await createOrderItemStock(tx, workOrderItem, orderItem.id);
    }
}

async function createOrderItem(tx: Prisma.TransactionClient, workOrderItem: WorkOrderWithRelations['WorkOrderItems'][0], orderId: string) {
    const orderItem = await tx.orderItem.create({
        data: {
            orderId,
            approved: workOrderItem.approved,
            artwork: workOrderItem.artwork,
            amount: workOrderItem.amount,
            cost: workOrderItem.cost,
            costPerM: workOrderItem.costPerM,
            cs: workOrderItem.cs ?? "",
            description: workOrderItem.description,
            expectedDate: workOrderItem.expectedDate,
            finishedQty: workOrderItem.finishedQty ?? 0,
            inkColor: workOrderItem.inkColor,
            overUnder: workOrderItem.overUnder,
            plateRan: workOrderItem.plateRan,
            prepTime: workOrderItem.prepTime,
            pressRun: workOrderItem.pressRun ?? "",
            quantity: workOrderItem.quantity,
            size: workOrderItem.size,
            specialInstructions: workOrderItem.specialInstructions,
            stockOnHand: workOrderItem.stockOnHand,
            stockOrdered: workOrderItem.stockOrdered,
            createdById: workOrderItem.createdById,
            status: "Pending",
        },
    });

    console.log('Order Item created');
    return orderItem;
}

async function updateTypesetting(tx: Prisma.TransactionClient, workOrderItem: WorkOrderWithRelations['WorkOrderItems'][0], orderItemId: string) {
    if (workOrderItem.Typesetting && workOrderItem.Typesetting.length > 0) {
        for (const typesetting of workOrderItem.Typesetting) {
            await tx.typesetting.update({
                where: { id: typesetting.id },
                data: { orderItemId },
            });
            console.log(`Typesetting updated: ${typesetting.id}`);
        }
    }
}

async function createProcessingOptions(tx: Prisma.TransactionClient, workOrderItem: WorkOrderWithRelations['WorkOrderItems'][0], orderItemId: string) {
    for (const processingOption of workOrderItem.ProcessingOptions) {
        await tx.processingOptions.create({
            data: {
                ...processingOption,
                id: undefined,
                orderItemId,
                workOrderItemId: undefined,
            },
        });
        console.log('Processing Option created');
    }
}

async function createOrderItemStock(tx: Prisma.TransactionClient, workOrderItem: WorkOrderWithRelations['WorkOrderItems'][0], orderItemId: string) {
    for (const stock of workOrderItem.WorkOrderItemStock) {
        await tx.orderItemStock.create({
            data: {
                ...stock,
                id: undefined,
                orderItemId,
            },
        });
        console.log('Order Stock created');
    }
}

async function updateWorkOrder(tx: Prisma.TransactionClient, workOrderId: string, orderId: string) {
    await tx.workOrder.update({
        where: { id: workOrderId },
        data: { Order: { connect: { id: orderId } } },
    });
}