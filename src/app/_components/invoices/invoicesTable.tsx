// ~/src/app/_components/invoices/invoicesTable.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    ColDef,
    GridReadyEvent,
    ICellRendererParams,
    ModuleRegistry,
    ValueFormatterParams,
} from "@ag-grid-community/core";
import Link from "next/link";
import { Invoice, InvoicePayment, InvoiceStatus } from "@prisma/client";
import { SerializedInvoice } from "~/types/serializedTypes";
import QuickbooksInvoiceButton from "./QuickbooksInvoiceButton";
import { api } from "~/trpc/react";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface InvoicesTableProps {
    invoices: SerializedInvoice[];
}

const InvoicesTable: React.FC= () => {
    const [rowData, setRowData] = useState<SerializedInvoice[]>([]);
    const [invoices, setInvoices] = useState<SerializedInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const { data: invoicesData, isLoading, error } = api.invoices.getAll.useQuery();
    const gridRef = useRef<AgGridReact>(null);
    const utils = api.useUtils();

    useEffect(() => {
        setRowData(invoices);
        if (gridRef.current) {
            gridRef.current.api.sizeColumnsToFit();
        }
    }, [invoices]);

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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
            </svg>
            Invoice
            </Link>
            <QuickbooksInvoiceButton invoice={props.data} onSyncSuccess={handleSyncSuccess}/>
        </div>
    );

    const columnDefs: ColDef[] = [
        { headerName: "Invoice Number", field: "invoiceNumber", filter: true, width: 90, },
        { headerName: "Date Issued", field: "dateIssued", valueFormatter: formatDate, width: 80 },
        { headerName: "Due Date", field: "dateDue", valueFormatter: formatDate, width: 80 },
        { headerName: "Total", field: "total", valueFormatter: formatCurrency, width: 80 },
        { headerName: "Status", field: "status", cellRenderer: statusCellRenderer, width: 80 },
        {
            headerName: "QB Status",
            field: "quickbooksId",
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
            width: 80
        },
        { headerName: "Actions", cellRenderer: actionCellRenderer, sortable: false, filter: false, width: 80 },
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
        <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                pagination={true}
                paginationPageSize={20}
            />
        </div>
    );
};

export default InvoicesTable;