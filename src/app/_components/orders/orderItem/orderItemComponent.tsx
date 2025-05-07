// ~/app/_components/orders/orderItem/orderItemComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import { OrderItemStatus, type ProcessingOptions } from "@prisma/client";
import { api } from "~/trpc/react";
import Link from "next/link";
import { TypesettingProvider } from '~/app/contexts/TypesettingContext';
import TypesettingComponent from "~/app/_components/shared/typesetting/typesettingComponent";
import { EditableInfoCard } from "../../shared/editableInfoCard/EditableInfoCard";
import ProcessingOptionsComponent from "~/app/_components/shared/processingOptions/processingOptionsComponent";
import { ProcessingOptionsProvider } from "~/app/contexts/ProcessingOptionsContext";
import { normalizeTypesetting } from "~/utils/dataNormalization";
import OrderItemStockComponent from "../OrderItemStock/orderItemStockComponent";
import { toast } from "react-hot-toast";
import ContactPersonEditor from "../../shared/ContactPersonEditor/ContactPersonEditor";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import FileUpload from "../../shared/fileUpload";
import { Input } from "../../ui/input";
import { SelectField } from "../../shared/ui/SelectField/SelectField";
import { Printer } from "lucide-react";
import ShippingInfoEditor from "../../shared/shippingInfoEditor/ShippingInfoEditor";
import InfoCard from "../../shared/InfoCard/InfoCard";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";
import { formatPaperProductLabel } from "~/utils/formatters";
import ItemStatusBadge from "./ItemStatusBadge";
import OutsourcedOrderItemInfoForm from "./OutsourcedOrderItemInfoForm";
import { z } from "zod";

type OrderItemPageProps = {
    orderId: string;
    orderItemId: string;
};

// Define the form schema to match OutsourcedOrderItemInfoForm
const outsourcedOrderItemInfoSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    contactName: z.string().min(1, "Contact name is required"),
    contactPhone: z.string().min(1, "Contact phone is required"),
    contactEmail: z.string().optional(),
    jobDescription: z.string().optional(),
    orderNumber: z.string().optional(),
    estimatedDeliveryDate: z.string().optional(),
    files: z.array(z.object({
        fileUrl: z.string(),
        description: z.string().optional(),
    })).optional(),
});

// Define the form data type
type OutsourcedOrderItemInfoFormData = z.infer<typeof outsourcedOrderItemInfoSchema>;

const OrderItemComponent: React.FC<OrderItemPageProps> = ({
    orderId,
    orderItemId
}) => {
    const { data: order, error: orderError, isLoading: orderLoading } = api.orders.getByID.useQuery(orderId);
    const { data: orderItem, error: itemError, isLoading: itemLoading } = api.orderItems.getByID.useQuery(orderItemId);
    const { data: typesettingData, isLoading: typesettingLoading } = api.typesettings.getByOrderItemID.useQuery(orderItemId);
    const { data: processingOptions } = api.processingOptions.getByOrderItemId.useQuery(orderItemId);
    const { data: orderItemStocks } = api.orderItemStocks.getByOrderItemId.useQuery(orderItemId);
    const { data: paperProducts } = api.paperProducts.getAll.useQuery();
    const { data: productTypes } = api.productTypes.getAll.useQuery();
    const utils = api.useUtils();

    // Add CopilotKit readable context at the top level
    useCopilotReadable({
        description: "The current order item being viewed, including its details, status, and specifications",
        value: orderItem ?? null,
    });

    useCopilotReadable({
        description: "The parent order containing this item",
        value: order ?? null,
    });

    useCopilotReadable({
        description: "Typesetting specifications and proofs for this order item",
        value: typesettingData ?? null,
    });

    useCopilotReadable({
        description: "Processing and bindery options for this order item",
        value: processingOptions ?? null,
    });

    useCopilotReadable({
        description: "Paper stock specifications for this order item",
        value: orderItemStocks ?? null,
    });

    const [jobDescription, setJobDescription] = useState("");
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [localArtwork, setLocalArtwork] = useState<{ fileUrl: string; description: string }[]>([]);
    const [localOutsourcedFiles, setLocalOutsourcedFiles] = useState<{ fileUrl: string; description: string }[]>([]);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempQuantity, setTempQuantity] = useState<number>(0);
    const [tempInk, setTempInk] = useState<string>("");
    const [tempProductTypeId, setTempProductTypeId] = useState<string>("");
    const [tempCost, setTempCost] = useState<number>(0);
    const [tempAmount, setTempAmount] = useState<number>(0);
    // Initialize local artwork state when orderItem changes
    useEffect(() => {
        if (orderItem?.artwork) {
            setLocalArtwork(orderItem.artwork.map(art => ({
                fileUrl: art.fileUrl,
                description: art.description || '',
            })));
        }
    }, [orderItem?.artwork]);

    const { mutate: updateArtwork } = api.orderItems.updateArtwork.useMutation({
        onSuccess: () => {
            void utils.orderItems.getByID.invalidate(orderItemId);
        },
    });

    const findPaperProduct = (id: string) => {
        if (!id) return null;
        const paperProduct = paperProducts?.find(product => product.id === id);
        return paperProduct ? formatPaperProductLabel(paperProduct) : null;
    };

    const { mutate: updateDescription } = api.orderItems.updateDescription.useMutation({
        onSuccess: () => {
            toast.success('Item description updated successfully');
            utils.orderItems.getByID.invalidate(orderItemId);
        },
        onError: (error) => {
            console.error('Failed to update item description:', error);
            toast.error('Failed to update item description');
        }
    });

    const { mutate: updateOutsourcedInfo } = api.orderItems.updateOutsourcedInfo.useMutation({
        onSuccess: () => {
            toast.success('Outsourced order information updated successfully');
            utils.orderItems.getByID.invalidate(orderItemId);
        },
        onError: (error) => {
            console.error('Failed to update outsourced order information:', error);
            toast.error('Failed to update outsourced order information');
        }
    });

    const { mutate: updateInstructions } = api.orderItems.updateSpecialInstructions.useMutation({
        onSuccess: () => {
            toast.success('Special instructions updated successfully');
            utils.orderItems.getByID.invalidate(orderItemId);
        },
        onError: (error) => {
            console.error('Failed to update special instructions:', error);
            toast.error('Failed to update special instructions');
        }
    });

    const { mutate: updateOrderItem } = api.orderItems.updateFields.useMutation({
        onSuccess: () => {
            toast.success('Item updated successfully');
            utils.orderItems.getByID.invalidate(orderItemId);
            setEditingField(null);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            console.error('Failed to update item:', error);
            toast.error('Failed to update item');
        }
    });

    useEffect(() => {
        if (orderItem) {
            setTempQuantity(orderItem.quantity);
            setTempInk(orderItem.ink ?? "");
            setTempProductTypeId(orderItem.ProductType?.id ?? "");
        }
    }, [orderItem]);

    const handleSave = (field: string) => {
        if (!orderItem) return;

        const updates: Record<string, unknown> = {};
        switch (field) {
            case 'quantity':
                updates.quantity = tempQuantity;
                break;
            case 'ink':
                updates.ink = tempInk;
                break;
            case 'productType':
                updates.productTypeId = tempProductTypeId;
                break;
            case 'cost':
                updates.cost = tempCost;
                break;
            case 'amount':
                updates.amount = tempAmount;
                break;
        }

        updateOrderItem({
            id: orderItem.id,
            data: updates
        });
    };

    const handleCancel = (field: string) => {
        if (!orderItem) return;

        switch (field) {
            case 'quantity':
                setTempQuantity(orderItem.quantity);
                break;
            case 'ink':
                setTempInk(orderItem.ink ?? "");
                break;
            case 'productType':
                setTempProductTypeId(orderItem.ProductType?.id ?? "");
                break;
        }
        setEditingField(null);
    };

    useEffect(() => {
        if (orderItem && !jobDescription && !specialInstructions) {
            setJobDescription(orderItem.description);
            setSpecialInstructions(orderItem.specialInstructions ?? '');
        }
    }, [orderItem, jobDescription, specialInstructions]);

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJobDescription(e.target.value);
    };

    const handleSpecialInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSpecialInstructions(e.target.value);
    };

    const handleOusourcedOrderItemSave = async (data: OutsourcedOrderItemInfoFormData) => {
        console.log("Saving outsourced order info", data);
        updateOutsourcedInfo({
            id: orderItemId,
            data: {
                companyName: data.companyName,
                contactName: data.contactName,
                contactPhone: data.contactPhone,
                contactEmail: data.contactEmail || "",
                jobDescription: data.jobDescription || "",
                orderNumber: data.orderNumber || "",
                estimatedDeliveryDate: data.estimatedDeliveryDate ? new Date(data.estimatedDeliveryDate) : new Date(),
                files: localOutsourcedFiles
            }
        });
        return Promise.resolve();
    };

    const handleFileUploaded = (fileUrl: string, description: string) => {
        console.log("File uploaded", fileUrl, description);
        setLocalOutsourcedFiles([...localOutsourcedFiles, { fileUrl, description }]);
    };

    const handleFileRemoved = (fileUrl: string) => {
        console.log("File removed", fileUrl);
        setLocalOutsourcedFiles(localOutsourcedFiles.filter(file => file.fileUrl !== fileUrl));
    };

    const handleFileDescriptionChanged = (fileUrl: string, description: string) => {
        console.log("File description changed", fileUrl, description);
        setLocalOutsourcedFiles(localOutsourcedFiles.map(file => file.fileUrl === fileUrl ? { ...file, description } : file));
    };

    const updateJobDescription = () => {
        updateDescription({ id: orderItemId, description: jobDescription });
    };

    const updateSpecialInstructions = () => {
        updateInstructions({ id: orderItemId, specialInstructions: specialInstructions });
    };

    if (orderLoading || itemLoading || typesettingLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (orderError || itemError || !order || !orderItem) {
        return <div className="text-red-500 text-center mt-8">Error loading item details.</div>;
    }

    const normalizedTypesetting = typesettingData ? typesettingData.map(normalizeTypesetting) : [];

    let orderPaperProducts: any[] = [];
    if (orderItemStocks) {
        // Build a list of paper products
        orderPaperProducts = orderItemStocks.map(stock => findPaperProduct(stock.paperProductId || ''));
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Item Details</h1>
                    <div className="text-sm breadcrumbs overflow-x-auto">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/orders">Orders</Link></li>
                            <li><Link href={`/orders/${orderId}`}>Order {order.orderNumber}</Link></li>
                            <li>Item {orderItem.orderItemNumber}</li>
                        </ul>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-4 md:p-6 shadow-md">
                    {/* Row 1 - Basic Info */}
                    <div className="flex flex-col gap-4 mb-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-2">
                            <InfoCard title="Order Number" content={order.orderNumber} />
                            <EditableInfoCard
                                title="Item Quantity"
                                content={orderItem.quantity}
                                isEditing={editingField === 'quantity'}
                                onEdit={() => setEditingField('quantity')}
                                onSave={() => handleSave('quantity')}
                                onCancel={() => handleCancel('quantity')}
                                editComponent={
                                    <Input
                                        type="number"
                                        value={tempQuantity}
                                        onChange={(e) => setTempQuantity(parseInt(e.target.value, 10))}
                                        min={1}
                                        className="w-full"
                                    />
                                }
                            />
                            <EditableInfoCard
                                title="Color"
                                content={orderItem.ink ?? 'N/A'}
                                isEditing={editingField === 'ink'}
                                onEdit={() => setEditingField('ink')}
                                onSave={() => handleSave('ink')}
                                onCancel={() => handleCancel('ink')}
                                editComponent={
                                    <Input
                                        type="text"
                                        value={tempInk}
                                        onChange={(e) => setTempInk(e.target.value)}
                                        className="w-full"
                                    />
                                }
                            />
                            <EditableInfoCard
                                title="Product Type"
                                content={orderItem.ProductType?.name ?? 'N/A'}
                                isEditing={editingField === 'productType'}
                                onEdit={() => setEditingField('productType')}
                                onSave={() => handleSave('productType')}
                                onCancel={() => handleCancel('productType')}
                                editComponent={
                                    <SelectField
                                        options={productTypes?.map(pt => ({ value: pt.id, label: pt.name })) ?? []}
                                        value={tempProductTypeId}
                                        onValueChange={setTempProductTypeId}
                                        placeholder="Select product type..."
                                    />
                                }
                            />
                            <EditableInfoCard
                                title="Item Cost"
                                content={orderItem.cost ?? 'N/A'}
                                isEditing={editingField === 'cost'}
                                onEdit={() => setEditingField('cost')}
                                onSave={() => handleSave('cost')}
                                onCancel={() => handleCancel('cost')}
                                editComponent={
                                    <Input
                                        type="number"
                                        value={tempCost}
                                        onChange={(e) => setTempCost(parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                }
                            />
                            <EditableInfoCard
                                title="Amount we bill to customer"
                                content={orderItem.amount ?? 'N/A'}
                                isEditing={editingField === 'amount'}
                                onEdit={() => setEditingField('amount')}
                                onSave={() => handleSave('amount')}
                                onCancel={() => handleCancel('amount')}
                                editComponent={
                                    <Input
                                        type="number"
                                        value={tempAmount}
                                        onChange={(e) => setTempAmount(parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                }
                            />
                        </div>
                    </div>

                    {/* Company Section */}
                    <div className="mb-6">
                        <InfoCard
                            title="Company"
                            content={<>
                                <p className="text-xl">{order.Office?.Company.name}</p>
                                <p className="text-sm text-gray-500">
                                    {order.Office?.isWalkInOffice == true ? "Walk-in" : "In-office"}
                                </p>
                            </>}
                        />
                        {order.WalkInCustomer != null && (
                            <InfoCard
                                title="Walk-in Customer"
                                content={<p className="text-xl">{order.WalkInCustomer.name}</p>}
                            />
                        )}
                    </div>
                    {order.Office.isWalkInOffice == false && (
                        <InfoCard
                            title="Office"
                            content={<p className="text-xl">{order.Office.name}</p>}
                        />
                    )}
                    <div className="flex flex-row gap-4 mb-2">
                        <InfoCard title="Print Order Item Details" content={
                            <Link href={`/orders/${orderId}/orderItem/${orderItemId}/print`}>

                                <Button variant="default">
                                    <Printer className="w-4 h-4" />
                                    Print Order Item Details
                                </Button>
                            </Link>
                        } />
                    </div>

                    {/* Paper Stock Section */}
                    <section className="mb-2">
                        <h2 className="text-xl md:text-2xl font-semibold mb-4">Paper Stock</h2>
                        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                            <OrderItemStockComponent orderItemId={orderItem.id} />
                        </div>
                    </section>

                    {/* Row 2 - Shipping Info and Contact */}
                    <div className="flex flex-col gap-4 mb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                            <div className="grid grid-cols-1 gap-4 mb-2">

                                <ShippingInfoEditor
                                    orderItemId={orderItem.id}
                                    officeId={order.officeId}
                                    currentShippingInfo={orderItem.ShippingInfo ? orderItem.ShippingInfo : null}
                                    onUpdate={() => {
                                        utils.orders.getByID.invalidate(orderId);
                                    }}
                                />
                            </div>
                            <InfoCard
                                title="Contact Info"
                                content={
                                    <ContactPersonEditor
                                        orderId={order.id}
                                        currentContactPerson={order.contactPerson}
                                        officeId={order.officeId}
                                        onUpdate={() => {
                                            utils.orders.getByID.invalidate(orderId);
                                        }}
                                    />
                                }
                            />
                        </div>
                    </div>

                    {/* Row 3 - Description and Instructions Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Item Description</h2>
                            <Textarea
                                value={jobDescription}
                                onChange={handleDescriptionChange}
                                className="bg-gray-50 p-4 rounded-lg w-full mb-4"
                            />
                            <Button variant="default" onClick={updateJobDescription}>
                                Update Description
                            </Button>
                        </div>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Special Instructions</h2>
                            <Textarea
                                value={specialInstructions}
                                onChange={handleSpecialInstructionsChange}
                                className="bg-gray-50 p-4 rounded-lg w-full mb-4"
                            />
                            <Button variant="default" onClick={updateSpecialInstructions}>
                                Update Special Instructions
                            </Button>
                        </div>
                    </div>

                    {/* Status Section */}
                    <div className="mb-6">
                        <InfoCard
                            title="Status"
                            content={
                                <ItemStatusBadge
                                    id={orderItem.id}
                                    status={orderItem.status}
                                    orderId={orderItem.orderId}
                                    onUpdate={() => {
                                        utils.orderItems.getByID.invalidate(orderItemId);
                                    }}
                                />
                            }
                        />
                    </div>
                    {/* Outsourced Order Item Info Section - Show if orderItem.status is Outsourced */}
                    {(orderItem.status === OrderItemStatus.Outsourced || orderItem.OutsourcedOrderItemInfo != null) && (
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Outsourced Order Item Info</h2>
                            <OutsourcedOrderItemInfoForm
                                info={orderItem.OutsourcedOrderItemInfo}
                                onSave={handleOusourcedOrderItemSave}
                                isEditable={true}
                                orderItemId={orderItem.id}
                                initialFiles={orderItem.OutsourcedOrderItemInfo?.files || []}
                                onFileUploaded={async (fileUrl: string, description: string) => {
                                    await handleFileUploaded(fileUrl, description);
                                }}
                                onFileRemoved={async (fileUrl: string) => {
                                    await handleFileRemoved(fileUrl);
                                }}
                                onFileDescriptionChanged={async (fileUrl: string, description: string) => {
                                    await handleFileDescriptionChanged(fileUrl, description);
                                }}
                            />
                        </div>
                    )}

                    {/* Artwork Section */}
                    <div className="mb-6">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Files</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="rounded-lg bg-white p-4 md:p-6 shadow-md">
                                <FileUpload
                                    onFileUploaded={(fileUrl: string, description: string) => {
                                        const newArtwork = { fileUrl, description };
                                        const updatedArtwork = [...localArtwork, newArtwork];
                                        setLocalArtwork(updatedArtwork);
                                        updateArtwork({
                                            orderItemId: orderItem.id,
                                            artwork: updatedArtwork,
                                        }, {
                                            onSuccess: () => {
                                                toast.success('File uploaded successfully');
                                            },
                                            onError: (error) => {
                                                console.error('Error uploading file:', error);
                                                toast.error('Failed to upload file');
                                            },
                                        });
                                    }}
                                    onFileRemoved={(fileUrl: string) => {
                                        const updatedArtwork = localArtwork.filter(art => art.fileUrl !== fileUrl);
                                        setLocalArtwork(updatedArtwork);
                                        updateArtwork({
                                            orderItemId: orderItem.id,
                                            artwork: updatedArtwork,
                                        }, {
                                            onSuccess: () => {
                                                toast.success('File removed successfully');
                                            },
                                            onError: (error) => {
                                                console.error('Error removing file:', error);
                                                toast.error('Failed to remove file');
                                            },
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
                                            orderItemId: orderItem.id,
                                            artwork: localArtwork,
                                        }, {
                                            onSuccess: () => {
                                                toast.success('File description updated successfully');
                                            },
                                            onError: (error) => {
                                                console.error('Error updating file description:', error);
                                                toast.error('Failed to update file description');
                                            },
                                        });
                                    }}
                                    initialFiles={localArtwork}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Sections */}
                    <div className="space-y-6 md:space-y-8">
                        {/* Typesetting Section */}
                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold mb-4">Typesetting</h2>
                            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                                <TypesettingProvider>
                                    <TypesettingComponent
                                        workOrderItemId=""
                                        orderItemId={orderItem.id}
                                        initialTypesetting={normalizedTypesetting}
                                    />
                                </TypesettingProvider>
                            </div>
                        </section>

                        {/* Bindery Options Section */}
                        <section>
                            <h2 className="text-xl md:text-2xl font-semibold mb-4">Bindery Options</h2>
                            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                                <ProcessingOptionsProvider orderItemId={orderItem.id}>
                                    <ProcessingOptionsComponent orderItemId={orderItem.id} />
                                </ProcessingOptionsProvider>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
            <CopilotPopup
                instructions={`You are an AI assistant helping with print order item management. You have access to:
                    1. The order item's complete details including:
                       - Item number, quantity, and specifications
                       - Current status and workflow position
                       - Paper stock selections and specifications
                       - Artwork and file attachments
                       - Description and special instructions
                    2. Typesetting information including:
                       - Proof versions and artwork
                       - Typesetting specifications
                    3. Processing and bindery options including:
                       - Cutting, folding, drilling specifications
                       - Binding and finishing details
                       - Special processing instructions
                    4. Parent order context and shipping details

                    Your role is to:
                    - Answer questions about this specific order item's specifications
                    - Explain technical printing terms and processes
                    - Help users understand paper stock selections and implications
                    - Guide users through typesetting and bindery options
                    - Assist with file and artwork management
                    - Explain status transitions and requirements

                    When responding:
                    - Be precise with technical printing terminology
                    - Reference specific details from the order item data
                    - Explain implications of processing choices
                    - Provide practical printing industry insights
                    - If discussing changes, explain their impact on production workflow`}
                labels={{
                    title: "Print Item Assistant",
                    initial: "How can I help you with this print item?",
                    placeholder: "Ask about specifications, paper, bindery options...",
                }}
            />
        </>
    );
};

export default OrderItemComponent;