"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import DashboardTabsClient from "../_components/dashboard/dashboardTabsClient";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Link from "next/link";

dayjs.extend(utc);
dayjs.extend(timezone);

export default async function DashboardPage() {

    const formatDate = (dateString) => {
        return dayjs(dateString).tz(dayjs.tz.guess()).format('MMMM D, YYYY h:mm A');
    };

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
    const workOrderItems = await api.workOrderItems.getAll();

    const serializedOrderData = orders.map((order) => ({
        status: order.status,
        id: order.id,
        description: order.description,
        expectedDate: formatDate(order.expectedDate),
    }));

    const serializedWorkOrderData = workOrders.map((workOrder) => ({
        status: workOrder.status,
        id: workOrder.id,
        description: workOrder.description,
        expectedDate: formatDate(workOrder.expectedDate),
    }));

    const serializedOrderItemsData = orders.map((order) => ({
        status: order.status,
        id: order.id,
        description: order.description,
        expectedDate: formatDate(order.expectedDate),
    }));


    return (
        <div className="container mx-auto">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">Dashboard</a>
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
            <DashboardTabsClient orders={serializedOrderData} workOrders={serializedWorkOrderData} orderItems={serializedOrderItemsData} />
        </div>
    );
}