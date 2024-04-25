"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { AgGridReact, CustomCellRendererProps } from "@ag-grid-community/react"; // React Grid Logic
import "@ag-grid-community/styles/ag-grid.css"; // Core CSS
import "@ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
  ColDef,
  ModuleRegistry,
  ValueFormatterParams,
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { User } from "@prisma/client";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const UsersTable: React.FC<User[]> = (users) => {
  const gridRef = useRef();
  const defaultColDef = {
    resizable: true,
    sortable: true,
  };
  const [rowData, setRowData] = useState([]);
  // Define column definitions and row data here
  const columnDefs = [
    { headerName: "Name", field: "name", sortable: true, filter: true },
    { headerName: "Email", field: "email", sortable: true, filter: true },
    { headerName: "Roles", field: "roles", sortable: true, filter: true },
    {
      headerName: "Permissions",
      field: "permissions",
      sortable: true,
      filter: true,
    },
  ];

  useEffect(() => {
    console.log("users", users["users"]);
    setRowData(
      users["users"].map((user) => {
        return {
          name: user.name,
          email: user.email,
          roles: user.Roles.map((role) => role.name).join(", "),
          permissions: user.Roles.map((role) =>
            role.Permissions.map((permission) => permission.name).join(", "),
          ).join(", "),
        };
      }),
    );
  }, []);

  return (
    <div className="ag-theme-quartz" style={{ height: "600px", width: "100%" }}>
      <AgGridReact
        id="users_grid"
        ref={gridRef}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowData={rowData}
        rowSelection={"single"}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};

export default UsersTable;
