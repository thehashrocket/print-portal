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
    const [loading, setLoading] = useState(true);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const mounted = useRef(true);

    const { data: workOrders, isLoading } = api.workOrders.getAll.useQuery();

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
            mounted.current = false;
            if (gridApi) {
                gridApi.destroy();
            }
        };
    }, [gridApi]);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    const actionsCellRenderer = (props: { data: SerializedWorkOrder }) => (
        <div className="flex gap-2">
            <Link href={`/workOrders/${props.data.id}`}>
                <Button
                    variant="default"
                    size="sm"
                    className="h-8"
                >
                    <Eye className="w-4 h-4 mr-1" />
                    Estimate
                </Button>
            </Link>
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

    const getCompanyName = (params: ValueGetterParams) => {
        return params.data?.Office?.Company?.name;
    };

    const columnDefs = useMemo<ColDef[]>(() => [
        { 
            headerName: "Company", 
            valueGetter: getCompanyName,
            minWidth: 200,
            flex: 2
        },
        { 
            headerName: "Estimate #", 
            field: "workOrderNumber", 
            minWidth: 150,
            flex: 1
        },
        { 
            headerName: "Date In", 
            field: "dateIn", 
            valueFormatter: formatDateInTable, 
            minWidth: 120,
            flex: 1
        },
        { 
            headerName: "Status", 
            field: "status", 
            minWidth: 120,
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
            minWidth: 200,
            flex: 1,
            sortable: false, 
            filter: false 
        },
    ], []);

    const mobileColumnDefs = useMemo<ColDef[]>(() => [
        { 
            headerName: "Company", 
            valueGetter: getCompanyName,
            flex: 2,
            minWidth: 160
        },
        { 
            headerName: "Est #", 
            field: "workOrderNumber", 
            minWidth: 100,
            flex: 1
        },
        { 
            headerName: "Status", 
            field: "status", 
            minWidth: 100,
            flex: 1
        },
        { 
            headerName: "Total", 
            field: "totalAmount", 
            valueFormatter: formatNumberAsCurrencyInTable, 
            minWidth: 100,
            flex: 1
        },
        { 
            headerName: "Actions", 
            cellRenderer: actionsCellRenderer, 
            minWidth: 160,
            flex: 1,
            sortable: false, 
            filter: false 
        },
    ], []);

    useEffect(() => {
        if (workOrders) {
            setLoading(false);
        }
    }, [workOrders]);

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

    if (!workOrders || workOrders.length === 0) {
        return <div>No work orders found</div>;
    }

    return (
        <div 
            className="ag-theme-alpine w-full" 
            style={{ 
                height: isMobile ? "calc(100vh - 200px)" : "600px",
                width: "100%",
                fontSize: isMobile ? "14px" : "inherit"
            }}
        >
            <AgGridReact
                ref={gridRef}
                columnDefs={isMobile ? mobileColumnDefs : columnDefs}
                defaultColDef={defaultColDef}
                rowData={workOrders}
                rowSelection="single"
                onGridReady={onGridReady}
                onFilterChanged={onFilterChanged}
                getRowStyle={getRowStyle}
                animateRows={true}
                pagination={true}
                paginationPageSize={isMobile ? 10 : 20}
                domLayout="normal"
                suppressMovableColumns={isMobile}
                headerHeight={isMobile ? 40 : 48}
                rowHeight={isMobile ? 40 : 48}
            />
        </div>
    );
};

export default WorkOrdersTable;
