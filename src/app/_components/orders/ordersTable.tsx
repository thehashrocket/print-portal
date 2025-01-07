// ~/src/app/_components/orders/ordersTable.tsx
// This component is a table that displays all orders in the database. It uses the ag-grid-react library to display the data in a table format. The table has columns for the order's status, work order, order number, deposit, total cost, and actions. The actions column contains a button that links to the order's details page. The table is populated with data from the orders prop, which is an array of Order objects. The table is wrapped in a div with a class of ag-theme
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
  type ColDef,
  type FilterChangedEvent,
  type GridReadyEvent,
  type GridApi,
  ModuleRegistry,
  type RowClassParams,
  type ValueGetterParams
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";
import { type SerializedOrder } from "~/types/serializedTypes";
import { formatDateInTable, formatNumberAsCurrencyInTable } from "~/utils/formatters";
import { Button } from "../ui/button";
import { Eye, RefreshCcw, RefreshCwOff } from "lucide-react";
import { api } from "~/trpc/react";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const OrdersTable: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<SerializedOrder[]>([]);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const utils = api.useUtils();
  
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  const getCompanyName = (params: { data: SerializedOrder }) => {
    return params.data.Office.Company.name;
  };

  const actionsCellRenderer = (props: { data: SerializedOrder }) => (
    <div className="flex gap-2">
      <Link href={`/orders/${props.data.id}`}>
        <Button
          variant="default"
          size="sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          Order
        </Button>
      </Link>
      {props.data.workOrderId && (
        <Link href={`/workOrders/${props.data.workOrderId}`}>
          <Button
            variant="default"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Estimate
          </Button>
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

  const columnDefs = useMemo<ColDef[]>(() => [
    { 
      headerName: "Company Name", 
      filter: true, 
      width: 120, 
      cellRenderer: getCompanyName,
      valueGetter: (params: ValueGetterParams) => params.data?.Office?.Company?.name
    },
    { headerName: "Order #", field: "orderNumber", filter: true, width: 60 },
    { headerName: "Status", field: "status", filter: true, width: 80 },
    { headerName: "In Hands Date", field: "inHandsDate", filter: true, valueFormatter: formatDateInTable, width: 80, sortable: true },
    { headerName: "Total Amount", field: "totalAmount", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 80 },
    { headerName: "Actions", cellRenderer: actionsCellRenderer, width: 100, sortable: false, filter: false },
  ], []);

  const { data: ordersData, isLoading } = api.orders.getAll.useQuery();

  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData);
      setLoading(false);
    }
  }, [ordersData]);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    setTimeout(() => {
      if (params.api) {
        params.api.sizeColumnsToFit();
      }
    }, 100);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (gridRef.current?.api) {
        gridRef.current.api.destroy();
      }
    };
  }, []);

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    orders && (
      <div className="ag-theme-alpine" style={{ height: "600px", width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={orders}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          getRowStyle={getRowStyle}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={20}
          rowSelection="single"
        />
      </div>
    ) || (
      <div>No orders found</div>
    )
  );
};

export default OrdersTable;