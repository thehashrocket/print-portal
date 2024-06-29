"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import OrderItemsTable from "../../_components/orders/orderItem/orderItemsTable";
import OrderNotesComponent from "~/app/_components/orders/orderNotesComponent";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";

type Decimal = Prisma.Decimal;

const InfoCard = ({ title, content }: { title: string; content: React.ReactNode }) => (
  <div className="rounded-lg bg-white p-4 shadow-md">
    <h2 className="mb-2 text-gray-600 text-lg font-semibold">{title}</h2>
    <div className="text-base">{content}</div>
  </div>
);

export default async function OrderPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerAuthSession();

  if (!session?.user.Permissions.includes("work_order_read")) {
    throw new Error("You do not have permission to view this page");
  }

  const order = await api.orders.getByID(id);

  if (!order) {
    notFound();
  }

  const serializedOrderItems = order.OrderItems.map((item) => ({
    ...item,
    amount: item.amount?.toString() ?? null,
    cost: item.cost?.toString() ?? null,
    createdAt: item.createdAt?.toISOString(),
    description: item.description,
    expectedDate: item.expectedDate?.toISOString(),
    finishedQty: item.finishedQty,
    id: item.id,
    orderId: item.orderId,
    quantity: item.quantity,
    status: item.status,
    updatedAt: item.updatedAt?.toISOString(),
  }));

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatCurrency = (amount: Decimal | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount.toNumber());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order Details</h1>
          <div className="text-sm breadcrumbs">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/orders">Orders</Link></li>
              <li>Order {order.orderNumber}</li>
            </ul>
          </div>
        </div>
        <Link className="btn btn-primary" href="/orders/create">Create Order</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard title="Order Number" content={order.orderNumber} />
        <InfoCard title="Company" content={order.Office.Company.name} />
        <InfoCard title="Status" content={
          <span className={`px-2 py-1 rounded ${order.status === 'Completed' ? 'bg-green-200 text-green-800' :
            order.status === 'Cancelled' ? 'bg-red-200 text-red-800' :
              'bg-blue-200 text-blue-800'
            }`}>
            {order.status}
          </span>
        } />
        <InfoCard title="Total" content={formatCurrency(order.totalCost)} />
        <InfoCard title="Created By" content={order.createdBy?.name} />
        <InfoCard title="Created At" content={formatDate(order.createdAt)} />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <InfoCard title="Recipient" content={
            <>
              <p>{order.Office.Company.name}</p>
              <p>{order.ShippingInfo?.Address?.line1}</p>
              {order.ShippingInfo?.Address?.line2 && <p>{order.ShippingInfo?.Address.line2}</p>}
              <p>{order.ShippingInfo?.Address?.city}, {order.ShippingInfo?.Address?.state} {order.ShippingInfo?.Address?.zipCode}</p>
            </>
          } />
          <InfoCard title="Shipping Details" content={
            <>
              <p><strong>Method:</strong> {order.ShippingInfo?.shippingMethod}</p>
              <p><strong>Phone:</strong> {order.ShippingInfo?.Address?.telephoneNumber}</p>
            </>
          } />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Notes & Instructions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <InfoCard title="Order Notes" content={
            <OrderNotesComponent notes={order.OrderNotes} orderId={order.id} />
          } />
          <InfoCard title="Special Instructions" content={order.specialInstructions || 'No special instructions'} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Order Items</h2>
        <OrderItemsTable orderItems={serializedOrderItems} />
      </div>
    </div>
  );
}