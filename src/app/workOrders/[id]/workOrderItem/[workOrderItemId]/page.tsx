// This loads a page for a specific work order item
// It shows the work order number, office name, work order item status, and total cost
// It shows the work order item details including: amount, approved, artwork, created at, description, expected date, finished quantity, quantity, status, and updated at
// It also shows the breadcrumbs and a link to create a new work order

// The page is only accessible to users with the order_read permission
// params: { workOrderItemId: string };

"use server";
import React from "react";
import WorkOrderItemComponent from "~/app/_components/workOrders/workOrderItem/workOrderItemComponent";
import { getServerAuthSession } from "~/server/auth";

export default async function WorkOrderItemPage(
    props: {
        params: Promise<{ id: string, workOrderItemId: string }>;
    }
) {
    const params = await props.params;

    const {
        id,
        workOrderItemId
    } = params;

    const session = await getServerAuthSession();

    if (!session || !session.user.Permissions.includes("order_read")) {
        return "You do not have permission to view this page";
    }

    return (
        <>
            <WorkOrderItemComponent workOrderId={id} workOrderItemId={workOrderItemId} />
        </>
    );
}