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
import { Button } from "../ui/button";
import { Eye } from "lucide-react";

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
            <Link href={`/workOrders/${props.data.id}`}>
                <Button
                    variant="default"
                    size="sm"
                >
                    <Eye className="w-4 h-4 mr-2" />
                    W/O
                </Button>
            </Link>
            {props.data.Order && (
                <Link href={`/orders/${props.data.Order.id}`}>
                    <Button
                        variant="default"
                        size="sm"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Order
                    </Button>
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
        { headerName: "Estimate #", field: "workOrderNumber", filter: true, width: 150 },
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
        (rowData && (
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
        )) || <div>No work orders found</div>
    );
};

export default WorkOrdersTable;