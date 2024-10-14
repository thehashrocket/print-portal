// ~/app/_components/orders/OrderDetailsComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Order, OrderStatus, OrderPayment, ShippingMethod, Address, ShippingInfo } from "@prisma/client";
import OrderItemsTable from "~/app/_components/orders/orderItem/orderItemsTable";
import { formatCurrency, formatDate } from "~/utils/formatters";
import { api } from "~/trpc/react";
import { type SerializedOrder, type SerializedOrderItem } from "~/types/serializedTypes";
import OrderPaymentComponent from "~/app/_components/orders/OrderPayment/OrderPaymentComponent";
import OrderDeposit from "./OrderDeposit/orderDeposit";
import ShippingInfoEditor from "~/app/_components/shared/shippiungInfoEditor/ShippingInfoEditor";


const StatusBadge: React.FC<{ id: string, status: OrderStatus, orderId: string }> = ({ id, status, orderId }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const utils = api.useContext();
    const { mutate: updateStatus, isError } = api.orders.updateStatus.useMutation({
        onSuccess: (udpatedOrder) => {
            utils.orders.getAll.invalidate();
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
        setCurrentStatus(newStatus);
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

const InfoCard = ({ title, content }: { title: string; content: React.ReactNode }) => (
    <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
        <div className="bg-gray-50 p-4 rounded-lg">{content}</div>
    </section>
);



interface OrderDetailsProps {
    initialOrder: SerializedOrder | null; // Replace 'any' with the correct type for your order object
    orderId: string;
}

export default function OrderDetails({ initialOrder, orderId }: OrderDetailsProps) {
    const [orderItems, setOrderItems] = useState<SerializedOrderItem[]>([]);
    const [isOrderItemsLoading, setIsOrderItemsLoading] = useState(true);
    const utils = api.useContext();

    const { data: order, isLoading, isError, error } = api.orders.getByID.useQuery(orderId, {
        initialData: initialOrder,
    });

    const { mutate: createQuickbooksInvoice, error: createQuickbooksInvoiceError } = api.qbInvoices.createInvoice.useMutation({
        onSuccess: (invoice) => {
            console.log('Quickbooks invoice created:', invoice);
        },
        onError: (error) => {
            console.error('Failed to create Quickbooks invoice:', error);
        }
    });

    const handleCreateQuickbooksInvoice = (orderId: string) => {
        createQuickbooksInvoice({ orderId: orderId });
    };

    useEffect(() => {
        if (order) {
            setOrderItems(order.OrderItems);
            setIsOrderItemsLoading(false);
        }
    }, [order]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900">
                    <svg className="w-16 h-16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 22C17.523 22 22 17.523 22 12H19V7h-2v5H15V7h-2v5H11V7H9v5H7V7H5v5H3V12c0 5.523 4.477 10 10 10z" />
                    </svg>
                </div>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 text-xl">
                <p>Error loading order. Please try again.</p>
                <p>{isError && error instanceof Error ? error.message : "Unknown error"}</p>
                </div>
            </div>
        );
    }

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
                    <InfoCard
                        title="Order Number"
                        content={<p className="text-2xl font-bold">{order.orderNumber}</p>}
                    />
                    <InfoCard
                        title="Company"
                        content={<p className="text-xl">{order.Office?.Company.name}</p>}
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <InfoCard
                        title="Status"
                        content={<StatusBadge
                            id={order.id}
                            status={order.status}
                            orderId={order.id}
                        />}
                    />
                    <div className="grid-flow-dense">
                        <InfoCard
                            title="Order Price Details"
                            content={
                                <div>
                                    <p><strong>Item Total:</strong> {formatCurrency(order.totalItemAmount ?? "")}</p>
                                    <p><strong>Shipping Amount:</strong> {formatCurrency(order.totalShippingAmount ?? "")}</p>
                                    <p><strong>Subtotal:</strong> {formatCurrency(order.calculatedSubTotal ?? "")}</p>
                                    <p><strong>Calculated Sales Tax:</strong> {formatCurrency(order.calculatedSalesTax ?? "")}</p>
                                    <p><strong>Total Amount:</strong> {formatCurrency(order.totalAmount ?? "")}</p>
                                    <p>
                                        {!order.quickbooksInvoiceId &&
                                            <button
                                            className="btn btn-primary"
                                            onClick={() => handleCreateQuickbooksInvoice(order.id)}>
                                            Create Quickbooks Invoice
                                        </button>}
                                    </p>
                                    {order.quickbooksInvoiceId && <p><strong>Quickbooks Invoice ID:</strong> {order.quickbooksInvoiceId}</p>}
                                    <OrderDeposit order={order} />
                                </div>
                            }
                        />
                        <OrderPaymentComponent order={order} />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <InfoCard
                        title="Created By"
                        content={<p>{order.createdBy?.name}</p>}
                    />
                    <InfoCard
                        title="Created At"
                        content={<p>{formatDate(order.createdAt ?? "")}</p>}
                    />
                    <InfoCard
                        title="Contact Person"
                        content={<p>{order.contactPerson?.name}</p>}
                    />
                    <InfoCard
                        title="In Hands Date"
                        content={<p>{formatDate(order.inHandsDate ?? "")}</p>}
                    />
                </div>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
                    <ShippingInfoEditor
                        orderId={order.id}
                        currentShippingInfo={order.ShippingInfo}
                        officeId={order.officeId}
                        onUpdate={() => {
                            utils.orders.getByID.invalidate(orderId);
                        }}
                    />
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Order Jobs</h2>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        {isOrderItemsLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
                            </div>
                        ) : (
                            <OrderItemsTable orderItems={orderItems} />
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}