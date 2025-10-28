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
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";
import { type SerializedOrder } from "~/types/serializedTypes";
import { formatDateInTable, formatNumberAsCurrencyInTable } from "~/utils/formatters";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";
import { api } from "~/trpc/react";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const OrdersTable: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);
  const [loading, setLoading] = useState(true);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const mounted = useRef(true);
  
  const { data: orders, isLoading } = api.orders.getAll.useQuery();
  
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

  const getPurchaseOrderNumber = (params: { data: SerializedOrder }) => {
    return params.data.purchaseOrderNumber ? params.data.purchaseOrderNumber : "";
  };

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
      minWidth: 120,
      flex: 1
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

    // Add resize listener
    window.addEventListener('resize', updateGridSize);

    // Return cleanup function
    return () => {
      window.removeEventListener('resize', updateGridSize);
    };
  };

  const onFilterChanged = (_event: FilterChangedEvent) => {
    if (!mounted.current || !gridApi) return;
    try {
      const filteredRowCount = gridApi.getDisplayedRowCount();
      console.log(`Filtered row count: ${filteredRowCount}`);
    } catch (error) {
      console.warn('Failed to get filtered row count:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return <div>No orders found</div>;
  }

  return (
    <div className="ag-theme-alpine" style={{ height: "600px", width: "100%" }}>
      <AgGridReact
        ref={gridRef}
        rowData={orders}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        animateRows={true}
        getRowStyle={getRowStyle}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        pagination={true}
        paginationPageSize={20}
        rowSelection="single"
      />
    </div>
  );
};

export default OrdersTable;
