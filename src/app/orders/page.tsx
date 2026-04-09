import React from "react";
import Link from "next/link";
import OrdersTable from "~/app/_components/orders/ordersTable";

export default async function OrdersPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Orders</h1>
          <div className="text-sm breadcrumbs">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li>Orders</li>
            </ul>
          </div>
        </div>
      </div>
      <OrdersTable />
    </div>
  );
}