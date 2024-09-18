// ~/src/app/_components/quickbooks/QuickbooksAuth.tsx
"use client"
import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

const QuickBooksAuth: React.FC = () => {
    const { data: session, status } = useSession();

    const handleAuth = async () => {
        if (session) {
            await signOut();
        } else {
            await signIn('quickbooks');
        }
    };

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <h2 className="text-xl font-bold mb-4">QuickBooks Integration</h2>
            <button
                onClick={handleAuth}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                {session ? 'Disconnect QuickBooks' : 'Connect to QuickBooks'}
            </button>
            {session && (
                <p className="mt-2 text-green-600">Connected to QuickBooks</p>
            )}
        </div>
    );
};

export default QuickBooksAuth;