// ~/types/serializedTypes.ts

import { OrderStatus, WorkOrderStatus, OrderItemStatus, WorkOrderItemStatus, ShippingMethod, InvoicePrintEmailOptions } from "@prisma/client";

export interface SerializedOrder {
    id: string;
    status: OrderStatus;
    workOrderId: string | null;
    orderNumber: number;
    deposit: string | null;
    inHandsDate: string | null;
    totalAmount: string | null;
    totalCost: string | null;
    createdAt: string;
    updatedAt: string;
    contactPerson: {
        id: string;
        name: string | null;
    };
    createdBy: {
        id: string;
        name: string | null;
    };
    Office: {
        Company: {
            name: string;
        };
    };
    OrderItems: SerializedOrderItem[];
    ShippingInfo: SerializedShippingInfo | null;
}

export interface SerializedOrderItem {
    amount: string | null;
    artwork: {
        id: string;
        fileUrl: string;
        description: string | null;
        orderItemId: string;
    }[];
    cost: string | null;
    costPerM: string | null;
    createdAt: string | null;
    description: string | null;
    expectedDate: string | null;
    finishedQty: number | null;
    id: string;
    orderId: string;
    pressRun: string | null;
    quantity: number;
    status: OrderItemStatus;
    updatedAt: string | null;
}

export interface SerializedWorkOrder {
    contactPersonId: string;
    createdAt: string;
    createdById: string;
    dateIn: string;
    estimateNumber: string;
    id: string;
    inHandsDate: string;
    invoicePrintEmail: InvoicePrintEmailOptions;
    officeId: string;
    purchaseOrderNumber: string;
    shippingInfoId: string | null | undefined;
    status: WorkOrderStatus;
    totalAmount: string | null;
    totalCost: string | null;
    updatedAt: string;
    version: number;
    workOrderNumber: string;
    contactPerson: {
        id: string;
        name: string | null;
    };
    createdBy: {
        id: string;
        name: string | null;
    };
    Office: {
        Company: {
            name: string;
        };
        id: string;
        name: string;
    };
    Order?: {
        id: string;
    } | null;
    ShippingInfo: SerializedShippingInfo | null;
    WorkOrderItems: SerializedWorkOrderItem[];
}

export interface SerializedWorkOrderItem {
    amount: string | undefined;
    artwork: {
        id: string;
        fileUrl: string;
        description: string | null;
        workOrderItemId: string;
    }[];
    cost: string | undefined;
    costPerM: string | null;
    customerSuppliedStock: string | null;
    description: string;
    expectedDate: string;
    id: string;
    inkColor: string | null;
    other: string | null;
    quantity: string;
    status: WorkOrderItemStatus;
    workOrderId: string | null;
}

export interface SerializedShippingPickup {
    id: string;
    pickupDate: string;
    pickupTime: string;
    notes: string | null;
    contactName: string;
    contactPhone: string;
    createdAt: string;
    updatedAt: string;
    createdById: string;
    shippingInfoId: string;
}

export interface SerializedShippingInfo {
    id: string;
    shippingMethod: ShippingMethod;
    instructions: string | null;
    shippingCost: string | null;
    shippingDate: string | null;
    shippingNotes: string | null;
    shippingOther: string | null;
    shipToSameAsBillTo: boolean;
    estimatedDelivery: string | null;
    numberOfPackages: number | null;
    trackingNumber: string | null;
    attentionTo: string | null;
    addressId: string | null;
    createdAt: string;
    updatedAt: string;
    createdById: string;
    officeId: string;
    Address: {
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        telephoneNumber: string;
    } | null;
    ShippingPickup: SerializedShippingPickup | null;
}