import React from 'react';

import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";


export default async function UsersPage() {
    const session = await getServerAuthSession();

    return (
        <div>
            <h1>Users Page</h1>
            {/* Add your user-related content here */}
            <GetUsers />
        </div>
    );
}

async function GetUsers() {
    const session = await getServerAuthSession();
    if (!session) {
        return null;
    }

    const users = await api.users.getAll();
    // Incluides Users, Roles, and Permissions
    return (
        <div>
            <h2>Users</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.name} - {user.email}
                        <ul>
                            {user.roles.map((role) => (
                                <li key={role.id}>
                                    {role.name}
                                    <ul>
                                        {role.permissions.map((permission) => (
                                            <li key={permission.id}>
                                                {permission.name}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}