// ~src/app/_components/dashboard/dashboardTabsClient.tsx
"use client";
import React, { useState } from "react";
import DraggableOrderItemsDash from "./draggableOrderItemsDash";
import { type SerializedOrderItem } from "~/types/serializedTypes";

// Update the component props to match the actual data being passed
interface DashboardTabsClientProps {
    orderItems: SerializedOrderItem[];
}

export default function DashboardTabsClient({ orderItems }: DashboardTabsClientProps) {
    const [activeTab, setActiveTab] = useState("orderItems");

    return (
        <div className="flex flex-col">
            <div role="tablist" className="tabs tabs-bordered tabs-lifted tabs-lg">
                <a
                    className={`tab ${activeTab === "orderItems" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-600"}`}
                    onClick={() => setActiveTab("orderItems")}
                >
                    Jobs
                </a>
            </div>
            <div className="flex-grow">
                {activeTab === "orderItems" && (
                    <DraggableOrderItemsDash initialOrderItems={orderItems} />
                )}
            </div>
        </div>
    );
}