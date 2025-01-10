// ~/app/_components/orders/OrderItemStock/orderItemStockComponent.tsx
"use client";

import React, { useState } from 'react';
import { api } from '~/trpc/react';
import OrderItemStockForm from './orderItemStockForm';
import { formatDate } from "~/utils/formatters";
import { Button } from '../../ui/button';
import { PencilIcon, Plus } from 'lucide-react';


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

    const { data: paperProducts } = api.paperProducts.getAll.useQuery();

    const findPaperProduct = (id: string) => {
        if (!id) return null;
        const paperProduct = paperProducts?.find(product => product.id === id);
        return paperProduct ? `${paperProduct.brand} ${paperProduct.finish} ${paperProduct.paperType} ${paperProduct.size} ${paperProduct.weightLb}lbs.` : null;
    };

    const handleSuccess = () => {
        setIsAddMode(false);
        setSelectedStockId(null);
        refetch();
    };

    return (
        <div className="space-y-4">
            {/* List of existing stocks */}
            {stocks && stocks.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Quantity</th>
                                <th>Paper Product</th>
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
                                    <td>{findPaperProduct(stock.paperProductId || '')}</td>
                                    <td>{stock.supplier || 'N/A'}</td>
                                    <td>{stock.stockStatus}</td>
                                    <td>{stock.expectedDate ? formatDate(new Date(stock.expectedDate)) : null}</td>
                                    <td>
                                        <Button
                                            variant="default"
                                            onClick={() => setSelectedStockId(stock.id)}
                                        >
                                            <PencilIcon className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add new stock button */}
            {!isAddMode && !selectedStockId && (
                <Button
                    variant="default"
                    onClick={() => setIsAddMode(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Stock
                </Button>
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