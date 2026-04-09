import React from "react";
import Link from "next/link";
import OrdersTable from "~/app/_components/orders/ordersTable";

export default async function OrdersPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Orders</h1>
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
          <OrdersTable />
        </section>
      </main>
    </div>
  );
}
