// ~/app/workOrders/page.tsx

"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import WorkOrdersTable from "../_components/workOrders/workOrdersTable";
import Link from "next/link";
import WorkOrderCharts from "../_components/workOrders/WorkOrderCharts";
import NoPermission from "~/app/_components/noPermission/noPremission";
import { SerializedWorkOrder } from "~/types/serializedTypes";

export default async function WorkOrdersPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user.Permissions.includes("work_order_read")) {
    return <NoPermission />;
  }

  const workOrders: SerializedWorkOrder[] = await api.workOrders.getAll();
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <Link className="btn btn-primary" href="/workOrders/create">
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
      <WorkOrderCharts workOrders={workOrders} />
      <main>
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Work Orders List</h2>
          <WorkOrdersTable workOrders={workOrders} />
        </section>
      </main>
    </div>
  );
}