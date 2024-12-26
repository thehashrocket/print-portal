// ~/app/_components/companies/QuickbooksSyncOrdersButton.tsx
// Since Orders with Quickbooks Button
// Pulls Invoices from Quickbooks and displays them in a table

"use client";

import React from 'react';
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import { useQuickbooksStore } from '~/store/useQuickbooksStore';
import { Office } from '@prisma/client';
import { Button } from '../ui/button';
import { RefreshCcw } from 'lucide-react';

const QuickbooksSyncOrdersButton: React.FC<{ office: Office; onSyncSuccess: () => void }> = ({ office, onSyncSuccess }) => {
    const isAuthenticated = useQuickbooksStore((state) => state.isAuthenticated);
    const syncOfficeMutation = api.qbInvoices.syncInvoicesForOffice.useMutation({
        onSuccess: (data) => {
            toast.success('Office synced with QuickBooks successfully');
            onSyncSuccess();
            console.log('data', data);
            // Optionally, you can refetch the office data here
        },
        onError: (error) => {
            toast.error(`Error syncing with QuickBooks: ${error.message}`);
        },
    });

    const handleSyncOffice = async () => {
        if (!isAuthenticated) {
            toast.error('You must be authenticated to sync with QuickBooks');
            return;
        }
        try {
            if (office.quickbooksCustomerId === null) {
                throw new Error('QuickBooks Customer ID is null');
            }
            console.log('companyId', office.quickbooksCustomerId);
            await syncOfficeMutation.mutateAsync({ officeId: office.id });
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Error syncing with QuickBooks: ${error.message}`);
            } else {
                toast.error('An unknown error occurred while syncing with QuickBooks');
            }
            console.error('Error syncing office:', error);
        }
    };

    const syncButtonText = office.quickbooksCustomerId
        ? 'Sync with QB'
        : 'Add to QB';

    return (
        <Button
            variant="default"
            size="sm"
            onClick={handleSyncOffice}
            disabled={syncOfficeMutation.isPending || !isAuthenticated}
        >
            {!syncOfficeMutation.isPending && (
                <RefreshCcw className="w-4 h-4" />
            )}
            {syncOfficeMutation.isPending ? 'Syncing...' : syncButtonText}
        </Button>
    );
};

export default QuickbooksSyncOrdersButton;