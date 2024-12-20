"use client";

import React from 'react';
import Link from 'next/link';
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useQuickbooksStore } from '~/store/useQuickbooksStore';
import { Button } from '~/app/_components/ui/button';
import { PlusCircle } from 'lucide-react';

const HeaderClient: React.FC<{ companyName: string; companyId: string; quickbooksId: string | null }> = ({ companyName, companyId, quickbooksId }) => {
    const router = useRouter();
    const isAuthenticated = useQuickbooksStore((state: { isAuthenticated: any; }) => state.isAuthenticated);
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
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Synced
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
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
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 mr-2" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    )}
                    {syncCompanyMutation.isPending ? 'Syncing...' : 'Sync with QuickBooks'}
                </Button>
                <Link href="/companies/create" className="w-full sm:w-auto">
                    <Button
                        variant="default"
                        className="w-full"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Create Company
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default HeaderClient;