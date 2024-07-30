import React, { useState, useEffect } from 'react';
import { api } from "~/trpc/react";
import { OrderItemStatus } from '@prisma/client';

type SerializedOrderItem = {
    id: string;
    status: OrderItemStatus;
    description: string;
    expectedDate: string;
    orderId: string;
};

const DraggableOrderItemsDash = ({ initialOrderItems }: { initialOrderItems: SerializedOrderItem[] }) => {

    const [orderItems, setOrderItems] = useState<SerializedOrderItem[]>(initialOrderItems);
    const allStatuses = [
        OrderItemStatus.Prepress,
        OrderItemStatus.Press,
        OrderItemStatus.Bindery,
        OrderItemStatus.Shipping,
        OrderItemStatus.Completed,
    ];

    const updateOrderItemStatus = api.orderItems.updateStatus.useMutation();

    const isWithinAWeek = (dateString) => {
        const targetDate = new Date(dateString);
        const currentDate = new Date();
        const timeDiff = targetDate.getTime() - currentDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff <= 7;
    };

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
        // Remove the highlight class
        const id = event.dataTransfer.getData("text/plain");
        event.currentTarget.classList.remove('bg-blue-600');
        try {
            // Call the updateStatus endpoint to update the WorkOrder's status
            await updateOrderItemStatus.mutateAsync({ id, status: newStatus });

            setOrderItems(prevOrderItems =>
                prevOrderItems.map(orderItem =>
                    orderItem.id === id ? { ...orderItem, status: newStatus } : orderItem
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    // Group the Order Items by their status
    const orderItemsByStatus: { [key in OrderItemStatus]: SerializedOrderItem[] } = orderItems.reduce((acc, orderItem) => {
        const statusGroup = acc[orderItem.status] || [];
        acc[orderItem.status] = [...statusGroup, orderItem];
        return acc;
    }, {} as { [key in OrderItemStatus]: SerializedOrderItem[] });

    return (
        <div className="flex p-5 bg-gray-800 text-white min-h-screen">
            {allStatuses.map((status) => (
                <div key={status}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={(event) => onDrop(event, status)}
                    className="p-4 mr-4 border border-gray-600 rounded-lg shadow bg-gray-700 transition-colors duration-200 overflow-auto min-w-[200px] min-h-[200px]">
                    <h3 className="font-semibold mb-2">{status}</h3>
                    {(orderItemsByStatus[status] || []).map(orderItem => (
                        <div key={orderItem.id}
                            draggable
                            onDragStart={(event) => onDragStart(event, orderItem.id)}
                            className="flex-column p-2 mb-2 border rounded cursor-move bg-gray-600 hover:bg-gray-500 hover:shadow-md transition-all duration-200"
                            style={{
                                borderColor: isWithinAWeek(orderItem.expectedDate) ? 'red' : 'green'
                            }}>
                            <div className="flex mb-3">
                                <div className="text-sm font-medium">{orderItem.description}</div>
                            </div>
                            <div className="flex mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 m-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                </svg>
                                <div className="text-sm">{orderItem.expectedDate}</div>
                            </div>
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 m-2">
                                    <path stroke-linecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                                </svg>
                                <a href={`/order/${orderItem.orderId}//orderItems/${orderItem.id}`} className="text-blue-400 hover:underline">View Job</a>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default DraggableOrderItemsDash;