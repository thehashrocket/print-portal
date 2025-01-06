// ~/app/_components/workOrders/workOrderItemsTable.tsx

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    type ColDef,
    ModuleRegistry,
    type ValueFormatterParams,
    type GridReadyEvent,
    type FilterChangedEvent,
    type RowClassParams,
    type GridApi
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";
import { type SerializedWorkOrderItem } from "~/types/serializedTypes";
import { Button } from "../../ui/button";
import { Eye } from "lucide-react";

// Register modules outside of component to prevent multiple registrations
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface WorkOrderItemsTableProps {
    workOrderItems: SerializedWorkOrderItem[];
}

const WorkOrderItemsTable: React.FC<WorkOrderItemsTableProps> = ({ workOrderItems }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<SerializedWorkOrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const mounted = useRef(true);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    const actionsRenderer = (props: { data: SerializedWorkOrderItem }) => (
        <Link href={`/workOrders/${props.data.workOrderId}/workOrderItem/${props.data.id}`}>
            <Button
                variant="default"
                size="sm"
            >
                <Eye className="w-4 h-4 mr-2" />
                View
            </Button>
        </Link>
    );

    const formatNumberAsCurrency = (params: ValueFormatterParams) => {
        if (params.value === null) return "$0.00";
        return `$${Number(params.value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    };

    const getRowStyle = (params: RowClassParams<SerializedWorkOrderItem>): { backgroundColor: string } | undefined => {
        if (!params.data) return undefined;

        switch (params.data.status) {
            case "Pending": return { backgroundColor: "#E3F2FD" };
            case "Approved": return { backgroundColor: "#E8F5E9" };
            case "Cancelled": return { backgroundColor: "#FFEBEE" };
            default: return undefined;
        }
    };

    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Item #", field: "workOrderItemNumber", width: 120 },
        { headerName: "Quantity", field: "quantity", width: 120 },
        { headerName: "Description", field: "description", filter: true },
        { headerName: "Status", field: "status", filter: true, width: 150 },
        { headerName: "Cost", field: "cost", filter: true, valueFormatter: formatNumberAsCurrency, width: 120 },
        { headerName: "Amount", field: "amount", filter: true, valueFormatter: formatNumberAsCurrency, width: 120 },
        { headerName: "Actions", cellRenderer: actionsRenderer, width: 100, sortable: false, filter: false },
    ], []);

    const mobileColumnDefs = useMemo<ColDef[]>(() => [
        { headerName: "Item #", field: "workOrderItemNumber", width: 120 },
        { headerName: "Desc", field: "description", filter: true },
        { headerName: "Status", field: "status", filter: true, width: 120 },
        { headerName: "Amount", field: "amount", filter: true, valueFormatter: formatNumberAsCurrency, width: 120 },
        { headerName: "Actions", cellRenderer: actionsRenderer, width: 100, sortable: false, filter: false },
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
        if (!mounted.current) return;
        
        setRowData(workOrderItems);
        setLoading(false);
        
        if (gridApi) {
            const timeoutId = setTimeout(() => {
                if (mounted.current && gridApi) {
                    try {
                        gridApi.sizeColumnsToFit();
                    } catch (error) {
                        console.warn('Failed to size columns:', error);
                    }
                }
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [workOrderItems, gridApi]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (mounted.current && gridApi) {
                try {
                    gridApi.sizeColumnsToFit();
                } catch (error) {
                    console.warn('Failed to size columns on resize:', error);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [gridApi]);

    const isMobile = windowWidth <= 768;

    const containerStyle = useMemo(() => ({
        height: isMobile ? 'calc(100vh - 200px)' : '600px',
        width: '100%',
    }), [isMobile]);

    const onGridReady = (params: GridReadyEvent) => {
        if (!mounted.current) return;
        
        setGridApi(params.api);
        try {
            params.api.sizeColumnsToFit();
        } catch (error) {
            console.warn('Failed to size columns on grid ready:', error);
        }
    };

    const onFilterChanged = (event: FilterChangedEvent) => {
        if (!mounted.current || !gridApi) return;
        
        try {
            const filteredRowCount = gridApi.getDisplayedRowCount();
            console.log(`Filtered row count: ${filteredRowCount}`);
        } catch (error) {
            console.warn('Failed to get filtered row count:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
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
                onFilterChanged={onFilterChanged}
                getRowStyle={getRowStyle}
                animateRows={true}
                pagination={true}
                paginationPageSize={isMobile ? 10 : 20}
                domLayout={isMobile ? 'autoHeight' : undefined}
                className={isMobile ? 'ag-grid-mobile' : ''}
            />
        </div>
    );
};

export default WorkOrderItemsTable;