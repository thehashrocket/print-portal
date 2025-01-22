// ~/app/_components/companies/QuickbooksCompanyButton.tsx
"use client";

import React from 'react';
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import { useQuickbooksStore } from '~/store/useQuickbooksStore';
import { Button } from '~/app/_components/ui/button';
import { RefreshCcw } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/app/_components/ui/tooltip";

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
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        onClick={handleSyncCompany}
                        disabled={syncCompanyMutation.isPending || !isAuthenticated}
                    >
                        {!syncCompanyMutation.isPending && (
                            <RefreshCcw className="w-4 h-4" />
                        )}
                        {syncCompanyMutation.isPending && 'Syncing...'}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{syncButtonText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default QuickbooksCompanyButton;