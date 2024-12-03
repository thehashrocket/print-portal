// ~/app/workOrders/page.tsx

"use server";

// ~/app/workOrders/page.tsx
import React from "react";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import NoPermission from "~/app/_components/noPermission/noPermission";
import WorkOrdersTable from "~/app/_components/workOrders/workOrdersTable";

export default async function WorkOrdersPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user.Permissions.includes("work_order_read")) {
    return <NoPermission />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Estimates</h1>
          {/* <Link href="/workOrders/create" className="btn btn-primary">
            Create New Estimate
          </Link> */}
        </div>
        <nav aria-label="breadcrumb" className="text-sm breadcrumbs">
          <ul>
            <li><Link href="/">Home</Link></li>
            <li>Orders Not in Production</li>
          </ul>
        </nav>
      </header>
      <main>
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Orders Not in Production List</h2>
          <WorkOrdersTable />
        </section>
      </main>
    </div>
  );
}