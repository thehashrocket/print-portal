// ~/app/orders/[id]/page.tsx

"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { notFound } from "next/navigation";
import NoPermission from "~/app/_components/noPermission/noPermission";
import OrderDetails from "~/app/_components/orders/OrderDetailsComponent";
import { Pill } from "~/app/_components/primitives/Pill";
import { RegMark } from "~/app/_components/primitives/RegMark";

export default async function OrderPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const { id } = params;

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
      <div className="page-head">
        <div>
          <div className="page-sub">
            <RegMark />
            &nbsp;
            <span style={{ verticalAlign: "middle" }}>
              {order.Office.Company.name} · Order #{order.orderNumber}
            </span>
          </div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span>Or<em>der</em></span>
            <Pill status={order.status} />
          </h1>
        </div>
      </div>

      <OrderDetails initialOrder={order} orderId={id} />
    </>
  );
}
