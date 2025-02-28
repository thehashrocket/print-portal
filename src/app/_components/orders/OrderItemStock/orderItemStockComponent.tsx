// ~/app/_components/orders/OrderItemStock/orderItemStockComponent.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { api } from '~/trpc/react';
import OrderItemStockForm from './orderItemStockForm';
import { formatDate } from "~/utils/formatters";
import { Button } from '../../ui/button';
import { PencilIcon, Plus, Trash2 } from 'lucide-react';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import type { ColDef, ValueFormatterParams, ICellRendererParams } from '@ag-grid-community/core';
import type { SerializedOrderItemStock } from '~/types/serializedTypes';
import { formatPaperProductLabel } from '~/utils/formatters';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "~/app/_components/ui/dialog";
import { toast } from 'react-hot-toast';

interface OrderItemStockComponentProps {
    orderItemId: string;
}

const OrderItemStockComponent: React.FC<OrderItemStockComponentProps> = ({ orderItemId }) => {
    const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const { data: stocks, refetch } = api.orderItemStocks.getByOrderItemId.useQuery(
        orderItemId,
        { enabled: !!orderItemId }
    );

    const { data: paperProducts } = api.paperProducts.getAll.useQuery();

    const { mutate: deleteStock } = api.orderItemStocks.delete.useMutation();

    // Effect to manage form visibility
    useEffect(() => {
        if (selectedStockId || isAddMode) {
            setShowForm(true);
        } else {
            setShowForm(false);
        }
    }, [selectedStockId, isAddMode]);

    const findPaperProduct = useCallback((id: string | null) => {
        if (!id) return '';
        const paperProduct = paperProducts?.find(product => product.id === id);
        return paperProduct ? formatPaperProductLabel(paperProduct) : '';
    }, [paperProducts]);

    const handleSuccess = () => {
        setIsAddMode(false);
        setSelectedStockId(null);
        setShowForm(false);
        refetch();
        toast.success('Stock item added successfully');
    };

    const handleDelete = useCallback((id: string) => {
        console.log('Delete clicked for stock:', id);
        deleteStock(id);
        toast.success('Stock item deleted successfully');
        refetch();
    }, [deleteStock, refetch]);

    const handleEdit = useCallback((id: string) => {
        console.log('Edit clicked for stock:', id);
        setSelectedStockId(id);
        setIsAddMode(false);
        setShowForm(true);
    }, []);

    const handleCancel = useCallback(() => {
        setIsAddMode(false);
        setSelectedStockId(null);
        setShowForm(false);
    }, []);

    const handleAdd = useCallback(() => {
        setSelectedStockId(null);
        setIsAddMode(true);
        setShowForm(true);
    }, []);

    // Column Definitions
    const columnDefs = useMemo<ColDef<SerializedOrderItemStock>[]>(() => [
        { 
            field: 'stockQty' as keyof SerializedOrderItemStock, 
            headerName: 'Quantity', 
            flex: 1 
        },
        { 
            field: 'paperProductId' as keyof SerializedOrderItemStock, 
            headerName: 'Paper Product', 
            flex: 2,
            valueFormatter: ({ value }: ValueFormatterParams<SerializedOrderItemStock>) => 
                findPaperProduct(value as string | null)
        },
        { 
            field: 'supplier' as keyof SerializedOrderItemStock, 
            headerName: 'Supplier', 
            flex: 1,
            valueFormatter: ({ value }: ValueFormatterParams<SerializedOrderItemStock>) => 
                value || ''
        },
        { 
            field: 'stockStatus' as keyof SerializedOrderItemStock, 
            headerName: 'Status', 
            flex: 1 
        },
        { 
            field: 'expectedDate' as keyof SerializedOrderItemStock, 
            headerName: 'Expected Date', 
            flex: 1,
            valueFormatter: ({ value }: ValueFormatterParams<SerializedOrderItemStock>) => 
                value ? formatDate(new Date(value as string)) : ''
        },
        {
            headerName: 'Action',
            flex: 1,
            cellRenderer: ({ data }: ICellRendererParams<SerializedOrderItemStock>) => {
                if (!data) return null;
                return (
                    <div className="flex items-center">
                    <Button
                        variant="default"
                        className="mr-2"
                        size="xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(data.id);
                        }}
                    >
                        <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(data.id);
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                );
            }
        }
    ], [findPaperProduct, handleEdit]);

    // Default Column Definitions
    const defaultColDef = useMemo<ColDef<SerializedOrderItemStock>>(() => ({
        sortable: true,
        filter: true,
        resizable: true,
    }), []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Stock Items</h3>
                <Button
                    variant="default"
                    onClick={handleAdd}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Stock
                </Button>
            </div>

            {/* AG Grid */}
            {stocks && stocks.length > 0 && (
                <div className="ag-theme-alpine w-full h-[400px]">
                    <AgGridReact<SerializedOrderItemStock>
                        rowData={stocks}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        animateRows={true}
                        rowSelection="single"
                        suppressCellFocus={true}
                        modules={[ClientSideRowModelModule]}
                    />
                </div>
            )}

            {/* Dialog for adding/editing stock */}
            <Dialog open={showForm} onOpenChange={(open) => !open && handleCancel()}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {isAddMode ? 'Add New Stock' : 'Edit Stock'}
                        </DialogTitle>
                    </DialogHeader>
                    <OrderItemStockForm
                        orderItemId={orderItemId}
                        stockId={selectedStockId}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrderItemStockComponent;