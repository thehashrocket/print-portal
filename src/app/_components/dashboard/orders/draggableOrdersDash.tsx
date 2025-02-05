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
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";
import { Info } from 'lucide-react';


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

    // Add CopilotKit readable context for orders and their statuses
    useCopilotReadable({
        description: "Current orders and their statuses in the dashboard",
        value: {
            orders: orders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                companyName: order.companyName,
                status: order.status,
                itemCount: order.orderItems.length,
            })),
            ordersByStatus: Object.fromEntries(
                Object.entries(ordersByStatus).map(([status, orders]) => [
                    status,
                    orders.length
                ])
            ),
            totalOrders: orders.length,
        },
    });

    // Add CopilotKit readable context for filtering state
    useCopilotReadable({
        description: "Current filtering state of the dashboard",
        value: {
            orderNumber,
            orderItemNumber,
            companyName,
            isFiltered: orderNumber !== "" || orderItemNumber !== "" || companyName !== "",
        },
    });

    // Add CopilotKit readable context for drag and drop state
    useCopilotReadable({
        description: "Drag and drop functionality state",
        value: {
            availableStatuses: allStatuses,
            canDragAndDrop: true,
        },
    });

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
            <div className="flex items-start gap-2 p-3 text-sm bg-blue-50 border border-blue-200 rounded-md mb-4">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <p className="text-blue-700">
                    Status is the current status of the order.
                    You can change the status of the order by dragging and dropping the order card into a new status.
                    Orders placed in the completed status are not visible in the dashboard after they are completed and the page is refreshed.
                </p>
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

            <CopilotPopup
                instructions={`You are an AI assistant helping users manage orders in a dashboard view. You have access to:
                    1. All orders and their current statuses
                    2. Filtering options by order number, order item number, and company name
                    3. Drag and drop functionality for status updates
                    4. Order details including amounts and item counts
                    5. Shipping information status

                    Your role is to:
                    - Help users understand the current state of orders
                    - Guide users through filtering and finding specific orders
                    - Explain the drag and drop functionality for status updates
                    - Provide insights about order distribution
                    - Help with status management and updates
                    - Alert users to orders needing attention
                    - Help track shipping information

                    When responding:
                    - Reference specific orders and their details
                    - Guide users through status transitions
                    - Help with filtering by multiple criteria
                    - Provide order insights and suggestions
                    - Explain shipping information status
                    - Help users understand order flow
                    - Provide workload distribution insights`}
                labels={{
                    title: "Orders Dashboard Assistant",
                    initial: "How can I help you manage your orders?",
                    placeholder: "Ask about orders, filtering, or status updates...",
                }}
            />
        </div>
    );
};

export default DraggableOrdersDash;

