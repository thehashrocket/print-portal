"use client";
import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
  ColDef,
  ModuleRegistry,
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { UserWithRoles } from "~/types/user";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface UsersTableProps {
  users: UserWithRoles[];
}

const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<any[]>([]);

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  const columnDefs: ColDef[] = [
    { headerName: "Name", field: "name" },
    { headerName: "Email", field: "email" },
    { headerName: "Roles", field: "roles" },
    { headerName: "Permissions", field: "permissions" },
  ];

  useEffect(() => {
    setRowData(
      users.map((user) => ({
        name: user.name,
        email: user.email,
        roles: user.Roles.map((role) => role.name).join(", "),
        permissions: Array.from(new Set(
          user.Roles.flatMap((role) => role.Permissions.map((permission) => permission.name))
        )).join(", ")
      }))
    );
  }, [users]);

  return (
    <div className="ag-theme-alpine" style={{ height: "600px", width: "100%" }}>
      <AgGridReact
        ref={gridRef}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowData={rowData}
        rowSelection="single"
      />
    </div>
  );
};

export default UsersTable;