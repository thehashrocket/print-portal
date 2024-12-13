// ~/app/_components/orders/OrderDetailsComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Order, OrderStatus, OrderPayment, ShippingMethod, Address, ShippingInfo } from "@prisma/client";
import OrderItemsTable from "~/app/_components/orders/orderItem/orderItemsTable";
import { formatCurrency, formatDate } from "~/utils/formatters";
import { api } from "~/trpc/react";
import { type SerializedOrder, type SerializedOrderItem } from "~/types/serializedTypes";
import OrderDeposit from "./OrderDeposit/orderDeposit";
import ShippingInfoEditor from "~/app/_components/shared/shippingInfoEditor/ShippingInfoEditor";
import { toast } from "react-hot-toast";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";
import { Printer, Send } from "lucide-react";
import { generateOrderPDF } from "~/utils/pdfGenerator";
import { StatusBadge } from "../shared/StatusBadge/StatusBadge";
import ContactPersonEditor from "../shared/ContactPersonEditor/ContactPersonEditor";
import { Receipt, Truck, Calculator, Percent, DollarSign, FileText, ReceiptIcon, PlusCircle } from 'lucide-react';
import { Button } from "../ui/button";

const ItemStatusBadge: React.FC<{ id: string, status: OrderStatus, orderId: string }> = ({ id, status, orderId }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const utils = api.useUtils();
    const { mutate: updateStatus } = api.orders.updateStatus.useMutation({
        onSuccess: (data) => {
            console.log('data', data);
            utils.orders.getByID.invalidate(orderId);
            toast.success('Status updated successfully');
        },
        onError: (error) => {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
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
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const handleStatusChange = (
        newStatus: OrderStatus,
        sendEmail: boolean,
        emailOverride: string,
        shippingDetails?: {
            trackingNumber?: string;
            shippingMethod?: ShippingMethod;
        }
    ) => {
        updateStatus({
            id,
            status: newStatus,
            sendEmail,
            emailOverride,
            shippingDetails
        });
        setCurrentStatus(newStatus);
    };

    return (
        <StatusBadge<OrderStatus>
            id={id}
            status={status}
            currentStatus={currentStatus}
            orderId={orderId}
            onStatusChange={handleStatusChange}
            getStatusColor={getStatusColor}
            statusOptions={Object.values(OrderStatus)}
        />
    );
}

const InfoCard = ({ title, content }: { title: string; content: React.ReactNode }) => (
    <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
        <div className="bg-gray-50 p-4 rounded-lg">{content}</div>
    </section>
);

const CreateInvoiceButton = ({ order }: { order: SerializedOrder }) => {
    const utils = api.useUtils();
    const { mutate: createInvoice } = api.invoices.create.useMutation({
        onSuccess: () => {
            utils.orders.getByID.invalidate(order.id);
            toast.success('Invoice created');
        },
        onError: (error) => {
            console.error('Failed to create invoice:', error);
            toast.error('Failed to create invoice');
        }
    });

    const handleCreateInvoice = () => {
        createInvoice({
            orderId: order.id,
            dateIssued: new Date(),
            dateDue: new Date(new Date().setDate(new Date().getDate() + 14)),
            subtotal: Number(order.calculatedSubTotal),
            taxRate: Number(0.07),
            taxAmount: Number(order.calculatedSalesTax),
            total: Number(order.totalAmount),
            status: "Draft",
            items: order.OrderItems.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: Number((Number(item.amount) / Number(item.quantity)).toFixed(2)),
                total: Number(item.amount),
                orderItemId: item.id,
            })),
        });
    };

    const isInvoiceCreated = order.Invoice !== null;

    const buttonText = isInvoiceCreated ? "Invoice Created" : "Create Invoice";

    return (
        <Button
            variant="default"
            disabled={isInvoiceCreated}
            onClick={handleCreateInvoice}
        >
            <FileText className="w-4 h-4" />
            {buttonText}
        </Button>
    );
};

interface OrderDetailsProps {
    initialOrder: SerializedOrder | null; // Replace 'any' with the correct type for your order object
    orderId: string;
}

export default function OrderDetails({ initialOrder, orderId }: OrderDetailsProps) {
    const [orderItems, setOrderItems] = useState<SerializedOrderItem[]>([]);
    const [isOrderItemsLoading, setIsOrderItemsLoading] = useState(true);
    const utils = api.useUtils();

    const { data: order, isLoading, isError, error } = api.orders.getByID.useQuery(orderId, {
        initialData: initialOrder,
    });

    useCopilotReadable({
        description: "The current order that is being viewed.",
        value: order,
    });

    const { mutate: createQuickbooksInvoice, error: createQuickbooksInvoiceError } = api.qbInvoices.createQbInvoiceFromOrder.useMutation({
        onSuccess: (invoice) => {
            toast.success('Quickbooks invoice created');
            utils.orders.getByID.invalidate(orderId);
        },
        onError: (error) => {
            console.error('Failed to create Quickbooks invoice:', error);
        }
    });

    const handleCreateQuickbooksInvoice = (orderId: string) => {
        createQuickbooksInvoice({ orderId: orderId });
    };

    const handlePrintOrder = (orderId: string) => {
        // sendOrderEmail({ orderId: orderId, recipientEmail: order?.contactPerson?.email ?? "" });
        if (order) {
            const pdfContent = generateOrderPDF(order);
        }
    };

    useEffect(() => {
        if (order) {
            setOrderItems(order.OrderItems);
        }
    }, [order]);

    useEffect(() => {
        if (orderItems) {
            setIsOrderItemsLoading(false);
        }
    }, [orderItems]);

    if (isLoading) {
        return (
            <>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900">
                        <svg className="w-16 h-16" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 22C17.523 22 22 17.523 22 12H19V7h-2v5H15V7h-2v5H11V7H9v5H7V7H5v5H3V12c0 5.523 4.477 10 10 10z" />
                        </svg>
                    </div>
                </div>
            </>
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
        <>
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold">Order Details</h1>
                        <Link href="/workOrders/create">
                            <Button
                                variant="default"
                            >
                                Create Order
                            </Button>
                        </Link>
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
                        <div className="grid-cols-1 gap-4">
                            <InfoCard
                                title="Status"
                                content={<ItemStatusBadge
                                    id={order.id}
                                    status={order.status}
                                    orderId={order.id}
                                />}
                            />
                            <InfoCard
                                title="Print Order"
                                content={<Button
                                    variant="default"
                                    onClick={async () => {
                                        try {
                                            console.log('Generating order PDF', order);
                                            await generateOrderPDF(order);
                                        } catch (error) {
                                            console.error('Error generating PDF:', error);
                                            toast.error('Error generating PDF');
                                        }
                                    }}
                                >
                                    <Printer className="w-4 h-4" /> Print Order
                                </Button>}
                            />
                        </div>
                        <div className="grid-flow-dense">
                            <InfoCard
                                title="Order Price Details"
                                content={
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Left Column - Price Details */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Item Total</div>
                                                        <div className="font-semibold">{formatCurrency(order.totalItemAmount ?? "")}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Truck className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Shipping Amount</div>
                                                        <div className="font-semibold">{formatCurrency(order.totalShippingAmount ?? "")}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Calculator className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Subtotal</div>
                                                        <div className="font-semibold">{formatCurrency(order.calculatedSubTotal ?? "")}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Percent className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Sales Tax</div>
                                                        <div className="font-semibold">{formatCurrency(order.calculatedSalesTax ?? "")}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2 border-t">
                                                    <DollarSign className="w-5 h-5 text-green-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Total Amount</div>
                                                        <div className="text-lg font-bold text-green-600">{formatCurrency(order.totalAmount ?? "")}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column - Actions */}
                                            <div className="space-y-3">
                                                <div>
                                                    {order.Invoice === null ? (
                                                        <CreateInvoiceButton order={order} />
                                                    ) : (
                                                        <Link
                                                            href={`/invoices/${order.Invoice.id}`}
                                                        >
                                                            <Button
                                                                variant="default"
                                                            >
                                                                <ReceiptIcon className="w-4 h-4" />
                                                                View Invoice
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>

                                                {!order.quickbooksInvoiceId && (
                                                    <Button
                                                        variant="default"
                                                        onClick={() => handleCreateQuickbooksInvoice(order.id)}
                                                    >
                                                        <PlusCircle className="w-4 h-4" />
                                                        Create QuickBooks Invoice
                                                    </Button>
                                                )}

                                                {order.quickbooksInvoiceId && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FileText className="w-4 h-4" />
                                                        QB Invoice: {order.quickbooksInvoiceId}
                                                    </div>
                                                )}

                                                <OrderDeposit order={order} />
                                            </div>
                                        </div>
                                    </div>
                                }
                            />
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
                            content={<ContactPersonEditor
                                orderId={order.id}
                                currentContactPerson={order.contactPerson}
                                officeId={order.officeId}
                                onUpdate={() => {
                                    utils.orders.getByID.invalidate(orderId);
                                }}
                            />}
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
                                console.log("Shipping info updated");
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
            <CopilotPopup
                instructions={"You are assisting the user as best as you can. Ansewr in the best way possible given the data you have."}
                labels={{
                    title: "Order Details Assistant",
                    initial: "Need any help?",
                }}
            />
        </>
    );
}