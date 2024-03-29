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

  // loop through order.ShippingInfo and order.ShippingInfo.Address
  // console log the values

  // Check if order.ShippingInfo is an array before looping through it
  if (Array.isArray(order?.ShippingInfo)) {
    // loop through order.ShippingInfo and order.ShippingInfo.Address
    order?.ShippingInfo.forEach((shippingInfo) => {
      console.log('console log shippingInfo', shippingInfo);
      console.log('console log shippingInfo.Address', shippingInfo?.Address);
      // Now you can safely access shippingInfo.Address
    });
  }


  // Render the component
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
        <div className="grid grid-cols-2 gap-4">
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
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Shipping Method</h2>
            <p className="text-lg">{order?.ShippingInfo.shippingMethod}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-2 text-gray-600 text-xl font-semibold">Processing Options</h2>
              <ul>
                {order?.ProcessingOptions.map((processingOption) => (
                  <li key={processingOption.id}>{processingOption.name}</li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-2 text-gray-600 text-xl font-semibold">Order Items</h2>
              <OrderItemsTable orderItems={order?.OrderItems} />
            </div>
          </div>

        </div>
        {/* Additional sections for more order details */}
      </div>
    </div>
  );
}
