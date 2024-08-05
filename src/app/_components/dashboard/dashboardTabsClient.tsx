"use client";
import React, { useState } from "react";
import DraggableOrdersDash from "./draggableOrdersDash";
import DraggableWorkOrdersDash from "./draggableWorkOrdersDash";
import DraggableOrderItemsDash from "./draggableOrderItemsDash";

export default function DashboardTabsClient({ orders, workOrders, orderItems }) {
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
                <a
                    className={`tab ${activeTab === "workOrders" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-600"}`}
                    onClick={() => setActiveTab("workOrders")}
                >
                    Work Orders
                </a>
                <a
                    className={`tab ${activeTab === "orderItems" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-600"}`}
                    onClick={() => setActiveTab("orderItems")}
                >
                    Jobs
                </a>
            </div>
            <div className="flex-grow">
                {activeTab === "orders" && (
                    <DraggableOrdersDash initialOrders={orders} />
                )}
                {activeTab === "workOrders" && (
                    <DraggableWorkOrdersDash initialWorkOrders={workOrders} />
                )}
                {activeTab === "orderItems" && (
                    <DraggableOrderItemsDash initialOrderItems={orderItems} />
                )}
            </div>
        </div>
    );
}