// ~/app/workOrders/[id]/page.tsx
"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import WorkOrderDetails from "~/app/_components/workOrders/WorkOrderDetailsComponent";
import { Pill } from "~/app/_components/primitives/Pill";
import { RegMark } from "~/app/_components/primitives/RegMark";

const WO_STATUS_LABEL: Record<string, string> = {
  Draft: "Draft",
  Pending: "Pending",
  Approved: "Approved",
  Cancelled: "Cancelled",
};

const WO_STATUS_TONE: Record<string, "ok" | "warn" | "info" | "danger" | ""> = {
  Draft: "",
  Pending: "warn",
  Approved: "ok",
  Cancelled: "danger",
};

export default async function WorkOrderPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const { id } = params;

  const session = await getServerAuthSession();
  await headers();

  if (!session?.user.Permissions.includes("work_order_read")) {
    throw new Error("You do not have permission to view this page");
  }

  const workOrder = await api.workOrders.getByID(id);

  if (!workOrder) {
    notFound();
  }

  const statusStr = workOrder.status as string;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">
            <RegMark />
            &nbsp;
            <span style={{ verticalAlign: "middle" }}>
              {workOrder.Office.Company.name} · WO #{workOrder.workOrderNumber}
            </span>
          </div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span>Esti<em>mate</em></span>
            <Pill
              label={WO_STATUS_LABEL[statusStr] ?? statusStr}
              tone={WO_STATUS_TONE[statusStr] ?? ""}
            />
          </h1>
        </div>
      </div>

      <WorkOrderDetails initialWorkOrder={workOrder} workOrderId={workOrder.id} />
    </>
  );
}
