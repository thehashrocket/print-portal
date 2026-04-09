"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { OrderItemStatus, type OrderItem } from "~/generated/prisma/browser";
import { Building2, CalendarDays, Eye, Phone, User } from "lucide-react";
import { formatDate } from "~/utils/formatters";
import { dueDateBorderColor } from "~/utils/dashboardHelpers";

// Define the type for the data returned by the API
type OutsourcedOrderItemWithRelations = OrderItem & {
    Order: {
        orderNumber: number;
        Office: {
            Company: {
                name: string;
            }
        }
    };
    OutsourcedOrderItemInfo: Array<{
        id: string;
        companyName: string | null;
        contactName: string | null;
        contactPhone: string | null;
        estimatedDeliveryDate: Date | null;
    }>;
};

interface OutsourcedOrderItemCardProps {
    orderItem: OutsourcedOrderItemWithRelations;
}

const OutsourcedOrderItemCard = ({ orderItem }: OutsourcedOrderItemCardProps) => {
    return (
        <div
            className="flex flex-col p-3 mb-2 border rounded-lg bg-card text-card-foreground hover:bg-accent hover:shadow-md transition-all duration-200"
            style={{
                borderColor: orderItem.expectedDate ? dueDateBorderColor(orderItem.expectedDate.toISOString(), orderItem.status === OrderItemStatus.Completed) : undefined,
                borderWidth: orderItem.expectedDate ? 3 : 1,
                borderStyle: orderItem.expectedDate ? 'solid' : 'dashed',
            }}
        >
            <div className="flex items-center mb-2">
                <Building2 className="w-5 h-5 mr-2 text-muted-foreground" />
                <div className="text-sm font-semibold truncate">{orderItem.Order.Office.Company.name}</div>
            </div>
            <div className="flex items-center mb-2">
                <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-xs">{formatDate(orderItem.expectedDate)}</span>
            </div>
            <div className="text-xs text-muted-foreground mb-0.5">Order #: <span className="font-semibold text-foreground">{orderItem.Order.orderNumber}</span></div>
            <div className="text-xs text-muted-foreground mb-2">Job #: <span className="font-semibold text-foreground">{orderItem.orderItemNumber}</span></div>

            <div className="pt-2 border-t border-border mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Outsourced Info</h3>
                <div className="flex items-center mb-1.5">
                    <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                        {orderItem.OutsourcedOrderItemInfo?.[0]?.companyName}
                    </span>
                </div>
                <div className="flex items-center mb-1.5">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                        {orderItem.OutsourcedOrderItemInfo?.[0]?.contactName}
                    </span>
                </div>
                <div className="flex items-center mb-1.5">
                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                        {orderItem.OutsourcedOrderItemInfo?.[0]?.contactPhone}
                    </span>
                </div>
                <div className="flex items-center mb-1.5">
                    <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-xs">
                        {orderItem.OutsourcedOrderItemInfo?.[0]?.estimatedDeliveryDate &&
                         formatDate(orderItem.OutsourcedOrderItemInfo[0].estimatedDeliveryDate)}
                    </span>
                </div>
            </div>

            <div className="flex items-center pt-2 border-t border-border">
                <Eye className="w-4 h-4 mr-2 text-primary" />
                <Link href={`/orders/${orderItem.orderId}/orderItem/${orderItem.id}`} className="text-primary hover:underline text-xs font-medium">
                    View Item
                </Link>
            </div>
        </div>
    )

}

export default function OutsourcedOrderItemsDash() {
    const { data: orderItems } = api.orderItems.dashboardOutsourced.useQuery();
    
    return (
        <div className="flex flex-col p-2 sm:p-5">
            {orderItems?.map((orderItem) => (
                <OutsourcedOrderItemCard key={orderItem.id} orderItem={orderItem as OutsourcedOrderItemWithRelations} />
            ))}
        </div>
    );
}
