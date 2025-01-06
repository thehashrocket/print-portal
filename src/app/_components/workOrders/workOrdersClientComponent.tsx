// ~/app/_components/workOrders/WorkOrdersClientComponent.tsx
"use client";

import React from "react";
import Link from "next/link";
import WorkOrdersTable from "./workOrdersTable";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";


const WorkOrdersClientComponent: React.FC = () => {

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Estimates</h1>
                    <Link href="/workOrders/create">
                        <Button
                            variant="default"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Create Estimate
                        </Button>
                    </Link>
                </div>
                <nav aria-label="breadcrumb" className="text-sm breadcrumbs">
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li>Estimates</li>
                    </ul>
                </nav>
            </header>
            <main>
                <section className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Estimates List</h2>
                    <WorkOrdersTable />
                </section>
            </main>
        </div>
    );
};

export default WorkOrdersClientComponent;