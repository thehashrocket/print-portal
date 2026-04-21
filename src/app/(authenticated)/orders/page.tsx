import React from "react";
import Link from "next/link";
import OrdersTable from "~/app/_components/orders/ordersTable";
import { RegMark } from "~/app/_components/primitives/RegMark";

export default async function OrdersPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">
            <RegMark />
            &nbsp;
            <span style={{ verticalAlign: "middle" }}>Production</span>
          </div>
          <h1 className="page-title">
            Or<em>ders</em>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/workOrders/create" className="btn primary">
            + New Work Order
          </Link>
        </div>
      </div>

      <OrdersTable />
    </>
  );
}
