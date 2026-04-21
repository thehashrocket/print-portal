"use client";

import React, { useState } from "react";
import Link from "next/link";
import DraggableOrdersDash from "./orders/draggableOrdersDash";
import DraggableOrderItemsDash from "./orderItems/draggableOrderItemsDash";
import OutsourcedOrderItemsDash from "./orderItems/OutsourcedOrderItemsDash";
import { type OrderDashboard } from "~/types/orderDashboard";
import { type OrderItemDashboard } from "~/types/orderItemDashboard";
import { RegMark } from "~/app/_components/primitives/RegMark";
import { CmykRow } from "~/app/_components/primitives/CmykRow";
import { Pill } from "~/app/_components/primitives/Pill";

type Tab = "orders" | "orderItems" | "outsourced";

const TERMINAL = new Set(["Shipping", "Invoiced", "Completed", "Cancelled", "PaymentReceived"]);

interface DashboardTabsClientProps {
  orderItems: OrderItemDashboard[];
  orders: OrderDashboard[];
}

export default function DashboardTabsClient({ orderItems, orders }: DashboardTabsClientProps) {
  const [tab, setTab] = useState<Tab>("orders");

  // Derived stats
  const openOrders = orders.filter((o) => !TERMINAL.has(o.status as string)).length;
  const onPress = orders.filter((o) => (o.orderItemStatus as string) === "Press").length;
  const proofsAwaiting = orders.filter((o) => (o.orderItemStatus as string) === "Prepress").length;
  const overdueProofs = orderItems.filter((i) => (i.status as string) === "Prepress" && new Date(i.expectedDate) < new Date()).length;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <>
      {/* Page head */}
      <div className="page-head">
        <div>
          <div className="page-sub">
            <RegMark />
            &nbsp;
            <span style={{ verticalAlign: "middle" }}>Production · {dateStr}</span>
          </div>
          <h1 className="page-title">
            Dash<em>board</em>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/workOrders/create" className="btn primary">
            + New Work Order
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">
            <span className="uppercase-label">Open Orders</span>
          </div>
          <div className="stat-value">{openOrders}</div>
          <div className="stat-delta">{orders.length} total in dashboard</div>
        </div>

        <div className="stat">
          <div className="stat-label">
            <span className="uppercase-label">On Press Now</span>
            <CmykRow />
          </div>
          <div className="stat-value">{onPress}</div>
          <div className="progress-rail" style={{ marginTop: 12 }}>
            <span style={{ flex: 3, background: "var(--cyan)" }} />
            <span style={{ flex: 2, background: "var(--magenta)" }} />
            <span style={{ flex: 1, background: "var(--yellow)" }} />
            <span style={{ flex: 1, background: "var(--key)" }} />
          </div>
        </div>

        <div className="stat">
          <div className="stat-label">
            <span className="uppercase-label">Proofs Awaiting</span>
            {overdueProofs > 0 && (
              <Pill tone="warn" label={`${overdueProofs} overdue`} dot />
            )}
          </div>
          <div className="stat-value">{proofsAwaiting}</div>
          <div className="stat-delta">Pending client approval</div>
        </div>

        <div className="stat">
          <div className="stat-label">
            <span className="uppercase-label">Active Items</span>
          </div>
          <div className="stat-value">{orderItems.length}</div>
          <div className="stat-delta">Across all open orders</div>
        </div>
      </div>

      {/* Tabs row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="tabs" style={{ flex: 1, marginBottom: 0 }}>
          <button
            className={`tab ${tab === "orders" ? "active" : ""}`}
            onClick={() => setTab("orders")}
          >
            Orders <span className="count">{orders.length}</span>
          </button>
          <button
            className={`tab ${tab === "orderItems" ? "active" : ""}`}
            onClick={() => setTab("orderItems")}
          >
            Order Items <span className="count">{orderItems.length}</span>
          </button>
          <button
            className={`tab ${tab === "outsourced" ? "active" : ""}`}
            onClick={() => setTab("outsourced")}
          >
            Outsourced
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ marginTop: 16 }}>
        {tab === "orders" && <DraggableOrdersDash initialOrders={orders} />}
        {tab === "orderItems" && <DraggableOrderItemsDash initialOrderItems={orderItems} />}
        {tab === "outsourced" && <OutsourcedOrderItemsDash />}
      </div>
    </>
  );
}
