"use client";

import React, { useState } from 'react';
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useQuickbooksStore } from '~/store/useQuickbooksStore';
import { Button } from '~/app/_components/ui/button';
import { PlusCircle, RefreshCcw, RefreshCwOff } from 'lucide-react';
import CreateOfficeForm from '../offices/CreateOfficeForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "~/app/_components/ui/dialog";

const HeaderClient: React.FC<{ companyName: string; companyId: string; quickbooksId: string | null }> = ({ companyName, companyId, quickbooksId }) => {
    const router = useRouter();
    const isAuthenticated = useQuickbooksStore((state: { isAuthenticated: any; }) => state.isAuthenticated);
    const [isAddOfficeModalOpen, setIsAddOfficeModalOpen] = useState(false);
    const syncCompanyMutation = api.qbCustomers.syncCompany.useMutation({
        onSuccess: () => {
            toast.success('Company synced with QuickBooks successfully');
            router.refresh(); // Refresh the page data
        },
        onError: (error) => {
            toast.error(`Error syncing with QuickBooks: ${error.message}`);
        },
    });

    const handleSyncCompany = async () => {
        try {
            await syncCompanyMutation.mutateAsync({ companyId });
        } catch (error) {
            console.error('Error syncing company:', error);
            if (error instanceof Error) {
                toast.error(`Error syncing with QuickBooks: ${error.message}`);
            } else {
                toast.error('An unknown error occurred while syncing with QuickBooks');
            }
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{companyName}</h1>
                <div className={`flex items-center ${quickbooksId ? "text-green-600" : "text-red-600"}`}>
                    {quickbooksId ? (
                        <>
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Synced
                        </>
                    ) : (
                        <>
                            <RefreshCwOff className="w-4 h-4 mr-2" />
                            Not Synced
                        </>
                    )}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <Button
                    variant="outline"
                    className={`w-full sm:w-auto ${syncCompanyMutation.isPending ? 'loading' : ''}`}
                    onClick={handleSyncCompany}
                    disabled={syncCompanyMutation.isPending || !isAuthenticated}
                >
                    {!syncCompanyMutation.isPending && (
                        <RefreshCcw className="w-4 h-4 mr-2" />
                    )}
                    {syncCompanyMutation.isPending ? 'Syncing...' : 'Sync with QuickBooks'}
                </Button>
                <Button
                    variant="default"
                    className="w-full sm:w-auto"
                    onClick={() => setIsAddOfficeModalOpen(true)}
                >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Office
                </Button>
            </div>

            <Dialog open={isAddOfficeModalOpen} onOpenChange={setIsAddOfficeModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Office</DialogTitle>
                    </DialogHeader>
                    <CreateOfficeForm
                        companyId={companyId}
                        onSuccess={() => setIsAddOfficeModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HeaderClient;