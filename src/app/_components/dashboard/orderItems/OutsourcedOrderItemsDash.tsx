"use client";

import { api } from "~/trpc/react";
import { OrderItemStatus } from "@prisma/client";
import type { OrderItem } from "@prisma/client";
import { Building2, CalendarDays, Eye, Mail, Phone, User } from "lucide-react";
import { formatDate } from "~/utils/formatters";

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

const calculateDaysUntilDue = (dateString: string): number => {
    const targetDate = new Date(dateString);
    const currentDate = new Date();
    const timeDiff = targetDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
};

const jobBorderColor = (dateString: string, status: OrderItemStatus): string => {
    if (status === OrderItemStatus.Completed) {
        return 'green';
    }
    const daysUntilDue = calculateDaysUntilDue(dateString);
    if (daysUntilDue === 1) {
        return 'yellow';
    } else if (daysUntilDue <= 0) {
        return 'red';
    } else {
        return 'green';
    }
};

const OutsourcedOrderItemCard = ({ orderItem }: OutsourcedOrderItemCardProps) => {
    return (
        <div 
            className="flex flex-col p-3 mb-2 border rounded bg-gray-600 hover:bg-gray-500 hover:shadow-md transition-all duration-200"
            style={{
                borderColor: orderItem.expectedDate ? jobBorderColor(orderItem.expectedDate.toISOString(), orderItem.status) : undefined,
                borderWidth: orderItem.expectedDate ? 3 : 1,
                borderStyle: orderItem.expectedDate ? 'solid' : 'dashed',
            }}
        >
            <div className="flex items-center mb-2">
                <Building2 className="w-6 h-6 mr-2" />
                <div className="text-sm font-bold mb-1 truncate">{orderItem.Order.Office.Company.name}</div>
            </div>
            <div className="flex items-center mb-2">
                <CalendarDays className="w-5 h-5 mr-2" />
                <div className="text-sm font-bold mb-1">{formatDate(orderItem.expectedDate)}</div>
            </div>
            <div className="flex items-center mb-2">
                <div className="text-sm font-bold mb-1">Order #: {orderItem.Order.orderNumber}</div>
            </div>
            <div className="flex items-center mb-2">
                <div className="text-sm font-bold mb-1">Job #: {orderItem.orderItemNumber}</div>
            </div>
            {/* Outsourced Order Item Info */}
            <div className="flex flex-col mb-2">
                <h3 className="text font-bold mb-1">Outsourced Order Item Info</h3>
            </div>
            <div className="flex items-center mb-2">
                <Mail className="w-5 h-5 mr-2" />
                <div className="text-sm font-bold mb-1">
                    {orderItem.OutsourcedOrderItemInfo?.[0]?.companyName}
                </div>
            </div>
            <div className="flex items-center mb-2">
                <User className="w-5 h-5 mr-2" />
                <div className="text-sm font-bold mb-1">
                    {orderItem.OutsourcedOrderItemInfo?.[0]?.contactName}
                </div>
            </div>
            <div className="flex items-center mb-2">
                <Phone className="w-5 h-5 mr-2" />
                <div className="text-sm font-bold mb-1">
                    {orderItem.OutsourcedOrderItemInfo?.[0]?.contactPhone}
                </div>
            </div>
            <div className="flex items-center mb-2">
                <CalendarDays className="w-5 h-5 mr-2" />
                <div className="text-sm font-bold mb-1">
                    {orderItem.OutsourcedOrderItemInfo?.[0]?.estimatedDeliveryDate && 
                     formatDate(orderItem.OutsourcedOrderItemInfo[0].estimatedDeliveryDate)}
                </div>
            </div>
            <div className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                <a href={`/orders/${orderItem.orderId}/orderItem/${orderItem.id}`} className="text-blue-400 hover:underline text-sm">
                    View Item
                </a>
            </div>

        </div>
    )

}

export default function OutsourcedOrderItemsDash() {
    const { data: orderItems } = api.orderItems.dashboardOutsourced.useQuery();
    
    return (
        <div className="flex flex-col p-2 sm:p-5 bg-gray-800 text-white min-h-screen">
            {orderItems?.map((orderItem) => (
                <OutsourcedOrderItemCard key={orderItem.id} orderItem={orderItem as OutsourcedOrderItemWithRelations} />
            ))}
        </div>
    );
}
