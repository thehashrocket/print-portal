// ~/utils/dataNormalization.ts

import { SerializedOrder, SerializedOrderItem, SerializedWorkOrder, SerializedWorkOrderItem, SerializedShippingInfo, SerializedShippingPickup } from "~/types/serializedTypes";
import { Order, OrderItem, OrderItemArtwork, Prisma, WorkOrder, WorkOrderItem, ShippingInfo, ShippingPickup, Address, WorkOrderItemArtwork } from "@prisma/client";


export function normalizeOrder(order: Order & {
    totalCost: Prisma.Decimal | null;
    Office: {
        Company: { name: string };
    };
    OrderItems?: OrderItem[];
    contactPerson: {
        id: string;
        name: string | null;
    };
    createdBy: {
        id: string;
        name: string | null;
    };
    ShippingInfo?: (ShippingInfo & {
        Address: Address | null;
        ShippingPickup: ShippingPickup[];
    }) | null;
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
        contactPerson: {
            id: order.contactPersonId,
            name: order.contactPerson?.name ?? null
        },
        createdBy: {
            id: order.createdBy.id,
            name: order.createdBy.name ?? null
        },
        Office: {
            Company: {
                name: order.Office.Company.name
            }
        },
        OrderItems: order.OrderItems ? order.OrderItems.map(normalizeOrderItem) : [],
        ShippingInfo: order.ShippingInfo ? normalizeShippingInfo(order.ShippingInfo) : null,
    };
}

export function normalizeOrderItem(item: OrderItem & { artwork?: OrderItemArtwork[] }): SerializedOrderItem {
    return {
        amount: item.amount ? item.amount.toString() : null,
        artwork: (item.artwork ?? []).map((art: OrderItemArtwork) => ({
            id: art.id,
            fileUrl: art.fileUrl,
            description: art.description,
            orderItemId: art.orderItemId,
        })),
        cost: item.cost ? item.cost.toString() : null,
        costPerM: item.costPerM ? item.costPerM.toString() : null,
        createdAt: item.createdAt.toISOString(),
        description: item.description,
        expectedDate: item.expectedDate ? item.expectedDate.toISOString() : null,
        finishedQty: item.finishedQty,
        id: item.id,
        orderId: item.orderId,
        pressRun: item.pressRun ? item.pressRun.toString() : '',
        quantity: item.quantity,
        status: item.status,
        updatedAt: "",
    };
}

export function normalizeWorkOrder(workOrder: WorkOrder & {
    Order: { id: string } | null;
    WorkOrderItems: (WorkOrderItem & { artwork?: WorkOrderItemArtwork[] })[];
    totalCost: Prisma.Decimal;
    contactPerson: {
        id: string;
        name: string | null;
    };
    createdBy: { id: string; name: string | null };
    Office: {
        id: string;
        name: string;
        Company: {
            name: string;
        }
    };
    ShippingInfo: (ShippingInfo & {
        Address: Address | null;
        ShippingPickup: ShippingPickup[];
    }) | null;
}): SerializedWorkOrder {
    return {
        contactPersonId: workOrder.contactPersonId,
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
        contactPerson: {
            id: workOrder.contactPerson.id,
            name: workOrder.contactPerson?.name ?? null
        },
        createdBy: {
            id: workOrder.createdById,
            name: workOrder.createdBy?.name ?? null
        },
        Office: {
            Company: {
                name: workOrder.Office.Company.name
            },
            id: workOrder.officeId,
            name: workOrder.Office.name
        },
        Order: workOrder.Order,
        WorkOrderItems: workOrder.WorkOrderItems.map(normalizeWorkOrderItem),
        invoicePrintEmail: workOrder.invoicePrintEmail,
        ShippingInfo: workOrder.ShippingInfo ? normalizeShippingInfo(workOrder.ShippingInfo) : null,
    };
}

export function normalizeWorkOrderItem(item: WorkOrderItem & { artwork?: WorkOrderItemArtwork[] }): SerializedWorkOrderItem {
    return {
        amount: item.amount?.toString() ?? undefined,
        artwork: (item.artwork ?? []).map((art: WorkOrderItemArtwork) => ({
            id: art.id,
            fileUrl: art.fileUrl,
            description: art.description,
            workOrderItemId: art.workOrderItemId,
        })),
        cost: item.cost?.toString() ?? undefined,
        costPerM: item.costPerM?.toString() ?? null,
        customerSuppliedStock: item.customerSuppliedStock ?? null,
        description: item.description,
        finishedQty: item.finishedQty ?? null,
        id: item.id,
        inkColor: item.inkColor ?? null,
        other: item.other ?? null,
        overUnder: item.overUnder ?? null,
        pressRun: item.pressRun ?? null,
        quantity: item.quantity.toString(),
        status: item.status,
        workOrderId: item.workOrderId ?? null,
    };
}

export function normalizeShippingPickup(pickup: ShippingPickup): SerializedShippingPickup {
    return {
        id: pickup.id,
        pickupDate: pickup.pickupDate.toISOString(),
        pickupTime: pickup.pickupTime,
        notes: pickup.notes,
        contactName: pickup.contactName,
        contactPhone: pickup.contactPhone,
        createdAt: pickup.createdAt.toISOString(),
        updatedAt: pickup.updatedAt.toISOString(),
        createdById: pickup.createdById,
        shippingInfoId: pickup.shippingInfoId,
    };
}

export function normalizeShippingInfo(shippingInfo: ShippingInfo & {
    Address: Address | null;
    ShippingPickup: ShippingPickup[];
}): SerializedShippingInfo {
    return {
        id: shippingInfo.id,
        shippingMethod: shippingInfo.shippingMethod,
        instructions: shippingInfo.instructions,
        shippingCost: shippingInfo.shippingCost?.toString() ?? null,
        shippingDate: shippingInfo.shippingDate?.toISOString() ?? null,
        shippingNotes: shippingInfo.shippingNotes,
        shippingOther: shippingInfo.shippingOther,
        shipToSameAsBillTo: shippingInfo.shipToSameAsBillTo,
        estimatedDelivery: shippingInfo.estimatedDelivery?.toISOString() ?? null,
        numberOfPackages: shippingInfo.numberOfPackages,
        trackingNumber: shippingInfo.trackingNumber,
        attentionTo: shippingInfo.attentionTo,
        addressId: shippingInfo.addressId,
        createdAt: shippingInfo.createdAt.toISOString(),
        updatedAt: shippingInfo.updatedAt.toISOString(),
        createdById: shippingInfo.createdById,
        officeId: shippingInfo.officeId,
        Address: shippingInfo.Address ? {
            line1: shippingInfo.Address.line1,
            line2: shippingInfo.Address.line2,
            city: shippingInfo.Address.city,
            state: shippingInfo.Address.state,
            zipCode: shippingInfo.Address.zipCode,
            country: shippingInfo.Address.country,
            telephoneNumber: shippingInfo.Address.telephoneNumber,
        } : null,
        ShippingPickup: shippingInfo.ShippingPickup.length > 0 && shippingInfo.ShippingPickup[0]
            ? normalizeShippingPickup(shippingInfo.ShippingPickup[0])
            : null,
    };
}