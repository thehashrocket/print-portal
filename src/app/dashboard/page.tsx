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
import { type SerializedOrderItem } from "~/types/serializedTypes";
import NoPermission from "../_components/noPermission/noPermission";
import { Button } from "../_components/ui/button";

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

    const orderItems = await api.orderItems.getAll().then((items) => {
        return items.sort((a, b) => {
            return new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime();
        });
    });

    const serializedOrderItemsData: SerializedOrderItem[] = orderItems.map((item: any) => ({
        ...item,
        amount: item.amount ? item.amount.toString() : null,
        cost: item.cost ? item.cost.toString() : null,
        shippingAmount: item.shippingAmount ? item.shippingAmount.toString() : null,
        prepTime: item.prepTime ?? null,
        size: item.size ?? null,
        specialInstructions: item.specialInstructions ?? null,
        OrderItemStock: item.OrderItemStock ?? [],
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        expectedDate: item.expectedDate?.toISOString() ?? null,
        Typesetting: item.Typesetting?.map((typesetting: any) => ({
            ...typesetting,
            cost: typesetting.cost ? typesetting.cost.toString() : null,
            createdAt: typesetting.createdAt.toISOString(),
            updatedAt: typesetting.updatedAt.toISOString(),
            dateIn: typesetting.dateIn.toISOString(),
            TypesettingOptions: typesetting.TypesettingOptions ?? [],
            TypesettingProofs: typesetting.TypesettingProofs ?? []
        })) ?? [],
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
                    <Button
                        variant="ghost"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                    </Button>
                </div>
            </div>
            <DashboardTabsClient orderItems={serializedOrderItemsData} />
        </div>
    );
}