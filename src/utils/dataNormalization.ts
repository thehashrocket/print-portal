// ~/utils/dataNormalization.ts

import { SerializedOrder, SerializedOrderItem, SerializedWorkOrder, SerializedWorkOrderItem } from "~/types/serializedTypes";
import { Order, OrderItem, Prisma, WorkOrder, WorkOrderItem } from "@prisma/client";

export function normalizeOrder(order: Order & {
    totalCost?: Prisma.Decimal | null,
    Office: { Company: { name: string } },
    OrderItems?: OrderItem[],
    createdBy: {
        id: string,
        name: string | null
    }
}): SerializedOrder {
    return {
        id: order.id,
        status: order.status,
        workOrderId: order.workOrderId,
        orderNumber: order.orderNumber,
        deposit: order.deposit ? order.deposit.toString() : null,
        totalCost: order.totalCost ? order.totalCost.toString() : null,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        createdBy: {
            id: order.createdBy.id,
            name: order.createdBy.name ?? null
        },
        Office: {
            Company: {
                name: order.Office.Company.name
            }
        },
        OrderItems: order.OrderItems ? order.OrderItems.map(normalizeOrderItem) : []
    };
}

export function normalizeOrderItem(item: OrderItem): SerializedOrderItem {
    return {
        amount: item.amount ? item.amount.toString() : null,
        cost: item.cost ? item.cost.toString() : null,
        costPerM: item.costPerM ? item.costPerM.toString() : null,
        createdAt: item.createdAt.toISOString(),
        description: item.description,
        expectedDate: item.expectedDate ? item.expectedDate.toISOString() : null,
        finishedQty: item.finishedQty,
        id: item.id,
        orderId: item.orderId,
        quantity: item.quantity,
        status: item.status,
        updatedAt: "",
    };
}

export function normalizeWorkOrder(workOrder: WorkOrder & {
    Order: { id: string } | null;
    WorkOrderItems: WorkOrderItem[];
    totalCost: Prisma.Decimal;
    createdBy?: { id: string; name: string | null };
    Office: {
        id: string;
        name: string;
        Company: {
            name: string;

        }
    };
}): SerializedWorkOrder {
    return {
        createdAt: workOrder.createdAt.toISOString(),
        createdById: workOrder.createdById,
        dateIn: workOrder.dateIn.toISOString(),
        estimateNumber: workOrder.estimateNumber,
        id: workOrder.id,
        inHandsDate: workOrder.inHandsDate.toISOString(),
        officeId: workOrder.officeId,
        purchaseOrderNumber: workOrder.purchaseOrderNumber,
        shippingInfoId: workOrder.shippingInfoId,
        status: workOrder.status,
        totalCost: workOrder.totalCost.toString(),
        updatedAt: workOrder.updatedAt.toISOString(),
        version: workOrder.version,
        workOrderNumber: workOrder.workOrderNumber.toString(),
        createdBy: {
            id: workOrder.createdById,
            name: workOrder.createdBy?.name ?? null// We don't have this information in the current query
        },
        Office: {
            Company: {
                name: workOrder.Office.Company.name // We don't have this information in the current query
            },
            id: workOrder.officeId,
            name: workOrder.Office.name // We don't have this information in the current query
        },
        Order: workOrder.Order,
        WorkOrderItems: workOrder.WorkOrderItems.map(normalizeWorkOrderItem),
        invoicePrintEmail: workOrder.invoicePrintEmail
    };
}

export function normalizeWorkOrderItem(item: WorkOrderItem): SerializedWorkOrderItem {
    return {
        amount: item.amount?.toString() ?? undefined,
        cost: item.cost?.toString() ?? undefined,
        costPerM: item.costPerM?.toString() ?? null,
        customerSuppliedStock: item.customerSuppliedStock ?? null,
        description: item.description,
        finishedQty: item.finishedQty ?? null,
        id: item.id,
        other: item.other ?? null,
        pressRun: item.pressRun ?? null,
        quantity: item.quantity.toString(),
        status: item.status,
        workOrderId: item.workOrderId ?? null,
    };
}