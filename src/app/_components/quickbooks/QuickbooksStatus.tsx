'use client';

import React, { useEffect, useState } from 'react';
import { api } from "~/trpc/react";

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
        }
    }, [checkAuthStatus.data]);

    const handleConnectClick = async () => {
        try {
            const result = await initializeAuthMutation.mutateAsync();
            if (result.authorizationUrl) {
                window.location.href = result.authorizationUrl;
            }
        } catch (error) {
            console.error('Error initializing QuickBooks auth:', error);
        }
    };

    const handleRefreshToken = async () => {
        try {
            await refreshTokenMutation.mutateAsync();
            await checkAuthStatus.refetch();
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
    };

    if (isLoading) {
        return <span className="text-white">Loading...</span>;
    }

    return (
        <div className="flex items-center">
            {isAuthenticated ? (
                <button
                    onClick={handleRefreshToken}
                    className="text-green-400 hover:text-green-300"
                    disabled={refreshTokenMutation.isPending}
                >
                    {refreshTokenMutation.isPending ? 'Refreshing...' : 'Connected to QuickBooks'}
                </button>
            ) : (
                <button
                    onClick={handleConnectClick}
                    className="text-blue-400 hover:text-blue-300"
                    disabled={initializeAuthMutation.isPending}
                >
                    {initializeAuthMutation.isPending ? 'Connecting...' : 'Connect to QuickBooks'}
                </button>
            )}
        </div>
    );
};

export default QuickbooksStatus;