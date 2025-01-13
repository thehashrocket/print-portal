// ~src/types/orderItemDashboard.ts
import { OrderStatus, type OrderItemStatus } from "@prisma/client";

export interface OrderItemDashboard {
    amount: number | null;
    companyName: string;
    cost: number | null;
    createdAt: Date;
    description: string;
    expectedDate: Date;
    id: string;
    orderId: string;
    orderItemNumber: number;
    orderNumber: string;
    orderStatus: OrderStatus;
    position: number;
    purchaseOrderNumber: string;
    shippingAmount: number | null;
    status: OrderItemStatus;
    totalItems: number;
    updatedAt: Date;
}