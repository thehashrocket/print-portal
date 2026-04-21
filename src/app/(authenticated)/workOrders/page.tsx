// ~/app/workOrders/page.tsx
"use server";

import React from "react";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import NoPermission from "~/app/_components/noPermission/noPermission";
import WorkOrdersTable from "~/app/_components/workOrders/workOrdersTable";
import { RegMark } from "~/app/_components/primitives/RegMark";

export default async function WorkOrdersPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user.Permissions.includes("work_order_read")) {
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
            Esti<em>mates</em>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/workOrders/create" className="btn primary">
            + New Estimate
          </Link>
        </div>
      </div>

      <WorkOrdersTable />
    </>
  );
}
