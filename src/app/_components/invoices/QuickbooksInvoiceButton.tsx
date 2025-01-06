// ~/app/_components/orders/QuickbooksInvoiceButton.tsx
"use client";

import React, { useState } from 'react';
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import { useQuickbooksStore } from '~/store/useQuickbooksStore';
import { type SerializedInvoice } from '~/types/serializedTypes';
import { Button } from '../ui/button';
import { Loader2 } from "lucide-react"

interface QuickbooksInvoiceButtonProps {
    invoice: SerializedInvoice;
    onSyncSuccess: () => void;
}

const QuickbooksInvoiceButton: React.FC<QuickbooksInvoiceButtonProps> = ({ invoice, onSyncSuccess }) => {
    const isAuthenticated = useQuickbooksStore((state) => state.isAuthenticated);
    const [invoiceData] = useState<SerializedInvoice | null>(invoice);

    const createQbInvoiceFromInvoice = api.qbInvoices.createQbInvoiceFromInvoice.useMutation({
        onSuccess: () => {
            toast.success('QB Invoice synced successfully');
            onSyncSuccess();
        },
    });

    const handleSync = async () => {
        // Check if there is an error or no data
        if (!invoiceData) {
            toast.error('Invoice not found');
            return;
        }

        await createQbInvoiceFromInvoice.mutateAsync({ invoiceId: invoiceData.id });
    };

    const syncButtonText = invoiceData?.quickbooksId
        ? 'Sync with QB'
        : 'Add to QB';

    return (
        <Button
            variant="outline"
            onClick={handleSync}
            disabled={createQbInvoiceFromInvoice.isPending || !isAuthenticated}
        >
            {createQbInvoiceFromInvoice.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createQbInvoiceFromInvoice.isPending ? 'Syncing...' : syncButtonText}
        </Button>
    );
};

export default QuickbooksInvoiceButton;
