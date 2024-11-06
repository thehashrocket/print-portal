// ~/app/_components/workOrders/workOrderItemsTable.tsx

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
    type RowClassParams
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";
import { type SerializedWorkOrderItem } from "~/types/serializedTypes";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface WorkOrderItemsTableProps {
    workOrderItems: SerializedWorkOrderItem[];
}

const WorkOrderItemsTable: React.FC<WorkOrderItemsTableProps> = ({ workOrderItems }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<SerializedWorkOrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    const actionsRenderer = (props: { data: SerializedWorkOrderItem }) => (
        <Link className="btn btn-xs btn-primary" href={`/workOrders/${props.data.workOrderId}/workOrderItem/${props.data.id}`}>
            View
        </Link>
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

    const columnDefs: ColDef[] = [
        { headerName: "Job #", field: "workOrderItemNumber", width: 120 },
        { headerName: "Quantity", field: "quantity", width: 120 },
        { headerName: "Description", field: "description", filter: true },
        { headerName: "Status", field: "status", filter: true, width: 150 },
        { headerName: "Cost", field: "cost", filter: true, valueFormatter: formatNumberAsCurrency, width: 120 },
        { headerName: "Amount", field: "amount", filter: true, valueFormatter: formatNumberAsCurrency, width: 120 },
        { headerName: "Actions", cellRenderer: actionsRenderer, width: 100, sortable: false, filter: false },
    ];

    useEffect(() => {
        setRowData(workOrderItems);
        setLoading(false);
        if (gridRef.current) {
            setTimeout(() => {
                gridRef.current?.api.sizeColumnsToFit();
            }, 0);
        }
    }, [workOrderItems]);

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

export default WorkOrderItemsTable;