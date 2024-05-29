"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { Order } from "@prisma/client";
import OrdersTable from "../_components/orders/ordersTable";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await getServerAuthSession();

  if (
    !session ||
    session.user.Permissions.map((permission) => permission)
      .join(", ")
      .includes("order_read") === false
  ) {
    return "You do not have permssion to view this page";
  }
  const orders = await api.orders.getAll();
  const serializedData = orders.map((order) => ({
    ...order,
    deposit: order.deposit.toString(),
    totalCost: order.totalCost.toString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  return (
    <div className="container mx-auto">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Orders</a>
          <div className="text-sm breadcrumbs">
            <ul>
              <li><Link href="/">Home</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex-none">
          <Link className="btn btn-sm btn-primary" href="/orders/create">Create Order</Link>
        </div>
      </div>
      {orders && <OrdersTable orders={serializedData} />}
    </div>
  );
}
