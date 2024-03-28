"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AgGridReact, CustomCellRendererProps } from "@ag-grid-community/react"; // React Grid Logic
import "@ag-grid-community/styles/ag-grid.css"; // Core CSS
import "@ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    ColDef,
    ModuleRegistry,
    ValueFormatterParams,
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { WorkOrder } from "@prisma/client";
import Link from "next/link";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const WorkOrdersTable: React.FC<WorkOrder[]> = (workOrders) => {
    const gridRef = useRef();
    const defaultColDef = {
        resizable: true,
        sortable: true,
    };
    const [rowData, setRowData] = useState([]);

    // Define cell renderers here
    const actionsCellRenderer = (props: CustomCellRendererProps) => {
        return (
            <div>
                <Link className="btn" href={`/workOrders/${props.data.id}`}>
                    View Work Order
                </Link>
            </div>
        );
    };

    // Define column definitions and row data here
    const columnDefs = [
        { headerName: "id", field: "id" },
        { headerName: "Status", field: "status", filter: true },
        { headerName: "Date In", field: "dateIn", filter: true },
        { headerName: "Work Order Number", field: "workOrderNumber", filter: true },
        { headerName: "PO Number", field: "purchaseOrderNumber", filter: true },
        { headerName: "Total Cost", field: "totalCost", filter: true },
        {
            headerName: "Actions",
            field: "workOrderId",
            cellRenderer: actionsCellRenderer,
        },
    ];

    useEffect(() => {
        console.log("workOrders", workOrders);
        setRowData(
            workOrders["workOrders"].map((workOrder) => {
                return {
                    id: workOrder.id,
                    status: workOrder.status,
                    dateIn: workOrder.dateIn,
                    workOrderNumber: workOrder.workOrderNumber,
                    purchaseOrderNumber: workOrder.purchaseOrderNumber,
                    totalCost: workOrder.totalCost,
                };
            }),
        );
    }, []);

    return (
        <div className="ag-theme-quartz" style={{ height: "600px", width: "100%" }}>
            <h1>Users Table</h1>
            <AgGridReact
                id="users_grid"
                ref={gridRef}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowData={rowData}
                rowSelection={"single"}
                style={{ height: "100%", width: "100%" }}
            />
        </div>
    );
};

export default WorkOrdersTable;
