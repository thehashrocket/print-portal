// ~/src/app/_components/invoices/InvoiceDetailClient.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { api } from "~/trpc/react";
import Link from 'next/link';
import { formatCurrency, formatDate } from '~/utils/formatters';
import AddPaymentForm from '~/app/_components/invoices/AddPaymentForm';
import PrintableInvoice from './PrintableInvoice';
import { Invoice, InvoiceStatus, Order, OrderStatus, InvoicePayment, InvoiceItem, PaymentMethod, User, ShippingMethod } from '@prisma/client';
import { SerializedAddress, SerializedInvoice, SerializedOrder } from '~/types/serializedTypes';

interface InvoiceDetailClientProps {
    initialInvoice: SerializedInvoice;
}

const InvoiceDetailClient: React.FC<InvoiceDetailClientProps> = ({ initialInvoice }) => {
    const [invoice, setInvoice] = useState<SerializedInvoice>(initialInvoice);
    const [order, setOrder] = useState<SerializedOrder>();
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const sendInvoiceMutation = api.invoices.sendInvoiceEmail.useMutation();
    const utils = api.useUtils();

    // When the order is updated, update the local state
    const { data: invoiceData, refetch } = api.invoices.getById.useQuery<SerializedInvoice>(initialInvoice.id, {
        initialData: initialInvoice,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    const { mutate: createQuickbooksInvoice, error: createQuickbooksInvoiceError } = api.qbInvoices.createQbInvoiceFromInvoice.useMutation({
        onSuccess: (invoice) => {
            console.log('Quickbooks invoice created:', invoice);
        },
        onError: (error) => {
            console.error('Failed to create Quickbooks invoice:', error);
        }
    });
    const { data: orderData, refetch: refetchOrder } = api.orders.getByID.useQuery<SerializedOrder>(invoice.orderId, {
        enabled: !!invoice.orderId,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });


    const formatTaxRate = (taxRate: number) => {
        return taxRate.toFixed(2);
    };

    const handleCreateQuickbooksInvoice = (invoiceId: string) => {
        createQuickbooksInvoice({ invoiceId: invoiceId });
    };

    useEffect(() => {
        if (invoiceData) {
            setInvoice(invoiceData as SerializedInvoice);
            refetchOrder();
            
        }
        if (orderData) {
            setOrder(orderData as SerializedOrder);
        }
    }, [invoiceData, orderData]);

    const handlePaymentAdded = () => {
        refetch();
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
    };

    const handleSendInvoice = async () => {
        setIsSending(true);
        try {
            // Assuming you have access to the User object associated with createdById
            const recipientEmail = invoice.createdBy.email || ''; // Use the email from the User object
            await sendInvoiceMutation.mutateAsync({
                invoiceId: invoice.id,
                recipientEmail: recipientEmail,
            });
            alert('Invoice sent successfully');
            refetch();
        } catch (error) {
            console.error('Failed to send invoice:', error);
            alert('Failed to send invoice. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    if (isPrinting) {
        // return <PrintableInvoice invoice={invoice} />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Invoice {invoice.invoiceNumber}</h1>
                <div>
                    <Link href="/invoices" className="btn btn-secondary mr-2">
                        Back to Invoices
                    </Link>
                    <Link href={`/invoices/${invoice.id}/edit`} className="btn btn-primary mr-2">
                        Edit Invoice
                    </Link>
                    <button onClick={handlePrint} className="btn btn-primary mr-2">
                        Print Invoice
                    </button>
                    <button
                        onClick={handleSendInvoice}
                        className="btn btn-primary"
                        disabled={isSending || invoice.status === InvoiceStatus.Sent}
                    >
                        {isSending ? 'Sending...' : 'Send Invoice'}
                    </button>
                </div>
            </div>
            <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Invoice Details</h2>
                            <p><strong>Status:</strong> {invoice.status}</p>
                            <p><strong>Date Issued:</strong> {formatDate(invoice.dateIssued)}</p>
                            <p><strong>Due Date:</strong> {formatDate(invoice.dateDue)}</p>
                            <p><strong>Subtotal:</strong> {formatCurrency(Number(invoice.subtotal))}</p>
                            <p><strong>Tax Rate:</strong> {formatTaxRate(Number(invoice.taxRate))}%</p>
                            <p><strong>Tax Amount:</strong> {formatCurrency(Number(invoice.taxAmount))}</p>
                            <p><strong>Total:</strong> {formatCurrency(Number(invoice.total))}</p>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Order Information</h2>
                            <p><strong>Company:</strong> {order?.Office?.Company.name}</p>
                            <p><strong>Order Number:</strong> {order?.orderNumber}</p>
                            <p><strong>Order Status:</strong> {order?.status}</p>
                            <Link href={`/orders/${invoice.orderId}`} className="btn btn-sm btn-outline mt-2">
                                View Order
                            </Link>
                            <p>
                                {!invoice.quickbooksId &&
                                    <button
                                        className="btn btn-primary btn-sm mt-2 mb-2"
                                        onClick={() => handleCreateQuickbooksInvoice(invoice.id)}>
                                        Create Quickbooks Invoice
                                    </button>}
                            </p>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Shipping Address</h2>
                            {order?.ShippingInfo && (
                                <div>
                                    <strong>Address:</strong> <br />
                                    Shipping Method: {order?.ShippingInfo?.shippingMethod}<br />
                                    {order?.ShippingInfo?.shippingMethod === ShippingMethod.Other && (
                                        <>
                                            <strong>Instructions:</strong> {order?.ShippingInfo?.shippingNotes}<br />
                                            <strong>Estimated Delivery:</strong> {formatDate(order?.ShippingInfo?.estimatedDelivery ?? "")}<br />
                                        </>
                                    )}
                                    {order?.ShippingInfo?.shippingMethod === ShippingMethod.Pickup && (
                                        <>
                                            <strong>Pickup Location:</strong> {order?.ShippingInfo?.shippingNotes}<br />
                                            <strong>Pickup Date:</strong> {formatDate(order?.ShippingInfo?.estimatedDelivery ?? "")}<br />
                                        </>
                                    )}
                                    {order?.ShippingInfo?.shippingMethod === ShippingMethod.Delivery && (
                                        <>
                                            <strong>Delivery Location:</strong> {order?.ShippingInfo?.Address?.line1}<br />
                                            {order?.ShippingInfo?.Address?.line2}<br />
                                            {order?.ShippingInfo?.Address?.city}, {order?.ShippingInfo?.Address?.state} {order?.ShippingInfo?.Address?.zipCode}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Contact Person</h2>
                            {order?.contactPerson && (
                                <div>
                                    <p><strong>Name:</strong> {order?.contactPerson?.name}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Invoice Items</h2>
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.InvoiceItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.description}</td>
                                        <td>{item.quantity}</td>
                                        <td>{formatCurrency(Number(item.unitPrice))}</td>
                                        <td>{formatCurrency(Number(item.total))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Payments</h2>
                        {invoice.InvoicePayments.length > 0 ? (
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.InvoicePayments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>{formatDate(payment.paymentDate)}</td>
                                            <td>{formatCurrency(payment.amount)}</td>
                                            <td>{payment.paymentMethod}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No payments recorded for this invoice.</p>
                        )}
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl mt-6">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Add Payment</h2>
                        <AddPaymentForm invoiceId={invoice.id} onPaymentAdded={handlePaymentAdded} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailClient;
