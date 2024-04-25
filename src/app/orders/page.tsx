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
    costPerM: order.costPerM.toString(),
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
          <button className="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
          </button>
        </div>
      </div>
      {orders && <OrdersTable orders={serializedData} />}
    </div>
  );
}
