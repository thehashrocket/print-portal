"use server";
import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { WorkOrder } from "@prisma/client";

export default async function WorkOrderPage({
    params: { id },
}: {
    params: { id: string };
}) {
    // Fetch user session for authentication
    const session = await getServerAuthSession();

    // Check if user has permission to view the page
    if (!session || !session.user.permissions.includes("work_order_read")) {
        return "You do not have permission to view this page";
    }

    // Fetch work order data
    const workOrder = await api.workOrders.getByID(id);

    // Render the component
    return (
        <div className="container mx-auto">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-4">Work Order Details</h1>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600 mb-2">Work Order Number</p>
                        <p className="text-lg font-semibold">{workOrder.workOrderNumber}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 mb-2">Office ID</p>
                        <p className="text-lg font-semibold">{workOrder.officeId}</p>
                    </div>
                    {/* Add more work order details here */}
                </div>
                {/* Additional sections for more work order details */}
            </div>
        </div>
    );
}
