// ~/app/_components/companies/companiesTable.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    ModuleRegistry,
    type ColDef,
    type GridReadyEvent,
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import Link from "next/link";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

type SerializedCompany = {
    id: string;
    name: string;
    workOrderTotalPending: number;
    orderTotalPending: number;
    orderTotalCompleted: number;
};

interface CompaniesTableProps {
    companies: SerializedCompany[];
}

const CompaniesTable = ({ companies }: CompaniesTableProps) => {
    const gridRef = useRef(null);
    const [rowData, setRowData] = useState<SerializedCompany[]>([]);
    const [loading, setLoading] = useState(true);

    const defaultColDef = {
        resizable: true,
        sortable: true,
        filter: true,
    };

    const actionsCellRenderer = (props: { data: SerializedCompany }) => (
        <Link className="btn btn-sm btn-primary" href={`/companies/${props.data.id}`}>
            View Company
        </Link>
    );

    const formatNumberAsCurrency = (params: { value: number }) => {
        return `$${parseFloat(params.value.toString()).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    };

    const columnDefs: ColDef[] = [
        { headerName: "Name", field: "name", flex: 1 },
        { headerName: "Pending Work Orders", field: "workOrderTotalPending", valueFormatter: formatNumberAsCurrency, flex: 1 },
        { headerName: "Pending Orders", field: "orderTotalPending", valueFormatter: formatNumberAsCurrency, flex: 1 },
        { headerName: "Completed Orders", field: "orderTotalCompleted", valueFormatter: formatNumberAsCurrency, flex: 1 },
        { headerName: "Actions", cellRenderer: actionsCellRenderer, width: 150, sortable: false, filter: false },
    ];

    const onGridReady = (params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    };

    useEffect(() => {
        setRowData(companies);
        setLoading(false);
    }, [companies]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
            <AgGridReact
                ref={gridRef}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowData={rowData}
                onGridReady={onGridReady}
                animateRows={true}
                pagination={true}
                paginationPageSize={20}
            />
        </div>
    );
};

export default CompaniesTable;