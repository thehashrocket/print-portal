"use client";

import React, { useState, useEffect } from "react";
import { WorkOrderItem } from "@prisma/client";
import { api } from "~/trpc/react";
import Link from "next/link";
import { TypesettingProvider } from '~/app/contexts/TypesettingContext';
import TypesettingComponent from "~/app/_components/shared/typesetting/typesettingComponent";
import ProcessingOptionsComponent from "~/app/_components/shared/processingOptions/processingOptionsComponent";
import { ProcessingOptionsProvider } from "~/app/contexts/ProcessingOptionsContext";

type WorkOrderItemPageProps = {
    workOrderId: string;
    workOrderItemId: string;
};

const WorkOrderItemComponent: React.FC<WorkOrderItemPageProps> = ({
    workOrderId = '',
    workOrderItemId = '',
}) => {
    // Fetch work order item data
    const { data: workOrder } = api.workOrders.getByID.useQuery(workOrderId);
    const { data: fetchedWorkOrderItem, isLoading } = api.workOrderItems.getByID.useQuery(workOrderItemId);
    const [workOrderItem, setWorkOrderItem] = useState<WorkOrderItem | null>(null);
    const { data: typesettingData } = api.typesetting.getByWorkOrderItemID.useQuery(workOrderItemId); // Ensure you have an API endpoint to fetch typesetting data by work order item ID

    useEffect(() => {
        if (fetchedWorkOrderItem) {
            setWorkOrderItem(fetchedWorkOrderItem);
        }
    }, [fetchedWorkOrderItem]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">Work Order Item Details</a>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/workOrders">Work Orders</Link></li>
                            <li><Link href={`/workOrders/${workOrderItem?.workOrderId}`}>Work Order</Link></li>
                            <li>Work Order Item</li>
                        </ul>
                    </div>
                </div>
                <div className="flex-none">
                    <Link className="btn btn-sm btn-primary" href="/workOrders/create">Create Work Order</Link>
                </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <p className="mb-2 text-gray-600 text-xl font-semibold">Work Order Number</p>
                        <p className="text-gray-800 text-lg font-semibold">{workOrder?.workOrderNumber}</p>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <p className="mb-2 text-gray-600 text-xl font-semibold">Office Name</p>
                        <p className="text-gray-800 text-lg font-semibold">{workOrder?.Office.name}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <p className="mb-2 text-gray-600 text-xl font-semibold">Work Order Item Status</p>
                        <p className="text-gray-800 text-lg font-semibold">{workOrderItem?.status}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Typesetting</h2>
                        {workOrderItem && typesettingData && (
                            <TypesettingProvider>
                                <TypesettingComponent
                                    workOrderItemId={workOrderItem?.id || ''}
                                    orderItemId=""
                                    initialTypesetting={typesettingData}
                                />
                            </TypesettingProvider>
                        )}
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Processing Options</h2>
                        <ProcessingOptionsProvider workOrderItemId={workOrderItem?.id || ''}>
                            <ProcessingOptionsComponent workOrderItemId={workOrderItem?.id || ''} />
                        </ProcessingOptionsProvider>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkOrderItemComponent;