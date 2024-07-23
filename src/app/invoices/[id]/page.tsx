// ~/src/app/invoices/[id]/page.tsx
import React from 'react';
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import Link from 'next/link';
import { formatCurrency, formatDate } from '~/utils/formatters';

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const session = await getServerAuthSession();

    if (!session || !session.user.Permissions.includes("invoice_read")) {
        return <div className="alert alert-error">You do not have permission to view this page.</div>;
    }

    const invoice = await api.invoices.getById(params.id);

    if (!invoice) {
        return <div className="alert alert-error">Invoice not found.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Invoice {invoice.invoiceNumber}</h1>
                <div>
                    <Link href="/invoices" className="btn btn-secondary mr-2">
                        Back to Invoices
                    </Link>
                    <Link href={`/invoices/${invoice.id}/edit`} className="btn btn-primary">
                        Edit Invoice
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Invoice Details</h2>
                        <p><strong>Status:</strong> {invoice.status}</p>
                        <p><strong>Date Issued:</strong> {formatDate(invoice.dateIssued)}</p>
                        <p><strong>Due Date:</strong> {formatDate(invoice.dateDue)}</p>
                        <p><strong>Subtotal:</strong> {formatCurrency(invoice.subtotal)}</p>
                        <p><strong>Tax Rate:</strong> {invoice.taxRate}%</p>
                        <p><strong>Tax Amount:</strong> {formatCurrency(invoice.taxAmount)}</p>
                        <p><strong>Total:</strong> {formatCurrency(invoice.total)}</p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Order Information</h2>
                        <p><strong>Order Number:</strong> {invoice.order.orderNumber}</p>
                        <p><strong>Order Status:</strong> {invoice.order.status}</p>
                        <Link href={`/orders/${invoice.order.id}`} className="btn btn-sm btn-outline mt-2">
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
                                    <td>{formatCurrency(item.unitPrice)}</td>
                                    <td>{formatCurrency(item.total)}</td>
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

            {invoice.notes && (
                <div className="card bg-base-100 shadow-xl mt-6">
                    <div className="card-body">
                        <h2 className="card-title">Notes</h2>
                        <p>{invoice.notes}</p>
                    </div>
                </div>
            )}
        </div>
    );
}