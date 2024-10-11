// ~/app/_components/companies/companiesTable.tsx

"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
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
import ActionsCellRenderer from "./ActionsCellRenderer";
import { api } from "~/trpc/react";
import { type CompanyDashboardData } from "~/types/company";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

type SerializedCompany = {
    id: string;
    name: string;
    workOrderTotalPending: number;
    orderTotalPending: number;
    orderTotalCompleted: number;
    quickbooksId: string | null;
    createdAt: Date;
    updatedAt: Date;
    syncToken: string | null;
};

interface CompaniesTableProps {
    companies: SerializedCompany[];
}

const CompaniesTable = ({ companies: initialCompanies }: CompaniesTableProps) => {
    const gridRef = useRef(null);
    const [rowData, setRowData] = useState<SerializedCompany[]>(initialCompanies);
    const [loading, setLoading] = useState(true);

    const defaultColDef = {
        resizable: true,
        sortable: true,
        filter: true,
    };

    const {data: updatedCompanies, refetch} = api.companies.companyDashboard.useQuery(
        undefined,
        {
            initialData: initialCompanies as CompanyDashboardData[], enabled: false,
        }
    );

    const handleSyncSuccess = useCallback(() => {
        void refetch();
    }, [refetch]);

    useEffect(() => {
        if (updatedCompanies) {
            const completeCompanies = updatedCompanies.map(company => ({
                ...company,
                workOrderTotalPending: typeof company.workOrderTotalPending === 'number' ? company.workOrderTotalPending : 0,
                orderTotalPending: typeof company.orderTotalPending === 'number' ? company.orderTotalPending : 0,
                orderTotalCompleted: typeof company.orderTotalCompleted === 'number' ? company.orderTotalCompleted : 0,
            }));
            setRowData(completeCompanies);
        }
    }, [updatedCompanies]);

    const actionsCellRenderer = (props: { data: SerializedCompany }) => (
        <div className="flex justify-center items-center space-x-2 px-2">
            <Link className="btn btn-sm btn-primary" href={`/companies/${props.data.id}`}>
                View Company
            </Link>
            <ActionsCellRenderer params={{ row: props.data }} onSyncSuccess={handleSyncSuccess}/>
        </div>
    );

    const formatNumberAsCurrency = (params: { value: number | null | undefined }) => {
        if (params.value == null) return '$0.00';
        return `$${parseFloat(params.value.toString()).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    };

    const columnDefs: ColDef[] = [
        { headerName: "Name", field: "name" },
        { headerName: "Pending Work Orders", field: "workOrderTotalPending", valueFormatter: formatNumberAsCurrency },
        { headerName: "Pending Orders", field: "orderTotalPending", valueFormatter: formatNumberAsCurrency },
        { headerName: "Completed Orders", field: "orderTotalCompleted", valueFormatter: formatNumberAsCurrency },
        {
            headerName: "QuickBooks Status",
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
        },
        { 
            headerName: "Actions", 
            cellRenderer: actionsCellRenderer, 
            sortable: false, 
            filter: false,
            width: 250, // Adjust this value as needed
            cellStyle: { padding: '5px' } // Add some padding
        },
    ];

    const onGridReady = (params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    };

    useEffect(() => {
        setRowData(initialCompanies);
        setLoading(false);
    }, [initialCompanies]);

    if (loading) {
        return (
            <div className="flex items-center h-64">
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