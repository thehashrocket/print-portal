// ~/src/app/_components/users/userManagementTable.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
    type ColDef,
    ModuleRegistry,
    type GridReadyEvent,
    type FilterChangedEvent,
    type ICellRendererParams
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { type User, type Role } from "@prisma/client";
import { api } from "~/trpc/react";
import EditUserRolesModal from './editUserRolesModal';
import Link from "next/link";
import { Button } from "../ui/button";
import { Eye, Pencil, Trash } from "lucide-react";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface UserWithRoles extends User {
    Roles: Role[];
}

interface UserManagementTableProps {
    initialUsers: UserWithRoles[];
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({ initialUsers }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<UserWithRoles[]>(initialUsers);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: updatedUsers } = api.userManagement.getAllUsers.useQuery(undefined, {
        initialData: initialUsers,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    const actionsCellRenderer = (props: ICellRendererParams) => (
        <div className="grid grid-cols-3 gap-2">
            <Button
                size="sm"
                variant="default"
                onClick={() => handleEditRoles(props.data)}
            >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Roles
            </Button>
            <Link href={`/users/${props.data.id}`}>
                <Button 
                    size="sm"
                    variant="secondary"
                >
                    <Eye className="w-4 h-4 mr-2" />
                    View User
                </Button>
            </Link>
            <Button
                size="sm"
                variant="destructive"
                onClick={() => console.log("Delete user")}
            >
                <Trash className="w-4 h-4 mr-2" />
                Delete User
            </Button>
        </div>

    );

    const rolesCellRenderer = (props: ICellRendererParams) => (
        <span>{props.data.Roles.map((role: Role) => role.name).join(', ')}</span>
    );

    const columnDefs: ColDef[] = [
        { headerName: "Name", field: "name", filter: true },
        { headerName: "Email", field: "email", filter: true },
        { headerName: "Roles", field: "Roles", cellRenderer: rolesCellRenderer, filter: true },
        { headerName: "Actions", cellRenderer: actionsCellRenderer, sortable: false, filter: false },
    ];

    useEffect(() => {
        if (updatedUsers) {
            setRowData(updatedUsers);
            setLoading(false);
            if (gridRef.current) {
                gridRef.current.api.sizeColumnsToFit();
            }
        }
    }, [updatedUsers]);

    const onGridReady = (params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    };

    const onFilterChanged = (event: FilterChangedEvent) => {
        const filteredRowCount = event.api.getDisplayedRowCount();
    };

    const handleEditRoles = (user: UserWithRoles) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setIsModalOpen(false);
    };

    const handleUpdateRoles = () => {
        // Refresh the user list after role update
        if (updatedUsers) {
            setRowData(updatedUsers);
        }
        handleCloseModal();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="ag-theme-alpine" style={{ height: "600px", width: "100%" }}>
                <AgGridReact
                    ref={gridRef}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={rowData}
                    rowSelection="single"
                    onGridReady={onGridReady}
                    onFilterChanged={onFilterChanged}
                    animateRows={true}
                    pagination={true}
                    paginationPageSize={20}
                />
            </div>

            {selectedUser && (
                <EditUserRolesModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    user={selectedUser}
                    onUpdateRoles={handleUpdateRoles}
                />
            )}
        </div>
    );
};

export default UserManagementTable;