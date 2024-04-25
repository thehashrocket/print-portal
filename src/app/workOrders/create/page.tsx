// A page to create a new work order
"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import ProcessingOptionsTable from "~/app/_components/shared/processingOptionsTable";
import { WorkOrder } from "@prisma/client";
import WorkOrderItemsTable from "../../_components/workOrders/workOrderItemsTable";
import WorkOrderNotesComponent from "../../_components/workOrders/workOrderNotesComponent";
import TypesettingComponent from "~/app/_components/shared/typesetting/typesettingComponent";
import WorkOrderStockComponent from "~/app/_components/workOrders/workOrderStockComponent";

export default async function CreateWorkOrderPage() {
    // Fetch user session for authentication
    const session = await getServerAuthSession();

    // Check if user has permission to view the page
    if (!session || !session.user.Permissions.includes("work_order_create")) {
        return "You do not have permission to view this page";
    }

    // Render the component
    return (
        <div className="container mx-auto">
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h1 className="mb-4 text-2xl text-gray-900">Create Work Order</h1>
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <p className="mb-2 text-gray-600 text-xl font-semibold">Work Order Number</p>
                        <p className="text-lg font-semibold">Work Order Number</p>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <p className="mb-2 text-gray-600 text-xl font-semibold">Office ID</p>
                        <p className="text-lg font-semibold">Office ID</p>
                    </div>
                </div>
            </div>

        </div>
    )

}
