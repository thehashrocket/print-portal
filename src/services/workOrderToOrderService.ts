import { type PrismaClient, Prisma, OrderStatus, OrderItemStatus, WorkOrderStatus, WorkOrderItemStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { normalizeWorkOrder } from "~/utils/dataNormalization";
import { type SerializedWorkOrder, type SerializedWorkOrderItem } from "~/types/serializedTypes";

const SALES_TAX = 0.07;

interface CalculatedTotals {
    totalCost: Prisma.Decimal;
    totalItemAmount: Prisma.Decimal;
    totalShippingAmount: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    calculatedSalesTax: Prisma.Decimal;
    calculatedSubTotal: Prisma.Decimal;
}

export async function convertWorkOrderToOrder(
    workOrderId: string,
    officeId: string,
    prisma?: PrismaClient
): Promise<SerializedWorkOrder & { Order: { id: string } }> {
    // Import prisma client if not provided (for backward compatibility)
    const { PrismaClient } = await import("@prisma/client");
    const client = prisma || new PrismaClient();

    return await client.$transaction(async (tx) => {
        const workOrder = await getWorkOrder(tx, workOrderId);
        const order = await createOrder(tx, workOrder, officeId);
        await createOrderItems(tx, workOrder, order.id);
        const updatedWorkOrder = await updateWorkOrder(tx, workOrderId, order.id);

        // Calculate totals once using the updated work order items
        const totals = calculateTotals(updatedWorkOrder.WorkOrderItems);

        // Normalize the updated work order to ensure proper serialization
        const normalizedWorkOrder = normalizeWorkOrder({
            ...updatedWorkOrder,
            ...totals,
            Orders: [{ id: order.id }], // Use Orders array as expected by normalizeWorkOrder
        });

        return {
            ...normalizedWorkOrder,
            Order: { id: order.id }, // Add the Order property for the return type
        };
    });
}

function calculateTotals(workOrderItems: Array<{
    cost: Prisma.Decimal | null;
    amount: Prisma.Decimal | null;
    shippingAmount: Prisma.Decimal | null;
}>): CalculatedTotals {
    const totalCost = workOrderItems.reduce(
        (sum, item) => sum.add(item.cost || new Prisma.Decimal(0)),
        new Prisma.Decimal(0)
    );

    const totalItemAmount = workOrderItems.reduce(
        (sum, item) => sum.add(item.amount || new Prisma.Decimal(0)),
        new Prisma.Decimal(0)
    );

    const totalShippingAmount = workOrderItems.reduce(
        (sum, item) => sum.add(item.shippingAmount || new Prisma.Decimal(0)),
        new Prisma.Decimal(0)
    );

    const totalAmount = totalItemAmount.add(totalShippingAmount);
    const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
    const calculatedSubTotal = totalAmount.sub(calculatedSalesTax);

    return {
        totalCost,
        totalItemAmount,
        totalShippingAmount,
        totalAmount,
        calculatedSalesTax,
        calculatedSubTotal,
    };
}

async function getWorkOrder(tx: Prisma.TransactionClient, workOrderId: string): Promise<SerializedWorkOrder> {
    const workOrder = await tx.workOrder.findUnique({
        where: { id: workOrderId },
        include: {
            WorkOrderItems: {
                include: {
                    artwork: true,
                    createdBy: true,
                    ProcessingOptions: true,
                    ProductType: true,
                    ShippingInfo: {
                        include: {
                            Address: true,
                            ShippingPickup: true,
                        },
                    },
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: true,
                        },
                    },
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

    // Calculate totals for the work order
    const totals = calculateTotals(workOrder.WorkOrderItems);

    // Prepare the data for normalization
    const workOrderData = {
        ...workOrder,
        ...totals,
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
            purchaseOrderNumber: workOrder.purchaseOrderNumber,
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
        await Promise.all([
            updateTypesetting(tx, workOrderItem.id, orderItem.id),
            createProcessingOptions(tx, workOrderItem.id, orderItem.id),
            createOrderItemStock(tx, workOrderItem.id, orderItem.id),
        ]);
    }
}

async function createOrderItem(tx: Prisma.TransactionClient, workOrderItem: SerializedWorkOrderItem, orderId: string, createdById: string) {
    // Duplicate shipping info if it exists on the WorkOrderItem
    let duplicatedShippingInfoId: string | undefined;
    if (workOrderItem.ShippingInfo) {
        const duplicatedShippingInfo = await tx.shippingInfo.create({
            data: {
                instructions: workOrderItem.ShippingInfo.instructions,
                shippingOther: workOrderItem.ShippingInfo.shippingOther,
                shippingDate: workOrderItem.ShippingInfo.shippingDate ? new Date(workOrderItem.ShippingInfo.shippingDate) : null,
                shippingMethod: workOrderItem.ShippingInfo.shippingMethod,
                shippingCost: workOrderItem.ShippingInfo.shippingCost ? new Prisma.Decimal(workOrderItem.ShippingInfo.shippingCost) : null,
                officeId: workOrderItem.ShippingInfo.officeId,
                shipToSameAsBillTo: workOrderItem.ShippingInfo.shipToSameAsBillTo,
                attentionTo: workOrderItem.ShippingInfo.attentionTo,
                addressId: workOrderItem.ShippingInfo.addressId,
                createdById: createdById,
                numberOfPackages: workOrderItem.ShippingInfo.numberOfPackages,
                shippingNotes: workOrderItem.ShippingInfo.shippingNotes,
                estimatedDelivery: workOrderItem.ShippingInfo.estimatedDelivery ? new Date(workOrderItem.ShippingInfo.estimatedDelivery) : null,
                trackingNumber: workOrderItem.ShippingInfo.trackingNumber || [],
            },
        });
        duplicatedShippingInfoId = duplicatedShippingInfo.id;

        // Duplicate ShippingPickup record if it exists
        if (workOrderItem.ShippingInfo.ShippingPickup) {
            await tx.shippingPickup.create({
                data: {
                    shippingInfoId: duplicatedShippingInfo.id,
                    pickupDate: new Date(workOrderItem.ShippingInfo.ShippingPickup.pickupDate),
                    pickupTime: workOrderItem.ShippingInfo.ShippingPickup.pickupTime,
                    notes: workOrderItem.ShippingInfo.ShippingPickup.notes,
                    contactName: workOrderItem.ShippingInfo.ShippingPickup.contactName,
                    contactPhone: workOrderItem.ShippingInfo.ShippingPickup.contactPhone,
                    createdById: createdById,
                },
            });
        }
    }

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
            shippingInfoId: duplicatedShippingInfoId,
        },
    });

    // Add the artwork
    if (workOrderItem.artwork?.length) {
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
    await tx.typesetting.updateMany({
        where: { workOrderItemId },
        data: { orderItemId },
    });
}

async function createProcessingOptions(tx: Prisma.TransactionClient, workOrderItemId: string, orderItemId: string) {
    const processingOptions = await tx.processingOptions.findMany({
        where: { workOrderItemId },
    });

    if (processingOptions.length > 0) {
        await tx.processingOptions.createMany({
            data: processingOptions.map(option => ({
                cutting: option.cutting,
                padding: option.padding,
                drilling: option.drilling,
                folding: option.folding,
                other: option.other,
                numberingStart: option.numberingStart,
                numberingEnd: option.numberingEnd,
                numberingColor: option.numberingColor,
                createdById: option.createdById,
                description: option.description,
                stitching: option.stitching,
                binderyTime: option.binderyTime,
                binding: option.binding,
                orderItemId,
            })),
        });
    }
}

async function createOrderItemStock(tx: Prisma.TransactionClient, workOrderItemId: string, orderItemId: string) {
    const stocks = await tx.workOrderItemStock.findMany({
        where: { workOrderItemId },
    });

    if (stocks.length > 0) {
        await tx.orderItemStock.createMany({
            data: stocks.map(stock => ({
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
            })),
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
                    createdBy: true,
                    ProcessingOptions: true,
                    ProductType: true,
                    ShippingInfo: {
                        include: {
                            Address: true,
                            ShippingPickup: true,
                        },
                    },
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: true,
                        },
                    },
                    WorkOrderItemStock: {
                        include: {
                            PaperProduct: true,
                        },
                    },
                },
            },
            WorkOrderNotes: true,
            WorkOrderVersions: true,
            WalkInCustomer: true,
        }
    });
}
