// ~/app/workOrders/[id]/page.tsx

"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import WorkOrderDetails from "~/app/_components/workOrders/WorkOrderDetailsComponent";
import { headers } from "next/headers";

export default async function WorkOrderPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;

  const {
    id
  } = params;

  const session = await getServerAuthSession();

  await headers();

  if (!session?.user.Permissions.includes("work_order_read")) {
    throw new Error("You do not have permission to view this page");
  }

  const workOrder = await api.workOrders.getByID(id);

  if (!workOrder) {
    throw new Error("Estimate not found");
  }

  return <WorkOrderDetails initialWorkOrder={workOrder} workOrderId={workOrder.id} />;
}
