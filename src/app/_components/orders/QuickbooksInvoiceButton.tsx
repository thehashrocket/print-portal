// ~/app/_components/orders/QuickbooksInvoiceButton.tsx
"use client";

import React from 'react';
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import { useQuickbooksStore } from '~/store/useQuickbooksStore';

const QuickbooksInvoiceButton: React.FC<{ params: any; onSyncSuccess: () => void }> = ({ params, onSyncSuccess }) => {
    const isAuthenticated = useQuickbooksStore((state) => state.isAuthenticated);
    const syncMutation = api.qbInvoices.createInvoice.useMutation({
        onSuccess: () => {
            onSyncSuccess();
        },
    });

    const handleSync = async () => {
        await syncMutation.mutateAsync({ orderId: params.row.id });
    };

    const syncButtonText = params.row.quickbooksInvoiceId
        ? 'Sync with QB'
        : 'Add to QB';

    return (
        <button
            className={`btn btn-xs btn-outline ${syncMutation.isPending ? 'loading' : ''}`}
            onClick={handleSync}
            disabled={syncMutation.isPending || !isAuthenticated}
        >
            {!syncMutation.isPending && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            )}
            {syncMutation.isPending ? 'Syncing...' : syncButtonText}
        </button>
    );
};

export default QuickbooksInvoiceButton;