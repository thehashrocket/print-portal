"use client";

import React, { useState, useEffect } from "react";
import { OrderItem } from "@prisma/client";
import { api } from "~/trpc/react";
import Link from "next/link";
import { TypesettingProvider } from '~/app/contexts/TypesettingContext';
import TypesettingComponent from "~/app/_components/shared/typesetting/typesettingComponent";
import ProcessingOptionsComponent from "~/app/_components/shared/processingOptions/processingOptionsComponent";

type OrderItemPageProps = {
    orderId: string;
    orderItemId: string;
};

const OrderItemComponent: React.FC<OrderItemPageProps> = ({
    orderId = '',
    orderItemId = '',
}) => {
    // Fetch order item data
    const { data: order } = api.orders.getByID.useQuery(orderId);
    const { data: fetchedOrderItem, isLoading } = api.orderItems.getByID.useQuery(orderItemId);
    const [orderItem, setOrderItem] = useState<OrderItem | null>(null);
    const { data: typesettingData } = api.typesetting.getByOrderItemID.useQuery(orderItemId); // Ensure you have an API endpoint to fetch typesetting data by order item ID

    useEffect(() => {
        if (fetchedOrderItem) {
            setOrderItem(fetchedOrderItem);
        }
    }, [fetchedOrderItem]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">Order Item Details</a>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/orders">Orders</Link></li>
                            <li><Link href={`/orders/${orderItem?.orderId}`}>Order</Link></li>
                            <li>Order Item</li>
                        </ul>
                    </div>
                </div>
                <div className="flex-none">
                    <Link className="btn btn-sm btn-primary" href="/orders/create">Create Order</Link>
                </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <p className="mb-2 text-gray-600 text-xl font-semibold">Order Number</p>
                        <p className="text-gray-800 text-lg font-semibold">{order?.orderNumber}</p>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <p className="mb-2 text-gray-600 text-xl font-semibold">Office Name</p>
                        <p className="text-gray-800 text-lg font-semibold">{order?.Office?.name}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Typesetting</h2>
                        {orderItem && typesettingData && (
                            <TypesettingProvider>
                                <TypesettingComponent
                                    workOrderItemId={orderItem?.workOrderItemId}
                                    orderItemId={orderItem.id}
                                    initialTypesetting={typesettingData}
                                />
                            </TypesettingProvider>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Processing Options</h2>
                        <ProcessingOptionsComponent processingOptions={orderItem?.ProcessingOptions || []} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderItemComponent;
