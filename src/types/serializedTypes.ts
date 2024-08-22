// ~/types/serializedTypes.ts

import { OrderStatus, WorkOrderStatus, OrderItemStatus, WorkOrderItemStatus, ShippingMethod, InvoicePrintEmailOptions } from "@prisma/client";

export interface SerializedOrder {
    id: string;
    status: OrderStatus;
    workOrderId: string | null;
    orderNumber: number;
    deposit: string | null;
    totalCost: string | null;
    createdAt: string;
    updatedAt: string;
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
    ShippingInfo?: {
        id: string;
        shippingMethod: ShippingMethod;
        Address: {
            line1: string;
            line2: string | null;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            telephoneNumber: string;
        };
    } | null;
}

export interface SerializedOrderItem {
    amount: string | null;
    cost: string | null;
    costPerM: string | null;
    createdAt: string | null;
    description: string | null;
    expectedDate: string | null;
    finishedQty: number | null;
    id: string;
    orderId: string;
    quantity: number;
    status: OrderItemStatus;
    updatedAt: string | null;
}

export interface SerializedWorkOrder {
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
    totalCost: string | null;
    updatedAt: string;
    version: number;
    workOrderNumber: string;
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
    ShippingInfo?: {
        id: string;
        shippingMethod: ShippingMethod;
        Address: {
            line1: string;
            line2: string | null;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            telephoneNumber: string;
        };
    } | null;
    WorkOrderItems: SerializedWorkOrderItem[];
}

export interface SerializedWorkOrderItem {
    amount: string | undefined;
    cost: string | undefined;
    costPerM: string | null;
    customerSuppliedStock: string | null;
    description: string;
    finishedQty: number | null;
    id: string;
    other: string | null;
    pressRun: string | null;
    quantity: string;
    status: WorkOrderItemStatus;
    workOrderId: string | null;
}