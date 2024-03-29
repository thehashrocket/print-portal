"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { Order } from "@prisma/client";
import OrdersTable from "../_components/orders/ordersTable";

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
    <div>
      <h1>Orders Page</h1>
      {orders && <OrdersTable orders={serializedData} />}
    </div>
  );
}
