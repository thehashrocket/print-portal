// ~/app/_components/orders/QuickbooksInvoiceButton.tsx
"use client";

import React, { useState } from 'react';
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import { useQuickbooksStore } from '~/store/useQuickbooksStore';
import { SerializedOrder } from '~/types/serializedTypes';
import { Button } from '../ui/button';
import { Loader2 } from "lucide-react"
interface QuickbooksInvoiceButtonProps {
    order: SerializedOrder;
    onSyncSuccess: () => void;
}

const QuickbooksInvoiceButton: React.FC<QuickbooksInvoiceButtonProps> = ({ order, onSyncSuccess }) => {
    const isAuthenticated = useQuickbooksStore((state) => state.isAuthenticated);
    const [orderData, setOrderData] = useState<SerializedOrder | null>(order);

    // Move the useQuery hook to the top level

    

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
        if (!orderData) {
            toast.error('Order not found');
            return;
        }

        if (!orderData.Invoice) {
            // Create a new invoice
            const invoice = await createInvoice.mutateAsync({
                orderId: orderData.id,
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

    const syncButtonText = orderData?.quickbooksInvoiceId
        ? 'Sync with QB'
        : 'Add to QB';

    return (
        <Button
            variant="outline"
            onClick={handleSync}
            disabled={createQbInvoiceFromInvoice.isPending || !isAuthenticated}
        >

            {!createQbInvoiceFromInvoice.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {createQbInvoiceFromInvoice.isPending ? 'Syncing...' : syncButtonText}
        </Button>
    );
};

export default QuickbooksInvoiceButton;
