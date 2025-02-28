// ~src/app/_components/dashboard/dashboardTabsClient.tsx
"use client";
import React, { useState } from "react";
import DraggableOrderItemsDash from "./orderItems/draggableOrderItemsDash";
import DraggableOrdersDash from "./orders/draggableOrdersDash";
import { type OrderDashboard } from "~/types/orderDashboard";
import { type OrderItemDashboard } from "~/types/orderItemDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/app/_components/ui/tabs";
import OutsourcedOrderItemsDash from "./orderItems/OutsourcedOrderItemsDash";

interface DashboardTabsClientProps {
    orderItems: OrderItemDashboard[];
    orders: OrderDashboard[];
    outsourcedOrderItems: OrderItemDashboard[];
}

export default function DashboardTabsClient({ orderItems, orders }: DashboardTabsClientProps) {
    const [activeTab, setActiveTab] = useState("orders");

    return (
        <div className="flex flex-col">
            <Tabs defaultValue="orders" className="grow">
                <TabsList>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="orderItems">Order Items</TabsTrigger>
                    <TabsTrigger value="outsourcedOrderItems">Outsourced Order Items</TabsTrigger>
                </TabsList>

                <TabsContent value="orders">
                    <DraggableOrdersDash initialOrders={orders} />
                </TabsContent>
                <TabsContent value="orderItems">
                    <DraggableOrderItemsDash initialOrderItems={orderItems} />
                </TabsContent>
                <TabsContent value="outsourcedOrderItems">
                    <OutsourcedOrderItemsDash />
                </TabsContent>
            </Tabs>
        </div>
    );
}