// ~/src/app/_components/quickbooks/QuickbooksAuth.tsx
"use client"
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from "~/trpc/react";
import { useRouter } from 'next/navigation';
import QuickBooksCompanyInfo from './QuickbooksCompanyInfo';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
const QuickBooksAuth: React.FC = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const initializeAuthMutation = api.qbAuth.initializeAuth.useMutation();
    const [isQuickbooksAuthenticated, setIsQuickbooksAuthenticated] = useState(false);
    const [companyInfo, setCompanyInfo] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSyncingInvoices, setIsSyncingInvoices] = useState(false);
    const [syncResult, setSyncResult] = useState<string | null>(null);

    const { data: authStatus, refetch: refetchAuthStatus, error: authStatusError } = api.qbAuth.checkQuickbooksAuthStatus.useQuery(
        undefined,
        { enabled: !!session }
    );

    const { data: customersData, refetch: syncCustomers, isLoading: isSyncingCustomers, error: syncCustomersError } = api.qbSyncCustomers.getCustomers.useQuery(
        {
            lastSyncTime: undefined, // You can add a state variable to track last sync time
            pageSize: 100, // You can make this configurable if needed
        },
        { enabled: false }
    );

    const { mutate: refreshToken, error: refreshTokenError } = api.qbAuth.refreshToken.useMutation({
        onSuccess: () => {
            alert('Token refreshed successfully');
            refetchAuthStatus();
        },
    });

    const { data: companyInfoData, refetch: getCompanyInfo, error: companyInfoError } = api.qbCompany.getCompanyInfo.useQuery(
        undefined,
        { enabled: false }
    );

    const { data: invoicesData, refetch: syncInvoices, error: syncInvoicesError } = api.qbInvoices.syncInvoices.useQuery(
        undefined,
        { enabled: false }
    );

    const getIntuitSignInUrlMutation = api.qbAuth.getIntuitSignInUrl.useMutation({
        onSuccess: (data) => {
            if (data.signInUrl) {
                console.log('Intuit Sign-In URL:', data.signInUrl);
                window.location.href = data.signInUrl;
            } else {
                setError('Failed to get Intuit sign-in URL');
            }
        },
        onError: (error) => {
            console.error('Error getting Intuit sign-in URL:', error);
            setError('An error occurred while trying to sign in to Intuit');
        }
    });

    useEffect(() => {
        if (authStatusError) {
            console.error('Error checking QuickBooks auth status:', authStatusError);
            setError('Failed to check QuickBooks authentication status.');
        } else if (authStatus) {
            setIsQuickbooksAuthenticated(authStatus.isAuthenticated);
            setError(null);
        }
    }, [authStatus, authStatusError]);

    useEffect(() => {
        if (refreshTokenError) {
            console.error('Error refreshing token:', refreshTokenError);
            if (refreshTokenError.message.includes('Please reconnect your account')) {
                setIsQuickbooksAuthenticated(false);
                setError('Your QuickBooks connection has expired. Please reconnect your account.');
            } else {
                setError('An error occurred while refreshing the token. Please try again later.');
            }
        }
    }, [refreshTokenError]);

    useEffect(() => {
        if (companyInfoError) {
            console.error('Error fetching company info:', companyInfoError);
            setError('Failed to fetch company information.');
        } else if (companyInfoData) {
            setCompanyInfo(companyInfoData);
            setError(null);
        }
    }, [companyInfoData, companyInfoError]);

    useEffect(() => {
        if (syncCustomersError) {
            console.error('Error syncing customers:', syncCustomersError);
            setError('Failed to sync customers from QuickBooks.');
            setIsSyncing(false);
        } else if (customersData) {
            setSyncResult(`Successfully synced ${customersData.totalCustomers} customers from QuickBooks.`);
            setIsSyncing(false);
        }
    }, [customersData, syncCustomersError]);

    useEffect(() => {
        if (syncInvoicesError) {
            console.error('Error syncing invoices:', syncInvoicesError);
            setError('Failed to sync invoices from QuickBooks.');
            setIsSyncingInvoices(false);
        } else if (invoicesData) {
            setSyncResult(`Successfully synced ${invoicesData.length} invoices from QuickBooks.`);
            setIsSyncingInvoices(false);
        }
    }, [invoicesData, syncInvoicesError]);

    const handleConnectClick = async () => {
        try {
            setError(null);
            const result = await initializeAuthMutation.mutateAsync();
            if (result.authorizationUrl) {
                console.log('Authorization URL:', result.authorizationUrl);
                window.location.href = result.authorizationUrl;
            } else {
                setError('Failed to get authorization URL');
            }
        } catch (error) {
            console.error('Error initializing QuickBooks auth:', error);
            setError('An error occurred while connecting to QuickBooks');
        }
    };

    const handleRefreshToken = () => {
        setError(null);
        refreshToken();
    };

    const handleGetCompanyInfo = () => {
        setError(null);
        getCompanyInfo();
    };

    const handleSyncCustomers = () => {
        setError(null);
        setSyncResult(null);
        setIsSyncing(true);
        syncCustomers();
    };

    const handleSyncInvoices = () => {
        setError(null);
        setSyncResult(null);
        setIsSyncingInvoices(true);
        syncInvoices();
    };

    const handleSignInToIntuit = () => {
        setError(null);
        getIntuitSignInUrlMutation.mutate();
    };

    if (!session) {
        return null; // Don't show Quickbooks auth if user is not logged in
    }

    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <h2 className="text-xl font-bold mb-4">QuickBooks Integration</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {isQuickbooksAuthenticated && (
                <>
                    <p className="mt-2 text-green-600">Connected to QuickBooks</p>
                    <div className="mt-2 flex flex-row gap-2">
                        <Button
                            variant="default"
                            onClick={handleRefreshToken}
                        >
                            Refresh Token
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleGetCompanyInfo}
                        >
                            Get Company Info
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleSyncCustomers}
                            disabled={isSyncing || isSyncingCustomers}
                        >
                            {isSyncing || isSyncingCustomers ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sync Customers'}
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleSyncInvoices}
                            disabled={isSyncing || isSyncingInvoices}
                        >
                            {isSyncing || isSyncingInvoices ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sync Invoices'}
                        </Button>
                    </div>
                    {companyInfo && (
                        <QuickBooksCompanyInfo companyInfo={companyInfo} />
                    )}
                </>
            )}

            {!isQuickbooksAuthenticated && (

                <>
                    <div>
                        <Button
                            variant="secondary"
                            onClick={handleSignInToIntuit}
                            disabled={getIntuitSignInUrlMutation.isPending}
                        >
                            {getIntuitSignInUrlMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In to Intuit'}
                        </Button>
                    </div>

                    <div>
                        <Button
                            variant="default"
                            onClick={handleConnectClick}
                            disabled={initializeAuthMutation.isPending}
                        >
                            {initializeAuthMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect to QuickBooks'}
                        </Button>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                </>

            )}
        </div>
    );
};

export default QuickBooksAuth;