// ~/src/app/invoices/create/page.tsx
import React from 'react';
import { getServerAuthSession } from "~/server/auth";

import Link from 'next/link';
import InvoiceForm from '~/app/_components/invoices/invoiceForm';

export default async function CreateInvoicePage() {
    const session = await getServerAuthSession();

    if (!session || !session.user.Permissions.includes("invoice_create")) {
        return <div className="alert alert-error">You do not have permission to create invoices.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Create New Invoice</h1>
                <Link href="/invoices" className="btn btn-secondary">
                    Back to Invoices
                </Link>
            </div>
            <InvoiceForm />
        </div>
    );
}