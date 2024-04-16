"use client";

import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react"; // React Grid Logic
import "@ag-grid-community/styles/ag-grid.css"; // Core CSS
import "@ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    ModuleRegistry,
    ColDef
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { WorkOrder } from "@prisma/client";
import Link from "next/link";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

type SerializedWorkOrder = {
    id: string;
    status: string;
    dateIn: string;
    workOrderNumber: string;
    purchaseOrderNumber: string;
    totalCost: string | null;
    createdAt: string;
    updatedAt: string;
    costPerM: string | null;
    approved: boolean;
    artwork: string | null;
    // Add other properties as needed
};

const WorkOrdersTable = ({ workOrders }: { workOrders: SerializedWorkOrder[] }) => {
    const gridRef = useRef(null);
    const defaultColDef = {
        resizable: true,
        sortable: true,
    };
    const [rowData, setRowData] = useState<SerializedWorkOrder[]>([]);

    const actionsCellRenderer = (props: { data: { id: any; }; }) => (
        <div>
            <Link className="btn btn-sm btn-primary" href={`/workOrders/${props.data.id}`}>
                View Work Order
            </Link>
        </div>
    );

    const columnDefs: ColDef[] = [
        { headerName: "id", field: "id" },
        { headerName: "Status", field: "status", filter: true },
        { headerName: "Date In", field: "dateIn", filter: true },
        { headerName: "Work Order Number", field: "workOrderNumber", filter: true },
        { headerName: "PO Number", field: "purchaseOrderNumber", filter: true },
        { headerName: "Total Cost", field: "totalCost", filter: true },
        {
            headerName: "Actions",
            cellRenderer: actionsCellRenderer,
        },
    ];


    useEffect(() => {
        setRowData(workOrders);
    }, [workOrders]);


    return (
        <div className="ag-theme-quartz" style={{ height: "600px", width: "100%" }}>
            <AgGridReact
                ref={gridRef}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowData={rowData}
                rowSelection="single"
            />
        </div>
    );
};

export default WorkOrdersTable;
