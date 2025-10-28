// ~/src/app/_components/invoices/invoicesTable.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    type ColDef,
    type GridReadyEvent,
    type ICellRendererParams,
    ModuleRegistry,
    type GridApi,
    type FilterChangedEvent,
    type ValueGetterParams,
} from "@ag-grid-community/core";
import Link from "next/link";
import { type InvoiceStatus } from "@prisma/client";
import { type SerializedInvoice } from "~/types/serializedTypes";
import QuickbooksInvoiceButton from "./QuickbooksInvoiceButton";
import { api } from "~/trpc/react";
import { Eye, RefreshCcw, RefreshCwOff } from "lucide-react";
import { formatNumberAsCurrencyInTable, formatDateInTable } from "~/utils/formatters";
import { Button } from "../ui/button";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const InvoicesTable: React.FC = () => {
    const gridRef = useRef<AgGridReact>(null);
    const [loading, setLoading] = useState(true);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const mounted = useRef(true);

    const { data: invoices, isLoading } = api.invoices.getAll.useQuery();
    const utils = api.useUtils();

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

    const statusCellRenderer = useCallback((params: ICellRendererParams) => {
        const status = params.value as InvoiceStatus;
        let colorClass = '';
        switch (status) {
            case 'Paid': colorClass = 'text-green-600'; break;
            case 'Overdue': colorClass = 'text-red-600'; break;
            case 'Sent': colorClass = 'text-blue-600'; break;
            case 'Draft': colorClass = 'text-gray-600'; break;
            default: colorClass = 'text-black';
        }
        return <span className={`font-semibold ${colorClass}`}>{status}</span>;
    }, []);

    const handleSyncSuccess = useCallback(() => {
        void utils.invoices.getAll.invalidate();
    }, [utils.invoices.getAll]);

    const actionCellRenderer = useCallback((props: { data: SerializedInvoice }) => (
        <div className="flex gap-2">
            <Link href={`/invoices/${props.data.id}`}>
                <Button
                    variant="default"
                    size="sm"
                    className="h-8"
                >
                    <Eye className="w-4 h-4 mr-1" />
                    Invoice
                </Button>
            </Link>
            <QuickbooksInvoiceButton invoice={props.data} onSyncSuccess={handleSyncSuccess} />
        </div>
    ), [handleSyncSuccess]);

    const quickbooksStatusRenderer = useCallback((params: { value: string | null }) => (
        <div className={`flex items-center ${params.value ? "text-green-600" : "text-red-600"}`}>
            {params.value ? (
                <>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Synced
                </>
            ) : (
                <>
                    <RefreshCwOff className="w-4 h-4 mr-2" />
                    Not Synced
                </>
            )}
        </div>
    ), []);

    const columnDefs = useMemo<ColDef[]>(() => [
        { 
            headerName: "Invoice #", 
            field: "invoiceNumber", 
            minWidth: 120,
            flex: 1
        },
        { 
            headerName: "Company", 
            valueGetter: (params: ValueGetterParams) => params.data?.Office?.Company?.name, 
            minWidth: 200,
            flex: 2
        },
        { 
            headerName: "Status", 
            field: "status", 
            cellRenderer: statusCellRenderer, 
            minWidth: 120,
            flex: 1
        },
        { 
            headerName: "Due Date", 
            field: "dueDate", 
            valueFormatter: formatDateInTable, 
            minWidth: 150,
            flex: 1
        },
        { 
            headerName: "Total", 
            field: "total", 
            valueFormatter: formatNumberAsCurrencyInTable, 
            minWidth: 120,
            flex: 1
        },
        { 
            headerName: "QB", 
            field: "quickbooksId", 
            minWidth: 90,
            flex: 1,
            cellRenderer: quickbooksStatusRenderer
        },
        { 
            headerName: "Actions", 
            cellRenderer: actionCellRenderer, 
            minWidth: 200,
            flex: 1,
            sortable: false, 
            filter: false 
        }
    ], [actionCellRenderer, quickbooksStatusRenderer, statusCellRenderer]);

    const mobileColumnDefs = useMemo<ColDef[]>(() => [
        { 
            headerName: "Invoice #", 
            field: "invoiceNumber", 
            minWidth: 100,
            flex: 1
        },
        { 
            headerName: "Status", 
            field: "status", 
            cellRenderer: statusCellRenderer, 
            minWidth: 100,
            flex: 1
        },
        { 
            headerName: "Total", 
            field: "total", 
            valueFormatter: formatNumberAsCurrencyInTable, 
            minWidth: 100,
            flex: 1
        },
        { 
            headerName: "Actions", 
            cellRenderer: actionCellRenderer, 
            minWidth: 160,
            flex: 1,
            sortable: false, 
            filter: false 
        }
    ], [actionCellRenderer, statusCellRenderer]);

    useEffect(() => {
        if (invoices) {
            setLoading(false);
        }
    }, [invoices]);

    const onGridReady = (params: GridReadyEvent) => {
        if (!mounted.current) return;
        setGridApi(params.api);
        try {
            params.api.sizeColumnsToFit();
        } catch (error) {
            console.warn('Failed to size columns on grid ready:', error);
        }
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

    if (!invoices || invoices.length === 0) {
        return <div>No invoices found</div>;
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
                rowData={invoices}
                rowSelection="single"
                onGridReady={onGridReady}
                onFilterChanged={onFilterChanged}
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

export default InvoicesTable;
