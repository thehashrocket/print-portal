"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import DraggableOrdersDash from "../_components/dashboard/draggableOrdersDash";
import { Order, WorkOrder } from "@prisma/client";
import DraggableWorkOrdersDash from "../_components/dashboard/draggableWorkOrdersDash";
import DashboardTabsClient from "../_components/dashboard/dashboardTabsClient";

export default async function DashboardPage() {
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
    const workOrders = await api.workOrders.getAll();

    const serializedOrderData = orders.map((order) => ({
        status: order.status,
        id: order.id,
        description: order.description,
    }));

    const serializedWorkOrderData = workOrders.map((workOrder) => ({
        status: workOrder.status,
        id: workOrder.id,
        description: workOrder.description,
    }));

    return (
        <div>
            <h1>Dashboard Page</h1>
            <DashboardTabsClient orders={serializedOrderData} workOrders={serializedWorkOrderData} />
        </div>
    );
}