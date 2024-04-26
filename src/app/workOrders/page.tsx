"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import WorkOrdersTable from "../_components/workOrders/workOrdersTable";
import Link from "next/link";

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
    <div className="container mx-auto">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Work Orders</a>
          <div className="text-sm breadcrumbs">
            <ul>
              <li><Link href="/">Home</Link> </li>
            </ul>
          </div>
        </div>
        <div className="flex-none">
          <Link className="btn btn-sm btn-primary" href="/workOrders/create">Create Work Order</Link>
        </div>
      </div>
      {/* Link to Create a Work Order */}

      <WorkOrdersTable workOrders={serializedData} />
    </div>
  );
}
