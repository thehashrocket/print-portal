import React from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import UserManagementTable from "~/app/_components/users/userManagementTable";
import NoPermission from "~/app/_components/noPermission/noPermission";
import { RegMark } from "~/app/_components/primitives/RegMark";

export default async function UsersPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return <NoPermission />;
  }

  if (!session.user.Permissions.includes("user_create")) {
    return <NoPermission />;
  }

  const users = await api.userManagement.getAllUsers();

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">
            <RegMark />
            &nbsp;
            <span style={{ verticalAlign: "middle" }}>Admin</span>
          </div>
          <h1 className="page-title">
            Us<em>ers</em>
          </h1>
        </div>
      </div>

      <UserManagementTable initialUsers={users} />
    </>
  );
}
