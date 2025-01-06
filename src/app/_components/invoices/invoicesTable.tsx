// ~/src/app/_components/invoices/invoicesTable.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    type ColDef,
    type GridReadyEvent,
    type ICellRendererParams,
    ModuleRegistry,
    type ValueFormatterParams,
} from "@ag-grid-community/core";
import Link from "next/link";
import { type InvoiceStatus } from "@prisma/client";
import { type SerializedInvoice } from "~/types/serializedTypes";
import QuickbooksInvoiceButton from "./QuickbooksInvoiceButton";
import { api } from "~/trpc/react";
import { Eye, RefreshCcw, RefreshCwOff } from "lucide-react";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const InvoicesTable: React.FC= () => {
    const [rowData, setRowData] = useState<SerializedInvoice[]>([]);
    const [invoices, setInvoices] = useState<SerializedInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const { data: invoicesData } = api.invoices.getAll.useQuery();
    const gridRef = useRef<AgGridReact>(null);
    const utils = api.useUtils();

    useEffect(() => {
        if (invoicesData) {
            setRowData(invoicesData || []);
            setLoading(false);
        if (gridRef.current) {
                gridRef.current.api.sizeColumnsToFit();
            }
        }
    }, [invoicesData]);

    const formatDate = (params: ValueFormatterParams) => {
        return new Date(params.value).toLocaleDateString();
    };

    const formatCurrency = (params: ValueFormatterParams) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(params.value));
    };

    const statusCellRenderer = (params: ICellRendererParams) => {
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
    };

    const handleSyncSuccess = () => {
        // Refresh the grid
        if (gridRef.current) {
            utils.invoices.getAll.invalidate();
        }
    };

    const actionCellRenderer = (props: { data: SerializedInvoice }) => (
        <div className="flex gap-2">
        <Link href={`/invoices/${props.data.id}`} className="btn btn-xs btn-primary">
            <Eye className="w-4 h-4 mr-1" />
            Invoice
            </Link>
            <QuickbooksInvoiceButton invoice={props.data} onSyncSuccess={handleSyncSuccess}/>
        </div>
    );

    const columnDefs: ColDef[] = [
        { headerName: "Invoice Number", field: "invoiceNumber", filter: true, width: 150, },
        { headerName: "Date Issued", field: "dateIssued", valueFormatter: formatDate, width: 120 },
        { headerName: "Due Date", field: "dateDue", valueFormatter: formatDate, width: 120 },
        { headerName: "Total", field: "total", valueFormatter: formatCurrency, width: 120 },
        { headerName: "Status", field: "status", cellRenderer: statusCellRenderer, width: 120 },
        {
            headerName: "QB Status",
            field: "quickbooksId",
            cellRenderer: (params: { value: string | null }) => (
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
            ),
            sortable: true,
            filter: true,
            width: 120
        },
        { headerName: "Actions", cellRenderer: actionCellRenderer, sortable: false, filter: false, width: 250 },
    ];

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
    }), []);

    const onGridReady = (params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    };

    useEffect(() => {
        setInvoices(invoicesData || []);
        setLoading(false);
        if (gridRef.current) {
            gridRef.current.api.sizeColumnsToFit();
        }
    }, [invoicesData]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        (invoices && (
            <div className="ag-theme-alpine" style={{ height: "600px", width: '100%' }}>
            <AgGridReact
                animateRows={true}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                pagination={true}
                paginationPageSize={20}
                ref={gridRef}
                rowData={rowData}
                rowSelection="single"
                />
            </div>
        )) || (
            <div>No invoices found</div>
        )
    );
};

export default InvoicesTable;