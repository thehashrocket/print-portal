import React from "react";
import OrdersTable from "~/app/_components/orders/ordersTable";
import Link from "next/link";

export default async function OrdersPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Link href="/orders/create" className="btn btn-primary">
          Create New Order
        </Link>
      </div>
      <OrdersTable />
    </div>
  );
}