// ~src/app/_components/dashboard/dashboardTabsClient.tsx
"use client";
import React, { useState } from "react";
import DraggableOrderItemsDash from "./draggableOrderItemsDash";
import DraggableOrdersDash from "./draggableOrdersDash";
import { type OrderDashboard } from "~/types/orderDashboard";
import { type OrderItemDashboard } from "~/types/orderItemDashboard";
// Update the component props to match the actual data being passed
interface DashboardTabsClientProps {
    orderItems: OrderItemDashboard[];
    orders: OrderDashboard[];
}

export default function DashboardTabsClient({ orderItems, orders }: DashboardTabsClientProps) {
    const [activeTab, setActiveTab] = useState("orders");

    return (
        <div className="flex flex-col">
            <div role="tablist" className="tabs tabs-bordered tabs-lifted tabs-lg">
                <a
                    className={`tab ${activeTab === "orders" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-600"}`}
                    onClick={() => setActiveTab("orders")}
                >
                    Orders
                </a>
            </div>
            <div className="flex-grow">
                {activeTab === "orders" && (
                    <DraggableOrdersDash initialOrders={orders} />
                )}
            </div>
        </div>
    );
}