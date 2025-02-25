// ~/src/app/_components/invoices/InvoiceDetailClient.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { api } from "~/trpc/react";
import Link from 'next/link';
import { formatCurrency, formatDate } from '~/utils/formatters';
import AddPaymentForm from '~/app/_components/invoices/AddPaymentForm';
import { ShippingMethod } from '@prisma/client';
import { type SerializedInvoice, type SerializedOrder } from '~/types/serializedTypes';
import { toast } from 'react-hot-toast';
import { Download, Send } from 'lucide-react';
import { Button } from '../ui/button';

interface InvoiceDetailClientProps {
    initialInvoice: SerializedInvoice | null;
    invoiceId: string;
}

const InvoiceDetailClient: React.FC<InvoiceDetailClientProps> = ({ initialInvoice, invoiceId }) => {
    const [invoice, setInvoice] = useState<SerializedInvoice | null>(initialInvoice);
    const [order, setOrder] = useState<SerializedOrder | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const utils = api.useUtils();

    // When the order is updated, update the local state
    const { data: invoiceData, error } = api.invoices.getById.useQuery<SerializedInvoice>(invoiceId, {
        initialData: initialInvoice || undefined
    });

    const { mutate: getInvoicePdfMutation} = api.qbInvoices.getInvoicePdf.useMutation({
        onSuccess: (pdfBase64) => {
            // Convert base64 to blob
            const binaryString = window.atob(pdfBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/pdf' });
    
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoice?.invoiceNumber}.pdf`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('PDF downloaded successfully');
            setIsPrinting(false);
        },
        onError: (error) => {
            console.error('Failed to download PDF:', error);
            toast.error('Failed to download PDF');
            setIsPrinting(false);
        }
    });

    const { mutate: createQuickbooksInvoice } = api.qbInvoices.createQbInvoiceFromInvoice.useMutation({
        onSuccess: (invoice) => {
            console.log('Quickbooks invoice created:', invoice);
            toast.success('Quickbooks invoice created');
            utils.invoices.getById.invalidate(invoiceId);
        },
        onError: (error) => {
            console.error('Failed to create Quickbooks invoice:', error);
            toast.error('Failed to create Quickbooks invoice');
        }
    });

    const { mutate: sendInvoiceEmailMutation } = api.qbInvoices.sendInvoiceEmail.useMutation({
        onSuccess: (data) => {
            toast.success('Invoice sent successfully');
            utils.invoices.getById.invalidate(invoiceId);
            console.log('data', data);
        },
        onError: (error) => {
            console.error('Failed to send invoice:', error);
            toast.error('Failed to send invoice');
        }
    });

    const { data: orderData, refetch: refetchOrder } = api.orders.getByID.useQuery<SerializedOrder>(
        invoice?.orderId ?? '',
        {
            enabled: !!invoice?.orderId,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        }
    );

    useEffect(() => {
        if (invoiceData) {
            setInvoice(invoiceData as SerializedInvoice);
            refetchOrder();
        }
        if (orderData) {
            setOrder(orderData as SerializedOrder);
        }
    }, [invoiceData, orderData, refetchOrder]);

    if (error || !invoice) {
        return <div className="alert alert-error">Invoice not found.</div>;
    }

    const formatTaxRate = (taxRate: number) => {
        return taxRate.toFixed(2);
    };

    const handleCreateQuickbooksInvoice = (invoiceId: string) => {
        createQuickbooksInvoice({ invoiceId: invoiceId });
    };

    const handlePaymentAdded = () => {
        utils.invoices.getById.invalidate(invoiceId);
    };

    const handlePrint = async (quickbooksId: string) => {
        setIsPrinting(true);
        if (!quickbooksId) {
            toast.error('No QuickBooks invoice ID available');
            return;
        }
        getInvoicePdfMutation({ quickbooksId });
    };

    const handleSendInvoiceByEmail = async (quickbooksId: string, invoiceId: string) => {
        try {
            // Assuming you have access to the User object associated with createdById
            const recipientEmail = invoice.createdBy.email || ''; // Use the email from the User object
            sendInvoiceEmailMutation({
                quickbooksId: quickbooksId,
                recipientEmail: recipientEmail,
            });
            utils.invoices.getById.invalidate(invoiceId);
        } catch (error) {
            console.error('Failed to send invoice:', error);
            toast.error('Failed to send invoice');
        }
    };

    return (
        <>
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
                        {invoice.quickbooksId &&
                            <>
                                <Button
                                    variant="default"
                                    onClick={() => handlePrint(invoice.quickbooksId!)}
                                    className="btn btn-primary mr-2"
                                    disabled={isPrinting}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {isPrinting ? 'Downloading...' : 'Download PDF'}
                                </Button>
                                <Button
                                    variant="default"
                                    className="btn btn-primary mr-2 mt-1"
                                    onClick={() => handleSendInvoiceByEmail(invoice.quickbooksId ?? '', invoice.id)}>
                                    <Send className="w-4 h-4" /> Email Invoice
                                </Button>
                            </>
                        }
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
                                <div className="grid-cols-1 gap-4">
                                    <div className="grid-cols-1 gap-4">
                                        <p><strong>Company:</strong> {order?.Office?.Company.name}</p>
                                        <p><strong>Order Number:</strong> {order?.orderNumber}</p>
                                        <p><strong>Order Status:</strong> {order?.status}</p>
                                        <p><strong>Quickbooks ID:</strong> {invoice.quickbooksId}</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <Link href={`/orders/${invoice.orderId}`} className="btn btn-sm btn-outline mt-2 mr-2">
                                            View Order
                                        </Link>
                                        <>
                                            {!invoice.quickbooksId &&
                                                <Button
                                                    variant="default"
                                                    className="btn btn-primary btn-sm mt-2 mb-2 mr-2"
                                                    onClick={() => handleCreateQuickbooksInvoice(invoice.id)}>
                                                    Create Quickbooks Invoice
                                                </Button>
                                            }
                                            {invoice.quickbooksId &&
                                                <>
                                                    <Button
                                                        variant="default"
                                                        className="btn btn-primary btn-sm mt-2 mb-2 mr-2"
                                                        onClick={() => handleCreateQuickbooksInvoice(invoice.id)}>
                                                        Update Quickbooks Invoice
                                                    </Button>

                                                    <Button
                                                        variant="default"
                                                        className="btn btn-primary btn-sm mt-2 mb-2 mr-2"
                                                        onClick={() => handleSendInvoiceByEmail(invoice.quickbooksId ?? '', invoice.id)}>
                                                        <Send className="w-4 h-4" /> Email Invoice
                                                    </Button>
                                                </>
                                            }
                                        </>
                                    </div>
                                </div>
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
                                                {order?.ShippingInfo?.Address?.line3}<br />
                                                {order?.ShippingInfo?.Address?.line4}<br />
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
        </>
    );
};

export default InvoiceDetailClient;
