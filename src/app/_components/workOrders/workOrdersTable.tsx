// ~/src/app/_components/workOrders/workOrdersTable.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    ModuleRegistry,
    ColDef,
    ValueFormatterParams,
    GridReadyEvent,
    FilterChangedEvent,
    RowClassParams
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";
import { SerializedWorkOrder } from "~/types/serializedTypes";
import { formatNumberAsCurrencyInTable, formatDateInTable } from "~/utils/formatters";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface WorkOrdersTableProps {
    workOrders: SerializedWorkOrder[];
}

const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({ workOrders }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<SerializedWorkOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    const actionsCellRenderer = (props: { data: SerializedWorkOrder }) => (
        <div className="flex gap-2">
            <Link className="btn btn-xs btn-primary" href={`/workOrders/${props.data.id}`}>
                View
            </Link>
            {props.data.Order && (
                <Link className="btn btn-xs btn-secondary" href={`/orders/${props.data.Order.id}`}>
                    Order
                </Link>
            )}
        </div>
    );

    const getRowStyle = (params: RowClassParams<SerializedWorkOrder>): { backgroundColor: string } | undefined => {
        if (!params.data) return undefined;

        switch (params.data.status) {
            case "Draft": return { backgroundColor: "#FFF3E0" };
            case "Pending": return { backgroundColor: "#E3F2FD" };
            case "Approved": return { backgroundColor: "#E8F5E9" };
            case "Cancelled": return { backgroundColor: "#FFEBEE" };
            default: return undefined;
        }
    };

    const columnDefs: ColDef[] = [
        { headerName: "Status", field: "status", filter: true, width: 120 },
        { headerName: "Date In", field: "dateIn", filter: true, valueFormatter: formatDateInTable, width: 120 },
        { headerName: "Work Order #", field: "workOrderNumber", filter: true, width: 150 },
        { headerName: "PO Number", field: "purchaseOrderNumber", filter: true, width: 150 },
        { headerName: "Total Cost", field: "totalCost", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 120 },
        { headerName: "Total Amount", field: "totalAmount", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 120 },
        { headerName: "Actions", cellRenderer: actionsCellRenderer, width: 150, sortable: false, filter: false },
    ];

    useEffect(() => {
        setRowData(workOrders);
        setLoading(false);
    }, [workOrders]);

    const onGridReady = (params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    };

    const onFilterChanged = (event: FilterChangedEvent) => {
        const filteredRowCount = event.api.getDisplayedRowCount();
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>;
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

export default WorkOrdersTable;
