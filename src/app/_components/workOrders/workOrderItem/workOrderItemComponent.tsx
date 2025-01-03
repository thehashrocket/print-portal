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
import { Pencil, PlusCircle } from "lucide-react";
import { Button } from "../../ui/button";
import { SelectField } from "~/app/_components/shared/ui/SelectField/SelectField";
import { Textarea } from "../../ui/textarea";
import { toast } from "react-hot-toast";

const StatusBadge: React.FC<{ id: string, status: WorkOrderItemStatus, workOrderId: string }> = ({ id, status, workOrderId }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    
    const utils = api.useUtils();
    const { mutate: updateStatus } = api.workOrderItems.updateStatus.useMutation({
        onSuccess: () => {
            utils.workOrders.getByID.invalidate(workOrderId);
            toast.success('Status updated successfully', { duration: 4000, position: 'top-right' });
        },
        onError: (error) => {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status', { duration: 4000, position: 'top-right' });
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
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <span className={`px-2 py-1 rounded-full text-sm font-semibold w-fit ${getStatusColor(currentStatus)}`}>
                {currentStatus}
            </span>
            <div className="w-full md:w-48">
                <SelectField
                    options={Object.values(WorkOrderItemStatus).map((status) => ({ value: status, label: status }))}
                    value={currentStatus}
                    onValueChange={(value: string) => handleStatusChange(value as WorkOrderItemStatus)}
                    placeholder="Select status..."
                    required={true}
                />
            </div>
        </div>
    );
};

type WorkOrderItemPageProps = {
    workOrderId: string;
    workOrderItemId: string;
};

const InfoCard: React.FC<{ title: string; content: React.ReactNode }> = ({ title, content }) => (
    <section className="mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">{title}</h2>
        <div className="bg-gray-50 p-3 md:p-4 rounded-lg">{content}</div>
    </section>
);

const WorkOrderItemComponent: React.FC<WorkOrderItemPageProps> = ({
    workOrderId,
    workOrderItemId
}) => {
    const [jobDescription, setJobDescription] = useState("");
    const [specialInstructions, setSpecialInstructions] = useState("");
    const { data: workOrder, isLoading: isWorkOrderLoading, error: workOrderError } = api.workOrders.getByID.useQuery(workOrderId);
    const { data: fetchedWorkOrderItem, isLoading: isItemLoading, error: itemError } = api.workOrderItems.getByID.useQuery(workOrderItemId);
    const [workOrderItem, setWorkOrderItem] = useState<SerializedWorkOrderItem | null>(null);
    const { data: typesettingData, isLoading: isTypesettingLoading } = api.typesettings.getByWorkOrderItemID.useQuery(workOrderItemId);
    const [serializedTypesettingData, setSerializedTypesettingData] = useState<SerializedTypesetting[]>([]);
    const utils = api.useUtils();

    const { mutate: updateDescription } = api.workOrderItems.updateDescription.useMutation({
        onSuccess: () => {
            toast.success('Item description updated successfully');
            utils.workOrderItems.getByID.invalidate(workOrderItemId);
        },
        onError: (error) => {
            console.error('Failed to update item description:', error);
            toast.error('Failed to update item description');
        }
    });

    const { mutate: updateInstructions } = api.workOrderItems.updateSpecialInstructions.useMutation({
        onSuccess: () => {
            toast.success('Special instructions updated successfully');
            utils.workOrderItems.getByID.invalidate(workOrderItemId);
        },
        onError: (error) => {
            console.error('Failed to update special instructions:', error);
            toast.error('Failed to update special instructions');
        }
    });

    useEffect(() => {
        if (fetchedWorkOrderItem) {
            setWorkOrderItem(fetchedWorkOrderItem);
            setJobDescription(fetchedWorkOrderItem.description);
            setSpecialInstructions(fetchedWorkOrderItem.specialInstructions ?? '');
        }
    }, [fetchedWorkOrderItem]);

    useEffect(() => {
        if (typesettingData) {
            const serializedData = typesettingData.map(normalizeTypesetting);
            setSerializedTypesettingData(serializedData);
        }
    }, [typesettingData]);

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJobDescription(e.target.value);
    };

    const handleSpecialInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSpecialInstructions(e.target.value);
    };

    const updateJobDescription = () => {
        updateDescription({ id: workOrderItemId, description: jobDescription });
    };

    const updateSpecialInstructions = () => {
        updateInstructions({ id: workOrderItemId, specialInstructions: specialInstructions });
    };

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
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Item Details</h1>
                <div className="text-sm breadcrumbs overflow-x-auto">
                    <ul className="flex flex-wrap gap-1">
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/workOrders">Estimates</Link></li>
                        <li><Link href={`/workOrders/${workOrderItem.workOrderId}`}>Estimate {workOrder?.workOrderNumber}</Link></li>
                        <li>Item {workOrderItem.workOrderItemNumber}</li>
                    </ul>
                </div>
            </div>

            <div className="rounded-lg bg-white p-3 md:p-6 shadow-md">
                {/* Basic Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <InfoCard
                        title="Estimate Number"
                        content={workOrder?.workOrderNumber ?? 'N/A'}
                    />
                    <InfoCard
                        title="Item Quantity"
                        content={workOrderItem.quantity ?? 'N/A'}
                    />
                    <InfoCard
                        title="Ink"
                        content={workOrderItem.ink ?? 'N/A'}
                    />
                </div>
                
                {/* Company Section */}
                <div className="mb-6">
                    <InfoCard
                        title="Company"
                        content={workOrder?.Office?.Company.name ?? 'N/A'}
                    />
                </div>

                {/* Description and Instructions Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-4">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-700">Job Description</h2>
                        <Textarea
                            value={jobDescription}
                            onChange={handleDescriptionChange}
                            className="bg-gray-50 p-3 rounded-lg w-full mb-2"
                        />
                        <Button
                            variant="default"
                            onClick={updateJobDescription}
                            className="w-full md:w-auto"
                        >
                            Update Description
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-700">Special Instructions</h2>
                        <Textarea
                            value={specialInstructions}
                            onChange={handleSpecialInstructionsChange}
                            className="bg-gray-50 p-3 rounded-lg w-full mb-2"
                        />
                        <Button
                            variant="default"
                            onClick={updateSpecialInstructions}
                            className="w-full md:w-auto"
                        >
                            Update Special Instructions
                        </Button>
                    </div>
                </div>

                {/* Status Section */}
                <div className="mb-6">
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

                {/* Edit Button */}
                <div className="mb-6">
                    <Link href={`/workOrders/${workOrderItem.workOrderId}/workOrderItem/${workOrderItem.id}/edit`}>
                        <Button
                            variant="default"
                            className="w-full md:w-auto"
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Item
                        </Button>
                    </Link>
                </div>

                {/* Artwork Section */}
                <div className="mb-6">
                    <div className="rounded-lg bg-white p-4 shadow-md">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">Artwork</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {workOrderItem.artwork && workOrderItem.artwork.length > 0 ? (
                                workOrderItem.artwork.map((artwork) => (
                                    <div key={artwork.id} className="rounded-lg bg-white p-4 shadow-md">
                                        <ArtworkComponent artworkUrl={artwork.fileUrl} artworkDescription={artwork.description} />
                                    </div>
                                ))
                            ) : (
                                <p>No artwork available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Sections */}
                <div className="space-y-6">
                    <div className="rounded-lg bg-white p-4 shadow-md">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">Bindery Options</h2>
                        <ProcessingOptionsProvider workOrderItemId={workOrderItem.id}>
                            <ProcessingOptionsComponent workOrderItemId={workOrderItem.id} />
                        </ProcessingOptionsProvider>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-md">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">Typesetting</h2>
                        <TypesettingProvider>
                            <TypesettingComponent
                                workOrderItemId={workOrderItem.id}
                                orderItemId=""
                                initialTypesetting={serializedTypesettingData}
                            />
                        </TypesettingProvider>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-md">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">Item Stock</h2>
                        <WorkOrderItemStockComponent workOrderItemId={workOrderItem.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkOrderItemComponent;