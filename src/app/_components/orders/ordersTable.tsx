// ~/src/app/_components/orders/ordersTable.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
  type ColDef,
  type GridReadyEvent,
  type GridApi,
  ModuleRegistry,
  type RowClassParams,
  type ICellRendererParams,
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";
import { type SerializedOrder } from "~/types/serializedTypes";
import { formatDateInTable, formatNumberAsCurrencyInTable } from "~/utils/formatters";
import { Button } from "../ui/button";
import { Eye, PackageSearch } from "lucide-react";
import { api } from "~/trpc/react";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Completed": return "bg-green-100 text-green-800";
    case "Cancelled": return "bg-red-100 text-red-800";
    case "Pending": return "bg-yellow-100 text-yellow-800";
    case "Shipping": return "bg-blue-100 text-blue-800";
    case "Invoiced": return "bg-indigo-100 text-indigo-800";
    case "PaymentReceived": return "bg-emerald-100 text-emerald-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getRowBackgroundColor = (status: string): string | undefined => {
  switch (status) {
    case "Pending": return "hsl(210 100% 95%)";
    case "Completed": return "hsl(120 60% 95%)";
    case "Cancelled": return "hsl(0 100% 95%)";
    default: return undefined;
  }
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const label = status === "PaymentReceived" ? "Payment Received" : status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
      {label}
    </span>
  );
};

const OrdersTable: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);
  const [loading, setLoading] = useState(true);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const mounted = useRef(true);
  const resizeHandlerRef = useRef<(() => void) | null>(null);

  const { data: orders, isLoading, isError } = api.orders.getAll.useQuery();

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  const getCompanyName = (params: { data: SerializedOrder }) => {
    return params.data.Office.Company.name;
  };

  const statusCellRenderer = (params: ICellRendererParams<SerializedOrder>) => {
    if (!params.data) return null;
    return <StatusPill status={params.data.status} />;
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
            variant="outline"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Estimate
          </Button>
        </Link>
      )}
    </div>
  );

  const getPurchaseOrderNumber = (params: { data: SerializedOrder }) => {
    return params.data.purchaseOrderNumber ? params.data.purchaseOrderNumber : "";
  };

  const getRowStyle = (params: RowClassParams<SerializedOrder>): { backgroundColor: string } | undefined => {
    if (!params.data) return undefined;
    const bg = getRowBackgroundColor(params.data.status);
    return bg ? { backgroundColor: bg } : undefined;
  };

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      headerName: "Order #",
      field: "orderNumber",
      minWidth: 120,
      flex: 1
    },
    {
      headerName: "Company",
      valueGetter: getCompanyName,
      minWidth: 200,
      flex: 2
    },
    {
      headerName: "PO #",
      field: "purchaseOrderNumber",
      minWidth: 120,
      flex: 1,
      valueGetter: getPurchaseOrderNumber,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Status",
      field: "status",
      minWidth: 150,
      flex: 1,
      cellRenderer: statusCellRenderer,
      valueFormatter: (params: { value: string }) =>
        params.value === "PaymentReceived" ? "Payment Received" : params.value,
      filter: "agTextColumnFilter",
      filterValueGetter: (params: { data: SerializedOrder }) =>
        params.data.status === "PaymentReceived" ? "Payment Received" : params.data.status,
    },
    {
      headerName: "In Hands Date",
      field: "inHandsDate",
      valueFormatter: formatDateInTable,
      minWidth: 150,
      flex: 1
    },
    {
      headerName: "Total",
      field: "totalAmount",
      valueFormatter: formatNumberAsCurrencyInTable,
      minWidth: 120,
      flex: 1
    },
    {
      headerName: "Actions",
      cellRenderer: actionsCellRenderer,
      sortable: false,
      filter: false,
      minWidth: 200,
      flex: 1
    },
  ], []);

  // Cleanup function
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
      if (gridApi) {
        gridApi.destroy();
      }
    };
  }, [gridApi]);

  useEffect(() => {
    if (orders) {
      setLoading(false);
    }
  }, [orders]);

  const onGridReady = (params: GridReadyEvent) => {
    if (!mounted.current) return;
    const gridApi = params.api;
    setGridApi(gridApi);

    const updateGridSize = () => {
      if (gridApi && !gridApi.isDestroyed()) {
        setTimeout(() => {
          gridApi.sizeColumnsToFit();
        }, 100);
      }
    };

    // Initial sizing
    updateGridSize();

    // Store and add resize listener (cleaned up in useEffect)
    resizeHandlerRef.current = updateGridSize;
    window.addEventListener('resize', updateGridSize);
  };

  // Summary stats computed from loaded data
  const stats = useMemo(() => {
    if (!orders) return null;
    const pending = orders.filter((o: SerializedOrder) => o.status === "Pending").length;
    const shipping = orders.filter((o: SerializedOrder) => o.status === "Shipping").length;
    const completed = orders.filter((o: SerializedOrder) => o.status === "Completed").length;
    return { total: orders.length, pending, shipping, completed };
  }, [orders]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Failed to load orders</h2>
        <p className="text-gray-400">Please try refreshing the page.</p>
      </div>
    );
  }

  if (loading || isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-20 animate-pulse" />
          ))}
        </div>
        <div className="bg-gray-100 rounded-lg h-[600px] animate-pulse" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <PackageSearch className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">No orders found</h2>
        <p className="text-gray-400 mb-6">Orders will appear here once they are created from estimates.</p>
        <Link href="/workOrders/create">
          <Button variant="default">Create New Estimate</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-700">Pending</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">Shipping</p>
            <p className="text-2xl font-bold text-blue-800">{stats.shipping}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-700">Completed</p>
            <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
          </div>
        </div>
      )}
      <div className="ag-theme-alpine" style={{ height: "calc(100vh - 320px)", minHeight: "400px", width: "100%" }}>
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
    </div>
  );
};

export default OrdersTable;
