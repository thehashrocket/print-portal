// ~/app/workOrders/page.tsx

"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import WorkOrdersTable from "../_components/workOrders/workOrdersTable";
import Link from "next/link";
import { WorkOrder } from "@prisma/client";
import WorkOrderCharts from "../_components/workOrders/WorkOrderCharts";

type SerializedWorkOrder = Omit<WorkOrder, 'createdAt' | 'dateIn' | 'deposit' | 'totalCost' | 'updatedAt' | 'workOrderNumber'> & {
  createdAt: string;
  dateIn: string;
  deposit: string;
  totalCost: string | null;
  updatedAt: string;
  workOrderNumber: string;
};

const serializeWorkOrder = (workOrder: WorkOrder): SerializedWorkOrder => ({
  ...workOrder,
  createdAt: workOrder.createdAt.toISOString(),
  dateIn: workOrder.dateIn.toISOString(),
  deposit: workOrder.deposit.toString(),
  totalCost: workOrder.totalCost?.toString() ?? null,
  updatedAt: workOrder.updatedAt.toISOString(),
  workOrderNumber: workOrder.workOrderNumber.toString(),
});

export default async function WorkOrdersPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user.Permissions.includes("work_order_read")) {
    throw new Error("You do not have permission to view this page");
  }

  const workOrders = await api.workOrders.getAll();
  const serializedData = workOrders.map(serializeWorkOrder);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <Link
            className="btn btn-primary"
            href="/workOrders/create"
          >
            Create Work Order
          </Link>
        </div>
        <nav aria-label="breadcrumb" className="text-sm breadcrumbs">
          <ul>
            <li><Link href="/">Home</Link></li>
            <li>Work Orders</li>
          </ul>
        </nav>
      </header>
      <WorkOrderCharts workOrders={serializedData} />
      <main>
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Work Orders List</h2>
          <WorkOrdersTable workOrders={serializedData} />
        </section>
      </main>
    </div>
  );
}