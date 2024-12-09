// ~/app/_components/quickbooks/QuickbooksStatus.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { api } from "~/trpc/react";
import { useQuickbooksStore } from "~/store/useQuickbooksStore";
import { toast } from 'react-hot-toast';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

const QuickbooksStatus: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = api.qbAuth.checkQuickbooksAuthStatus.useQuery(undefined, {
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    });

    const initializeAuthMutation = api.qbAuth.initializeAuth.useMutation();
    const refreshTokenMutation = api.qbAuth.refreshToken.useMutation();

    useEffect(() => {
        if (checkAuthStatus.data) {
            setIsAuthenticated(checkAuthStatus.data.isAuthenticated);
            setIsLoading(false);
            useQuickbooksStore.setState({ isAuthenticated: checkAuthStatus.data.isAuthenticated });
        }
    }, [checkAuthStatus.data]);

    useEffect(() => {
        if (isAuthenticated) {
            const refreshInterval = setInterval(() => {
                handleRefreshToken();
            }, 15 * 60 * 1000); // 15 minutes in milliseconds

            return () => clearInterval(refreshInterval);
        }
    }, [isAuthenticated]);

    const handleConnectClick = async () => {
        try {
            const result = await initializeAuthMutation.mutateAsync();
            if (result.authorizationUrl) {
                window.location.href = result.authorizationUrl;
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Error syncing with QuickBooks: ${error.message}`);
            } else {
                toast.error('An unknown error occurred while connecting to QuickBooks');
            }
            console.error('Error initializing QuickBooks auth:', error);
        }
    };

    const handleRefreshToken = async () => {
        try {
            await refreshTokenMutation.mutateAsync();
            await checkAuthStatus.refetch();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Error refreshing token: ${error.message}`);
            } else {
                toast.error('An unknown error occurred while refreshing the QuickBooks token');
            }
            console.error('Error refreshing token:', error);
        }
    };

    if (isLoading) {
        return <span className="text-white">Loading...</span>;
    }

    return (
        <div className="flex items-center">
            {isAuthenticated ? (
                <Button
                    variant="navOutline"
                    title="Refresh QuickBooks Token"
                    aria-label="Refresh QuickBooks Token"
                    onClick={handleRefreshToken}
                    disabled={refreshTokenMutation.isPending}
                >
                    {refreshTokenMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connected to QuickBooks'}
                </Button>
            ) : (
                <Button
                    title="Connect to QuickBooks"
                    aria-label="Connect to QuickBooks"
                    onClick={handleConnectClick}
                    variant="navOutline"
                    disabled={initializeAuthMutation.isPending}
                >
                    {initializeAuthMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect to QuickBooks'}
                </Button>
            )}
        </div>
    );
};

export default QuickbooksStatus;