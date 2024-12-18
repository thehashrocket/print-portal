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
import { Eye, Pencil, Trash, Plus } from "lucide-react";
import { Card, CardContent } from "~/app/_components/ui/card";
import { useMediaQuery } from "~/hooks/use-media-query"
import { toast } from "react-hot-toast";
import CreateUserModal from './createUserModal';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface UserWithRoles extends User {
    Roles: Role[];
}

interface UserManagementTableProps {
    initialUsers: UserWithRoles[];
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({ initialUsers }) => {
    const utils = api.useUtils();
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<UserWithRoles[]>(initialUsers);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: updatedUsers } = api.userManagement.getAllUsers.useQuery(undefined, {
        initialData: initialUsers,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    // Delete User and remove from rowData. User userManagement.deleteUser mutation. Refreshes the user list.
    const { mutate: deleteUser } = api.userManagement.deleteUser.useMutation(
        {
            onSuccess: () => {
                // Refresh the user list
                utils.userManagement.getAllUsers.invalidate();
                toast.success("User deleted");
            },
        }
    );

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
                onClick={() => deleteUser(props.data.id)}
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

    const handleCreateSuccess = () => {
        utils.userManagement.getAllUsers.invalidate();
    };

    const renderMobileCard = (user: UserWithRoles) => (
        <Card key={user.id} className="mb-4">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Name</h3>
                        <p>{user.name}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Email</h3>
                        <p>{user.email}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Roles</h3>
                        <p>{user.Roles.map(role => role.name).join(', ')}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleEditRoles(user)}
                            className="w-full"
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Roles
                        </Button>
                        <Link href={`/users/${user.id}`} className="w-full">
                            <Button 
                                size="sm"
                                variant="secondary"
                                className="w-full"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View User
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => console.log("Delete user")}
                            className="w-full"
                        >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete User
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4">
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
                </Button>
            </div>

            {isDesktop ? (
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
            ) : (
                <div className="space-y-4">
                    {rowData.map((user) => renderMobileCard(user))}
                </div>
            )}

            {selectedUser && (
                <EditUserRolesModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    user={selectedUser}
                    onUpdateRoles={handleUpdateRoles}
                />
            )}

            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default UserManagementTable;