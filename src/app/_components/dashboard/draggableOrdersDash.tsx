"use client";
import React, { useState, useEffect } from 'react';
import { OrderStatus } from '@prisma/client';
import { api } from "~/trpc/react";

type SerializedOrder = {
    id: string;
    status: OrderStatus;
    description: string;
    expectedDate: string;
};

const DraggableOrdersDash = ({ initialOrders }: { initialOrders: SerializedOrder[] }) => {
    const [orders, setOrders] = useState<SerializedOrder[]>(initialOrders);
    const allStatuses = Object.values(OrderStatus);

    const updateOrderStatus = api.orders.updateStatus.useMutation();

    const onDragLeave = (event) => {
        // Optionally, remove the class from the event target to remove the highlight
        event.currentTarget.classList.remove('bg-blue-600');
    }

    const onDragStart = (event, id) => {
        event.dataTransfer.setData("text/plain", id);
        // Add additional styling or class changes if needed when drag starts
    };

    const onDragOver = (event) => {
        event.preventDefault();
        // Optionally, add a class to the event target to highlight the drop area
        event.currentTarget.classList.add('bg-blue-600');
    };

    const onDrop = async (event, newStatus) => {
        event.preventDefault();
        const id = event.dataTransfer.getData("text/plain");
        event.currentTarget.classList.remove('bg-blue-600');
        try {
            // Remove the highlight class
            const id = event.dataTransfer.getData("text/plain");

            // Call the updateStatus endpoint to update the Order's status
            await updateOrderStatus.mutateAsync({ id, status: newStatus });

            console.log('id:', id);
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === id ? { ...order, status: newStatus } : order
                )
            );

        } catch (error) {
            console.error('Failed to update Order status: ', error);
        }
    };

    const ordersByStatus: { [key in OrderStatus]: SerializedOrder[] } = orders.reduce((acc, order) => {
        const statusGroup = acc[order.status] || [];
        acc[order.status] = [...statusGroup, order];
        return acc;
    }, {} as { [key in OrderStatus]: SerializedOrder[] });

    return (
        <div className="flex p-5 bg-gray-800 text-white min-h-screen">
            {allStatuses.map((status) => (
                <div key={status}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={(event) => onDrop(event, status)}
                    className="p-4 mr-4 border border-gray-600 rounded-lg shadow bg-gray-700 transition-colors duration-200 overflow-auto"
                    style={{ minHeight: '50px' }}>
                    <h3 className="text-lg font-semibold mb-2">{status}</h3>
                    {(ordersByStatus[status] || []).map(order => (
                        <div key={order.id}
                            draggable
                            onDragStart={(event) => onDragStart(event, order.id)}
                            className="flex-column p-2 mb-2 border rounded cursor-move bg-gray-600 hover:bg-gray-500 hover:shadow-md transition-all duration-200"
                            style={{ borderColor: '#2D3748' }}>
                            <div className="flex mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                <div className="text-sm font-medium">{order.description}</div>
                            </div>
                            <div className="flex">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                </svg>
                                <div className="text-sm">{order.expectedDate}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default DraggableOrdersDash;

