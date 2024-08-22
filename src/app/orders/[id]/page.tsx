// ~/app/orders/[id]/page.tsx

"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import OrderItemsTable from "../../_components/orders/orderItem/orderItemsTable";
import OrderNotesComponent from "~/app/_components/orders/orderNotesComponent";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma, OrderStatus } from "@prisma/client";
import NoPermission from "~/app/_components/noPermission/noPremission";

type Decimal = Prisma.Decimal;

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
    return (
      <NoPermission />
    )
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
    expectedDate: item.expectedDate?.toISOString(),
    updatedAt: item.updatedAt?.toISOString(),
  }));

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatCurrency = (amount: Decimal | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
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
            content={<p className="text-xl">{order.Office.Company.name}</p>}
          />
          <InfoSection
            title="Status"
            content={<StatusBadge status={order.status} />}
          />
          <InfoSection
            title="Total"
            content={<p className="text-2xl font-bold">{formatCurrency(order.totalCost)}</p>}
          />
          <InfoSection
            title="Created By"
            content={<p>{order.createdBy?.name}</p>}
          />
          <InfoSection
            title="Created At"
            content={<p>{formatDate(order.createdAt)}</p>}
          />
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoSection
              title="Recipient"
              content={
                <>
                  <p className="font-semibold">{order.Office.Company.name}</p>
                  <p>{order.ShippingInfo?.Address?.line1}</p>
                  {order.ShippingInfo?.Address?.line2 && <p>{order.ShippingInfo.Address.line2}</p>}
                  <p>{order.ShippingInfo?.Address?.city}, {order.ShippingInfo?.Address?.state} {order.ShippingInfo?.Address?.zipCode}</p>
                </>
              }
            />
            <InfoSection
              title="Shipping Details"
              content={
                <>
                  <p><strong>Method:</strong> {order.ShippingInfo?.shippingMethod}</p>
                  <p><strong>Phone:</strong> {order.ShippingInfo?.Address?.telephoneNumber}</p>
                </>
              }
            />
          </div>
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