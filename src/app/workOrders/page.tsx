"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import WorkOrdersTable from "../_components/workOrders/workOrdersTable";

export default async function WorkOrdersPage() {
  const session = await getServerAuthSession();

  if (
    !session ||
    session.user.Permissions.map((permission: any) => permission)
      .join(", ")
      .includes("work_order_read") === false
  ) {
    return "You do not have permssion to view this page";
  }
  const workOrders = await api.workOrders.getAll();
  console.log("workOrders", workOrders);
  const serializedData = workOrders.map((workOrder) => ({
    ...workOrder,
    costPerM: workOrder.costPerM !== null ? workOrder.costPerM.toString() : null,
    createdAt: workOrder.createdAt.toISOString(),
    dateIn: workOrder.dateIn.toString(),
    deposit: workOrder.deposit.toString(),
    totalCost: workOrder.totalCost !== null ? workOrder.totalCost.toString() : null,
    updatedAt: workOrder.updatedAt.toISOString(),
    workOrderNumber: workOrder.workOrderNumber.toString(),
  }));

  return (
    <div>
      <h1>Work Orders Page</h1>
      <WorkOrdersTable workOrders={serializedData} />
    </div>
  );
}
