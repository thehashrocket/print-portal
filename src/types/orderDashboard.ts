import { OrderItem, OrderStatus } from "@prisma/client";

import { OrderItemStatus } from "@prisma/client";

export interface OrderDashboard {
    status: OrderStatus;
    orderItemStatus: OrderItemStatus;
    id: string;
    companyName: string;
    inHandsDate: string | null;
    orderItems: OrderItem[];
  }