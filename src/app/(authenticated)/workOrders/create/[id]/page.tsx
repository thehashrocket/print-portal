"use server";
import React from "react";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import WorkOrderWizard from "~/app/_components/workOrders/create/workOrderWizard";
import { WorkOrderProvider } from "~/app/contexts/workOrderContext";
import NoPermission from "~/app/_components/noPermission/noPermission";
import { RegMark } from "~/app/_components/primitives/RegMark";

export default async function Page(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const { id } = params;

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
            New <em>Estimate</em>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/workOrders" className="btn">
            Cancel
          </Link>
        </div>
      </div>

      <WorkOrderProvider>
        <WorkOrderWizard workOrderId={id} />
      </WorkOrderProvider>
    </>
  );
}
