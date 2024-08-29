// ~/app/_components/orders/OrderDetailsComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Order, OrderStatus, ShippingMethod } from "@prisma/client";
import OrderItemsTable from "../../_components/orders/orderItem/orderItemsTable";
import { formatCurrency, formatDate } from "~/utils/formatters";
import { api } from "~/trpc/react";
import { SerializedOrder } from "~/types/serializedTypes";

const StatusBadge: React.FC<{ id: string, status: OrderStatus, orderId: string }> = ({ id, status, orderId }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const utils = api.useContext();
    const { mutate: updateStatus, isError } = api.orders.updateStatus.useMutation({
        onSuccess: (udpatedOrder) => {
            setCurrentStatus(udpatedOrder.status);
            utils.workOrders.getByID.invalidate(orderId);
        },
        onError: (error) => {
            console.error('Failed to update status:', error);
            // Optionally, you can show an error message to the user here
        }
    });

    const getStatusColor = (status: OrderStatus): string => {
        switch (status) {
            case "Completed": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            case "Pending": return "bg-yellow-100 text-yellow-800";
            case "Shipping": return "bg-blue-100 text-blue-800";
            case "Invoicing": return "bg-blue-100 text-blue-800";
            case "PaymentReceived": return "bg-blue-100 text-blue-800";
            default: return "bg-blue-100 text-blue-800";
        }
    };

    const handleStatusChange = (newStatus: OrderStatus) => {
        updateStatus({ id, status: newStatus });
    };

    useEffect(() => {
        setCurrentStatus(status);
    }, [status]);

    return (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentStatus)}`}>
                {currentStatus}
            </span>
            <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                className="px-2 py-1 rounded-md border border-gray-300"
            >
                {Object.values(OrderStatus).map((status) => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
            {isError && <p className="text-red-500 mt-2">Failed to update status. Please try again.</p>}
        </div>
    );
};

const InfoSection = ({ title, content }: { title: string; content: React.ReactNode }) => (
    <section className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
        <div>{content}</div>
    </section>
);

const formatShippingMethod = (method: ShippingMethod) => {
    return method.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

interface OrderDetailsProps {
    initialOrder: SerializedOrder | null; // Replace 'any' with the correct type for your order object
    orderId: string;
}

export default function OrderDetails({ initialOrder, orderId }: OrderDetailsProps) {
    const { data: order, refetch, isLoading, isError } = api.orders.getByID.useQuery(orderId, {
        initialData: initialOrder,
        refetchInterval: 5000,
    });

    useEffect(() => {
        const refetchInterval = setInterval(() => {
            refetch();
        }, 5000);

        return () => clearInterval(refetchInterval);
    }, [refetch]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 text-xl">Error loading work order. Please try again.</div>
            </div>
        );
    }

    const serializedOrderItems = order.OrderItems.map((item: any) => ({
        ...item,
        amount: item.amount?.toString() ?? null,
        cost: item.cost?.toString() ?? null,
        createdAt: item.createdAt?.toString(),
        expectedDate: item.expectedDate?.toString(),
        updatedAt: item.updatedAt?.toString(),
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Order Details</h1>
                    <Link className="btn btn-primary" href="/orders/create">Create Order</Link>
                </div>
                <nav aria-label="breadcrumb" className="text-sm breadcrumbs">
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/orders">Orders</Link></li>
                        <li>Order {order.orderNumber}</li>
                    </ul>
                </nav>
            </header>

            <main className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <InfoSection
                        title="Order Number"
                        content={<p className="text-2xl font-bold">{order.orderNumber}</p>}
                    />
                    <InfoSection
                        title="Company"
                        content={<p className="text-xl">{order.Office?.Company.name}</p>}
                    />
                    <InfoSection
                        title="Status"
                        content={<StatusBadge
                            id={order.id}
                            status={order.status}
                            orderId={order.id}
                        />}
                    />
                    <InfoSection
                        title="Order Price Details"
                        content={
                            <div>
                                <p><strong>Item Total:</strong> {formatCurrency(order.totalItemAmount ?? "")}</p>
                                <p><strong>Shipping Amount:</strong> {formatCurrency(order.totalShippingAmount ?? "")}</p>
                                <p><strong>Subtotal:</strong> {formatCurrency(order.calculatedSubTotal ?? "")}</p>
                                <p><strong>Calculated Sales Tax:</strong> {formatCurrency(order.calculatedSalesTax ?? "")}</p>
                                <p><strong>Total Amount:</strong> {formatCurrency(order.totalAmount ?? "")}</p>
                                <p><strong>Deposit:</strong> {formatCurrency(order.deposit ?? "")}</p>
                            </div>
                        }
                    />
                    <InfoSection
                        title="Created By"
                        content={<p>{order.createdBy?.name}</p>}
                    />
                    <InfoSection
                        title="Created At"
                        content={<p>{formatDate(order.createdAt ?? "")}</p>}
                    />
                    <InfoSection
                        title="Contact Person"
                        content={<p>{order.contactPerson?.name}</p>}
                    />
                    <InfoSection
                        title="In Hands Date"
                        content={<p>{formatDate(order.inHandsDate ?? "")}</p>}
                    />
                </div>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <InfoSection
                            title="Recipient"
                            content={
                                <>
                                    <p className="font-semibold">{order.ShippingInfo?.attentionTo || order.Office?.Company.name}</p>
                                    <p>{order.ShippingInfo?.Address?.line1}</p>
                                    {order.ShippingInfo?.Address?.line2 && <p>{order.ShippingInfo.Address.line2}</p>}
                                    <p>{order.ShippingInfo?.Address?.city}, {order.ShippingInfo?.Address?.state} {order.ShippingInfo?.Address?.zipCode}</p>
                                    <p>{order.ShippingInfo?.Address?.country}</p>
                                </>
                            }
                        />
                        <InfoSection
                            title="Shipping Details"
                            content={
                                <>
                                    <p><strong>Method:</strong> {order.ShippingInfo ? formatShippingMethod(order.ShippingInfo.shippingMethod) : 'N/A'}</p>
                                    <p><strong>Phone:</strong> {order.ShippingInfo?.Address?.telephoneNumber || 'N/A'}</p>
                                    <p><strong>Cost:</strong> {formatCurrency(order.ShippingInfo?.shippingCost ?? "")}</p>
                                    <p><strong>Date:</strong> {formatDate(order.ShippingInfo?.shippingDate ?? "")}</p>
                                    <p><strong>Estimated Delivery:</strong> {formatDate(order.ShippingInfo?.estimatedDelivery ?? "")}</p>
                                    <p><strong>Number of Packages:</strong> {order.ShippingInfo?.numberOfPackages || 'N/A'}</p>
                                    <p><strong>Tracking Number:</strong> {order.ShippingInfo?.trackingNumber || 'N/A'}</p>
                                </>
                            }
                        />
                    </div>
                    {order.ShippingInfo?.ShippingPickup && (
                        <div className="mt-4">
                            <InfoSection
                                title="Pickup Information"
                                content={
                                    <>
                                        <p><strong>Date:</strong> {order.ShippingInfo.ShippingPickup.pickupDate ? formatDate(order.ShippingInfo.ShippingPickup.pickupDate) : null}</p>
                                        <p><strong>Time:</strong> {order.ShippingInfo.ShippingPickup.pickupTime}</p>
                                        <p><strong>Contact:</strong> {order.ShippingInfo.ShippingPickup.contactName}</p>
                                        <p><strong>Phone:</strong> {order.ShippingInfo.ShippingPickup.contactPhone}</p>
                                        {order.ShippingInfo.ShippingPickup.notes && (
                                            <p><strong>Notes:</strong> {order.ShippingInfo.ShippingPickup.notes}</p>
                                        )}
                                    </>
                                }
                            />
                        </div>
                    )}
                </section>
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Order Jobs</h2>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <OrderItemsTable orderItems={serializedOrderItems} />
                    </div>
                </section>
            </main>
        </div>
    );
}