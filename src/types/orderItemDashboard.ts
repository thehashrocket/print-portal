// ~src/types/orderItemDashboard.ts
import { type OrderItemStatus } from "@prisma/client";

export interface OrderItemDashboard {
    id: string;
    position: number;
    totalItems: number;
    orderItemNumber: number;
    orderId: string;
    expectedDate: Date;
    status: OrderItemStatus;
    description: string;
    companyName: string;
    purchaseOrderNumber: string;
    createdAt: Date;
    updatedAt: Date;
    amount: number | null;
    cost: number | null;
    shippingAmount: number | null;
}