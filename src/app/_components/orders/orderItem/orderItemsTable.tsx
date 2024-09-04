// ~/app/_components/orders/orderItemsTable.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    ColDef,
    ModuleRegistry,
    ValueFormatterParams,
    GridReadyEvent,
    FilterChangedEvent,
    ICellRendererParams,
    RowClassParams
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { OrderItemStatus } from "@prisma/client";
import Link from "next/link";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

type SerializedOrderItem = {
    id: string;
    description: string | null;
    finishedQty: number | null;
    orderId: string;
    status: OrderItemStatus;
    cost: string | null;
    amount: string | null;
};

interface OrderItemsTableProps {
    orderItems: SerializedOrderItem[];
}

const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ orderItems }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<SerializedOrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    const defaultColDef = useMemo<ColDef>(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    const actionsRenderer = (props: ICellRendererParams) => (
        <Link className="btn btn-xs btn-primary" href={`/orders/${props.data.orderId}/orderItem/${props.data.id}`}>
            View
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

    const columnDefs: ColDef[] = [
        { headerName: "Job #", field: "orderItemNumber", width: 120 },
        { headerName: "Quantity", field: "quantity", width: 100 },
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
        <div className="ag-theme-alpine" style={{ height: "600px", width: "100%" }}>
            <AgGridReact
                ref={gridRef}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowData={rowData}
                rowSelection="single"
                onGridReady={onGridReady}
                onFilterChanged={onFilterChanged}
                getRowStyle={getRowStyle}
                animateRows={true}
                pagination={true}
                paginationPageSize={20}
            />
        </div>
    );
};

export default OrderItemsTable;