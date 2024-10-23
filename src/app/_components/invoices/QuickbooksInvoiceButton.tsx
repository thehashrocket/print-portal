// ~/app/_components/orders/QuickbooksInvoiceButton.tsx
"use client";

import React, { useState } from 'react';
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import { useQuickbooksStore } from '~/store/useQuickbooksStore';
import { SerializedInvoice } from '~/types/serializedTypes';
interface QuickbooksInvoiceButtonProps {
    invoice: SerializedInvoice;
    onSyncSuccess: () => void;
}

const QuickbooksInvoiceButton: React.FC<QuickbooksInvoiceButtonProps> = ({ invoice, onSyncSuccess }) => {
    const isAuthenticated = useQuickbooksStore((state) => state.isAuthenticated);
    const [invoiceData, setInvoiceData] = useState<SerializedInvoice | null>(invoice);

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
