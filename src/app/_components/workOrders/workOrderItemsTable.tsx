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
import { WorkOrderItem } from "@prisma/client";
import Link from "next/link";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const WorkOrderItemsTable: React.FC<WorkOrderItem[]> = (workOrderItems) => {
    const gridRef = useRef();
    const defaultColDef = {
        resizable: true,
        sortable: true,
    };
    const [rowData, setRowData] = useState<{
        id: string;
        quantity: number;
        description: string;
        finishedQty: string;
        orderId: string;
        status: string;
    }[]>([]);

    const actionsRenderer = ((props: CustomCellRendererProps) => {
        console.log('props', props)
        return (
            <div>
                <Link className="btn btn-sm btn-primary" href={`/workOrders/${props.data.workOrderId}/workOrderItem/${props.data.id}`}>
                    View
                </Link>
            </div>
        );
    });

    // Define column definitions and row data here
    const columnDefs = [
        { headerName: "ID", field: "id", hide: true },
        { headerName: "Quantity", field: "quantity", width: 100 },
        { headerName: "Description", field: "description", filter: true },
        { headerName: "Finished Qty", field: "finishedQty", filter: true, width: 150 },
        { headerName: "Status", field: "status", filter: true, width: 150 },
        {
            headerName: "Actions",
            field: "actions",
            cellRenderer: actionsRenderer,
            width: 150
        },
    ];

    useEffect(() => {
        setRowData(
            workOrderItems["workOrderItems"].map((workOrderItem) => {
                return {
                    id: workOrderItem.id,
                    quantity: workOrderItem.quantity,
                    description: workOrderItem.description,
                    finishedQty: workOrderItem.finishedQty,
                    workOrderId: workOrderItem.workOrderId,
                    status: workOrderItem.status,
                };
            }),
        );
    }, []);

    return (
        <div className="ag-theme-quartz" style={{ height: "600px", width: "100%" }}>
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

export default WorkOrderItemsTable;
