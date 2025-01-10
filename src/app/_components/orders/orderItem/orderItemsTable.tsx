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

    const mobileColumnDefs = useMemo<ColDef[]>(() => [
        { 
            headerName: "Item #", 
            field: "orderItemNumber", 
            width: 70,
            maxWidth: 70
        },
        { 
            headerName: "Description", 
            field: "description", 
            flex: 2,
            minWidth: 160,
            tooltipField: "description"
        },
        { 
            headerName: "Status", 
            field: "status", 
            flex: 1,
            minWidth: 100,
            maxWidth: 120
        },
        { 
            headerName: "Amount", 
            field: "amount", 
            valueFormatter: formatNumberAsCurrencyInTable,
            flex: 1,
            minWidth: 120,
            maxWidth: 140
        },
        { 
            headerName: "", 
            cellRenderer: actionsRenderer, 
            width: 140,
            maxWidth: 160,
            sortable: false, 
            filter: false
        }
    ], []);

    const desktopColumnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Item #", field: "orderItemNumber", width: 120 },
        { headerName: "Quantity", field: "quantity", width: 120 },
        { headerName: "Description", field: "description", filter: true },
        { headerName: "Finished Qty", field: "finishedQty", filter: true, width: 150 },
        { headerName: "Status", field: "status", filter: true, width: 150 },
        { headerName: "Cost", field: "cost", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 120 },
        { headerName: "Amount", field: "amount", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 120 },
        { headerName: "Actions", cellRenderer: actionsRenderer, width: 100, sortable: false, filter: false },
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