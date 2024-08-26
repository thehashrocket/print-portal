// ~/app/_components/workOrders/create/existing_work_order_items_list.tsx
"use client";
import React from 'react';
import { SerializedWorkOrderItem } from '~/types/serializedTypes';

interface ExistingWorkOrderItemsListProps {
    items: SerializedWorkOrderItem[];
    onItemClick: (id: string) => void;
}

const ExistingWorkOrderItemsList: React.FC<ExistingWorkOrderItemsListProps> = ({ items, onItemClick }) => {
    return (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-2">Existing Work Order Items</h3>
            {items.length === 0 ? (
                <p>No work order items created yet.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="py-2 cursor-pointer hover:bg-gray-200"
                            onClick={() => onItemClick(item.id)}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{item.description}</span>
                                <span className="text-sm text-gray-500">
                                    Qty: {item.quantity} | Expected: {new Date(item.expectedDate).toLocaleDateString()} |
                                    Status: {item.status} | Amount: ${item.amount}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ExistingWorkOrderItemsList;