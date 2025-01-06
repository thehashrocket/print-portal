// ~/src/app/_components/dashboard/DraggableOrderItemsDash.tsx

"use client";
import React, { useState } from 'react';
import { OrderStatus } from '@prisma/client';
import { api } from "~/trpc/react";
import { type OrderDashboard } from "~/types/orderDashboard";
import OrderCard from './OrderCard';

const DraggableOrdersDash: React.FC<{ initialOrders: OrderDashboard[] }> = ({ initialOrders }) => {
    const [orders, setOrders] = useState<OrderDashboard[]>(initialOrders);
    const allStatuses = [
        OrderStatus.Pending,
        OrderStatus.Cancelled,
        OrderStatus.PaymentReceived,
        OrderStatus.Shipping,
        OrderStatus.Invoicing,
        OrderStatus.Completed
    ];

    const updateOrderStatus = api.orders.updateStatus.useMutation();

    const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.currentTarget.classList.remove('bg-blue-600');
    }

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
        event.dataTransfer.setData("text/plain", id);
    };

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.classList.add('bg-blue-600');
    };

    const onDrop = async (event: React.DragEvent<HTMLDivElement>, newStatus: OrderStatus) => {
        event.preventDefault();
        const id = event.dataTransfer.getData("text/plain");
        event.currentTarget.classList.remove('bg-blue-600');
        try {
            await updateOrderStatus.mutateAsync({ 
                id, 
                status: newStatus,
                sendEmail: false,
                emailOverride: ""
            });

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === id ? { ...order, status: newStatus } : order
                )
            );

        } catch (error) {
            console.error('Failed to update Order status: ', error);
        }
    };

    const ordersByStatus: { [key in OrderStatus]: OrderDashboard[] } = orders.reduce((acc, order) => {
        const statusGroup = acc[order.status] || [];
        acc[order.status] = [...statusGroup, order];
        return acc;
    }, {} as { [key in OrderStatus]: OrderDashboard[] });

    return (
        <div className="flex p-5 bg-gray-800 text-white min-h-screen">
            {allStatuses.map((status) => (
                <div key={status}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={(event) => onDrop(event, status)}
                    className="p-4 mr-4 border border-gray-600 rounded-lg shadow bg-gray-700 transition-colors duration-200 overflow-auto min-w-[200px] min-h-[200px]">
                    <h3 className="font-semibold mb-2">{status}</h3>
                    {(ordersByStatus[status] || []).map(order => (
                        <OrderCard key={order.id} order={order} onDragStart={onDragStart} />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default DraggableOrdersDash;

