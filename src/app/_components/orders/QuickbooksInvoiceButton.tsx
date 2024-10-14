// ~/app/_components/orders/QuickbooksInvoiceButton.tsx
"use client";

import React from 'react';
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import { useQuickbooksStore } from '~/store/useQuickbooksStore';

const QuickbooksInvoiceButton: React.FC<{ params: any; onSyncSuccess: () => void }> = ({ params, onSyncSuccess }) => {
    const isAuthenticated = useQuickbooksStore((state) => state.isAuthenticated);
    const syncMutation = api.qbInvoices.syncInvoice.useMutation({
        onSuccess: () => {
            onSyncSuccess();
        },
    });

    const handleSync = async () => {
        await syncMutation.mutateAsync({ orderId: params.row.id });
    };

    const syncButtonText = params.row.quickbooksInvoiceId
        ? 'Sync with QuickBooks'
        : 'Add to QuickBooks';

    return (
        <button
            className={`btn btn-xs btn-outline ${syncMutation.isPending ? 'loading' : ''}`}
            onClick={handleSync}
            disabled={syncMutation.isPending || !isAuthenticated}
        >
            {syncButtonText}
        </button>
    );
};

export default QuickbooksInvoiceButton;