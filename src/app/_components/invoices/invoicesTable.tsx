// ~/src/app/_components/invoices/invoicesTable.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Invoice, InvoiceStatus } from "@prisma/client";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

type SerializedInvoice = Omit<Invoice, 'dateIssued' | 'dateDue' | 'createdAt' | 'updatedAt' | 'subtotal' | 'taxRate' | 'taxAmount' | 'total'> & {
    dateIssued: string;
    dateDue: string;
    createdAt: string;
    updatedAt: string;
    subtotal: string;
    taxRate: string;
    taxAmount: string;
    total: string;
};

interface InvoicesTableProps {
    invoices: SerializedInvoice[];
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices }) => {
    const [rowData, setRowData] = useState<SerializedInvoice[]>([]);

    useEffect(() => {
        setRowData(invoices);
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

    const actionCellRenderer = (params: ICellRendererParams) => (
        <Link href={`/invoices/${params.data.id}`} className="btn btn-sm btn-primary">
            View
        </Link>
    );

    const columnDefs: ColDef[] = [
        { headerName: "Invoice Number", field: "invoiceNumber", filter: true },
        { headerName: "Date Issued", field: "dateIssued", valueFormatter: formatDate },
        { headerName: "Due Date", field: "dateDue", valueFormatter: formatDate },
        { headerName: "Total", field: "total", valueFormatter: formatCurrency },
        { headerName: "Status", field: "status", cellRenderer: statusCellRenderer },
        { headerName: "Actions", cellRenderer: actionCellRenderer, sortable: false, filter: false },
    ];

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
    }), []);

    const onGridReady = (params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    };

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