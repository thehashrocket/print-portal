// ~/app/orders/page.tsx

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import OrdersTable from "../_components/orders/ordersTable";
import Link from "next/link";
import NoPermission from "../_components/noPermission/noPremission";
import { SerializedOrder } from "~/types/serializedTypes";
import { normalizeOrder } from "~/utils/dataNormalization";

export default async function OrdersPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user.Permissions.includes("order_read")) {
    return <NoPermission />;
  }

  const orders = await api.orders.getAll();
  const serializedData: SerializedOrder[] = orders.map(normalizeOrder);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Orders</h1>
          <Link className="btn btn-primary" href="/orders/create">
            Create Order
          </Link>
        </div>
        <nav aria-label="breadcrumb" className="text-sm breadcrumbs">
          <ul>
            <li><Link href="/">Home</Link></li>
            <li>Orders</li>
          </ul>
        </nav>
      </header>

      <main>
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Orders List</h2>
          <OrdersTable orders={serializedData} />
        </section>
      </main>
    </div>
  );
}