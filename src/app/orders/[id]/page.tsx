"use server";
import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { Order } from "@prisma/client";
import OrderItemsTable from "./orderItemsTable";

export default async function OrderPage({
  params: { id },
}: {
  params: { id: string };
}) {
  // Fetch user session for authentication
  const session = await getServerAuthSession();

  // Check if user has permission to view the page
  if (!session || !session.user.Permissions.includes("work_order_read")) {
    return "You do not have permission to view this page";
  }

  // Fetch order data
  const order = await api.orders.getByID(id);
  console.log('console log order', order);

  return (
    <div className="container mx-auto">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-4 text-2xl">Order Details</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="mb-2 text-gray-600 text-xl font-semibold">Order Number</p>
            <p className="text-lg">{order?.orderNumber}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="mb-2 text-gray-600 text-xl font-semibold">Office ID</p>
            <p className="text-lg">{order?.officeId}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Order Status</h2>
            <p className="text-lg">{order?.status}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Total</h2>
            <p className="text-lg">$ {order?.totalCost?.toString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Recipient</h2>
            <p className="text-lg">{order?.Office.Company.name}</p>
            <p className="text-lg">
              {order?.ShippingInfo.Address?.line1}<br />
              {/* If line2 is not null, then print line 2 */}
              {order?.ShippingInfo.Address?.line2 && (
                <>{order?.ShippingInfo.Address?.line2}<br /></>
              )}
              {order?.ShippingInfo.Address?.city}, {order?.ShippingInfo.Address?.state} {order?.ShippingInfo.Address?.zipCode}<br />
            </p>
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Shipping Method</h2>
            <p className="text-lg">{order?.ShippingInfo.shippingMethod}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Telephone Number</h2>
            <p className="text-lg">{order?.ShippingInfo?.Address?.telephoneNumber}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Special Instructions</h2>
            <p className="text-lg mb-2">
              {order?.specialInstructions}<br />
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Notes</h2>
            <p className="text-lg">{order?.ShippingInfo?.Address?.telephoneNumber}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Order Items</h2>
            <OrderItemsTable orderItems={order?.OrderItems} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Processing Options</h2>
            <ul>
              {order?.ProcessingOptions.map((processingOption) => (
                <li key={processingOption.id}>{processingOption.name}</li>
              ))}
            </ul>
          </div>

        </div>
        {/* Additional sections for more order details */}
      </div>
    </div>
  );
}
