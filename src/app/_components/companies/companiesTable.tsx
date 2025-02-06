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
import QuickbooksCompanyButton from "./QuickbooksCompanyButton";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import { Eye, RefreshCcw, RefreshCwOff, Trash } from "lucide-react";
import "~/styles/ag-grid-custom.css";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

type SerializedCompany = {
    id: string;
    name: string;
    isActive: boolean;
    deleted: boolean;
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
    const gridRef = useRef<AgGridReact>(null);
    const [loading, setLoading] = useState(true);

    const defaultColDef = {
        resizable: true,
        sortable: true,
        filter: true,
        minWidth: 100,
        flex: 1,
    };

    const { data: companies, refetch } = api.companies.companyDashboard.useQuery(
        undefined,
        {
            initialData: initialCompanies.map(company => ({
                ...company,
                quickbooksId: company.quickbooksId || '',
                syncToken: company.syncToken || '',
                deleted: false
            })),
            enabled: true,
        }
    );

    const deleteCompanyMutation = api.companies.delete.useMutation({
        onSuccess: async () => {
            await refetch();
        },
    });

    const handleDeleteCompany = async (companyId: string) => {
        if (window.confirm('Are you sure you want to delete this company?')) {
            await deleteCompanyMutation.mutateAsync(companyId);
        }
    };

    const handleSyncSuccess = useCallback(() => {
        void refetch();
    }, [refetch]);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        const gridApi = params.api;
        
        const updateGridSize = () => {
            if (gridApi && !gridApi.isDestroyed()) {
                setTimeout(() => {
                    try {
                        gridApi.sizeColumnsToFit();
                    } catch (error) {
                        console.warn('Failed to size columns:', error);
                    }
                }, 100);
            }
        };

        // Initial sizing
        updateGridSize();

        // Add resize listener
        window.addEventListener('resize', updateGridSize);

        // Store the cleanup function
        return () => {
            window.removeEventListener('resize', updateGridSize);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (companies && !loading && gridRef.current?.api) {
            try {
                gridRef.current.api.sizeColumnsToFit();
            } catch (error) {
                console.warn('Failed to size columns:', error);
            }
        }
    }, [companies, loading]);

    const actionsCellRenderer = (props: { data: SerializedCompany }) => (
        <div className="flex gap-1">
            <Link href={`/companies/${props.data.id}`}>
                <Button
                    variant="default"
                    size="xs"
                    className="h-8 px-2 sm:px-3"
                >
                    <Eye className="w-4 h-4" />
                </Button>
            </Link>
            <QuickbooksCompanyButton params={{ row: props.data }} onSyncSuccess={handleSyncSuccess} />
            <Button
                variant="destructive"
                size="xs"
                className="h-8 px-2 sm:px-3"
                onClick={() => void handleDeleteCompany(props.data.id)}
            >
                <Trash className="w-4 h-4" />
            </Button>
        </div>
    );

    const formatNumberAsCurrency = (params: { value: number | null | undefined }) => {
        if (params.value == null) return '$0.00';
        return `$${parseFloat(params.value.toString()).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    };

    const columnDefs: ColDef[] = [
        { 
            headerName: "Name", 
            field: "name",
            minWidth: 200,
            flex: 2,
            cellRenderer: (params: { value: string }) => (
                <div className="truncate max-w-[150px] sm:max-w-none" title={params.value}>
                    {params.value}
                </div>
            )
        },
        { 
            headerName: "Est.", 
            field: "workOrderTotalPending", 
            valueFormatter: formatNumberAsCurrency,
            headerClass: 'hide-below-lg',
            cellClass: 'hide-below-lg text-right',
            minWidth: 120,
            flex: 1,
            type: 'numericColumn'
        },
        { 
            headerName: "Orders", 
            field: "orderTotalPending", 
            valueFormatter: formatNumberAsCurrency,
            headerClass: 'hide-below-md',
            cellClass: 'hide-below-md text-right',
            minWidth: 120,
            flex: 1,
            type: 'numericColumn'
        },
        { 
            headerName: "Done", 
            field: "orderTotalCompleted", 
            valueFormatter: formatNumberAsCurrency,
            headerClass: 'hide-below-md',
            cellClass: 'hide-below-md text-right',
            minWidth: 120,
            flex: 1,
            type: 'numericColumn'
        },
        {
            headerName: "QB",
            field: "quickbooksId",
            minWidth: 130,
            flex: 1,
            cellRenderer: (params: { value: string | null }) => (
                <div className={`flex items-center justify-center ${params.value ? "text-green-600" : "text-red-600"}`}>
                    {params.value ? (
                        <span className="flex items-center" title="Synced with QuickBooks">
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Synced
                        </span>
                    ) : (
                        <span className="flex items-center" title="Not synced with QuickBooks">
                            <RefreshCwOff className="w-4 h-4 mr-2" />
                            Not Synced
                        </span>
                    )}
                </div>
            ),
        },
        {
            headerName: "Active",
            field: "isActive",
            minWidth: 100,
            flex: 0.5,
            cellRenderer: (params: { value: boolean }) => (
                <div className={`flex items-center justify-center ${params.value ? "text-green-600" : "text-red-600"}`}>
                    {params.value ? "Yes" : "No"}
                </div>
            )
        },
        {
            headerName: "Actions",
            cellRenderer: actionsCellRenderer,
            sortable: false,
            filter: false,
            minWidth: 150,
            flex: 0.8,
            cellClass: "action-cell",
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="ag-theme-alpine w-full" style={{ height: 600 }}>
                <AgGridReact
                    ref={gridRef}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={companies}
                    onGridReady={onGridReady}
                    animateRows={true}
                    pagination={true}
                    paginationPageSize={20}
                    suppressMovableColumns={true}
                    domLayout="autoHeight"
                />
            </div>
        </div>
    );
};

export default CompaniesTable;