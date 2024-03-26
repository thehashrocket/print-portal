import React from "react";

import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import UsersTable from "./usersTable";
import { User } from "@prisma/client";

export default async function UsersPage() {
  const session = await getServerAuthSession();

  if (
    !session ||
    session.user.Permissions.map((permission) => permission)
      .join(", ")
      .includes("user_read") === false
  ) {
    return "You must be logged in to view this page";
  }
  const users = await api.users.getAll();
  console.log("session");
  return (
    <div>
      <h1>Users Page</h1>
      {/* Add your user-related content here */}
      {/* <GetUsers users={users} /> */}
      {users && <UsersTable users={users} />}
    </div>
  );
}

async function GetUsers({ users }: { users: User[] }) {
  const session = await getServerAuthSession();

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
                    {role.Permissions.map((permission) => (
                      <li key={permission.id}>{permission.name}</li>
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
