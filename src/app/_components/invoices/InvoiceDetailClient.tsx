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
                id: string;
                createdAt: Date;
                updatedAt: Date;
                quickbooksId: string | null;
                name: string;
                syncToken: string | null;
                fullyQualifiedName: string | null;
                quickbooksCustomerId: string | null;
            };
            createdBy: {
                officeId: string | null;
                id: string;
                name: string | null;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                emailVerified: Date | null;
                image: string | null;
                quickbooksRealmId: string | null;
                quickbooksAuthState: string | null;
                quickbooksAccessToken: string | null;
                quickbooksRefreshToken: string | null;
                quickbooksTokenExpiry: Date | null;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            createdById: string;
            companyId: string;
            syncToken: string | null;
            fullyQualifiedName: string | null;
            quickbooksCustomerId: string | null;
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

    const { data: invoiceData, refetch } = api.invoices.getById.useQuery<ExtendedInvoice>(initialInvoice.id, {
        initialData: initialInvoice,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    const formatTaxRate = (taxRate: number) => {
        return taxRate.toFixed(2);
    };

    useEffect(() => {
        if (invoiceData) {
            setInvoice(invoiceData as unknown as ExtendedInvoice);
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
