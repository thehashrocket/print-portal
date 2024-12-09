// ~/src/app/_components/orders/ordersTable.tsx
// This component is a table that displays all orders in the database. It uses the ag-grid-react library to display the data in a table format. The table has columns for the order's status, work order, order number, deposit, total cost, and actions. The actions column contains a button that links to the order's details page. The table is populated with data from the orders prop, which is an array of Order objects. The table is wrapped in a div with a class of ag-theme
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
  ColDef,
  FilterChangedEvent,
  GridReadyEvent,
  ModuleRegistry,
  RowClassParams
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";
import { type SerializedOrder } from "~/types/serializedTypes";
import { formatDateInTable, formatNumberAsCurrencyInTable } from "~/utils/formatters";
import { useQuickbooksStore } from "~/store/useQuickbooksStore";
import QuickbooksInvoiceButton from "./QuickbooksInvoiceButton";
ModuleRegistry.registerModules([ClientSideRowModelModule]);
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";


const OrdersTable: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<SerializedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<SerializedOrder[]>([]);
  const isAuthenticated = useQuickbooksStore((state) => state.isAuthenticated);
  const utils = api.useUtils();
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  const { data: ordersData, isLoading, error } = api.orders.getAll.useQuery();

  const handleSyncSuccess = () => {
    // Refresh the grid data
    // You can use the gridRef to refresh the data
    utils.orders.getAll.invalidate();

    if (gridRef.current) {
      gridRef.current.api.sizeColumnsToFit();
    }
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
            W/O
          </Button>
        </Link>
      )}
      <QuickbooksInvoiceButton order={props.data} onSyncSuccess={handleSyncSuccess} />
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
    { headerName: "In Hands Date", field: "inHandsDate", filter: true, valueFormatter: formatDateInTable, width: 120, sort: "asc" },
    { headerName: "Total Amount", field: "totalAmount", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 90 },
    { headerName: "Total Cost", field: "totalCost", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 90 },
    { headerName: "Created At", field: "createdAt", filter: true, valueFormatter: formatDateInTable, width: 80 },
    {
      headerName: "QB Status",
      field: "quickbooksInvoiceId",
      cellRenderer: (params: { value: string | null }) => (
        <div className={`flex items-center ${params.value ? "text-green-600" : "text-red-600"}`}>
          {params.value ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Synced
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Not Synced
            </>
          )}
        </div>
      ),
      sortable: true,
      filter: true,
      width: 120
    },
    { headerName: "Actions", cellRenderer: actionsCellRenderer, width: 200, sortable: false, filter: false },
  ];

  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData || []);
      setLoading(false);
      if (gridRef.current) {
        gridRef.current.api.sizeColumnsToFit();
      }
    }
  }, [ordersData]);

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  const rowSelection = {
    mode: 'single',
    checkboxes: false,
    enableClickSelection: true,
  };

  const onFilterChanged = (event: FilterChangedEvent) => {
    const filteredRowCount = event.api.getDisplayedRowCount();
    // You can update a state here to show the filtered row count if desired
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    (orders && (
      <div className="ag-theme-alpine" style={{ height: "600px", width: "100%" }}>
        <AgGridReact
          animateRows={true}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowStyle={getRowStyle}
          onFilterChanged={onFilterChanged}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={20}
          ref={gridRef}
          rowData={orders}
          rowSelection="single"
        />
      </div>
    )) || (
      <div>No orders found</div>
    )
  );
};

export default OrdersTable;