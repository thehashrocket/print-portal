// ~/app/_components/orders/orderItem/orderItemComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import { OrderItemStatus } from "@prisma/client";
import { api } from "~/trpc/react";
import Link from "next/link";
import { TypesettingProvider } from '~/app/contexts/TypesettingContext';
import TypesettingComponent from "~/app/_components/shared/typesetting/typesettingComponent";
import ProcessingOptionsComponent from "~/app/_components/shared/processingOptions/processingOptionsComponent";
import { ProcessingOptionsProvider } from "~/app/contexts/ProcessingOptionsContext";
import ArtworkComponent from "../../shared/artworkComponent/artworkComponent";
import { normalizeTypesetting } from "~/utils/dataNormalization";
import OrderItemStockComponent from "../OrderItemStock/orderItemStockComponent";
import { toast } from "react-hot-toast";
import { StatusBadge } from "../../shared/StatusBadge/StatusBadge";
import { generateOrderItemPDF } from '~/utils/generateOrderItemPDF'; // You'll need to create this file
import { PrintButton } from './PrintButton'; // Create this component in the same directory
import ContactPersonEditor from "../../shared/ContactPersonEditor/ContactPersonEditor";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

type OrderItemPageProps = {
    orderId: string;
    orderItemId: string;
};

const ItemStatusBadge: React.FC<{ id: string, status: OrderItemStatus, orderId: string }> = ({ id, status, orderId }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const utils = api.useUtils();

    const { mutate: updateStatus } = api.orderItems.updateStatus.useMutation({
        onSuccess: () => {
            utils.orders.getByID.invalidate(orderId);
        },
        onError: (error) => {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
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
    const { mutate: updateDescription } = api.orderItems.updateDescription.useMutation({
        onSuccess: () => {
            toast.success('Job description updated successfully');
            utils.orderItems.getByID.invalidate(orderItemId);
        },
        onError: (error) => {
            console.error('Failed to update job description:', error);
            toast.error('Failed to update job description');
        }
    });

    const utils = api.useUtils();
    const [jobDescription, setJobDescription] = useState("");

    useEffect(() => {
        if (orderItem) {
            setJobDescription(orderItem.description);
        }
    }, [orderItem]);

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setJobDescription(e.target.value);
    };

    const updateJobDescription = () => {
        updateDescription({ id: orderItemId, description: jobDescription });
    };

    if (orderLoading || itemLoading || typesettingLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (orderError || itemError || !order || !orderItem) {
        return <div className="text-red-500 text-center mt-8">Error loading job details.</div>;
    }



    const normalizedTypesetting = typesettingData ? typesettingData.map(normalizeTypesetting) : [];



    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Job Details</h1>
                <PrintButton
                    onClick={async () => {
                        try {
                            await generateOrderItemPDF(orderItem, order, normalizedTypesetting);
                        } catch (error) {
                            console.error('Error generating PDF:', error);
                            toast.error('Error generating PDF');
                        }
                    }}
                />
                <div className="text-sm breadcrumbs">
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/orders">Orders</Link></li>
                        <li><Link href={`/orders/${orderId}`}>Order {order.orderNumber}</Link></li>
                        <li>Job {orderItem.orderItemNumber}</li>
                    </ul>
                </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
                {/* Row 1 */}
                <div className="flex flex-col gap-4 mb-2">
                    <div className="grid grid-cols-3 gap-4 mb-2">
                        <InfoCard title="Order Number" content={order.orderNumber} />
                        <InfoCard title="Job Number" content={orderItem.orderItemNumber} />
                        <InfoCard title="Purchase Order Number" content={order.WorkOrder.purchaseOrderNumber} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <InfoCard title="Company" content={order.Office?.Company.name} />
                        <InfoCard title="Contact Info" content={
                            <ContactPersonEditor
                                orderId={order.id}
                                currentContactPerson={order.contactPerson}
                                officeId={order.officeId}
                                onUpdate={() => {
                                    utils.orders.getByID.invalidate(orderId);
                                }}
                            />
                        } />
                    </div>
                </div>
                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Job Description</h2>
                        <Input
                            type="text"
                            value={jobDescription}
                            onChange={handleDescriptionChange}
                            className="bg-gray-50 p-4 rounded-lg w-full mb-4"
                        />
                        <Button
                            variant="default"
                            onClick={updateJobDescription}
                        >
                            Update Description
                        </Button>
                    </div>
                    <InfoCard
                        title="Job Quantity"
                        content={orderItem.quantity}
                    />
                    <InfoCard
                        title="Ink"
                        content={orderItem.ink}
                    />
                </div>
                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <InfoCard title="Status" content={
                        <ItemStatusBadge id={orderItem.id} status={orderItem.status} orderId={orderItem.orderId} />
                    } />
                </div>
                {/* Row 4 */}
                <div className="grid grid-cols-1 gap-4 mb-2">
                    {/* Render OrderItemArtwork */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-gray-600 text-xl font-semibold">Artwork</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {orderItem?.artwork.map((artwork: { id: React.Key | null | undefined; fileUrl: string; description: string | null; }) => (
                                <div key={artwork.id} className="rounded-lg bg-white p-6 shadow-md">
                                    <ArtworkComponent artworkUrl={artwork.fileUrl} artworkDescription={artwork.description} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 5 */}
                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Typesetting</h2>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <TypesettingProvider>
                                <TypesettingComponent
                                    workOrderItemId=""
                                    orderItemId={orderItem.id}
                                    initialTypesetting={normalizedTypesetting}
                                />
                            </TypesettingProvider>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Bindery Options</h2>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <ProcessingOptionsProvider orderItemId={orderItem.id}>
                                <ProcessingOptionsComponent orderItemId={orderItem.id} />
                            </ProcessingOptionsProvider>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Job Stock</h2>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <OrderItemStockComponent orderItemId={orderItem.id} />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default OrderItemComponent;