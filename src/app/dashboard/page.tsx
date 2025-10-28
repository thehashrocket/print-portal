// ~/
"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import DashboardTabsClient from "../_components/dashboard/dashboardTabsClient";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Link from "next/link";
import NoPermission from "../_components/noPermission/noPermission";
import { formatDate } from "~/utils/formatters";
import { type OrderItemStatus, type OrderStatus } from "@prisma/client";
import { type OrderDashboard } from "~/types/orderDashboard";
import { type OrderItemDashboard } from "~/types/orderItemDashboard";
dayjs.extend(utc);
dayjs.extend(timezone);

export default async function DashboardPage() {
    const session = await getServerAuthSession();

    if (
        !session ||
        session.user.Permissions.map((permission: any) => permission)
            .join(", ")
            .includes("order_read") === false
    ) {
        return (
            <NoPermission />
        )
    }

    const orderItems = await api.orderItems.dashboard().then((items) => {
        return items.sort((a, b) => {
            return new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime();
        });
    });

    const orderDashboard = await api.orders.dashboard();

    const serializedOrderData: OrderDashboard[] = orderDashboard.map((order) => ({
        status: order.status as OrderStatus,
        orderItemStatus: order.OrderItemStatus as OrderItemStatus,
        orderNumber: order.orderNumber,
        purchaseOrderNumber: order.WorkOrder?.purchaseOrderNumber || '',
        id: order.id,
        companyName: order.Office.Company.name,
        inHandsDate: order.inHandsDate ? formatDate(order.inHandsDate) : null,
        deposit: Number(order.deposit),
        orderItems: order.OrderItems,
    }));
    
    const serializedOrderItems: OrderItemDashboard[] = orderItems.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        orderItemNumber: item.orderItemNumber,
        position: item.position,
        totalItems: item.totalItems,
        expectedDate: item.expectedDate,
        status: item.status,
        description: item.description,
        companyName: item.companyName,
        purchaseOrderNumber: item.purchaseOrderNumber,
        orderNumber: item.orderNumber?.toString() || '',
        orderStatus: item.orderStatus,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        amount: item.amount,
        cost: item.cost,
        shippingAmount: item.shippingAmount
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
            <DashboardTabsClient orderItems={serializedOrderItems} orders={serializedOrderData} />
        </div>
    );
}
