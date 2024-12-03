// ~/app/orders/[id]/page.tsx

"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { notFound } from "next/navigation";
import NoPermission from "~/app/_components/noPermission/noPermission";
import OrderDetails from "~/app/_components/orders/OrderDetailsComponent";

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

  return (
    <>
      <OrderDetails initialOrder={order || null} orderId={id} />
    </>
  );
}