// ~/src/app/_components/workOrders/workOrderItemComponent.tsx
"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { TypesettingProvider } from '~/app/contexts/TypesettingContext';
import TypesettingComponent from "~/app/_components/shared/typesetting/typesettingComponent";
import ProcessingOptionsComponent from "~/app/_components/shared/processingOptions/processingOptionsComponent";
import { ProcessingOptionsProvider } from "~/app/contexts/ProcessingOptionsContext";
import { SerializedWorkOrderItem, SerializedTypesetting } from "~/types/serializedTypes";
import { normalizeTypesetting } from "~/utils/dataNormalization";
import ArtworkComponent from "../../shared/artworkComponent/artworkComponent";
import { WorkOrderItemStatus } from "@prisma/client";

type WorkOrderItemPageProps = {
    workOrderId: string;
    workOrderItemId: string;
};

const StatusBadge: React.FC<{ id: string, status: WorkOrderItemStatus }> = ({ id, status }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const { mutate: updateStatus } = api.workOrderItems.updateStatus.useMutation();

    const getStatusColor = (status: WorkOrderItemStatus): string => {
        switch (status) {
            case "Approved": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            case "Pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const handleStatusChange = async (newStatus: WorkOrderItemStatus) => {
        await updateStatus({ id, status: newStatus });
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

const InfoCard: React.FC<{ title: string; content: React.ReactNode }> = ({ title, content }) => (
    <div className="rounded-lg bg-white p-4 shadow-md">
        <h3 className="mb-2 text-gray-600 text-lg font-semibold">{title}</h3>
        <div className="text-gray-800">{content}</div>
    </div>
);

const WorkOrderItemComponent: React.FC<WorkOrderItemPageProps> = ({
    workOrderId = '',
    workOrderItemId = ''
}) => {
    const { data: workOrder } = api.workOrders.getByID.useQuery(workOrderId);
    const { data: fetchedWorkOrderItem, isLoading } = api.workOrderItems.getByID.useQuery(workOrderItemId);
    const [workOrderItem, setWorkOrderItem] = useState<SerializedWorkOrderItem | null>(null);
    const { data: typesettingData } = api.typesettings.getByWorkOrderItemID.useQuery(workOrderItemId);
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

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">Work Job Details</a>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/workOrders">Work Orders</Link></li>
                            <li><Link href={`/workOrders/${workOrderItem?.workOrderId}`}>Work Order</Link></li>
                            <li>Job</li>
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
                {/* Row 2 */}
                <div className="grid grid-cols-1 gap-4 mb-2">
                    <InfoCard title="Status" content={
                        <StatusBadge id={workOrderItem?.id || ''} status={workOrderItem?.status || WorkOrderItemStatus.Pending} />
                    } />
                </div>
                {/* Row 3 */}
                <div className="grid grid-cols-1 gap-4 mb-2">
                    {/* Render WorkOrderItemArtwork */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Artwork</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {workOrderItem?.artwork.map((artwork) => (
                                <div key={artwork.id} className="rounded-lg bg-white p-6 shadow-md">
                                    <ArtworkComponent artworkUrl={artwork.fileUrl} artworkDescription={artwork.description} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Row 4 */}
                <div className="grid grid-cols-1 gap-4 mb-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Bindery Options</h2>
                        <ProcessingOptionsProvider workOrderItemId={workOrderItem?.id || ''}>
                            <ProcessingOptionsComponent workOrderItemId={workOrderItem?.id || ''} />
                        </ProcessingOptionsProvider>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Typesetting</h2>
                        {workOrderItem && serializedTypesettingData.length > 0 && (
                            <TypesettingProvider>
                                <TypesettingComponent
                                    workOrderItemId={workOrderItem.id}
                                    orderItemId=""
                                    initialTypesetting={serializedTypesettingData}
                                />
                            </TypesettingProvider>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkOrderItemComponent;