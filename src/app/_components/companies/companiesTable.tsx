"use client";

import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react"; // React Grid Logic
import "@ag-grid-community/styles/ag-grid.css"; // Core CSS
import "@ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    ModuleRegistry,
    ColDef
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { Company } from "@prisma/client";
import Link from "next/link";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const CompaniesTable = ({ companies }: { companies: Company[] }) => {

    const gridRef = useRef(null);
    const defaultColDef = {
        resizable: true,
        sortable: true,
    };
    const [rowData, setRowData] = useState<Company[]>(companies);

    const actionsCellRenderer = (props: { data: { id: any; }; }) => (
        <div>
            <Link className="btn btn-sm btn-primary" href={`/companies/${props.data.id}`}>
                View Company
            </Link>
        </div>
    );

    const columnDefs: ColDef[] = [
        { headerName: "id", field: "id" },
        { headerName: "Name", field: "name", filter: true },
        {
            headerName: "Actions",
            cellRenderer: actionsCellRenderer,
        },
    ];

    return (
        <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
            <AgGridReact
                ref={gridRef}
                defaultColDef={defaultColDef}
                columnDefs={columnDefs}
                rowData={rowData}
                rowSelection="single"
                animateRows={true}
            />
        </div>
    );

};

export default CompaniesTable;