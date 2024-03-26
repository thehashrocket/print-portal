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
import { Order } from "@prisma/client";
import Link from "next/link";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const OrdersTable: React.FC<Order[]> = (orders) => {
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
        <Link className="btn" href={`/workOrders/${props.data.workOrderId}`}>
          View Work Order
        </Link>
        <Link className="btn" href={`/orders/${props.data.id}`}>
          View Order
        </Link>
      </div>
    );
  };

  // Define column definitions and row data here
  const columnDefs = [
    { headerName: "id", field: "id" },
    { headerName: "Status", field: "status", filter: true },
    { headerName: "Work Order", field: "workOrderId", filter: true },
    { headerName: "Order Number", field: "orderNumber", filter: true },
    { headerName: "Deposit", field: "deposit", filter: true },
    { headerName: "Total Cost", field: "totalCost", filter: true },
    {
      headerName: "Actions",
      field: "workOrderId",
      cellRenderer: actionsCellRenderer,
    },
  ];

  useEffect(() => {
    console.log("orders", orders["orders"]);
    setRowData(
      orders["orders"].map((order) => {
        return {
          id: order.id,
          status: order.status,
          workOrderId: order.workOrderId,
          orderNumber: order.orderNumber,
          deposit: order.deposit,
          totalCost: order.totalCost,
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

export default OrdersTable;
