// ~src/app/_components/dashboard/dashboardTabsClient.tsx
"use client";
import React, { useState } from "react";
import DraggableOrderItemsDash from "./draggableOrderItemsDash";
import { SerializedOrder, SerializedOrderItem } from "~/types/serializedTypes";
import DraggableOrdersDash from "./draggableOrdersDash";
import { OrderDashboard } from "~/types/orderDashboard";
// Update the component props to match the actual data being passed
interface DashboardTabsClientProps {
    orderItems: SerializedOrderItem[];
    orders: OrderDashboard[];
}

export default function DashboardTabsClient({ orderItems, orders }: DashboardTabsClientProps) {
    const [activeTab, setActiveTab] = useState("orderItems");

    return (
        <div className="flex flex-col">
            <div role="tablist" className="tabs tabs-bordered tabs-lifted tabs-lg">
                <a
                    className={`tab ${activeTab === "orderItems" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-600"}`}
                    onClick={() => setActiveTab("orderItems")}
                >
                    Items
                </a>
                <a
                    className={`tab ${activeTab === "orders" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-600"}`}
                    onClick={() => setActiveTab("orders")}
                >
                    Orders
                </a>
            </div>
            <div className="flex-grow">
                {activeTab === "orderItems" && (
                    <DraggableOrderItemsDash initialOrderItems={orderItems} />
                )}
                {activeTab === "orders" && (
                    <DraggableOrdersDash initialOrders={orders} />
                )}
            </div>
        </div>
    );
}