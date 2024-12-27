// ~/app/_components/orders/orderItemsTable.tsx
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
    type ICellRendererParams,
    type RowClassParams
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { type SerializedOrderItem } from "~/types/serializedTypes";
import Link from "next/link";
import { Button } from "../../ui/button";
import { EyeIcon } from "lucide-react";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface OrderItemsTableProps {
    orderItems: SerializedOrderItem[];
}

const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ orderItems }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<SerializedOrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

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
                <EyeIcon className="w-4 h-4 mr-1" />
                View
            </Button>
        </Link>
    );

    const formatNumberAsCurrency = (params: ValueFormatterParams): string => {
        if (params.value === null) return "$0.00";
        return `$${Number(params.value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    };

    const getRowStyle = (params: RowClassParams<SerializedOrderItem>): { backgroundColor: string } | undefined => {
        if (!params.data) return undefined;

        switch (params.data.status) {
            case "Pending": return { backgroundColor: "#E3F2FD" };
            case "Completed": return { backgroundColor: "#E8F5E9" };
            case "Cancelled": return { backgroundColor: "#FFEBEE" };
            default: return undefined;
        }
    };

    const mobileColumnDefs: ColDef[] = [
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
            valueFormatter: formatNumberAsCurrency,
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
    ];

    const desktopColumnDefs: ColDef[] = [
        { headerName: "Item #", field: "orderItemNumber", width: 120 },
        { headerName: "Quantity", field: "quantity", width: 120 },
        { headerName: "Description", field: "description", filter: true },
        { headerName: "Finished Qty", field: "finishedQty", filter: true, width: 150 },
        { headerName: "Status", field: "status", filter: true, width: 150 },
        { headerName: "Cost", field: "cost", filter: true, valueFormatter: formatNumberAsCurrency, width: 120 },
        { headerName: "Amount", field: "amount", filter: true, valueFormatter: formatNumberAsCurrency, width: 120 },
        { headerName: "Actions", cellRenderer: actionsRenderer, width: 100, sortable: false, filter: false },
    ];

    useEffect(() => {
        setRowData(orderItems);
        setLoading(false);
        if (gridRef.current) {
            gridRef.current.api.sizeColumnsToFit();
        }
    }, [orderItems]);

    const onGridReady = (params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    };

    const onFilterChanged = (event: FilterChangedEvent) => {
        const filteredRowCount = event.api.getDisplayedRowCount();
        // You can update a state here to show the filtered row count if desired
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div 
            className="ag-theme-alpine w-full" 
            style={{ 
                height: isMobile ? "600px" : "600px",
                width: "100%",
                fontSize: isMobile ? "14px" : "inherit"
            }}
        >
            <AgGridReact
                ref={gridRef}
                columnDefs={isMobile ? mobileColumnDefs : desktopColumnDefs}
                defaultColDef={defaultColDef}
                rowData={rowData}
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