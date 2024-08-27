"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import DashboardTabsClient from "../_components/dashboard/dashboardTabsClient";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Link from "next/link";
import { SerializedOrderItem } from "~/types/serializedTypes";
import NoPermission from "../_components/noPermission/noPremission";

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

    const formatDate = (dateString: string | Date) => {
        return dayjs(dateString).tz(dayjs.tz.guess()).format('MMMM D, YYYY h:mm A');
    };

    const orderItems = await api.orderItems.getAll();

    const serializedOrderItemsData: SerializedOrderItem[] = orderItems.map((item: any) => ({
        ...item,
        prepTime: item.prepTime ?? null,
        size: item.size ?? null,
        specialInstructions: item.specialInstructions ?? null,
        OrderItemStock: item.OrderItemStock ?? [],
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        expectedDate: item.expectedDate?.toISOString() ?? null,
        artwork: item.artwork.map((art: any) => ({
            ...art,
            createdAt: art.createdAt.toISOString(),
            updatedAt: art.updatedAt.toISOString(),
        })),
    }));

    return (
        <div className="container mx-auto px-4 py-8">
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
            <DashboardTabsClient orderItems={serializedOrderItemsData} />
        </div>
    );
}