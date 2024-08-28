// ~/app/_components/orders/OrderItemStock/orderItemStockComponent.tsx
"use client";

import React, { useState } from 'react';
import { api } from '~/trpc/react';
import OrderItemStockForm from './orderItemStockForm';
import { StockStatus } from '@prisma/client';

interface OrderItemStockComponentProps {
    orderItemId: string;
}

const OrderItemStockComponent: React.FC<OrderItemStockComponentProps> = ({ orderItemId }) => {
    const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);

    const { data: stocks, refetch } = api.orderItemStocks.getByOrderItemId.useQuery(
        orderItemId,
        { enabled: !!orderItemId }
    );

    const formatDate = (date: Date | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    };

    const handleSuccess = () => {
        setIsAddMode(false);
        setSelectedStockId(null);
        refetch();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Item Stock</h3>

            {/* List of existing stocks */}
            {stocks && stocks.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Quantity</th>
                                <th>Cost Per M</th>
                                <th>Supplier</th>
                                <th>Status</th>
                                <th>Expected Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.map(stock => (
                                <tr key={stock.id}>
                                    <td>{stock.stockQty}</td>
                                    <td>${stock.costPerM.toString()}</td>
                                    <td>{stock.supplier || 'N/A'}</td>
                                    <td>{stock.stockStatus}</td>
                                    <td>{formatDate(stock.expectedDate ? new Date(stock.expectedDate) : null)}</td>
                                    <td>
                                        <button
                                            className="btn btn-xs btn-primary"
                                            onClick={() => setSelectedStockId(stock.id)}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add new stock button */}
            {!isAddMode && !selectedStockId && (
                <button
                    className="btn btn-primary"
                    onClick={() => setIsAddMode(true)}
                >
                    Add New Stock
                </button>
            )}

            {/* Form for adding/editing stock */}
            {(isAddMode || selectedStockId) && (
                <OrderItemStockForm
                    orderItemId={orderItemId}
                    stockId={selectedStockId}
                    onSuccess={handleSuccess}
                    onCancel={() => {
                        setIsAddMode(false);
                        setSelectedStockId(null);
                    }}
                />
            )}
        </div>
    );
};

export default OrderItemStockComponent;