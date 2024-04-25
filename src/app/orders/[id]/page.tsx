"use server";
import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import ProcessingOptionsTable from "~/app/_components/shared/processingOptionsTable";
import { Order } from "@prisma/client";
import OrderItemsTable from "../../_components/orders/orderItemsTable";
import OrderNotesComponent from "~/app/_components/orders/orderNotesComponent";
import TypesettingComponent from "~/app/_components/shared/typesetting/typesettingComponent";

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
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Order Details</a>
        </div>
        <div className="flex-none">
          <button className="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
          </button>
        </div>
      </div>
      <div className="rounded-lg bg-white p-6 shadow-md">
        {/* Row 1 */}
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
        {/* Row 2 */}
        {/* Status and Total */}
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
        {/* Row 3 */}
        {/* Shipping Address and Telephone Number */}
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
        {/* Row 4 */}
        {/* Work Order Notes, Special Instructions and Processing Options */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-2 text-gray-600 text-xl font-semibold">Notes</h2>
              <OrderNotesComponent notes={order?.OrderNotes} orderId={order?.id} />
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-2 text-gray-600 text-xl font-semibold">Special Instructions</h2>
              <p className="text-lg mb-2">
                {order?.specialInstructions}<br />
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Processing Options</h2>
            <ProcessingOptionsTable processingOptions={order?.ProcessingOptions} workOrderId={order?.workOrderId} orderId={order?.id} />
          </div>
        </div>
        {/* Row 5 */}
        {/* Typesetting */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Typesetting</h2>
            <TypesettingComponent typesetting={order?.Typesetting} workOrderId={order?.workOrderId} orderId={order?.id} />
          </div>
        </div>
        {/* Row 6 */}
        {/* Order Items  */}
        <div className="grid grid-cols-1 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Order Items</h2>
            <OrderItemsTable orderItems={order?.OrderItems} />
          </div>
        </div>
        {/* Additional sections for more order details */}
      </div>
    </div>
  );
}
