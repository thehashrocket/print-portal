// ~/src/app/_components/orders/ordersTable.tsx
// This component is a table that displays all orders in the database. It uses the ag-grid-react library to display the data in a table format. The table has columns for the order's status, work order, order number, deposit, total cost, and actions. The actions column contains a button that links to the order's details page. The table is populated with data from the orders prop, which is an array of Order objects. The table is wrapped in a div with a class of ag-theme
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
  RowClassParams
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";
import { SerializedOrder } from "~/types/serializedTypes";
import { formatDateInTable, formatNumberAsCurrencyInTable } from "~/utils/formatters";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface OrdersTableProps {
  orders: SerializedOrder[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<SerializedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  const actionsCellRenderer = (props: { data: SerializedOrder }) => (
    <div className="flex gap-2">
      <Link className="btn btn-xs btn-primary" href={`/orders/${props.data.id}`}>
        View Order
      </Link>
      {props.data.workOrderId && (
        <Link className="btn btn-xs btn-secondary" href={`/workOrders/${props.data.workOrderId}`}>
          View Work Order
        </Link>
      )}
    </div>
  );

  const getRowStyle = (params: RowClassParams<SerializedOrder>): { backgroundColor: string } | undefined => {
    if (!params.data) return undefined;

    switch (params.data.status) {
      case "Pending": return { backgroundColor: "#E3F2FD" };
      case "Completed": return { backgroundColor: "#E8F5E9" };
      case "Cancelled": return { backgroundColor: "#FFEBEE" };
      default: return undefined;
    }
  };

  const columnDefs: ColDef[] = [
    { headerName: "Order #", field: "orderNumber", filter: true, width: 90 },
    { headerName: "Status", field: "status", filter: true, width: 120 },
    { headerName: "In Hands Date", field: "inHandsDate", filter: true, valueFormatter: formatDateInTable, width: 150, sort: "asc" },
    { headerName: "Deposit", field: "deposit", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 120 },
    { headerName: "Total Amount", field: "totalAmount", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 120 },
    { headerName: "Total Cost", field: "totalCost", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 120 },
    { headerName: "Created At", field: "createdAt", filter: true, valueFormatter: formatDateInTable, width: 120 },
    { headerName: "Actions", cellRenderer: actionsCellRenderer, width: 200, sortable: false, filter: false },
  ];

  useEffect(() => {
    setRowData(orders);
    setLoading(false);
  }, [orders]);

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

export default OrdersTable;