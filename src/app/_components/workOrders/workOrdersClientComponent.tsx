// ~/app/_components/workOrders/WorkOrdersClientComponent.tsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import WorkOrdersTable from "./workOrdersTable";
import WorkOrderCharts from "./WorkOrderCharts";
import { api } from "~/trpc/react";
import { SerializedWorkOrder } from "~/types/serializedTypes";


const WorkOrdersClientComponent: React.FC = () => {
    // const { data: workOrders, isLoading, isError } = api.workOrders.getAll.useQuery();


    // if (isLoading) {
    //     return (
    //         <div className="flex justify-center items-center h-screen">
    //             <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    //         </div>
    //     );
    // }

    // if (isError || !workOrders) {
    //     return (
    //         <div className="flex justify-center items-center h-screen">
    //             <div className="text-red-500 text-xl">Error loading Work Orders. Please try again.</div>
    //         </div>
    //     );
    // }

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
            {/* <WorkOrderCharts workOrders={workOrders} /> */}
            <main>
                <section className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Work Orders List</h2>
                    <WorkOrdersTable />
                </section>
            </main>
        </div>
    );
};

export default WorkOrdersClientComponent;