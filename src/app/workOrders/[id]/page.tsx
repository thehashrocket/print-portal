// ~/app/workOrders/[id]/page.tsx

"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import WorkOrderItemsTable from "../../_components/workOrders/workOrderItemsTable";
import WorkOrderNotesComponent from "../../_components/workOrders/workOrderNotesComponent";
import Link from "next/link";
import ConvertWorkOrderButton from "../../_components/workOrders/convertWorkOrderToOrderButton";
import { WorkOrderStatus } from "@prisma/client";

const StatusBadge = ({ status }: { status: WorkOrderStatus }) => {
  const getStatusColor = () => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
      {status}
    </span>
  );
};

const InfoSection = ({ title, content }: { title: string; content: React.ReactNode }) => (
  <section className="mb-6">
    <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
    <div className="bg-gray-50 p-4 rounded-lg">{content}</div>
  </section>
);

export default async function WorkOrderPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerAuthSession();

  if (!session?.user.Permissions.includes("work_order_read")) {
    throw new Error("You do not have permission to view this page");
  }

  const workOrder = await api.workOrders.getByID(id);

  if (!workOrder) {
    throw new Error("Work Order not found");
  }

  const serializedWorkOrderItems = workOrder.WorkOrderItems.map((item) => ({
    amount: item.amount?.toString(),
    cost: item.cost?.toString(),
    description: item.description,
    finishedQty: (item.finishedQty || 0),
    id: item.id,
    quantity: item.quantity.toString(),
    status: item.status,
    workOrderId: item.workOrderId,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Work Order Details</h1>
          <div className="space-x-2">
            <ConvertWorkOrderButton workOrderId={id} officeId={workOrder.Office.id} />
            <Link className="btn btn-primary" href="/workOrders/create">Create a Work Order</Link>
          </div>
        </div>
        <nav aria-label="breadcrumb" className="text-sm breadcrumbs">
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/workOrders">Work Orders</Link></li>
            <li>Work Order {workOrder.workOrderNumber}</li>
          </ul>
        </nav>
      </header>

      <main className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <InfoSection
            title="Work Order Number"
            content={<p className="text-2xl font-bold">{workOrder.workOrderNumber}</p>}
          />
          <InfoSection
            title="Office Name"
            content={<p className="text-2xl">{workOrder.Office.Company.name}</p>}
          />
          <InfoSection
            title="Work Order Status"
            content={<StatusBadge status={workOrder.status} />}
          />
          <InfoSection
            title="Total"
            content={<p className="text-2xl font-bold">${workOrder.totalCost?.toString()}</p>}
          />
          <InfoSection
            title="Created By"
            content={<p>{workOrder.createdBy?.name}</p>}
          />
          <InfoSection
            title="Created At"
            content={<p>{new Date(workOrder.createdAt).toLocaleString()}</p>}
          />
        </div>

        <InfoSection
          title="Shipping Information"
          content={
            <div>
              <p className="font-semibold mb-2">{workOrder.Office.Company.name}</p>
              <p>{workOrder.ShippingInfo?.Address?.line1}</p>
              {workOrder.ShippingInfo?.Address?.line2 && <p>{workOrder.ShippingInfo.Address.line2}</p>}
              <p>{workOrder.ShippingInfo?.Address?.city}, {workOrder.ShippingInfo?.Address?.state} {workOrder.ShippingInfo?.Address?.zipCode}</p>
              <p>{workOrder.ShippingInfo?.Address?.country}</p>
              <p className="mt-2"><strong>Shipping Method:</strong> {workOrder.ShippingInfo?.shippingMethod}</p>
              <p><strong>Telephone:</strong> {workOrder.ShippingInfo?.Address?.telephoneNumber}</p>
            </div>
          }
        />

        <div className="grid md:grid-cols-2 gap-6">
          <InfoSection
            title="Notes"
            content={<WorkOrderNotesComponent workOrder={workOrder} />}
          />
          <InfoSection
            title="Special Instructions"
            content={<p>{workOrder.specialInstructions || "No special instructions"}</p>}
          />
        </div>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Work Order Items</h2>
            <Link className="btn btn-primary" href={`/workOrders/create/${workOrder.id}`}>
              Add Work Order Item
            </Link>
          </div>
          <WorkOrderItemsTable workOrderItems={serializedWorkOrderItems} />
        </section>
      </main>
    </div>
  );
}
