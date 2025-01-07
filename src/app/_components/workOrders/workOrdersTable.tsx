// ~/src/app/_components/workOrders/workOrdersTable.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    ModuleRegistry,
    type ColDef,
    type GridReadyEvent,
    type GridApi,
    type FilterChangedEvent,
    type RowClassParams,
    type ValueGetterParams
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";
import { type SerializedWorkOrder } from "~/types/serializedTypes";
import { api } from "~/trpc/react";
import { formatNumberAsCurrencyInTable, formatDateInTable } from "~/utils/formatters";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const WorkOrdersTable: React.FC = () => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<SerializedWorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    const { data: workOrders, isLoading } = api.workOrders.getAll.useQuery();

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    const actionsCellRenderer = (props: { data: SerializedWorkOrder }) => (
        <div className="flex gap-1">
            <Link href={`/workOrders/${props.data.id}`}>
                <Button
                    variant="default"
                    size="sm"
                    className="h-8 whitespace-nowrap"
                    title="View Estimate"
                >
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Estimate</span>
                    <span className="sm:hidden">Estimate</span>
                </Button>
            </Link>
            {props.data.Order && (
                <Link href={`/orders/${props.data.Order.id}`}>
                    <Button
                        variant="default"
                        size="sm"
                        className="h-8 whitespace-nowrap"
                        title="View Order"
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Order</span>
                        <span className="sm:hidden">Order</span>
                    </Button>
                </Link>
            )}
        </div>
    );

    const getRowStyle = (params: RowClassParams<SerializedWorkOrder>): { backgroundColor: string } | undefined => {
        if (!params.data) return undefined;

        switch (params.data.status) {
            case "Draft": return { backgroundColor: "#FFF3E0" };
            case "Pending": return { backgroundColor: "#E3F2FD" };
            case "Approved": return { backgroundColor: "#E8F5E9" };
            case "Cancelled": return { backgroundColor: "#FFEBEE" };
            default: return undefined;
        }
    };

    const columnDefs = useMemo<ColDef[]>(() => [
        { 
            headerName: "Company Name", 
            filter: true, 
            width: 150,
            valueGetter: (params: ValueGetterParams) => params.data?.Office?.Company?.name
        },
        { headerName: "Estimate #", field: "workOrderNumber", filter: true, width: 150 },
        { headerName: "Date In", field: "dateIn", filter: true, valueFormatter: formatDateInTable, width: 120, sortable: true },
        { headerName: "Status", field: "status", filter: true, width: 120 },
        { headerName: "Total Amount", field: "totalAmount", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 120 },
        { headerName: "Actions", cellRenderer: actionsCellRenderer, width: 250, sortable: false, filter: false, cellClass: 'action-cell' },
    ], []);

    const mobileColumnDefs = useMemo<ColDef[]>(() => [
        { 
            headerName: "Company Name", 
            filter: true, 
            width: 150,
            valueGetter: (params: ValueGetterParams) => params.data?.Office?.Company?.name
        },
        { headerName: "Estimate #", field: "workOrderNumber", filter: true, width: 150 },
        { headerName: "Date In", field: "dateIn", filter: true, valueFormatter: formatDateInTable, width: 120, sortable: true },
        { headerName: "Status", field: "status", filter: true, width: 120 },
        { headerName: "Total Amount", field: "totalAmount", filter: true, valueFormatter: formatNumberAsCurrencyInTable, width: 120 },
        { headerName: "Actions", cellRenderer: actionsCellRenderer, width: 250, sortable: false, filter: false, cellClass: 'action-cell' },
    ], []);

    useEffect(() => {
        if (workOrders) {
            setRowData(workOrders);
            setLoading(false);
            // Wrap in setTimeout to ensure the grid is mounted
            setTimeout(() => {
                if (gridRef.current?.api) {
                    gridRef.current.api.sizeColumnsToFit();
                }
            }, 100);
        }
    }, [workOrders]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (gridRef.current?.api) {
                gridRef.current.api.sizeColumnsToFit();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            // Cleanup grid
            if (gridRef.current?.api) {
                gridRef.current.api.destroy();
            }
        };
    }, []);

    const isMobile = windowWidth <= 768;

    const containerStyle = useMemo(() => ({
        height: isMobile ? 'calc(100vh - 200px)' : '600px',
        width: '100%',
    }), [isMobile]);

    const onGridReady = (params: GridReadyEvent) => {
        setGridApi(params.api);
        setTimeout(() => {
            if (params.api) {
                params.api.sizeColumnsToFit();
            }
        }, 100);
    };

    if (loading || isLoading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>;
    }

    return (
        (rowData && (
            <div 
                className="ag-theme-alpine w-full overflow-hidden"
                style={containerStyle}
            >
                <AgGridReact
                    ref={gridRef}
                    columnDefs={isMobile ? mobileColumnDefs : columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={rowData}
                    rowSelection="single"
                    onGridReady={onGridReady}
                    getRowStyle={getRowStyle}
                    animateRows={true}
                    pagination={true}
                    paginationPageSize={isMobile ? 10 : 20}
                    domLayout={isMobile ? 'autoHeight' : undefined}
                    className={isMobile ? 'ag-grid-mobile' : ''}
                />
            </div>
        )) || <div>No work orders found</div>
    );
};

export default WorkOrdersTable;