// ~/app/workOrders/create/page.tsx
// A page to create a new work order
"use server";

import React from "react";
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import CreateWorkOrderComponent from "~/app/_components/workOrders/create/createWorkOrderComponent";
import NoPermission from "~/app/_components/noPermission/noPremission";


export default async function CreateWorkOrderPage() {
    // Fetch user session for authentication
    const session = await getServerAuthSession();

    // Check if user has permission to view the page
    if (!session || !session.user.Permissions.includes("work_order_create")) {
        return (
            <NoPermission />
        )
    }

    // Render the component
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">Work Orders</a>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link> </li>
                            <li><Link href="/workOrders">Work Orders</Link></li>
                            <li><Link href="/workOrders/create">Create Work Order</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="flex-none">
                    <Link className="btn btn-sm btn-primary" href="/workOrders/create">Create a Work Order</Link>
                </div>
            </div>
            <div className="flex justify-center">
                <div className="steps">
                    <div className={`step step-primary`}>
                        Basic Information
                    </div>
                    <div className={`step`}>
                        Shipping Information
                    </div>
                    <div className={`step`}>
                        Work Order Jobs
                    </div>
                </div>
            </div>
            <CreateWorkOrderComponent />
        </div>
    )
}
