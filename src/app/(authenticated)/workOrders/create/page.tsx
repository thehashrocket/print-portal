// ~/app/workOrders/create/page.tsx
"use server";

import React from "react";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import NoPermission from "~/app/_components/noPermission/noPermission";
import CreateWorkOrderComponent from "~/app/_components/workOrders/create/createWorkOrderComponent";
import { RegMark } from "~/app/_components/primitives/RegMark";

export default async function CreateWorkOrderPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user.Permissions.includes("work_order_create")) {
    return <NoPermission />;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">
            <RegMark />
            &nbsp;
            <span style={{ verticalAlign: "middle" }}>Sales</span>
          </div>
          <h1 className="page-title">
            New <em>Estimate</em>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/workOrders" className="btn">
            Cancel
          </Link>
        </div>
      </div>

      <CreateWorkOrderComponent />
    </>
  );
}
