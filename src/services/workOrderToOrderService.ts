import { PrismaClient, Prisma, OrderStatus, OrderItemStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { normalizeWorkOrder } from "~/utils/dataNormalization";
import { SerializedWorkOrder, SerializedWorkOrderItem } from "~/types/serializedTypes";

const prisma = new PrismaClient();

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

async function getWorkOrder(tx: Prisma.TransactionClient, workOrderId: string): Promise<SerializedWorkOrder> {
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
            ShippingInfo: {
                include: {
                    Address: true,
                    ShippingPickup: true,
                },
            },
            Office: {
                include: {
                    Company: true,
                },
            },
            contactPerson: true,
            createdBy: true,
            Order: true,
        },
    });

    if (!workOrder) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Work Order not found',
        });
    }

    // Calculate totalCost
    const totalCost = workOrder.WorkOrderItems.reduce((sum, item) => {
        return sum.add(item.amount || 0);
    }, new Prisma.Decimal(0));

    // Prepare the data for normalization
    const workOrderData = {
        ...workOrder,
        totalCost,
        Order: workOrder.Order ? { id: workOrder.Order.id } : null,
    };

    return normalizeWorkOrder(workOrderData);
}

async function createOrder(tx: Prisma.TransactionClient, workOrder: SerializedWorkOrder, officeId: string) {
    const order = await tx.order.create({
        data: {
            officeId,
            shippingInfoId: workOrder.shippingInfoId ?? undefined,
            status: OrderStatus.Pending,
            createdById: workOrder.createdById,
            contactPersonId: workOrder.contactPersonId,
            workOrderId: workOrder.id,
            version: 1,
            dateInvoiced: null,
            inHandsDate: new Date(workOrder.inHandsDate),
            invoicePrintEmail: workOrder.invoicePrintEmail,
        },
    });

    console.log('Order created:', order.id);
    return order;
}

async function createOrderItems(tx: Prisma.TransactionClient, workOrder: SerializedWorkOrder, orderId: string) {
    console.log('Converting work order items to order items');

    for (const workOrderItem of workOrder.WorkOrderItems) {
        const orderItem = await createOrderItem(tx, workOrderItem, orderId);
        await updateTypesetting(tx, workOrderItem.id, orderItem.id);
        await createProcessingOptions(tx, workOrderItem.id, orderItem.id);
        await createOrderItemStock(tx, workOrderItem.id, orderItem.id);
    }
}

async function createOrderItem(tx: Prisma.TransactionClient, workOrderItem: SerializedWorkOrderItem, orderId: string) {
    const orderItem = await tx.orderItem.create({
        data: {
            orderId,
            approved: false,
            amount: workOrderItem.amount ? new Prisma.Decimal(workOrderItem.amount) : null,
            cost: workOrderItem.cost ? new Prisma.Decimal(workOrderItem.cost) : null,
            costPerM: workOrderItem.costPerM ? new Prisma.Decimal(workOrderItem.costPerM) : null,
            customerSuppliedStock: workOrderItem.customerSuppliedStock ?? "",
            description: workOrderItem.description,
            expectedDate: new Date(),
            finishedQty: 0,
            inkColor: workOrderItem.inkColor ?? null,
            prepTime: null,
            pressRun: '0',
            quantity: parseInt(workOrderItem.quantity),
            size: null,
            specialInstructions: null,
            stockOnHand: false,
            stockOrdered: null,
            overUnder: '0',
            createdById: "", // You'll need to set this appropriately
            status: OrderItemStatus.Pending,
        },
    });

    // Add the artwork
    if (workOrderItem.artwork) {
        workOrderItem.artwork.forEach(async (artwork) => {
            await tx.orderItemArtwork.create({
                data: {
                    fileUrl: artwork.fileUrl,
                    description: artwork.description,
                    orderItemId: orderItem.id,
                },
            });

            console.log('Artwork created');
        });
    }

    console.log('Order Item created');
    return orderItem;
}

async function updateTypesetting(tx: Prisma.TransactionClient, workOrderItemId: string, orderItemId: string) {
    const typesettings = await tx.typesetting.findMany({
        where: { workOrderItemId },
    });

    for (const typesetting of typesettings) {
        await tx.typesetting.update({
            where: { id: typesetting.id },
            data: { orderItemId },
        });
        console.log(`Typesetting updated: ${typesetting.id}`);
    }
}

async function createProcessingOptions(tx: Prisma.TransactionClient, workOrderItemId: string, orderItemId: string) {
    const processingOptions = await tx.processingOptions.findMany({
        where: { workOrderItemId },
    });

    for (const processingOption of processingOptions) {
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

async function createOrderItemStock(tx: Prisma.TransactionClient, workOrderItemId: string, orderItemId: string) {
    const stocks = await tx.workOrderItemStock.findMany({
        where: { workOrderItemId },
    });

    for (const stock of stocks) {
        await tx.orderItemStock.create({
            data: {
                stockQty: stock.stockQty,
                costPerM: stock.costPerM,
                totalCost: stock.totalCost,
                from: stock.from,
                expectedDate: stock.expectedDate,
                orderedDate: stock.orderedDate,
                received: stock.received,
                receivedDate: stock.receivedDate,
                notes: stock.notes,
                stockStatus: stock.stockStatus,
                createdById: stock.createdById,
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