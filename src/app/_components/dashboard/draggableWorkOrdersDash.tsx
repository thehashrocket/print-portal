"use client";
import React, { useState, useEffect } from 'react';
import { WorkOrderStatus } from '@prisma/client';
import { api } from "~/trpc/react";

const DraggableWorkOrdersDash = ({ initialWorkOrders }) => {
    const [workOrders, setWorkOrders] = useState(initialWorkOrders);
    const allStatuses = Object.values(WorkOrderStatus);

    const updateWorkOrderStatus = api.workOrders.updateStatus.useMutation();

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
        // Remove the highlight class
        event.target.classList.remove('bg-blue-100');
        const id = event.dataTransfer.getData("text/plain");
        try {
            // Call the updateStatus endpoint to update the WorkOrder's status
            await updateWorkOrderStatus.mutateAsync({ id, status: newStatus });

            console.log('id:', id);
            setWorkOrders(prevWorkOrders =>
                prevWorkOrders.map(workOrder =>
                    workOrder.id === id ? { ...workOrder, status: newStatus } : workOrder
                )
            );
        } catch (error) {
            console.error('Failed to update WorkOrder status: ', error);
        }
    };

    const onDragLeave = (event) => {
        // Optionally, remove the class from the event target to remove the highlight
        event.target.classList.remove('bg-blue-100');
    };


    // Group the work orders by their status
    const ordersByStatus = workOrders.reduce((acc, workOrder) => {
        const statusGroup = acc[workOrder.status] || [];
        acc[workOrder.status] = [...statusGroup, workOrder];
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
                    style={{ minHeight: '200px' }}>
                    <h3 className="text-lg font-semibold mb-2">{status}</h3>
                    {(ordersByStatus[status] || []).map(workOrder => (
                        <div key={workOrder.id}
                            draggable
                            onDragStart={(event) => onDragStart(event, workOrder.id)}
                            className="p-2 mb-2 border rounded cursor-move bg-gray-600 hover:bg-gray-500"
                            style={{ borderColor: '#2D3748' }}>
                            {workOrder.description}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default DraggableWorkOrdersDash;

