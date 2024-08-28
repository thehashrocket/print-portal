// ~/app/_components/workOrders/WorkOrdersClientComponent.tsx
"use client";

import React from "react";
import Link from "next/link";
import WorkOrdersTable from "./workOrdersTable";
import WorkOrderCharts from "./WorkOrderCharts";
import { SerializedWorkOrder } from "~/types/serializedTypes";

interface WorkOrdersClientComponentProps {
    workOrders: SerializedWorkOrder[];
}

const WorkOrdersClientComponent: React.FC<WorkOrdersClientComponentProps> = ({ workOrders }) => {
    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Work Orders</h1>
                    <Link className="btn btn-primary" href="/workOrders/create">
                        Create Work Order
                    </Link>
                </div>
                <nav aria-label="breadcrumb" className="text-sm breadcrumbs">
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li>Work Orders</li>
                    </ul>
                </nav>
            </header>
            <WorkOrderCharts workOrders={workOrders} />
            <main>
                <section className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Work Orders List</h2>
                    <WorkOrdersTable workOrders={workOrders} />
                </section>
            </main>
        </div>
    );
};

export default WorkOrdersClientComponent;