// ~/app/_components/workOrders/WorkOrderItemStock/workOrderItemStockComponent.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { api } from '~/trpc/react';
import { SerializedWorkOrderItemStock } from '~/types/serializedTypes';
import WorkOrderItemStockForm from './workOrderItemStockForm';

interface WorkOrderItemStockComponentProps {
    workOrderItemId: string;
}

const WorkOrderItemStockComponent: React.FC<WorkOrderItemStockComponentProps> = ({ workOrderItemId }) => {
    const [stocks, setStocks] = useState<SerializedWorkOrderItemStock[]>([]);
    const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);

    const { data: fetchedStocks, refetch } = api.workOrderItemStocks.getByWorkOrderItemId.useQuery(
        workOrderItemId,
        { enabled: !!workOrderItemId }
    );

    useEffect(() => {
        if (fetchedStocks) {
            setStocks(fetchedStocks);
        }
    }, [fetchedStocks]);

    const handleStockAdded = (newStock: SerializedWorkOrderItemStock) => {
        setStocks(prevStocks => [...prevStocks, newStock]);
        setIsAddMode(false);
        refetch();
    };

    const handleStockUpdated = (updatedStock: SerializedWorkOrderItemStock) => {
        setStocks(prevStocks =>
            prevStocks.map(stock => stock.id === updatedStock.id ? updatedStock : stock)
        );
        setSelectedStockId(null);
        refetch();
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Work Order Item Stock</h3>

            {/* List of existing stocks */}
            {stocks.length > 0 && (
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
                                    <td>${stock.costPerM}</td>
                                    <td>{stock.supplier || 'N/A'}</td>
                                    <td>{stock.stockStatus}</td>
                                    <td>{formatDate(stock.expectedDate)}</td>
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
                <WorkOrderItemStockForm
                    workOrderItemId={workOrderItemId}
                    stockId={selectedStockId}
                    onStockAdded={handleStockAdded}
                    onStockUpdated={handleStockUpdated}
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