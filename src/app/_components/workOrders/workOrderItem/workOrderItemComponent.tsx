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
import { WorkOrderItemStatus } from "@prisma/client";
import WorkOrderItemStockComponent from "~/app/_components/workOrders/WorkOrderItemStock/workOrderItemStockComponent";
import { Info, Pencil } from "lucide-react";
import { Button } from "../../ui/button";
import { SelectField } from "~/app/_components/shared/ui/SelectField/SelectField";
import { Textarea } from "../../ui/textarea";
import { toast } from "react-hot-toast";
import FileUpload from "../../shared/fileUpload";
import ShippingInfoEditor from "../../shared/shippingInfoEditor/ShippingInfoEditor";
import InfoCard from "../../shared/InfoCard/InfoCard";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";
import { formatPaperProductLabel } from "~/utils/formatters";

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
        <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 text-sm bg-blue-50 border border-blue-200 rounded-md mb-4">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <p className="text-blue-700">
                    Status is the current status of the work order item.
                    You can change the status of the work order item by selecting a new status from the dropdown.
                    You can toggle whether to notify the customer via email by toggling the switch.
                    You can override the email address to notify by entering an email address in the input field.
                </p>
            </div>
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

const WorkOrderItemComponent: React.FC<WorkOrderItemPageProps> = ({
    workOrderId,
    workOrderItemId
}) => {
    const [jobDescription, setJobDescription] = useState("");
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [localArtwork, setLocalArtwork] = useState<{ fileUrl: string; description: string }[]>([]);
    const { data: workOrder, isLoading: isWorkOrderLoading, error: workOrderError } = api.workOrders.getByID.useQuery(workOrderId);
    const { data: fetchedWorkOrderItem, isLoading: isItemLoading, error: itemError } = api.workOrderItems.getByID.useQuery(workOrderItemId);
    const [workOrderItem, setWorkOrderItem] = useState<SerializedWorkOrderItem | null>(null);
    const { data: typesettingData, isLoading: isTypesettingLoading } = api.typesettings.getByWorkOrderItemID.useQuery(workOrderItemId);
    const [serializedTypesettingData, setSerializedTypesettingData] = useState<SerializedTypesetting[]>([]);
    const utils = api.useUtils();

    // Get all paper products
    const { data: paperProducts } = api.paperProducts.getAll.useQuery();
    const findPaperProduct = (id: string) => {
        if (!id) return null;
        const paperProduct = paperProducts?.find(product => product.id === id);
        return paperProduct ? formatPaperProductLabel(paperProduct) : null;
    };

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

    const { mutate: updateArtwork } = api.workOrderItems.updateArtwork.useMutation({
        onSuccess: () => {
            void utils.workOrderItems.getByID.invalidate(workOrderItemId);
            toast.success('Artwork updated successfully');
        },
        onError: (error) => {
            console.error('Error updating artwork:', error);
            toast.error('Failed to update artwork');
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

    useEffect(() => {
        if (fetchedWorkOrderItem?.artwork) {
            setLocalArtwork(fetchedWorkOrderItem.artwork.map(art => ({
                fileUrl: art.fileUrl,
                description: art.description || '',
            })));
        }
    }, [fetchedWorkOrderItem?.artwork]);

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

    // Add CopilotKit readable context for work order item details
    useCopilotReadable({
        description: "Current work order item details and specifications",
        value: {
            workOrderItem: workOrderItem ? {
                id: workOrderItem.id,
                description: workOrderItem.description,
                quantity: workOrderItem.quantity,
                ink: workOrderItem.ink,
                specialInstructions: workOrderItem.specialInstructions,
                status: workOrderItem.status,
                productType: workOrderItem.ProductType?.name,
                workOrderNumber: workOrder?.workOrderNumber,
                company: workOrder?.Office?.Company.name,
            } : null,
            isLoading: isWorkOrderLoading || isItemLoading,
            hasError: !!workOrderError || !!itemError,
        },
    });

    // Add CopilotKit readable context for artwork and files
    useCopilotReadable({
        description: "Artwork and file attachments for the work order item",
        value: {
            artwork: localArtwork.map(art => ({
                fileUrl: art.fileUrl,
                description: art.description,
            })),
            hasFiles: localArtwork.length > 0,
        },
    });

    // Add CopilotKit readable context for paper stock
    useCopilotReadable({
        description: "Paper stock information for the work order item",
        value: {
            stocks: workOrderItem?.WorkOrderItemStock?.map(stock => ({
                stockQty: stock.stockQty,
                paperProduct: findPaperProduct(stock.paperProductId || ''),
                supplier: stock.supplier,
                status: stock.stockStatus,
                expectedDate: stock.expectedDate,
            })) ?? [],
            hasStocks: (workOrderItem?.WorkOrderItemStock?.length ?? 0) > 0,
        },
    });

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

            <div className="rounded-lg bg-white p-4 md:p-6 shadow-md">
                {/* Basic Info Section */}
                <div className="flex flex-col gap-4 mb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-2">
                        <InfoCard
                            title="Estimate Number"
                            content={workOrder?.workOrderNumber ?? 'N/A'}
                        />
                        <InfoCard
                            title="Item Quantity"
                            content={workOrderItem.quantity ?? 'N/A'}
                        />
                        <InfoCard
                            title="Color"
                            content={workOrderItem.ink ?? 'N/A'}
                        />
                        <InfoCard
                            title="Product Type"
                            content={workOrderItem.ProductType?.name ?? 'N/A'}
                        />
                    </div>
                </div>

                {/* Company Section */}
                <div className="mb-6">
                    <InfoCard
                        title="Company"
                        content={workOrder?.Office?.Company.name ?? 'N/A'}
                    />
                </div>

                {/* Paper Stock Section */}
                <section className="mb-2">
                    <h2 className="text-xl md:text-2xl font-semibold mb-4">Paper Stock</h2>
                    <WorkOrderItemStockComponent workOrderItemId={workOrderItem.id} />
                </section>

                {/* Shipping Info Section */}
                <div className="flex flex-col gap-4 mb-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="grid grid-cols-1 gap-4 mb-2">
                            <ShippingInfoEditor
                                workOrderItemId={workOrderItem.id}
                                officeId={workOrder?.Office?.id ?? ''}
                                currentShippingInfo={workOrderItem.ShippingInfo}
                                onUpdate={() => {
                                    utils.workOrderItems.getByID.invalidate(workOrderItemId);
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 mb-2">
                        </div>
                    </div>
                </div>

                {/* Description and Instructions Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-4">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-700">Item Description</h2>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                        <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">Files</h2>
                        <FileUpload
                            onFileUploaded={(fileUrl: string, description: string) => {
                                const newArtwork = { fileUrl, description };
                                const updatedArtwork = [...localArtwork, newArtwork];
                                setLocalArtwork(updatedArtwork);
                                updateArtwork({
                                    workOrderItemId: workOrderItem.id,
                                    artwork: updatedArtwork,
                                });
                            }}
                            onFileRemoved={(fileUrl: string) => {
                                const updatedArtwork = localArtwork.filter(art => art.fileUrl !== fileUrl);
                                setLocalArtwork(updatedArtwork);
                                updateArtwork({
                                    workOrderItemId: workOrderItem.id,
                                    artwork: updatedArtwork,
                                });
                            }}
                            onDescriptionChanged={(fileUrl: string, description: string) => {
                                const updatedArtwork = localArtwork.map(art =>
                                    art.fileUrl === fileUrl ? { ...art, description } : art
                                );
                                setLocalArtwork(updatedArtwork);
                            }}
                            onDescriptionBlur={(fileUrl: string) => {
                                updateArtwork({
                                    workOrderItemId: workOrderItem.id,
                                    artwork: localArtwork,
                                });
                            }}
                            initialFiles={localArtwork}
                        />
                    </div>
                </div>

                {/* Typesetting Section */}
                <div className="space-y-6 md:space-y-8">
                    {/* Typesetting Section */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold mb-4">Typesetting</h2>
                        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                            <TypesettingProvider>
                                <TypesettingComponent
                                workOrderItemId={workOrderItem.id}
                                orderItemId=""
                                    initialTypesetting={serializedTypesettingData}
                                />
                            </TypesettingProvider>
                        </div>
                    </section>
                    {/* Bindery Options Section */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold mb-4">Bindery Options</h2>
                        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                            <ProcessingOptionsProvider workOrderItemId={workOrderItem.id}>
                                <ProcessingOptionsComponent workOrderItemId={workOrderItem.id} />
                            </ProcessingOptionsProvider>
                        </div>
                    </section>
                </div>
            </div>

            {/* Add CopilotPopup at the end of the component */}
            <CopilotPopup
                instructions={`You are an AI assistant helping users manage work order items in a print portal system. You have access to:
                    1. Complete work order item specifications and details
                    2. Artwork and file attachments
                    3. Paper stock information and requirements
                    4. Shipping information
                    5. Typesetting and bindery options
                    6. Status and progress tracking

                    Your role is to:
                    - Help users understand and manage item specifications
                    - Guide users through file and artwork management
                    - Assist with paper stock selection and tracking
                    - Help with shipping information setup
                    - Explain typesetting and bindery requirements
                    - Guide users through status updates and tracking
                    - Provide context-aware suggestions and explanations

                    When responding:
                    - Reference specific details from the current work order item
                    - Explain technical specifications and requirements
                    - Guide users through complex processes
                    - Help troubleshoot issues and errors
                    - Provide suggestions for optimization
                    - Explain relationships between different components`}
                labels={{
                    title: "Work Order Item Assistant",
                    initial: "How can I help you manage this work order item?",
                    placeholder: "Ask about specifications, files, shipping...",
                }}
            />
        </div>
    );
}

export default WorkOrderItemComponent;