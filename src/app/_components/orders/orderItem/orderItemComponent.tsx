// ~/app/_components/orders/orderItem/orderItemComponent.tsx
"use client";

import React from "react";
import { OrderItem, OrderItemStatus } from "@prisma/client";
import { api } from "~/trpc/react";
import Link from "next/link";
import { TypesettingProvider } from '~/app/contexts/TypesettingContext';
import TypesettingComponent from "~/app/_components/shared/typesetting/typesettingComponent";
import ProcessingOptionsComponent from "~/app/_components/shared/processingOptions/processingOptionsComponent";
import { ProcessingOptionsProvider } from "~/app/contexts/ProcessingOptionsContext";

type OrderItemPageProps = {
    orderId: string;
    orderItemId: string;
};

const StatusBadge: React.FC<{ id: string, status: OrderItemStatus }> = ({ id, status }) => {
    const [currentStatus, setCurrentStatus] = React.useState(status);
    const { mutate: updateStatus } = api.orderItems.updateStatus.useMutation();
    const getStatusColor = () => {
        switch (currentStatus) {
            case "Completed": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            case "Pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    const handleStatusChange = async (newStatus: OrderItemStatus) => {
        await updateStatus({ id, status: newStatus });
        setCurrentStatus(newStatus);

    }

    return (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
                {currentStatus}
            </span>
            <select value={status} onChange={(e) => handleStatusChange(e.target.value)} className="px-2 py-1 rounded-md border border-gray-300">
                {Object.values(OrderItemStatus).map((status) => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
        </div>
    );
};

const InfoCard: React.FC<{ title: string; content: React.ReactNode }> = ({ title, content }) => (
    <div className="rounded-lg bg-white p-4 shadow-md">
        <h3 className="mb-2 text-gray-600 text-lg font-semibold">{title}</h3>
        <div className="text-gray-800">{content}</div>
    </div>
);

const OrderItemComponent: React.FC<OrderItemPageProps> = ({ orderId, orderItemId }) => {
    const { data: order, error: orderError, isLoading: orderLoading } = api.orders.getByID.useQuery(orderId);
    const { data: orderItem, error: itemError, isLoading: itemLoading } = api.orderItems.getByID.useQuery(orderItemId);
    const { data: typesettingData, isLoading: typesettingLoading } = api.typesettings.getByOrderItemID.useQuery(orderItemId);

    if (orderLoading || itemLoading || typesettingLoading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>;
    }

    if (orderError || itemError || !order || !orderItem) {
        return <div className="text-red-500 text-center mt-8">Error loading order item details.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Order Item Details</h1>
                <div className="text-sm breadcrumbs">
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/orders">Orders</Link></li>
                        <li><Link href={`/orders/${orderId}`}>Order {order.orderNumber}</Link></li>
                        <li>Item {orderItem.id}</li>
                    </ul>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <InfoCard title="Order Number" content={order.orderNumber} />
                <InfoCard title="Company" content={order.Office?.Company.name} />
                <InfoCard title="Status" content={
                    <StatusBadge id={orderItem.id} status={orderItem.status} />
                } />
                <InfoCard title="Quantity" content={orderItem.quantity} />
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Typesetting</h2>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <TypesettingProvider>
                            <TypesettingComponent
                                workOrderItemId=""
                                orderItemId={orderItem.id}
                                initialTypesetting={typesettingData || []}
                            />
                        </TypesettingProvider>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Processing Options</h2>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <ProcessingOptionsProvider orderItemId={orderItem.id}>
                            <ProcessingOptionsComponent orderItemId={orderItem.id} />
                        </ProcessingOptionsProvider>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OrderItemComponent;
