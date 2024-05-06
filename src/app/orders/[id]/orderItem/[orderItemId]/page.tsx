// This loads a page for a specific order item
// It shows the order number, office name, order status, and total cost
// It shows the order item details including: amount, approved, artwork, created at, description, expected date, finished quantity, quantity, status, and updated at
// It also shows the breadcrumbs and a link to create a new order

// The page is only accessible to users with the order_read permission
// params: { orderItemId: string };


"use server";
import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { Order } from "@prisma/client";
import { OrderItem } from "@prisma/client";
import Link from "next/link";
import TypesettingComponent from "~/app/_components/shared/typesetting/typesettingComponent";
import ProcessingOptionsTable from "~/app/_components/shared/processingOptionsTable";
import { create } from "domain";
import ProcessingOptionsComponent from "~/app/_components/shared/processingOptions/processingOptionsComponent";

export default async function OrderItemPage({
    params: { id, orderItemId },
}: {
    params: { id: string, orderItemId: string };
}) {

    console.log('id', id)
    // console log all the params
    console.log('orderItemId', orderItemId)
    // Fetch user session for authentication
    const session = await getServerAuthSession();

    // Check if user has permission to view the page
    if (!session || !session.user.Permissions.includes("order_read")) {
        return "You do not have permission to view this page";
    }

    // Fetch order item data
    const order = await api.orders.getByID(id);
    const orderItem = await api.orderItems.getByID(orderItemId);
    // Take orderItem.Typesetting and it's children, serialize them, and pass them to the TypesettingComponent

    const serializedTypesetting = orderItem?.Typesetting.map((type) => {
        // serialize the TypesettingOptions
        const typesettingOptions = type.TypesettingOptions.map((option) => {
            return {
                ...option,
                createdAt: option.createdAt?.toISOString(),
                updatedAt: option.updatedAt?.toISOString(),

            };
        });

        const typesettingProofs = type.TypesettingProofs.map((proof) => {
            return {
                ...proof,
                dateSubmitted: proof.dateSubmitted?.toISOString(),
                createdAt: proof.createdAt?.toISOString(),
                updatedAt: proof.updatedAt?.toISOString(),
            };
        });

        return {
            ...type,
            cost: type.cost?.toString(),
            dateIn: type.dateIn.toISOString(),
            TypesettingProofs: typesettingProofs,
            TypesettingOptions: typesettingOptions,
        };
    });

    return (
        <div className="container mx-auto">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">Order Item Details</a>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/orders">Orders</Link></li>
                            <li><Link href={`/orders/${orderItem?.Order?.id}`}>Order {orderItem?.Order?.orderNumber}</Link></li>
                            <li>Order Item {orderItem?.id}</li>
                        </ul>
                    </div>
                </div>
                <div className="flex-none">
                    <Link className="btn btn-sm btn-primary" href="/orders/create">Create Order</Link>
                </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <p className="mb-2 text-gray-600 text-xl font-semibold">Order Number</p>
                        <p className="text-gray-800 text-lg font-semibold">{order?.orderNumber}</p>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <p className="mb-2 text-gray-600 text-xl font-semibold">Office Name</p>
                        <p className="text-gray-800 text-lg font-semibold">{order?.Office?.name}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Typesetting</h2>
                        <TypesettingComponent typesetting={serializedTypesetting} />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Processing Options</h2>
                        <ProcessingOptionsComponent processingOptions={orderItem?.ProcessingOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
}
