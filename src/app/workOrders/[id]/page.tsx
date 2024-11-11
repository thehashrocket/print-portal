// ~/app/workOrders/[id]/page.tsx

"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import WorkOrderDetails from "~/app/_components/workOrders/WorkOrderDetailsComponent";

export default async function WorkOrderPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerAuthSession();

  if (!session?.user.Permissions.includes("work_order_read")) {
    throw new Error("You do not have permission to view this page");
  }

  const workOrder = await api.workOrders.getByID(id);

  if (!workOrder) {
    throw new Error("Estimate not found");
  }

  return <WorkOrderDetails initialWorkOrder={workOrder} workOrderId={workOrder.id} />;
}
