// ~/app/_components/workOrders/workOrderItem/workOrderItemsTable.tsx

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    type ColDef,
    ModuleRegistry,
    type ValueFormatterParams,
    type GridReadyEvent,
    type FilterChangedEvent,
    type RowClassParams,
    type GridApi
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";
import { type SerializedWorkOrderItem } from "~/types/serializedTypes";
import { Button } from "../../ui/button";
import { Eye, Loader2, Trash2 } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";

// Register modules outside of component to prevent multiple registrations
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface WorkOrderItemsTableProps {
    workOrderItems: SerializedWorkOrderItem[];
}

const WorkOrderItemsTable: React.FC<WorkOrderItemsTableProps> = ({ workOrderItems: initialWorkOrderItems }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [loading, setLoading] = useState(true);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const mounted = useRef(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [workOrderItems, setWorkOrderItems] = useState(initialWorkOrderItems);
    const utils = api.useUtils();
    const deleteWorkOrderItemMutation = api.workOrderItems.deleteWorkOrderItem.useMutation(
        {
            onSuccess: (_, deletedId) => {
                setIsDeleting(false);
                // Update local state by removing the deleted item
                setWorkOrderItems((prevItems) => 
                    prevItems.filter(item => item.id !== deletedId)
                );
                void utils.workOrderItems.getAll.invalidate();
                toast.success('Item deleted successfully');
            },
            onError: (error) => {
                setIsDeleting(false);
                toast.error('Failed to delete item: ' + error.message);
            }
        }
    );
    
    const handleDelete = (id: string) => {
        setIsDeleting(true);
        deleteWorkOrderItemMutation.mutate(id);
    };

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    const actionsRenderer = (props: { data: SerializedWorkOrderItem }) => (
        <div className="flex flex-row gap-2">
            <Link href={`/workOrders/${props.data.workOrderId}/workOrderItem/${props.data.id}`}>
                <Button
                    variant="default"
                    size="sm"
                >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                </Button>
            </Link>
            <Button
                onClick={() => handleDelete(props.data.id)}
                variant="destructive"
                size="sm"
                disabled={isDeleting}
            >
                {isDeleting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                    </>
                ) : (
                    <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </>
                )}
            </Button>
        </div>
    );

    const formatNumberAsCurrency = (params: ValueFormatterParams) => {
        if (params.value === null) return "$0.00";
        return `$${Number(params.value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    };

    const getRowStyle = (params: RowClassParams<SerializedWorkOrderItem>): { backgroundColor: string } | undefined => {
        if (!params.data) return undefined;

        switch (params.data.status) {
            case "Pending": return { backgroundColor: "#E3F2FD" };
            case "Approved": return { backgroundColor: "#E8F5E9" };
            case "Cancelled": return { backgroundColor: "#FFEBEE" };
            default: return undefined;
        }
    };

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            headerName: "Item #",
            field: "workOrderItemNumber",
            minWidth: 120,
            flex: 1
        },
        {
            headerName: "Description",
            field: "description",
            minWidth: 200,
            flex: 2
        },
        {
            headerName: "Status",
            field: "status",
            minWidth: 120,
            flex: 1
        },
        {
            headerName: "Quantity",
            field: "quantity",
            minWidth: 120,
            flex: 1
        },
        {
            headerName: "Cost",
            field: "cost",
            valueFormatter: formatNumberAsCurrency,
            minWidth: 120,
            flex: 1
        },
        {
            headerName: "Total",
            field: "amount",
            valueFormatter: formatNumberAsCurrency,
            minWidth: 120,
            flex: 1
        },
        {
            headerName: "Actions",
            cellRenderer: actionsRenderer,
            minWidth: 120,
            flex: 1,
            sortable: false,
            filter: false
        }
    ], []);

    const mobileColumnDefs = useMemo<ColDef[]>(() => [
        {
            headerName: "Item #",
            field: "itemNumber",
            minWidth: 100,
            flex: 1
        },
        {
            headerName: "Status",
            field: "status",
            minWidth: 100,
            flex: 1
        },
        {
            headerName: "Total",
            field: "amount",
            valueFormatter: formatNumberAsCurrency,
            minWidth: 100,
            flex: 1
        },
        {
            headerName: "Actions",
            cellRenderer: actionsRenderer,
            minWidth: 120,
            flex: 1,
            sortable: false,
            filter: false
        }
    ], []);

    // Cleanup function
    useEffect(() => {
        return () => {
            mounted.current = false;
            if (gridApi) {
                gridApi.destroy();
            }
        };
    }, [gridApi]);

    // Add debug logging
    useEffect(() => {
        console.log('WorkOrderItems prop:', workOrderItems);
    }, [workOrderItems]);

    useEffect(() => {
        setLoading(false);
    }, [workOrderItems]);

    // Separate effect for grid sizing
    useEffect(() => {
        if (!gridApi || !mounted.current) return;

        const timeoutId = setTimeout(() => {
            if (mounted.current && gridApi) {
                try {
                    gridApi.sizeColumnsToFit();
                } catch (error) {
                    console.warn('Failed to size columns:', error);
                }
            }
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [gridApi, workOrderItems]); // Add workOrderItems as dependency

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (mounted.current && gridApi) {
                try {
                    gridApi.sizeColumnsToFit();
                } catch (error) {
                    console.warn('Failed to size columns on resize:', error);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [gridApi]);

    const isMobile = windowWidth <= 768;

    const containerStyle = useMemo(() => ({
        height: isMobile ? 'calc(100vh - 200px)' : '600px',
        width: '100%',
    }), [isMobile]);

    const onGridReady = (params: GridReadyEvent) => {
        if (!mounted.current) return;
        setGridApi(params.api);
        try {
            params.api.sizeColumnsToFit();
        } catch (error) {
            console.warn('Failed to size columns on grid ready:', error);
        }
    };

    const onFilterChanged = (event: FilterChangedEvent) => {
        if (!mounted.current || !gridApi) return;

        try {
            const filteredRowCount = gridApi.getDisplayedRowCount();
            console.log(`Filtered row count: ${filteredRowCount}`);
        } catch (error) {
            console.warn('Failed to get filtered row count:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!loading && workOrderItems.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>No items found</p>
            </div>
        );
    }

    return (
        <div
            className="ag-theme-alpine w-full overflow-hidden"
            style={containerStyle}
        >
            <AgGridReact
                ref={gridRef}
                columnDefs={isMobile ? mobileColumnDefs : columnDefs}
                defaultColDef={defaultColDef}
                rowData={workOrderItems}
                rowSelection="single"
                onGridReady={onGridReady}
                onFilterChanged={onFilterChanged}
                getRowStyle={getRowStyle}
                animateRows={true}
                pagination={true}
                paginationPageSize={isMobile ? 10 : 20}
                domLayout={isMobile ? 'autoHeight' : undefined}
                className={isMobile ? 'ag-grid-mobile' : ''}
            />
        </div>
    );
};

export default WorkOrderItemsTable;