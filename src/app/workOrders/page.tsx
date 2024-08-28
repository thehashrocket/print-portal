// ~/app/workOrders/page.tsx

"use server";

// ~/app/workOrders/page.tsx
import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import NoPermission from "~/app/_components/noPermission/noPremission";
import WorkOrdersClientComponent from "~/app/_components/workOrders/workOrdersClientComponent";

export default async function WorkOrdersPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user.Permissions.includes("work_order_read")) {
    return <NoPermission />;
  }

  const workOrders = await api.workOrders.getAll();

  return <WorkOrdersClientComponent workOrders={workOrders} />;
}