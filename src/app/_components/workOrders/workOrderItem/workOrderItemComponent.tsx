"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { TypesettingProvider } from '~/app/contexts/TypesettingContext';
import TypesettingComponent from "~/app/_components/shared/typesetting/typesettingComponent";
import ProcessingOptionsComponent from "~/app/_components/shared/processingOptions/processingOptionsComponent";
import { ProcessingOptionsProvider } from "~/app/contexts/ProcessingOptionsContext";
import { type SerializedWorkOrderItem, type SerializedTypesetting } from "~/types/serializedTypes";
import { normalizeTypesetting } from "~/utils/dataNormalization";
import ArtworkComponent from "../../shared/artworkComponent/artworkComponent";
import { WorkOrderItemStatus } from "@prisma/client";
import WorkOrderItemStockComponent from "~/app/_components/workOrders/WorkOrderItemStock/workOrderItemStockComponent";

const StatusBadge: React.FC<{ id: string, status: WorkOrderItemStatus, workOrderId: string }> = ({ id, status, workOrderId }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const utils = api.useUtils();
    const { mutate: updateStatus } = api.workOrderItems.updateStatus.useMutation({
        onSuccess: () => {
            utils.workOrders.getByID.invalidate(workOrderId);
        }
    });
    const getStatusColor = (status: WorkOrderItemStatus): string => {
        switch (status) {
            case "Approved": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            case "Pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-blue-100 text-blue-800";
        }
    };

    const handleStatusChange = async (newStatus: WorkOrderItemStatus) => {
        updateStatus({ id, status: newStatus });
        setCurrentStatus(newStatus);

    };

    return (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentStatus)}`}>
                {currentStatus}
            </span>
            <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as WorkOrderItemStatus)}
                className="px-2 py-1 rounded-md border border-gray-300"
            >
                {Object.values(WorkOrderItemStatus).map((status) => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
        </div>
    );
};

type WorkOrderItemPageProps = {
    workOrderId: string;
    workOrderItemId: string;
};

const InfoCard: React.FC<{ title: string; content: React.ReactNode }> = ({ title, content }) => (
    <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
        <div className="bg-gray-50 p-4 rounded-lg">{content}</div>
    </section>
);

const WorkOrderItemComponent: React.FC<WorkOrderItemPageProps> = ({
    workOrderId,
    workOrderItemId
}) => {
    const { data: workOrder, isLoading: isWorkOrderLoading, error: workOrderError } = api.workOrders.getByID.useQuery(workOrderId);
    const { data: fetchedWorkOrderItem, isLoading: isItemLoading, error: itemError } = api.workOrderItems.getByID.useQuery(workOrderItemId);
    const [workOrderItem, setWorkOrderItem] = useState<SerializedWorkOrderItem | null>(null);
    const { data: typesettingData, isLoading: isTypesettingLoading } = api.typesettings.getByWorkOrderItemID.useQuery(workOrderItemId);
    const [serializedTypesettingData, setSerializedTypesettingData] = useState<SerializedTypesetting[]>([]);

    useEffect(() => {
        if (fetchedWorkOrderItem) {
            setWorkOrderItem(fetchedWorkOrderItem);
        }
    }, [fetchedWorkOrderItem]);

    useEffect(() => {
        if (typesettingData) {
            const serializedData = typesettingData.map(normalizeTypesetting);
            setSerializedTypesettingData(serializedData);
        }
    }, [typesettingData]);

    if (isWorkOrderLoading || isItemLoading || isTypesettingLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (workOrderError || itemError) {
        return <div className="text-red-500 text-center">Error loading data. Please try again.</div>;
    }

    if (!workOrderItem) {
        return <div className="text-center">No order items found.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Job Details</h1>
                <div className="text-sm breadcrumbs">
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/workOrders">Orders Not in Production</Link></li>
                            <li><Link href={`/workOrders/${workOrderItem.workOrderId}`}>Order {workOrder?.workOrderNumber}</Link></li>
                            <li>Job {workOrderItem.workOrderItemNumber}</li>
                        </ul>
                    </div>
                </div>
                <div className="flex-none">
                    <Link className="btn btn-sm btn-primary" href="/workOrders/create">Create Order</Link>
                </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <InfoCard
                        title="Estimate Number"
                        content={workOrder?.workOrderNumber ?? 'N/A'}
                    />
                    <InfoCard
                        title="Company"
                        content={workOrder?.Office?.Company.name ?? 'N/A'}
                    />
                </div>
                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <InfoCard
                        title="Job Description"
                        content={workOrderItem.description ?? 'N/A'}
                    />
                    <InfoCard
                        title="Job Quantity"
                        content={workOrderItem.quantity ?? 'N/A'}
                    />
                    <InfoCard
                        title="Ink"
                        content={workOrderItem.ink ?? 'N/A'}
                    />
                </div>
                {/* Row 3 */}
                <div className="grid grid-cols-1 gap-4 mb-2">
                    <InfoCard
                        title="Status"
                        content={
                            <StatusBadge
                                id={workOrderItem.id}
                                status={workOrderItem.status}
                                workOrderId={workOrderItem.workOrderId ?? ''}
                            />
                        }
                    />
                </div>
                {/* Row 4 */}
                <div className="grid grid-cols-1 gap-4 mb-2">
                    <Link className="btn btn-sm btn-primary" href={`/workOrders/${workOrderItem.workOrderId}/workOrderItem/${workOrderItem.id}/edit`}>Edit</Link>
                </div>
                {/* Row 5 */}
                <div className="grid grid-cols-1 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Artwork</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {workOrderItem.artwork && workOrderItem.artwork.length > 0 ? (
                                workOrderItem.artwork.map((artwork) => (
                                    <div key={artwork.id} className="rounded-lg bg-white p-6 shadow-md">
                                        <ArtworkComponent artworkUrl={artwork.fileUrl} artworkDescription={artwork.description} />
                                    </div>
                                ))
                            ) : (
                                <p>No artwork available</p>
                            )}
                        </div>
                    </div>
                </div>
                {/* Row 6 */}
                <div className="grid grid-cols-1 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Bindery Options</h2>
                        <ProcessingOptionsProvider workOrderItemId={workOrderItem.id}>
                            <ProcessingOptionsComponent workOrderItemId={workOrderItem.id} />
                        </ProcessingOptionsProvider>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Typesetting</h2>
                        <TypesettingProvider>
                            <TypesettingComponent
                                workOrderItemId={workOrderItem.id}
                                orderItemId=""
                                initialTypesetting={serializedTypesettingData}
                            />
                        </TypesettingProvider>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Job Stock</h2>
                        <WorkOrderItemStockComponent workOrderItemId={workOrderItem.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkOrderItemComponent;