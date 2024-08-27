// ~/app/orders/[id]/page.tsx

"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import OrderItemsTable from "../../_components/orders/orderItem/orderItemsTable";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma, OrderStatus, ShippingMethod } from "@prisma/client";
import NoPermission from "~/app/_components/noPermission/noPremission";

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const getStatusColor = () => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };
  return (
    <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
      {status}
    </span>
  );
};

const InfoSection = ({ title, content }: { title: string; content: React.ReactNode }) => (
  <section className="bg-white p-4 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
    <div>{content}</div>
  </section>
);

export default async function OrderPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerAuthSession();

  if (!session?.user.Permissions.includes("work_order_read")) {
    return <NoPermission />;
  }

  const order = await api.orders.getByID(id);

  if (!order) {
    notFound();
  }

  const serializedOrderItems = order.OrderItems.map((item) => ({
    ...item,
    amount: item.amount?.toString() ?? null,
    cost: item.cost?.toString() ?? null,
    createdAt: item.createdAt?.toString(),
    expectedDate: item.expectedDate?.toString(),
    updatedAt: item.updatedAt?.toString(),
  }));

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount: string | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
  };

  const formatShippingMethod = (method: ShippingMethod) => {
    return method.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <Link className="btn btn-primary" href="/orders/create">Create Order</Link>
        </div>
        <nav aria-label="breadcrumb" className="text-sm breadcrumbs">
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/orders">Orders</Link></li>
            <li>Order {order.orderNumber}</li>
          </ul>
        </nav>
      </header>

      <main className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <InfoSection
            title="Order Number"
            content={<p className="text-2xl font-bold">{order.orderNumber}</p>}
          />
          <InfoSection
            title="Company"
            content={<p className="text-xl">{order.Office?.Company.name}</p>}
          />
          <InfoSection
            title="Status"
            content={<StatusBadge status={order.status} />}
          />
          <InfoSection
            title="Order Price Details"
            content={
              <div>
                <p><strong>Item Total:</strong> {formatCurrency(order.totalItemAmount)}</p>
                <p><strong>Shipping Amount: </strong>{formatCurrency(order.totalShippingAmount)}</p>
                <p><strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}</p>
                <p><strong>Deposit:</strong> {formatCurrency(order.deposit)}</p>
              </div>
            }
          />
          <InfoSection
            title="Created By"
            content={<p>{order.createdBy?.name}</p>}
          />
          <InfoSection
            title="Created At"
            content={<p>{formatDate(order.createdAt)}</p>}
          />
          <InfoSection
            title="Contact Person"
            content={<p>{order.contactPerson?.name}</p>}
          />
          <InfoSection
            title="In Hands Date"
            content={<p>{formatDate(order.inHandsDate)}</p>}
          />
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoSection
              title="Recipient"
              content={
                <>
                  <p className="font-semibold">{order.ShippingInfo?.attentionTo || order.Office?.Company.name}</p>
                  <p>{order.ShippingInfo?.Address?.line1}</p>
                  {order.ShippingInfo?.Address?.line2 && <p>{order.ShippingInfo.Address.line2}</p>}
                  <p>{order.ShippingInfo?.Address?.city}, {order.ShippingInfo?.Address?.state} {order.ShippingInfo?.Address?.zipCode}</p>
                  <p>{order.ShippingInfo?.Address?.country}</p>
                </>
              }
            />
            <InfoSection
              title="Shipping Details"
              content={
                <>
                  <p><strong>Method:</strong> {order.ShippingInfo ? formatShippingMethod(order.ShippingInfo.shippingMethod) : 'N/A'}</p>
                  <p><strong>Phone:</strong> {order.ShippingInfo?.Address?.telephoneNumber || 'N/A'}</p>
                  <p><strong>Cost:</strong> {formatCurrency(order.ShippingInfo?.shippingCost)}</p>
                  <p><strong>Date:</strong> {formatDate(order.ShippingInfo?.shippingDate ?? null)}</p>
                  <p><strong>Estimated Delivery:</strong> {formatDate(order.ShippingInfo?.estimatedDelivery ?? null)}</p>
                  <p><strong>Number of Packages:</strong> {order.ShippingInfo?.numberOfPackages || 'N/A'}</p>
                  <p><strong>Tracking Number:</strong> {order.ShippingInfo?.trackingNumber || 'N/A'}</p>
                </>
              }
            />
          </div>
          {order.ShippingInfo?.ShippingPickup && (
            <div className="mt-4">
              <InfoSection
                title="Pickup Information"
                content={
                  <>
                    <p><strong>Date:</strong> {formatDate(order.ShippingInfo.ShippingPickup.pickupDate)}</p>
                    <p><strong>Time:</strong> {order.ShippingInfo.ShippingPickup.pickupTime}</p>
                    <p><strong>Contact:</strong> {order.ShippingInfo.ShippingPickup.contactName}</p>
                    <p><strong>Phone:</strong> {order.ShippingInfo.ShippingPickup.contactPhone}</p>
                    {order.ShippingInfo.ShippingPickup.notes && (
                      <p><strong>Notes:</strong> {order.ShippingInfo.ShippingPickup.notes}</p>
                    )}
                  </>
                }
              />
            </div>
          )}
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Order Items</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <OrderItemsTable orderItems={serializedOrderItems} />
          </div>
        </section>
      </main>
    </div>
  );
}