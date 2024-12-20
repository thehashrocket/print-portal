import React from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import UserManagementTable from "~/app/_components/users/userManagementTable";
import NoPermission from "../_components/noPermission/noPermission";

export default async function UsersPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return (
      <NoPermission />
    )
  }

  if (!session || !session.user.Permissions.includes("user_create")) {
    <NoPermission />
  }

  const users = await api.userManagement.getAllUsers();

  return (
    <div className="container mx-auto">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Users</a>
        </div>
        <div className="flex-none">
          <button className="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
          </button>
        </div>
      </div>
      <UserManagementTable initialUsers={users} />
    </div>
  );
}