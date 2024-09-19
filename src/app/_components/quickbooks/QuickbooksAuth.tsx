// ~/src/app/_components/quickbooks/QuickbooksAuth.tsx
"use client"
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from "~/trpc/react";
import { useRouter } from 'next/navigation';

const QuickBooksAuth: React.FC = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [isQuickbooksAuthenticated, setIsQuickbooksAuthenticated] = useState(false);
    const [companyInfo, setCompanyInfo] = useState<any>(null);

    const { data: authStatus } = api.quickbooks.checkQuickbooksAuthStatus.useQuery(
        undefined,
        { enabled: !!session }
    );

    const { mutate: initiateAuth } = api.quickbooks.initiateAuth.useMutation({
        onSuccess: (data) => {
            router.push(data.authUri);
        },
    });

    const { mutate: refreshToken } = api.quickbooks.refreshToken.useMutation({
        onSuccess: () => {
            alert('Token refreshed successfully');
        },
    });

    const { data: companyInfoData, refetch: getCompanyInfo } = api.quickbooks.getCompanyInfo.useQuery(
        undefined,
        { enabled: false }
    );

    useEffect(() => {
        if (companyInfoData) {
            setCompanyInfo(companyInfoData);
        }
    }, [companyInfoData]);

    useEffect(() => {
        if (authStatus) {
            setIsQuickbooksAuthenticated(authStatus.isAuthenticated);
        }
    }, [authStatus]);

    const handleAuth = async () => {
        if (isQuickbooksAuthenticated) {
            // Implement disconnect logic if needed
            console.log("Disconnect not implemented");
        } else {
            initiateAuth();
        }
    };

    const handleGetCompanyInfo = () => {
        getCompanyInfo();
    };

    if (!session) {
        return null; // Don't show Quickbooks auth if user is not logged in
    }

    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <h2 className="text-xl font-bold mb-4">QuickBooks Integration</h2>
            <button
                onClick={handleAuth}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-2"
            >
                {isQuickbooksAuthenticated ? 'Disconnect QuickBooks' : 'Connect to QuickBooks'}
            </button>
            {isQuickbooksAuthenticated && (
                <>
                    <p className="mt-2 text-green-600">Connected to QuickBooks</p>
                    <button
                        onClick={() => refreshToken()}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors mt-2"
                    >
                        Refresh Token
                    </button>
                    <button
                        onClick={handleGetCompanyInfo}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors mt-2 ml-2"
                    >
                        Get Company Info
                    </button>
                    {companyInfo && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold">Company Info:</h3>
                            <pre className="bg-gray-100 p-2 rounded mt-2">
                                {JSON.stringify(companyInfo, null, 2)}
                            </pre>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default QuickBooksAuth;