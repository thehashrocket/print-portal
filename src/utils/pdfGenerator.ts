"use client";

import { SerializedInvoice, SerializedOrder } from '~/types/serializedTypes';
import { formatCurrency, formatDate } from './formatters';
import { jsPDF } from 'jspdf';

export async function generateInvoicePDF(invoice: SerializedInvoice): Promise<string> {
    return new Promise((resolve, reject) => {
        const doc = new jsPDF();

        // Add content to the PDF
        doc.setFontSize(25).text('Invoice', 105, 20, { align: 'center' });
        doc.setFontSize(15).text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 40);
        doc.text(`Date: ${formatDate(invoice.updatedAt)}`, 20, 50);
        doc.text(`Due Date: ${formatDate(invoice.dateDue)}`, 20, 60);
        doc.text(`Bill To: ${invoice.Order.Office.Company.name}`, 20, 70);

        // Add table for invoice items
        const tableTop = 80;
        doc.setFont('helvetica', 'bold');
        doc.text('Item', 20, tableTop);
        doc.text('Quantity', 80, tableTop);
        doc.text('Price', 140, tableTop);
        doc.text('Total', 200, tableTop);

        let tableRow = 0;
        invoice.InvoiceItems.forEach((item: any) => {
            tableRow += 10;
            doc.setFont('helvetica', 'normal');
            doc.text(item.description, 20, tableTop + tableRow);
            doc.text(item.quantity.toString(), 80, tableTop + tableRow);
            doc.text(formatCurrency(item.unitPrice), 140, tableTop + tableRow);
            doc.text(formatCurrency(item.total), 200, tableTop + tableRow);
        });

        doc.text(`Subtotal: $${invoice.subtotal}`, 20, tableTop + tableRow + 20);
        doc.text(`Tax: $${invoice.taxAmount}`, 20, tableTop + tableRow + 30);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: $${invoice.total}`, 20, tableTop + tableRow + 40);

        const pdfData = doc.output('datauristring');
        resolve(pdfData);
    });
}

export async function generateOrderPDF(order: SerializedOrder): Promise<string> {
    return new Promise((resolve, reject) => {
        const doc = new jsPDF();
        let buffers: Uint8Array[] = [];

        // Add content to the PDF
        doc.setFontSize(25).text('Order', 105, 20, { align: 'center' });
        doc.setFontSize(15).text(`Order Number: ${order.orderNumber}`, 20, 40);
        doc.text(`Date: ${formatDate(order.updatedAt)}`, 20, 50);
        doc.text(`Ship To: ${order.Office.Company.name}`, 20, 60);
        doc.text(`Order Items: ${order.OrderItems.length}`, 20, 70);

        // Add table for order items
        const tableTop = 80;
        doc.setFont('helvetica', 'bold');
        doc.text('Item', 20, tableTop);
        doc.text('Quantity', 80, tableTop);
        doc.text('Price', 140, tableTop);
        doc.text('Total', 200, tableTop);

        let tableRow = 0;
        order.OrderItems.forEach((item: any) => {
            tableRow += 10;
            doc.setFont('helvetica', 'normal');
            doc.text(item.description, 20, tableTop + tableRow);
            doc.text(item.quantity.toString(), 80, tableTop + tableRow);
            doc.text(formatCurrency(item.unitPrice), 140, tableTop + tableRow);
            doc.text(formatCurrency(item.total), 200, tableTop + tableRow);
        });

        doc.text(`Subtotal: ${formatCurrency(order.calculatedSubTotal ?? 0)}`, 20, tableTop + tableRow + 20);
        doc.text(`Tax: ${formatCurrency(order.calculatedSalesTax ?? 0)}`, 20, tableTop + tableRow + 30);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: ${formatCurrency(order.totalAmount ?? 0)}`, 20, tableTop + tableRow + 40);

        doc.save('order.pdf');
    });
}