"use client";

import { type SerializedInvoice, type SerializedOrder } from '~/types/serializedTypes';
import { formatCurrency, formatDate } from './formatters';
import { jsPDF } from 'jspdf';

export async function generateInvoicePDF(invoice: SerializedInvoice): Promise<string> {
    return new Promise((resolve) => {
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

// this is used to print the order to the printer
export const generateOrderPDF = async (order: SerializedOrder) => {

    const loadSVG = async (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);

                const newImg = new Image();
                newImg.onload = () => resolve(newImg);
                newImg.onerror = (e) => reject(e);
                newImg.src = canvas.toDataURL('image/png');
            };

            img.onerror = (e) => reject(e);
            img.src = url;
        });
    };

    // Two-column layout for top section
    const addField = (label: string, value: string, x: number, currentY: number, spacing: number = 10, labelWidth: number = 20) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(label, x, currentY);

        // Calculate value position based on label length
        // const labelWidth = doc.getTextWidth(label);
        // const labelWidth = 20;
        const valueX = x + labelWidth + 10;

        doc.setFont('helvetica', 'normal');
        doc.text(value || 'N/A', valueX, currentY);
        return currentY + spacing;
    };

    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    let yPos = 20;
    const leftMargin = 20;
    const rightColStart = doc.internal.pageSize.width / 2 + 15;

    // Add Thomson logo/header
    try {
        const logoUrl = window.location.origin + '/images/thomson-pdf-logo-green.svg';
        const logoDataUrl = await loadSVG(logoUrl);
        doc.addImage(logoDataUrl, 'PNG', leftMargin - 20, yPos - 12, 90 * 0.8, 30 * 0.8);
    } catch (error) {
        console.error('Error loading logo:', error);
    }

    // Add content to the PDF

    // doc.setTextColor(61, 0, 38, 65)
    doc.setTextColor('#235937')
    doc.setFontSize(25).text('Order Details', 120, 20);
    yPos += 20;
    doc.setTextColor(0, 0, 0, 100)
    doc.setFontSize(15).text(`Order Number: ${order.orderNumber}`, 20, yPos);
    yPos += 10;
    doc.text(`Ship To: ${order.Office.Company.name}`, 20, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal')
    if (order.ShippingInfo?.Address?.name) {
        doc.text(`${order.ShippingInfo?.Address?.name}`, 20, yPos);
        yPos += 5;
    }
    if (order.ShippingInfo?.Address?.line1) {
        doc.text(`${order.ShippingInfo?.Address?.line1}`, 20, yPos);
        yPos += 5;
    }
    if (order.ShippingInfo?.Address?.line2) {
        doc.text(`${order.ShippingInfo?.Address?.line2}`, 20, yPos);
        yPos += 5;
    }
    if (order.ShippingInfo?.Address?.city) {
        doc.text(`${order.ShippingInfo?.Address?.city}, ${order.ShippingInfo?.Address?.state} ${order.ShippingInfo?.Address?.zipCode}`, 20, yPos);
        yPos += 5;
    }

    if (order.ShippingInfo?.shippingMethod) {
        doc.text(`Shipping Method: ${order.ShippingInfo?.shippingMethod}`, 20, yPos);
        yPos += 20;
    }


    // Left column
    let leftY = yPos;
    leftY = addField('Company', order.Office?.Company.name || 'N/A', leftMargin, leftY);
    leftY = addField('Contact', order.contactPerson?.name || 'N/A', leftMargin, leftY);
    leftY = addField('Email', order.contactPerson?.email || 'N/A', leftMargin, leftY);
    leftY = addField('Date', formatDate(order.updatedAt), leftMargin, leftY);
    
    // Right column
    let rightY = yPos;
    rightY = addField('Item Total', formatCurrency(order.calculatedSubTotal ?? 0), rightColStart, rightY);
    rightY = addField('Shipping', formatCurrency(order.totalShippingAmount ?? 0), rightColStart, rightY);
    rightY = addField('Tax', formatCurrency(order.calculatedSalesTax ?? 0), rightColStart, rightY);
    rightY = addField('Total', formatCurrency(order.totalAmount ?? 0), rightColStart, rightY);

    yPos = Math.max(leftY, rightY) + 5;

    // Add table for order items
    const tableTop = yPos + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Item', 20, tableTop);
    doc.text('Quantity', 150, tableTop);
    doc.text('Amount', 180, tableTop);

    let tableRow = 0;
    order.OrderItems.forEach((item: any) => {
        tableRow += 10;
        doc.setFont('helvetica', 'normal');
        // Truncate description to 20 characters
        const truncatedDescription = item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description;
        doc.text(truncatedDescription, 20, tableTop + tableRow);
        doc.text(item.quantity.toString(), 150, tableTop + tableRow);
        doc.text(formatCurrency(item.amount), 180, tableTop + tableRow);
    });

    doc.save(`order_${order.orderNumber}.pdf`);
}

// This is used to send the order to the customer via email
export const generateEmailOrderPDF = async (order: SerializedOrder): Promise<string> => {
    try {
        console.log('Starting generateEmailOrderPDF for order:', order.orderNumber);
        const loadSVG = async (url: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);

                    const newImg = new Image();
                    newImg.onload = () => resolve(newImg);
                    newImg.onerror = (e) => reject(e);
                    newImg.src = canvas.toDataURL('image/png');
                };

                img.onerror = (e) => reject(e);
                img.src = url;
            });
        };

        const doc = new jsPDF();
        
        // Two-column layout for top section
        const addField = (label: string, value: string, x: number, currentY: number, spacing: number = 10, labelWidth: number = 20) => {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(label, x, currentY);

            const valueX = x + labelWidth + 10;

            doc.setFont('helvetica', 'normal');
            doc.text(value || 'N/A', valueX, currentY);
            return currentY + spacing;
        };

        let yPos = 20;
        const leftMargin = 20;
        const rightColStart = doc.internal.pageSize.width / 2 + 15;

        // Add Thomson logo/header
        try {
            const logoUrl = window.location.origin + '/images/thomson-pdf-logo-green.svg';
            const logoDataUrl = await loadSVG(logoUrl);
            doc.addImage(logoDataUrl, 'PNG', leftMargin - 20, yPos - 12, 90 * 0.8, 30 * 0.8);
        } catch (error) {
            console.error('Error loading logo:', error);
        }

        // Add content to the PDF
        // doc.setTextColor(61, 0, 38, 65)
        doc.setTextColor('#235937')
        doc.setFontSize(25).text('Order Details', 120, 20);
        yPos += 20;
        doc.setTextColor(0, 0, 0, 100)
        doc.setFontSize(15).text(`Order Number: ${order.orderNumber}`, 20, yPos);
        yPos += 10;
        doc.text(`Ship To: ${order.Office.Company.name}`, 20, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal')
        if (order.ShippingInfo) {
            console.log('ShippingInfo', order.ShippingInfo);
        }
        if (order.ShippingInfo?.Address?.name) {
            doc.text(`${order.ShippingInfo?.Address?.name}`, 20, yPos);
            yPos += 5;
        }
        if (order.ShippingInfo?.Address?.line1) {
            doc.text(`${order.ShippingInfo?.Address?.line1}`, 20, yPos);
            yPos += 5;
        }
        if (order.ShippingInfo?.Address?.line2) {
            doc.text(`${order.ShippingInfo?.Address?.line2}`, 20, yPos);
            yPos += 5;
        }
        if (order.ShippingInfo?.Address?.city) {
            doc.text(`${order.ShippingInfo?.Address?.city}, ${order.ShippingInfo?.Address?.state} ${order.ShippingInfo?.Address?.zipCode}`, 20, yPos);
            yPos += 5;
        }

        if (order.ShippingInfo?.shippingMethod) {
            doc.text(`Shipping Method: ${order.ShippingInfo?.shippingMethod}`, 20, yPos);
            yPos += 20;
        }

        // Left column
        let leftY = yPos;
        leftY = addField('Company', order.Office?.Company.name || 'N/A', leftMargin, leftY);
        leftY = addField('Contact', order.contactPerson?.name || 'N/A', leftMargin, leftY);
        leftY = addField('Email', order.contactPerson?.email || 'N/A', leftMargin, leftY);
        leftY = addField('Date', formatDate(order.updatedAt), leftMargin, leftY);

        // Right column
        let rightY = yPos;
        rightY = addField('Item Total', formatCurrency(order.calculatedSubTotal ?? 0), rightColStart, rightY);
        rightY = addField('Shipping', formatCurrency(order.totalShippingAmount ?? 0), rightColStart, rightY);
        rightY = addField('Tax', formatCurrency(order.calculatedSalesTax ?? 0), rightColStart, rightY);
        rightY = addField('Total', formatCurrency(order.totalAmount ?? 0), rightColStart, rightY);

        yPos = Math.max(leftY, rightY) + 5;

        // Add table for order items
        const tableTop = yPos + 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Item', 20, tableTop);
        doc.text('Quantity', 150, tableTop);
        doc.text('Amount', 180, tableTop);

        let tableRow = 0;
        order.OrderItems.forEach((item: any) => {
            tableRow += 10;
            doc.setFont('helvetica', 'normal');
            const truncatedDescription = item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description;
            doc.text(truncatedDescription, 20, tableTop + tableRow);
            doc.text(item.quantity.toString(), 150, tableTop + tableRow);
            doc.text(formatCurrency(item.amount), 180, tableTop + tableRow);
        });

        const pdfContent = doc.output('datauristring');
        console.log('Generated PDF content length:', pdfContent.length);
        return pdfContent;
    } catch (error) {
        console.error('Error in generateEmailOrderPDF:', error);
        throw error;
    }
};