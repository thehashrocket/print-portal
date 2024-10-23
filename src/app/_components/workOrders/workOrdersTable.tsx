// ~/src/app/_components/workOrders/workOrdersTable.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    ModuleRegistry,
    type ColDef,
    type GridReadyEvent,
    type FilterChangedEvent,
    type RowClassParams
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";
import { type SerializedWorkOrder } from "~/types/serializedTypes";
import { api } from "~/trpc/react";
import { formatNumberAsCurrencyInTable, formatDateInTable } from "~/utils/formatters";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const WorkOrdersTable: React.FC = () => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<SerializedWorkOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const { data: workOrders, isLoading } = api.workOrders.getAll.useQuery();

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    const actionsCellRenderer = (props: { data: SerializedWorkOrder }) => (
        <div className="flex gap-2">
            <Link className="btn btn-xs btn-primary" href={`/workOrders/${props.data.id}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
                </svg>
                W/O
            </Link>
            {props.data.Order && (
                <Link className="btn btn-xs btn-secondary" href={`/orders/${props.data.Order.id}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
                    </svg>
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
        { headerName: "Work Order #", field: "workOrderNumber", filter: true, width: 150 },
        { headerName: "Date In", field: "dateIn", filter: true, valueFormatter: formatDateInTable, width: 120, sort: "asc" },
        { headerName: "Status", field: "status", filter: true, width: 120 },
        { headerName: "PO Number", field: "purchaseOrderNumber", filter: true, width: 150 },
        { headerName: "Total Cost", field: "totalCost", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 120 },
        { headerName: "Total Amount", field: "totalAmount", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 120 },
        { headerName: "Actions", cellRenderer: actionsCellRenderer, width: 150, sortable: false, filter: false },
    ];

    useEffect(() => {
        if (workOrders) {
            setRowData(workOrders);
            setLoading(false);
            if (gridRef.current) {
                gridRef.current.api.sizeColumnsToFit();
            }
        }
        if (gridRef.current) {
            gridRef.current.api.sizeColumnsToFit();
        }
    }, [workOrders]);

    const onGridReady = (params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    };

    const onFilterChanged = (event: FilterChangedEvent) => {
        const filteredRowCount = event.api.getDisplayedRowCount();
        console.log(`Filtered row count: ${filteredRowCount}`);
    };

    if (loading || isLoading) {
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