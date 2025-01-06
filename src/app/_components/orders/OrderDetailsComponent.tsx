// ~/app/_components/orders/OrderDetailsComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { OrderStatus, type ShippingMethod } from "@prisma/client";
import OrderItemsTable from "~/app/_components/orders/orderItem/orderItemsTable";
import { formatCurrency, formatDate } from "~/utils/formatters";
import { api } from "~/trpc/react";
import { type SerializedOrder, type SerializedOrderItem } from "~/types/serializedTypes";
import OrderDeposit from "./OrderDeposit/orderDeposit";
import ShippingInfoEditor from "~/app/_components/shared/shippingInfoEditor/ShippingInfoEditor";
import { toast } from "react-hot-toast";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";
import { Printer, RefreshCcw, Send, FilePlus2 } from "lucide-react";
import { generateOrderPDF } from "~/utils/generateOrderPDF";
import { StatusBadge } from "../shared/StatusBadge/StatusBadge";
import ContactPersonEditor from "../shared/ContactPersonEditor/ContactPersonEditor";
import { Receipt, Truck, Calculator, Percent, DollarSign, FileText, ReceiptIcon, PlusCircle } from 'lucide-react';
import { Button } from "../ui/button";
import { generateOrderPDFData } from "~/app/_components/orders/OrderPDFGenerator";
import { Input } from "../ui/input";
import { useQuickbooksStore } from '~/store/useQuickbooksStore';

const OrderStatusBadge: React.FC<{ id: string, status: OrderStatus, orderId: string }> = ({ id, status, orderId }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const utils = api.useUtils();
    const { mutate: updateStatus } = api.orders.updateStatus.useMutation({
        onSuccess: () => {
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
    <section className="mb-6 bg-white p-4 rounded-lg shadow-md">
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
            <FilePlus2 className="w-4 h-4" />
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
    const [recipientEmail, setRecipientEmail] = useState('');
    const utils = api.useUtils();
    const isAuthenticated = useQuickbooksStore((state) => state.isAuthenticated);
    const { data: order, isLoading, isError, error } = api.orders.getByID.useQuery(orderId, {
        initialData: initialOrder,
    });

    // Use sendOrderEmail from orders/order.ts
    const { mutate: sendOrderEmail } = api.orders.sendOrderEmail.useMutation({
        onSuccess: () => {
            toast.success('Order sent by email');
        },
        onError: (error) => {
            console.error('Failed to send order by email:', error);
            toast.error('Failed to send order by email');
        }
    });

    useCopilotReadable({
        description: "The current order that is being viewed.",
        value: order,
    });

    const { mutate: createQuickbooksInvoice } = api.qbInvoices.createQbInvoiceFromOrder.useMutation({
        onSuccess: () => {
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
                        <RefreshCcw className="w-16 h-16" />
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
                                <FilePlus2 className="w-4 h-4" /> Create Order
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
                            {/* Status Badge */}
                            <InfoCard
                                title="Order Status"
                                content={<OrderStatusBadge
                                    id={order.id}
                                    status={order.status}
                                    orderId={order.id}
                                />}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                {/* Print Order */}
                                <InfoCard
                                    title="Print Order"
                                    content={<Button
                                        variant="default"
                                        onClick={async () => {
                                            try {
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
                                {/* Send Order by Email */}
                                <InfoCard
                                    title="Send Order by Email"
                                    content={

                                        <div className="flex flex-col gap-2">
                                            <Input
                                                type="email"
                                                placeholder="Recipient Email"
                                                value={recipientEmail}
                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                            />

                                            <Button
                                                variant="default"
                                                onClick={async () => {
                                                    try {
                                                        console.log('Testing PDF generation...');
                                                        // Test PDF generation first
                                                        const testOrder = await utils.orders.getByID.fetch(order.id);
                                                        if (!testOrder) {
                                                            console.error('Could not fetch order');
                                                            return;
                                                        }
                                                        // If recipient email is not set, use the contact person email
                                                        const emailToUse = recipientEmail || testOrder.contactPerson?.email;
                                                        if (!emailToUse) {
                                                            toast.error('No recipient email provided');
                                                            return;
                                                        }

                                                        // Try to generate PDF and log the result
                                                        const testPdf = await generateOrderPDFData(testOrder);
                                                        console.log('PDF generated successfully:', {
                                                            hasContent: !!testPdf,
                                                            length: testPdf?.length,
                                                            firstFewChars: testPdf?.substring(0, 50)
                                                        });

                                                        // Only proceed with email if PDF generation worked
                                                        if (testPdf) {
                                                            console.log('Proceeding with email send...');
                                                            // Extract base64 content from data URI
                                                            const base64Content = testPdf?.split(',')[1] ?? '';

                                                            await sendOrderEmail({
                                                                orderId: order.id,
                                                                recipientEmail: emailToUse,
                                                                pdfContent: base64Content
                                                            });
                                                            console.log('Email sent successfully');
                                                        } else {
                                                            console.error('PDF generation failed');
                                                            toast.error('Failed to generate PDF');
                                                        }
                                                    } catch (error) {
                                                        console.error('Error in button click handler:', error);
                                                        if (error instanceof Error) {
                                                            console.error('Error details:', {
                                                                message: error.message,
                                                                stack: error.stack
                                                            });
                                                        }
                                                        toast.error('Failed to process request');
                                                    }
                                                }}
                                            >
                                                <Send className="w-4 h-4" /> Send Order by Email
                                            </Button>
                                        </div>
                                    }
                                />
                            </div>
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
                                                        disabled={!isAuthenticated}
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

                    <section className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Shipping Information</h2>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <ShippingInfoEditor
                                orderId={order.id}
                                currentShippingInfo={order.ShippingInfo}
                                officeId={order.officeId}
                                onUpdate={() => {
                                    // Wrap the invalidation in a try-catch and add a small delay
                                    try {
                                        setTimeout(() => {
                                            utils.orders.getByID.invalidate(orderId)
                                                .catch(error => {
                                                    console.error("Error invalidating order:", error);
                                                    toast.error("Error refreshing order details");
                                                });
                                        }, 100);
                                    } catch (error) {
                                        console.error("Error in shipping info update:", error);
                                        toast.error("Error updating shipping information");
                                    }
                                }}
                            />
                        </div>
                    </section>

                    <section className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Order Items</h2>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-md">
                            {isOrderItemsLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
                                </div>
                            ) : orderItems && orderItems.length > 0 ? (
                                <OrderItemsTable orderItems={orderItems} />
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    No order items found
                                </div>
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