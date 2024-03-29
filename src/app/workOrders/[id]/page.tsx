"use server";
import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { WorkOrder } from "@prisma/client";
import WorkOrderItemsTable from "./workOrderItemsTable";
import WorkOrderNotes from "../workOrderNotes";

export default async function WorkOrderPage({
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

  // Fetch work order data
  const workOrder = await api.workOrders.getByID(id);

  const serializedWorkOrderItems = workOrder?.WorkOrderItems.map((workOrderItem) => ({
    ...workOrderItem,
    amount: workOrderItem.amount.toString(),

  }));
  // Render the component
  return (
    <div className="container mx-auto">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-4 text-2xl">Work Order Details</h1>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="mb-2 text-gray-600 text-xl font-semibold">Work Order Number</p>
            <p className="text-lg font-semibold">{workOrder?.workOrderNumber}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="mb-2 text-gray-600 text-xl font-semibold">Office ID</p>
            <p className="text-lg font-semibold">{workOrder?.officeId}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Status</h2>
            <p className="text-lg">{workOrder?.status}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Total</h2>
            <p className="text-lg">$ {workOrder?.totalCost?.toString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Recipient</h2>
            <p className="text-lg">{workOrder?.Office.Company.name}</p>
            <p className="text-lg mb-2">
              {workOrder?.ShippingInfo?.Address?.line1}<br />
              {/* If line2 is not null, then print line 2 */}
              {workOrder?.ShippingInfo?.Address?.line2 && (
                <>{workOrder?.ShippingInfo.Address?.line2}<br /></>
              )}
              {workOrder?.ShippingInfo?.Address?.city}, {workOrder?.ShippingInfo?.Address?.state} {workOrder?.ShippingInfo.Address?.zipCode}<br />
              {workOrder?.ShippingInfo?.Address?.country}
            </p>
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Shipping Method:</h2>
            <p className="text-lg">{workOrder?.ShippingInfo?.shippingMethod}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Telephone Number</h2>
            <p className="text-lg">{workOrder?.ShippingInfo?.Address?.telephoneNumber}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Special Instructions</h2>
            <p className="text-lg mb-2">
              {workOrder?.specialInstructions}<br />
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Notes</h2>
            <WorkOrderNotes notes={workOrder?.WorkOrderNotes} workOrderId={workOrder?.id} />
          </div>
        </div>
        <div className="grid grid-cols-1 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Work Order Items</h2>
            <WorkOrderItemsTable workOrderItems={serializedWorkOrderItems} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Address Type</h2>
            <p className="text-lg">{workOrder?.ShippingInfo?.Address?.addressType}</p>
          </div>

        </div>
        {/* Additional sections for more work order details */}
      </div>
    </div>
  );
}
