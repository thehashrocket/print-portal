import { PrismaClient, Prisma, OrderStatus, OrderItemStatus, WorkOrderStatus, WorkOrderItemStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { normalizeWorkOrder } from "~/utils/dataNormalization";
import { type SerializedWorkOrder, type SerializedWorkOrderItem } from "~/types/serializedTypes";

const prisma = new PrismaClient();
const SALES_TAX = 0.07;

export async function convertWorkOrderToOrder(workOrderId: string, officeId: string) {

    return await prisma.$transaction(async (tx) => {
        const workOrder = await getWorkOrder(tx, workOrderId);
        const order = await createOrder(tx, workOrder, officeId);
        await createOrderItems(tx, workOrder, order.id);
        const updatedWorkOrder = await updateWorkOrder(tx, workOrderId, order.id) as unknown as {
            WorkOrderItems: Array<{
                cost: Prisma.Decimal | null;
                amount: Prisma.Decimal | null;
                shippingAmount: Prisma.Decimal | null;
            }>;
        };

        // Calculate totalAmount and totalCost
        const totalCost = updatedWorkOrder.WorkOrderItems.reduce(
            (sum: Prisma.Decimal, item: { cost: Prisma.Decimal | null }) => 
                sum.add(item.cost || new Prisma.Decimal(0)),
            new Prisma.Decimal(0)
        );

        const totalItemAmount = updatedWorkOrder.WorkOrderItems.reduce(
            (sum: Prisma.Decimal, item: { amount: Prisma.Decimal | null }) => 
                sum.add(item.amount || new Prisma.Decimal(0)),
            new Prisma.Decimal(0)
        );

        const totalShippingAmount = updatedWorkOrder.WorkOrderItems.reduce(
            (sum: Prisma.Decimal, item: { shippingAmount: Prisma.Decimal | null }) => 
                sum.add(item.shippingAmount || new Prisma.Decimal(0)),
            new Prisma.Decimal(0)
        );

        const totalAmount = totalItemAmount.add(totalShippingAmount);
        const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
        const calculatedSubTotal = totalAmount.sub(calculatedSalesTax);

        return {
            ...updatedWorkOrder,
            calculatedSalesTax,
            calculatedSubTotal,
            totalAmount,
            totalCost,
            totalItemAmount,
            totalShippingAmount,
            Order: { id: order.id },
        };
    });
}

async function getWorkOrder(tx: Prisma.TransactionClient, workOrderId: string): Promise<SerializedWorkOrder> {
    const workOrder = await tx.workOrder.findUnique({
        where: { id: workOrderId },
        include: {
            WorkOrderItems: {
                include: {
                    artwork: true, // Add this line
                    createdBy: true,
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: true,
                        },
                    },
                    ProcessingOptions: true,
                    ProductType: true,
                    WorkOrderItemStock: {
                        include: {
                            PaperProduct: true,
                        },
                    },
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
            Orders: true,
            WorkOrderNotes: true,
            WorkOrderVersions: true,
            WalkInCustomer: true,
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
        return sum.add(item.cost || new Prisma.Decimal(0));
    }, new Prisma.Decimal(0));

    // Calculate totalAmount
    const totalItemAmount = workOrder.WorkOrderItems.reduce((sum, item) => {
        return sum.add(item.amount || new Prisma.Decimal(0));
    }, new Prisma.Decimal(0));

    // Calculate totalShippingAmount
    const totalShippingAmount = workOrder.WorkOrderItems.reduce((sum, item) => {
        return sum.add(item.shippingAmount || new Prisma.Decimal(0));
    }, new Prisma.Decimal(0));

    // Calculate totalAmount
    const totalAmount = totalItemAmount.add(totalShippingAmount)
    const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
    const calculatedSubTotal = totalAmount.sub(calculatedSalesTax);

    // Prepare the data for normalization
    const workOrderData = {
        ...workOrder,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalCost,
        totalItemAmount,
        totalShippingAmount,
        Order: { id: workOrder.Orders?.[0]?.id ?? null },
        contactPerson: {
            id: workOrder.contactPerson?.id ?? '',
            name: workOrder.contactPerson?.name ?? null,
            email: workOrder.contactPerson?.email ?? null,
        },
    };

    return normalizeWorkOrder(workOrderData);
}

async function createOrder(tx: Prisma.TransactionClient, workOrder: SerializedWorkOrder, officeId: string) {
    const order = await tx.order.create({
        data: {
            officeId,
            status: OrderStatus.Pending,
            createdById: workOrder.createdById,
            workOrderId: workOrder.id,
            version: 1,
            dateInvoiced: null,
            inHandsDate: new Date(workOrder.inHandsDate),
            invoicePrintEmail: workOrder.invoicePrintEmail,
            contactPersonId: workOrder.contactPersonId || undefined,
            shippingInfoId: workOrder.shippingInfoId || undefined,
            isWalkIn: workOrder.isWalkIn,
            walkInCustomerId: workOrder.walkInCustomerId || undefined,
        },
    });

    return order;
}

async function createOrderItems(tx: Prisma.TransactionClient, workOrder: SerializedWorkOrder, orderId: string) {

    for (const workOrderItem of workOrder.WorkOrderItems) {
        const orderItem = await createOrderItem(tx, workOrderItem, orderId, workOrderItem.createdById);
        await updateTypesetting(tx, workOrderItem.id, orderItem.id);
        await createProcessingOptions(tx, workOrderItem.id, orderItem.id);
        await createOrderItemStock(tx, workOrderItem.id, orderItem.id);
    }
}

async function createOrderItem(tx: Prisma.TransactionClient, workOrderItem: SerializedWorkOrderItem, orderId: string, createdById: string) {
    const orderItem = await tx.orderItem.create({
        data: {
            orderId,
            amount: workOrderItem.amount ? new Prisma.Decimal(workOrderItem.amount) : null,
            cost: workOrderItem.cost ? new Prisma.Decimal(workOrderItem.cost) : null,
            createdById: createdById,
            description: workOrderItem.description,
            expectedDate: new Date(workOrderItem.expectedDate),
            finishedQty: 0,
            ink: workOrderItem.ink,
            paperProductId: workOrderItem.paperProductId,
            productTypeId: workOrderItem.ProductType?.id,
            prepTime: null,
            pressRun: '0',
            quantity: workOrderItem.quantity,
            shippingAmount: null,
            size: workOrderItem.size,
            specialInstructions: null,
            status: OrderItemStatus.Prepress,
        },
    });

    // Add the artwork
    if (workOrderItem.artwork) {
        await Promise.all(workOrderItem.artwork.map(async (artwork) => {
            return tx.orderItemArtwork.create({
                data: {
                    fileUrl: artwork.fileUrl,
                    description: artwork.description,
                    orderItemId: orderItem.id,
                },
            });
        }));
    }
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
                paperProductId: stock.paperProductId,
            },
        });
    }
}

async function updateWorkOrder(tx: Prisma.TransactionClient, workOrderId: string, orderId: string) {
    return await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
            status: WorkOrderStatus.Approved,
            Orders: {
                connect: { id: orderId }
            },
            WorkOrderItems: {
                updateMany: {
                    where: { workOrderId },
                    data: { status: WorkOrderItemStatus.Approved }
                }
            }
        },
        include: {
            contactPerson: true,
            createdBy: true,
            Office: {
                include: {
                    Company: true,
                }
            },
            Orders: true,
            ShippingInfo: {
                include: {
                    Address: true,
                    ShippingPickup: true,
                }
            },
            WorkOrderItems: {
                include: {
                    artwork: true,
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: true,
                        }
                    },
                    ProcessingOptions: true,
                    WorkOrderItemStock: true,
                    createdBy: true,
                }
            },
            WorkOrderNotes: true,
            WorkOrderVersions: true,
        }
    });
}