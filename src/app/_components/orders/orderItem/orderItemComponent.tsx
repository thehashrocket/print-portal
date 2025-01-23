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
import { normalizeProcessingOptions, normalizeShippingInfo, normalizeTypesetting } from "~/utils/dataNormalization";
import OrderItemStockComponent from "../OrderItemStock/orderItemStockComponent";
import { toast } from "react-hot-toast";
import { StatusBadge } from "../../shared/StatusBadge/StatusBadge";
import { generateOrderItemPDF } from '~/utils/generateOrderItemPDF';
import { PrintButton } from './PrintButton';
import ContactPersonEditor from "../../shared/ContactPersonEditor/ContactPersonEditor";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import FileUpload from "../../shared/fileUpload";
import { Input } from "../../ui/input";
import { SelectField } from "../../shared/ui/SelectField/SelectField";
import { Check, X, PencilIcon, Printer, FilePlus } from "lucide-react";
import ShippingInfoEditor from "../../shared/shippingInfoEditor/ShippingInfoEditor";
import { type SerializedProcessingOptions } from "~/types/serializedTypes";

type OrderItemPageProps = {
    orderId: string;
    orderItemId: string;
};

const ItemStatusBadge: React.FC<{ id: string, status: OrderItemStatus, orderId: string }> = ({ id, status, orderId }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const utils = api.useUtils();

    const { mutate: updateStatus } = api.orderItems.updateStatus.useMutation({
        onSuccess: (data) => {
            console.log('data', data);
            utils.orders.getByID.invalidate(orderId);
            toast.success('Status updated successfully', { duration: 4000, position: 'top-right' });
        },
        onError: (error) => {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status', { duration: 4000, position: 'top-right' });
        },
    });



    const getStatusColor = (status: OrderItemStatus): string => {
        switch (status) {
            case "Completed": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            case "Pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const handleStatusChange = (newStatus: OrderItemStatus, sendEmail: boolean, emailOverride: string) => {
        updateStatus({
            id,
            status: newStatus,
            sendEmail,
            emailOverride
        });
        setCurrentStatus(newStatus);
    };

    return (
        <StatusBadge<OrderItemStatus>
            id={id}
            status={status}
            currentStatus={currentStatus}
            orderId={orderId}
            onStatusChange={handleStatusChange}
            getStatusColor={getStatusColor}
            statusOptions={Object.values(OrderItemStatus)}
        />
    );
};

const InfoCard: React.FC<{ title: string; content: React.ReactNode }> = ({ title, content }) => (
    <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
        <div className="bg-gray-50 p-4 rounded-lg">{content}</div>
    </section>
);

const OrderItemComponent: React.FC<OrderItemPageProps> = ({
    orderId,
    orderItemId
}) => {
    const { data: order, error: orderError, isLoading: orderLoading } = api.orders.getByID.useQuery(orderId);
    const { data: orderItem, error: itemError, isLoading: itemLoading } = api.orderItems.getByID.useQuery(orderItemId);
    const { data: typesettingData, isLoading: typesettingLoading } = api.typesettings.getByOrderItemID.useQuery(orderItemId);
    const { data: processingOptions } = api.processingOptions.getByOrderItemId.useQuery(orderItemId);
    const { data: orderItemStocks } = api.orderItemStocks.getByOrderItemId.useQuery(orderItemId);
    const [jobDescription, setJobDescription] = useState("");
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [localArtwork, setLocalArtwork] = useState<{ fileUrl: string; description: string }[]>([]);
    const { data: paperProducts } = api.paperProducts.getAll.useQuery();
    const { data: productTypes } = api.productTypes.getAll.useQuery();
    const utils = api.useUtils();
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempQuantity, setTempQuantity] = useState<number>(0);
    const [tempInk, setTempInk] = useState<string>("");
    const [tempProductTypeId, setTempProductTypeId] = useState<string>("");

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
        return paperProduct ? `${paperProduct.brand} ${paperProduct.finish} ${paperProduct.paperType} ${paperProduct.size} ${paperProduct.weightLb}lbs.` : null;
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
    const normalizedOrderItemStocks = orderItemStocks ?? [];
    const normalizedProcessingOptions = processingOptions ? processingOptions.map(normalizeProcessingOptions) : [];

    let orderPaperProducts: any[] = [];
    if (orderItemStocks) {
        // Build a list of paper products
        orderPaperProducts = orderItemStocks.map(stock => findPaperProduct(stock.paperProductId || ''));
    }

    const shippingInfo = orderItem.ShippingInfo ? orderItem.ShippingInfo : order.ShippingInfo;


    return (
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
                        <InfoCard title="Purchase Order Number" content={order.WorkOrder.purchaseOrderNumber} />
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
                        <InfoCard title="Download PDF Order Item Details" content={
                            <PrintButton
                                onClick={async () => {
                                    try {
                                        if (!shippingInfo) {
                                            throw new Error('Shipping info is required to generate PDF');
                                        }
                                        const defaultProcessingOptions = {
                                            id: '',
                                            cutting: null,
                                            padding: null,
                                            drilling: null,
                                            folding: null,
                                            other: null,
                                            numberingStart: null,
                                            numberingEnd: null,
                                            numberingColor: null,
                                            createdAt: new Date().toISOString(),
                                            updatedAt: new Date().toISOString(),
                                            orderItemId: null,
                                            workOrderItemId: null,
                                            createdById: '',
                                            description: '',
                                            stitching: null,
                                            binderyTime: null,
                                            binding: null,
                                        } as const;
                                        const processingOptions = normalizedProcessingOptions ?? [defaultProcessingOptions];
                                        await generateOrderItemPDF(
                                            orderItem, 
                                            order, 
                                            normalizedTypesetting, 
                                            normalizedOrderItemStocks, 
                                            orderPaperProducts, 
                                            shippingInfo, 
                                            processingOptions
                                        );
                                    } catch (error) {
                                        console.error('Error generating PDF:', error);
                                        toast.error('Error generating PDF');
                                    }
                                }}
                            />
                        } />
                        <InfoCard title="Print Order Item Details" content={
                            <Link href={`/orders/${orderId}/orderItem/print/${orderItemId}`}>

                                <Button variant="default">
                                    <Printer className="w-4 h-4" />
                                    Print Order Item Details
                                </Button>
                            </Link>
                        } />
                        {/* If orderItem.OrderItemStock is not null, then loop through the stocks and display the paper product */}
                        {orderItem.OrderItemStock && orderItem.OrderItemStock.length > 0 && (
                            orderItem.OrderItemStock.map((stock) => (
                                <InfoCard key={stock.id} title="Paper Product" content={findPaperProduct(stock.paperProductId || '')} />
                            ))
                        )}
                    </div>
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
                            <InfoCard title="Company" content={order.Office?.Company.name} />
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

                {/* Row 3 - Description and Instructions */}
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
                            />
                        }
                    />
                </div>

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
    );
};

export default OrderItemComponent;