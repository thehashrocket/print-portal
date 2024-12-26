// ~/app/_components/workOrders/create/existing_work_order_items_list.tsx
"use client";
import React from 'react';
import { type SerializedWorkOrderItem } from '~/types/serializedTypes';

interface ExistingWorkOrderItemsListProps {
    items: SerializedWorkOrderItem[];
    onItemClick: (id: string) => void;
}

const ExistingWorkOrderItemsList: React.FC<ExistingWorkOrderItemsListProps> = ({ items, onItemClick }) => {
    return (
        <div className="bg-white shadow-md rounded-lg mb-4">
            <h3 className="text-lg font-semibold p-4 border-b">Existing Estimate Items</h3>
            {items.length === 0 ? (
                <p className="p-4 text-gray-500">No estimate items created yet.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="p-4 cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out"
                            onClick={() => onItemClick(item.id)}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <span className="font-medium text-lg mb-2 sm:mb-0">{item.description}</span>
                                <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-500">
                                    <span>Status: <span className={`font-semibold ${getStatusColor(item.status)}`}>{item.status}</span></span>
                                    <span>Amount: ${item.amount}</span>
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                                Expected: {new Date(item.expectedDate).toLocaleDateString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed':
            return 'text-green-600';
        case 'Pending':
            return 'text-yellow-600';
        case 'Cancelled':
            return 'text-red-600';
        default:
            return 'text-gray-600';
    }
};

export default ExistingWorkOrderItemsList;