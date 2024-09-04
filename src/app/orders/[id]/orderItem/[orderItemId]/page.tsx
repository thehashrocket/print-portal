// This loads a page for a specific order item
// It shows the order number, office name, order item status, and total cost
// It shows the order item details including: amount, approved, artwork, created at, description, expected date, finished quantity, quantity, status, and updated at
// It also shows the breadcrumbs and a link to create a new order

// The page is only accessible to users with the order_read permission
// params: { orderItemId: string };


"use server";
import React from "react";
import NoPermission from "~/app/_components/noPermission/noPremission";
import OrderItemComponent from "~/app/_components/orders/orderItem/orderItemComponent";

import { getServerAuthSession } from "~/server/auth";

export default async function OrderItemPage({
    params: { id, orderItemId },
}: {
    params: { id: string, orderItemId: string };
}) {


    // Fetch user session for authentication
    const session = await getServerAuthSession();

    // Check if user has permission to view the page
    if (!session || !session.user.Permissions.includes("order_read")) {
        return (
            <NoPermission />
        )
    }

    return (
        <OrderItemComponent orderId={id} orderItemId={orderItemId} />
    );
}
