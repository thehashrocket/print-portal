// ~/src/app/_components/invoices/InvoiceDetailClient.tsx
// ~/src/app/_components/invoices/InvoiceDetailClient.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { api } from "~/trpc/react";
import Link from 'next/link';
import { formatCurrency, formatDate } from '~/utils/formatters';
import AddPaymentForm from '~/app/_components/invoices/AddPaymentForm';
import PrintableInvoice from './PrintableInvoice';
import { Invoice, InvoiceStatus, Order, OrderStatus, InvoicePayment, InvoiceItem, PaymentMethod, User } from '@prisma/client';

type ExtendedInvoice = Invoice & {
    Order: Order & {
        Office: {
            Company: {
                name: string;
                id: string;
            };
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdById: string;
            companyId: string;
        };
    };
    createdBy: User;
    InvoiceItems: InvoiceItem[];
    InvoicePayments: InvoicePayment[];
};

interface InvoiceDetailClientProps {
    initialInvoice: ExtendedInvoice;
}

const InvoiceDetailClient: React.FC<InvoiceDetailClientProps> = ({ initialInvoice }) => {
    const [invoice, setInvoice] = useState<ExtendedInvoice>(initialInvoice);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const sendInvoiceMutation = api.invoices.sendInvoiceEmail.useMutation();

    const { data: invoiceData, refetch } = api.invoices.getById.useQuery(initialInvoice.id, {
        initialData: initialInvoice,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    const formatTaxRate = (taxRate: number) => {
        return taxRate.toFixed(2);
    };

    useEffect(() => {
        if (invoiceData) {
            setInvoice(invoiceData as ExtendedInvoice);
        }
    }, [invoiceData]);

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
            await sendInvoiceMutation.mutateAsync({
                invoiceId: invoice.id,
                recipientEmail: invoice.Order.createdBy.email || '', // Assuming email might be optional
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
        return <PrintableInvoice invoice={invoice} />;
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
                            <p><strong>Subtotal:</strong> {formatCurrency(invoice.subtotal.toNumber())}</p>
                            <p><strong>Tax Rate:</strong> {formatTaxRate(invoice.taxRate.toNumber())}%</p>
                            <p><strong>Tax Amount:</strong> {formatCurrency(invoice.taxAmount.toNumber())}</p>
                            <p><strong>Total:</strong> {formatCurrency(invoice.total.toNumber())}</p>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Order Information</h2>
                            <p><strong>Order Number:</strong> {invoice.Order.orderNumber}</p>
                            <p><strong>Order Status:</strong> {invoice.Order.status}</p>
                            <Link href={`/orders/${invoice.Order.id}`} className="btn btn-sm btn-outline mt-2">
                                View Order
                            </Link>
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
                                        <td>{formatCurrency(item.unitPrice.toNumber())}</td>
                                        <td>{formatCurrency(item.total.toNumber())}</td>
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
                                            <td>{formatCurrency(payment.amount.toNumber())}</td>
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