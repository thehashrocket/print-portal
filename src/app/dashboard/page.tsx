"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import DraggableOrdersDash from "../_components/dashboard/draggableOrdersDash";
import { Order } from "@prisma/client";

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
    const serializedData = orders.map((order) => ({
        status: order.status,
        id: order.id,
        description: order.description,
    }));

    console.log('serializedData', serializedData);


    return (
        <div>
            <h1>Dashboard Page</h1>
            <DraggableOrdersDash initialOrders={serializedData} />
        </div>
    );
}