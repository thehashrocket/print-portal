// ~/app/workOrders/[id]/page.tsx

"use server";
import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import WorkOrderItemsTable from "../../_components/workOrders/workOrderItemsTable";
import WorkOrderNotesComponent from "../../_components/workOrders/workOrderNotesComponent";
import Link from "next/link";
import ConvertWorkOrderButton from "../../_components/workOrders/convertWorkOrderToOrderButton";

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
    amount: workOrderItem?.amount?.toString(),
    cost: workOrderItem?.cost?.toString(),
    costPerM: workOrderItem?.costPerM?.toString(),
    createdAt: workOrderItem?.createdAt?.toString(),
    expectedDate: workOrderItem?.expectedDate?.toString(),
    updatedAt: workOrderItem?.updatedAt?.toString(),
  }));

  // Render the component
  return (
    <div className="container mx-auto">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Work Order Details</a>
          <div className="text-sm breadcrumbs">
            <ul>
              <li><Link href="/">Home</Link> </li>
              <li><Link href="/workOrders">Work Orders</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex-none">
          <Link className="btn btn-sm btn-primary" href="/workOrders/create">Create a Work Order</Link>
        </div>
      </div>
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <ConvertWorkOrderButton workOrderId={id} officeId={workOrder?.Office.id} />
          </div>
        </div>
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="mb-2 text-gray-600 text-xl font-semibold">Work Order Number</p>
            <p className="text-lg font-semibold">{workOrder?.workOrderNumber}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="mb-2 text-gray-600 text-xl font-semibold">Office Name</p>
            <p className="text-lg font-semibold">{workOrder?.Office.Company.name}</p>
          </div>
        </div>
        {/* Row 2 */}
        {/* Status and Total */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Work Order Status</h2>
            <p className="text-lg">{workOrder?.status}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Total</h2>
            <p className="text-lg">$ {workOrder?.totalCost?.toString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="mb-2 text-gray-600 text-xl font-semibold">Created By</p>
            <p className="text-lg">{workOrder?.createdBy?.name}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="mb-2 text-gray-600 text-xl font-semibold">Created At</p>
            <p className="text-lg">{workOrder?.createdAt?.toString()}</p>
          </div>
        </div>
        {/* Row 3 */}
        {/* Shipping Address and Telephone Number */}
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
              {workOrder?.ShippingInfo?.Address?.city}, {workOrder?.ShippingInfo?.Address?.state} {workOrder?.ShippingInfo?.Address?.zipCode}<br />
              {workOrder?.ShippingInfo?.Address?.country}
            </p>
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Shipping Method</h2>
            <p className="text-lg">{workOrder?.ShippingInfo?.shippingMethod}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Telephone Number</h2>
            <p className="text-lg">{workOrder?.ShippingInfo?.Address?.telephoneNumber}</p>
          </div>
        </div>
        {/* Row 4 */}
        {/* Work Order Notes, Special Instructions and Processing Options */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Notes</h2>
            <WorkOrderNotesComponent notes={workOrder?.WorkOrderNotes} workOrderId={workOrder?.id} />
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Special Instructions</h2>
            <p className="text-lg mb-2">
              {workOrder?.specialInstructions}<br />
            </p>
          </div>
        </div>
        {/* Row 6 */}
        {/* Work Order Items */}
        <div className="grid grid-cols-1 mb-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <h2 className="mb-2 text-gray-600 text-xl font-semibold">Work Order Items</h2>
              <Link className="btn btn-primary" href={`/workOrders/create/${workOrder?.id}`}>
                Add Work Order Item
              </Link>
            </div>
            <WorkOrderItemsTable workOrderItems={serializedWorkOrderItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
