// ~/src/app/_components/dashboard/DraggableOrderItemsDash.tsx

"use client";
import React, { useState } from 'react';
import { OrderStatus } from '@prisma/client';
import { api } from "~/trpc/react";
import { type OrderDashboard } from "~/types/orderDashboard";
import OrderCard from '../OrderCard';
import OrderNumberFilter from './OrderNumberFilter';
import OrderItemNumberFilter from './OrderItemNumberFilter';
import CompanyNameFilter from './CompanyNameFilter';


const DraggableOrdersDash: React.FC<{ initialOrders: OrderDashboard[] }> = ({ initialOrders }) => {
    // Keep original orders separate from filtered view
    const [originalOrders] = useState<OrderDashboard[]>(initialOrders);
    const [orders, setOrders] = useState<OrderDashboard[]>(initialOrders);
    const [orderNumber, setOrderNumber] = useState<string>("");
    const [orderItemNumber, setOrderItemNumber] = useState<string>("");
    const [companyName, setCompanyName] = useState<string>("");
    const allStatuses = [
        OrderStatus.Pending,
        OrderStatus.PaymentReceived,
        OrderStatus.Shipping,
        OrderStatus.Invoiced,
        OrderStatus.Completed
    ];

    const updateOrderStatus = api.orders.updateStatus.useMutation();

    const handleOrderNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOrderNumber(event.target.value);
    };

    const handleOrderNumberSubmit = () => {
        if (!orderNumber.trim()) {
            setOrders(originalOrders);
            return;
        }
        const filtered = originalOrders.filter(
            order => order.orderNumber.toString().includes(orderNumber.trim())
        );
        setOrders(filtered);
    };

    const clearOrderNumberFilter = () => {
        setOrderNumber("");
        setOrders(originalOrders);
    };

    const handleOrderItemNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOrderItemNumber(event.target.value);
    };

    const handleOrderItemNumberSubmit = () => {
        if (!orderItemNumber.trim()) {
            setOrders(originalOrders);
            return;
        }
        const filtered = originalOrders.filter(
            order => order.orderItems.some(item => item.orderItemNumber.toString().includes(orderItemNumber.trim()))
        );
        setOrders(filtered);
    };

    const clearOrderItemNumberFilter = () => {
        setOrderItemNumber("");
        setOrders(originalOrders);
    };

    const handleCompanyNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCompanyName(event.target.value);
    };

    const handleCompanyNameSubmit = () => {
        if (!companyName.trim()) {
            setOrders(originalOrders);
            return;
        }
        const filtered = originalOrders.filter(
            order => order.companyName.toLowerCase().includes(companyName.trim().toLowerCase())
        );
        setOrders(filtered);
    };

    const clearCompanyNameFilter = () => {
        setCompanyName("");
        setOrders(originalOrders);
    };

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
        <div className="flex flex-col p-2 sm:p-5 bg-gray-800 text-white min-h-screen">
            <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-4 mb-4">
                <CompanyNameFilter
                    companyName={companyName}
                    onCompanyNameChange={handleCompanyNameChange}
                    onSubmit={handleCompanyNameSubmit}
                    onClear={clearCompanyNameFilter}
                />
                <OrderNumberFilter
                    orderNumber={orderNumber}
                    onOrderNumberChange={handleOrderNumberChange}
                    onSubmit={handleOrderNumberSubmit}
                    onClear={clearOrderNumberFilter}
                />
                <OrderItemNumberFilter
                    orderItemNumber={orderItemNumber}
                    onOrderItemNumberChange={handleOrderItemNumberChange}
                    onSubmit={handleOrderItemNumberSubmit}
                    onClear={clearOrderItemNumberFilter}
                />
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4">
                {allStatuses.map((status) => (
                    <div key={status}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={(event) => onDrop(event, status)}
                        className="flex-1 min-w-[280px] p-4 border border-gray-600 rounded-lg shadow-sm bg-gray-700 transition-colors duration-200 overflow-y-auto max-h-[calc(100vh-200px)]">
                        <h3 className="font-semibold mb-2">{status}</h3>
                        {(ordersByStatus[status] || []).map(order => (
                            <OrderCard key={order.id} order={order} onDragStart={onDragStart} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DraggableOrdersDash;

