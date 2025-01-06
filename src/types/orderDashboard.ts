import { type OrderItem, type OrderStatus } from "@prisma/client";
import { type OrderItemStatus } from "@prisma/client";

export interface OrderDashboard {
    status: OrderStatus;
    orderItemStatus: OrderItemStatus;
    id: string;
    companyName: string;
    inHandsDate: string | null;
    orderItems: OrderItem[];
  }