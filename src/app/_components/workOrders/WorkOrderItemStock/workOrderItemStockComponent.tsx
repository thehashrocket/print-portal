// ~/app/_components/workOrders/WorkOrderItemStock/workOrderItemStockComponent.tsx
"use client";

import React, { useState } from 'react';
import { api } from '~/trpc/react';
import WorkOrderItemStockForm from './workOrderItemStockForm';
import { formatDate } from '~/utils/formatters';
import { Button } from '~/app/_components/ui/button';
import { Pencil, PlusCircle } from 'lucide-react';

interface WorkOrderItemStockComponentProps {
    workOrderItemId: string;
}

const WorkOrderItemStockComponent: React.FC<WorkOrderItemStockComponentProps> = ({ workOrderItemId }) => {
    const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);

    const { data: paperProducts } = api.paperProducts.getAll.useQuery();
    const findPaperProduct = (id: string) => {
        if (!id) return null;
        const paperProduct = paperProducts?.find(product => product.id === id);
        return paperProduct ? `${paperProduct.brand} ${paperProduct.finish} ${paperProduct.paperType} ${paperProduct.size} ${paperProduct.weightLb}lbs.` : null;
    };

    const { data: stocks, refetch } = api.workOrderItemStocks.getByWorkOrderItemId.useQuery(
        workOrderItemId,
        { enabled: !!workOrderItemId }
    );

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
                                            <Pencil className="w-4 h-4 mr-2" />
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
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add New Stock
                </Button>
            )}

            {/* Form for adding/editing stock */}
            {(isAddMode || selectedStockId) && (
                <WorkOrderItemStockForm
                    workOrderItemId={workOrderItemId}
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

export default WorkOrderItemStockComponent;