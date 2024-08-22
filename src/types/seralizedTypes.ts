// /src/types/serializedTypes.ts

import { OrderStatus, WorkOrderStatus, OrderItemStatus } from "@prisma/client";

export type SerializedOrder = {
    status: OrderStatus;
    id: string;
    companyName: string;
};

export type SerializedWorkOrder = {
    status: WorkOrderStatus;
    id: string;
};

export type SerializedOrderItem = {
    status: OrderItemStatus;
    id: string;
    description: string;
    expectedDate: string;
    orderId: string;
};

export type SerializedWorkOrderItem = {
    status: OrderItemStatus;
    id: string;
    orderId: string;
};