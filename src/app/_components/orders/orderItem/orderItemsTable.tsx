// ~/app/_components/orders/orderItemsTable.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    type ColDef,
    ModuleRegistry,
    type GridReadyEvent,
    type FilterChangedEvent,
    type ICellRendererParams,
    type RowClassParams,
    type GridApi
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { type SerializedOrderItem } from "~/types/serializedTypes";
import Link from "next/link";
import { Button } from "../../ui/button";
import { Eye } from "lucide-react";
import { formatNumberAsCurrencyInTable } from "~/utils/formatters";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface OrderItemsTableProps {
    orderItems: SerializedOrderItem[];
}

const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ orderItems }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const mounted = useRef(true);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
            mounted.current = false;
            if (gridApi) {
                gridApi.destroy();
            }
        };
    }, [gridApi]);

    const defaultColDef = useMemo<ColDef>(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    const actionsRenderer = (props: ICellRendererParams) => (
        <Link href={`/orders/${props.data.orderId}/orderItem/${props.data.id}`}>
            <Button
                variant="default"
                size="sm"
            >
                <Eye className="w-4 h-4 mr-1" />
                View
            </Button>
        </Link>
    );

    const getRowStyle = (params: RowClassParams<SerializedOrderItem>): { backgroundColor: string } | undefined => {
        if (!params.data) return undefined;

        switch (params.data.status) {
            case "Pending": return { backgroundColor: "#E3F2FD" };
            case "Completed": return { backgroundColor: "#E8F5E9" };
            case "Cancelled": return { backgroundColor: "#FFEBEE" };
            default: return undefined;
        }
    };

    const desktopColumnDefs = useMemo<ColDef[]>(() => [
        { 
            headerName: "Item #", 
            field: "orderItemNumber", 
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
            valueFormatter: formatNumberAsCurrencyInTable, 
            minWidth: 120,
            flex: 1
        },
        { 
            headerName: "Total", 
            field: "amount", 
            valueFormatter: formatNumberAsCurrencyInTable, 
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
            valueFormatter: formatNumberAsCurrencyInTable, 
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

    useEffect(() => {
        if (orderItems) {
            setLoading(false);
        }
    }, [orderItems]);

    const onGridReady = (params: GridReadyEvent) => {
        if (!mounted.current) return;
        setGridApi(params.api);
        try {
            params.api.sizeColumnsToFit();
        } catch (error) {
            console.warn('Failed to size columns on grid ready:', error);
        }
    };

    const onFilterChanged = (_event: FilterChangedEvent) => {
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

    if (!orderItems || orderItems.length === 0) {
        return <div>No order items found</div>;
    }

    return (
        <div 
            className="ag-theme-alpine w-full" 
            style={{ 
                height: "600px",
                width: "100%",
                fontSize: isMobile ? "14px" : "inherit"
            }}
        >
            <AgGridReact
                ref={gridRef}
                columnDefs={isMobile ? mobileColumnDefs : desktopColumnDefs}
                defaultColDef={defaultColDef}
                rowData={orderItems}
                rowSelection="single"
                onGridReady={onGridReady}
                onFilterChanged={onFilterChanged}
                getRowStyle={getRowStyle}
                animateRows={true}
                pagination={true}
                paginationPageSize={isMobile ? 10 : 20}
                domLayout="normal"
                suppressMovableColumns={isMobile}
                headerHeight={isMobile ? 40 : 48}
                rowHeight={isMobile ? 40 : 48}
            />
        </div>
    );
};

export default OrderItemsTable;
