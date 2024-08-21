// ~/src/app/_components/users/userManagementTable.tsx
"use client";

import React, { useState } from 'react';
import { api } from "~/trpc/react";
import { User, Role } from "@prisma/client";
import EditUserRolesModal from './editUserRolesModal';

interface UserWithRoles extends User {
    Roles: Role[];
}

interface UserManagementTableProps {
    initialUsers: UserWithRoles[];
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({ initialUsers }) => {
    const [users, setUsers] = useState<UserWithRoles[]>(initialUsers);
    const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: updatedUsers } = api.userManagement.getAllUsers.useQuery(undefined, {
        initialData: initialUsers,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

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
        setUsers(updatedUsers);
        handleCloseModal();
    };

    return (
        <div>
            <table className="table w-full">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Roles</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.Roles.map(role => role.name).join(', ')}</td>
                            <td>
                                <button
                                    onClick={() => handleEditRoles(user)}
                                    className="btn btn-sm btn-primary"
                                >
                                    Edit Roles
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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