"use server";
import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import WorkOrderWizard from "~/app/_components/workOrders/create/workOrderWizard";
import { WorkOrderProvider } from "~/app/contexts/workOrderContext";
import NoPermission from "~/app/_components/noPermission/noPermission";


export default async function Page({
    params: { id },
}: {
    params: { id: string };
}) {
    // Fetch user session for authentication
    const session = await getServerAuthSession();
    // Check if user has permission to view the page
    if (!session || !session.user.Permissions.includes("work_order_read")) {
        return (
            <NoPermission />
        )
    }

    // Render the component
    return (
        <div className="container mx-auto px-4 py-8">
            <WorkOrderProvider>
                <WorkOrderWizard workOrderId={id} />
            </WorkOrderProvider>
        </div>
    );
}
