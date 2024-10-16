// ~/app/_components/companies/QuickbooksCompanyButton.tsx
"use client";

import React from 'react';
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import { useQuickbooksStore } from '~/store/useQuickbooksStore';

const QuickbooksCompanyButton: React.FC<{ params: any; onSyncSuccess: () => void }> = ({ params, onSyncSuccess }) => {
    const isAuthenticated = useQuickbooksStore((state) => state.isAuthenticated);
    const syncCompanyMutation = api.qbCustomers.syncCompany.useMutation({
        onSuccess: () => {
            toast.success('Company synced with QuickBooks successfully');
            onSyncSuccess();
            // Optionally, you can refetch the office data here
        },
        onError: (error) => {
            toast.error(`Error syncing with QuickBooks: ${error.message}`);
        },
    });

    const handleSyncCompany = async () => {
        if (!isAuthenticated) {
            toast.error('You must be authenticated to sync with QuickBooks');
            return;
        }
        try {
            console.log('companyId', params.row.id);
            await syncCompanyMutation.mutateAsync({ companyId: params.row.id });
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Error syncing with QuickBooks: ${error.message}`);
            } else {
                toast.error('An unknown error occurred while syncing with QuickBooks');
            }
            console.error('Error syncing office:', error);
        }
    };

    const syncButtonText = params.row.quickbooksCustomerId || params.row.quickbooksId
        ? 'Sync with QB'
        : 'Add to QB';

    return (
        <button
            className={`btn btn-xs btn-outline ${syncCompanyMutation.isPending ? 'loading' : ''}`}
            onClick={handleSyncCompany}
            disabled={syncCompanyMutation.isPending || !isAuthenticated}
        >
            {!syncCompanyMutation.isPending && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            )}
            {syncCompanyMutation.isPending ? 'Syncing...' : syncButtonText}
        </button>
    );
};

export default QuickbooksCompanyButton;