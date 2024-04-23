"use client";
import React, { useState, useEffect } from 'react';
import { OrderStatus } from '@prisma/client';
import { api } from "~/trpc/react";

const DraggableOrdersDash = ({ initialOrders }) => {
    const [orders, setOrders] = useState(initialOrders);
    const allStatuses = Object.values(OrderStatus);

    const updateOrderStatus = api.orders.updateStatus.useMutation();

    const onDragStart = (event, id) => {
        event.dataTransfer.setData("text/plain", id);
        // Add additional styling or class changes if needed when drag starts
    };

    const onDragOver = (event) => {
        event.preventDefault();
        // Optionally, add a class to the event target to highlight the drop area
        event.target.classList.add('bg-blue-100');
    };

    const onDrop = async (event, newStatus) => {
        event.preventDefault();
        const id = event.dataTransfer.getData("text/plain");
        try {
            // Remove the highlight class
            event.target.classList.remove('bg-blue-100');
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

    const onDragLeave = (event) => {
        // Optionally, remove the class from the event target to remove the highlight
        event.target.classList.remove('bg-blue-100');
    };


    // Group the orders by their status
    const ordersByStatus = orders.reduce((acc, order) => {
        const statusGroup = acc[order.status] || [];
        acc[order.status] = [...statusGroup, order];
        return acc;
    }, {});

    return (
        <div className="flex p-5 bg-gray-800 text-white min-h-screen">
            {allStatuses.map((status) => (
                <div key={status}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={(event) => onDrop(event, status)}
                    className="flex-1 p-4 mr-4 border border-gray-600 rounded-lg shadow bg-gray-700"
                    style={{ minHeight: '50px' }}>
                    <h3 className="text-lg font-semibold mb-2">{status}</h3>
                    {(ordersByStatus[status] || []).map(order => (
                        <div key={order.id}
                            draggable
                            onDragStart={(event) => onDragStart(event, order.id)}
                            className="p-2 mb-2 border rounded cursor-move bg-gray-600 hover:bg-gray-500"
                            style={{ borderColor: '#2D3748' }}>
                            {order.description}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default DraggableOrdersDash;

