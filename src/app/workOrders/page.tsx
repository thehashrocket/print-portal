"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { WorkOrder } from "@prisma/client";
import WorkOrdersTable from "../_components/workOrders/workOrdersTable";

export default async function WorkOrdersPage() {
  const session = await getServerAuthSession();

  if (
    !session ||
    session.user.Permissions.map((permission) => permission)
      .join(", ")
      .includes("work_order_read") === false
  ) {
    return "You do not have permssion to view this page";
  }
  const workOrders = await api.workOrders.getAll();
  console.log("workOrders", workOrders);
  const serializedData = workOrders.map((workOrder) => ({
    ...workOrder,
    dateIn: workOrder.dateIn.toString(),
    deposit: workOrder.deposit.toString(),
    workOrderNumber: workOrder.workOrderNumber.toString(),
    totalCost: workOrder.totalCost.toString(),
    createdAt: workOrder.createdAt.toISOString(),
    updatedAt: workOrder.updatedAt.toISOString(),
  }));

  return (
    <div>
      <h1>Work Orders Page</h1>
      <WorkOrdersTable workOrders={serializedData} />
    </div>
  );
}
