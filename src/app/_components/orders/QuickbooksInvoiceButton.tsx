// ~/app/_components/orders/QuickbooksInvoiceButton.tsx
"use client";

import React from 'react';
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import { useQuickbooksStore } from '~/store/useQuickbooksStore';

const QuickbooksInvoiceButton: React.FC<{ params: any; onSyncSuccess: () => void }> = ({ params, onSyncSuccess }) => {
    const isAuthenticated = useQuickbooksStore((state) => state.isAuthenticated);

    // Move the useQuery hook to the top level
    const { data: orderData, error: orderError } = api.orders.getByID.useQuery(params.row.id);

    const createQbInvoiceFromInvoice = api.qbInvoices.createQbInvoiceFromInvoice.useMutation({
        onSuccess: () => {
            toast.success('QB Invoice synced successfully');
            onSyncSuccess();
        },
    });

    const createInvoice = api.invoices.create.useMutation({
        onSuccess: () => {
            toast.success('Invoice created successfully');
        },
    });

    const handleSync = async () => {
        // Check if there is an error or no data
        if (orderError || !orderData) {
            toast.error('Order not found');
            return;
        }

        if (!orderData.Invoice) {
            // Create a new invoice
            const invoice = await createInvoice.mutateAsync({
                orderId: params.row.id,
                dateIssued: new Date(),
                dateDue: new Date(new Date().setDate(new Date().getDate() + 30)),
                subtotal: parseFloat(orderData.calculatedSubTotal || '0'),
                taxRate: 7.0, // Ensure this is a number, not a string
                taxAmount: parseFloat(orderData.calculatedSalesTax || '0'),
                total: parseFloat(orderData.totalAmount || '0'),
                status: "Draft",
                notes: "",
                items: orderData.OrderItems.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: parseFloat(item.cost || '0'),
                    total: parseFloat(item.amount || '0'),
                    orderItemId: item.id,
                })),
            });
            toast.success('Invoice created successfully');
            await createQbInvoiceFromInvoice.mutateAsync({ invoiceId: invoice.id });
        } else {
            await createQbInvoiceFromInvoice.mutateAsync({ invoiceId: orderData.Invoice.id });
        }
    };

    const syncButtonText = params.row.quickbooksInvoiceId
        ? 'Sync with QB'
        : 'Add to QB';

    return (
        <button
            className={`btn btn-xs btn-outline ${createQbInvoiceFromInvoice.isPending ? 'loading' : ''}`}
            onClick={handleSync}
            disabled={createQbInvoiceFromInvoice.isPending || !isAuthenticated}
        >
            {!createQbInvoiceFromInvoice.isPending && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            )}
            {createQbInvoiceFromInvoice.isPending ? 'Syncing...' : syncButtonText}
        </button>
    );
};

export default QuickbooksInvoiceButton;
