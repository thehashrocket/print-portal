// ~/src/app/_components/invoices/PrintableInvoice.tsx
"use client";

import React from 'react';
import { formatCurrency, formatDate } from '~/utils/formatters';

interface PrintableInvoiceProps {
    invoice: {
        invoiceNumber: string;
        dateIssued: Date;
        dateDue: Date;
        subtotal: number;
        taxRate: number;
        taxAmount: number;
        total: number;
        status: string;
        order: {
            orderNumber: number;
            Office: {
                Company: {
                    name: string;
                };
            };
        };
        InvoiceItems: Array<{
            description: string;
            quantity: number;
            unitPrice: number;
            total: number;
        }>;
    };
}

const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ invoice }) => {
    return (
        <div className="p-8 max-w-4xl mx-auto bg-white">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Invoice</h1>
                    <p>Invoice Number: {invoice.invoiceNumber}</p>
                    <p>Date: {formatDate(invoice.dateIssued)}</p>
                    <p>Due Date: {formatDate(invoice.dateDue)}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-semibold">Your Company Name</h2>
                    <p>123 Your Street</p>
                    <p>Your City, State ZIP</p>
                    <p>your@email.com</p>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Bill To:</h2>
                <p>{invoice.order.Office.Company.name}</p>
                {/* Add more customer details here */}
            </div>

            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2">Description</th>
                        <th className="text-right py-2">Quantity</th>
                        <th className="text-right py-2">Unit Price</th>
                        <th className="text-right py-2">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.InvoiceItems.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200">
                            <td className="py-2">{item.description}</td>
                            <td className="text-right py-2">{item.quantity}</td>
                            <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-right py-2">{formatCurrency(item.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>Tax ({invoice.taxRate}%):</span>
                        <span>{formatCurrency(invoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(invoice.total)}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <p className="font-semibold">Payment Terms: Due by {formatDate(invoice.dateDue)}</p>
                <p>Thank you for your business!</p>
            </div>
        </div>
    );
};

export default PrintableInvoice;