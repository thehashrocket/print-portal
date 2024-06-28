// ~/src/app/_components/workOrders/workOrdersTable.tsx
// This component is a table that displays all work orders in the database. It uses the ag-grid-react library to display the data in a table format. The table has columns for the work order's status, date in, work order number, purchase order number, total cost, and actions. The actions column contains a button that links to the work order's details page. The table is populated with data from the workOrders prop, which is an array of SerializedWorkOrder objects. The table is wrapped in a div with a class of ag-theme-quartz to apply the ag-grid theme. The table has a height of 600px and a width of 100% to make it scrollable and responsive. The column definitions and default column definitions are defined in the component. The formatNumberAsCurrency function is used to format the total cost column as a currency value. The actionsCellRenderer function is used to render the actions column with a link to the work order's details page. The component uses the useState and useEffect hooks to manage the state of the row data and update it when the workOrders prop changes.

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
    RowStyle
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";
import { WorkOrderStatus } from "@prisma/client";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

type SerializedWorkOrder = {
    id: string;
    status: WorkOrderStatus;
    dateIn: string;
    workOrderNumber: string;
    purchaseOrderNumber: string;
    totalCost: string | null;
    createdAt: string;
    updatedAt: string;
    approved: boolean;
    artwork: string | null;
    Order: { id: string } | null;
};

const WorkOrdersTable = ({ workOrders }: { workOrders: SerializedWorkOrder[] }) => {
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

    const formatNumberAsCurrency = (params: ValueFormatterParams) => {
        if (params.value === null) return "$0.00";
        return `$${Number(params.value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    }

    const formatDate = (params: ValueFormatterParams) => {
        return new Date(params.value).toLocaleDateString();
    }

    const getRowStyle = (params: { data: SerializedWorkOrder }): RowStyle => {
        switch (params.data.status) {
            case "Draft": return { backgroundColor: "#FFF3E0" };
            case "Pending": return { backgroundColor: "#E3F2FD" };
            case "Approved": return { backgroundColor: "#E8F5E9" };
            case "Cancelled": return { backgroundColor: "#FFEBEE" };
            default: return {};
        }
    };

    const columnDefs: ColDef[] = [
        { headerName: "Status", field: "status", filter: true, width: 120 },
        { headerName: "Date In", field: "dateIn", filter: true, valueFormatter: formatDate, width: 120 },
        { headerName: "Work Order #", field: "workOrderNumber", filter: true, width: 150 },
        { headerName: "PO Number", field: "purchaseOrderNumber", filter: true, width: 150 },
        { headerName: "Total Cost", field: "totalCost", filter: true, valueFormatter: formatNumberAsCurrency, width: 120 },
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
        console.log(`Rows after filter: ${filteredRowCount}`);
        // You can update a state here to show the filtered row count if desired
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