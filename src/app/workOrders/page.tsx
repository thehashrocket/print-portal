"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { Order } from "@prisma/client";

export default async function WorkOrdersPage() {
  const session = await getServerAuthSession();

  if (
    !session ||
    session.user.Permissions.map((permission) => permission)
      .join(", ")
      .includes("order_read") === false
  ) {
    return "You do not have permssion to view this page";
  }
  const orders = await api.workOrders.getAll();
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
      <h1>Work Orders Page</h1>
    </div>
  );
}
