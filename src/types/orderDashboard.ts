import { type OrderItem, type OrderStatus } from "@prisma/client";
import { type OrderItemStatus } from "@prisma/client";

// Define a type for the serialized order item with number values instead of Decimal
interface SerializedOrderItem extends Omit<OrderItem, 'amount' | 'cost' | 'shippingAmount'> {
  amount: number | null;
  cost: number | null;
  shippingAmount: number | null;
}

export interface OrderDashboard {
  status: OrderStatus;
  orderItemStatus: OrderItemStatus;
  orderNumber: string;
  purchaseOrderNumber: string;
  id: string;
  companyName: string;
  inHandsDate: string | null;
  deposit: number;
  orderItems: SerializedOrderItem[];
}