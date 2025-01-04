"use client";

import { type SerializedOrder } from "~/types/serializedTypes";
import { generateEmailOrderPDF } from "~/utils/generateOrderPDF";

export async function generateOrderPDFData(order: SerializedOrder): Promise<string> {
    try {
        console.log('Starting PDF generation for order:', order.orderNumber);
        const pdfContent = await generateEmailOrderPDF(order);
        console.log('PDF generation successful, content length:', pdfContent?.length);
        
        if (!pdfContent) {
            throw new Error('PDF generation returned empty content');
        }
        
        return pdfContent;
    } catch (error) {
        console.error('Error in generateOrderPDFData:', error);
        throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
} 