// ~/src/app/invoices/page.tsx
import React from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import Link from "next/link";
import InvoicesTable from "../_components/invoices/invoicesTable";

export default async function InvoicesPage() {
    const session = await getServerAuthSession();

    if (!session || !session.user.Permissions.includes("invoice_read")) {
        return <div className="alert alert-error">You do not have permission to view this page.</div>;
    }

    const invoices = await api.invoices.getAll();
    const serializedInvoices = invoices.map(invoice => ({
        ...invoice,
        dateIssued: invoice.dateIssued.toISOString(),
        dateDue: invoice.dateDue.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Invoices</h1>
                <Link href="/invoices/create" className="btn btn-primary">
                    Create New Invoice
                </Link>
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search invoices..."
                    className="input input-bordered w-full max-w-xs"
                />
            </div>
            <InvoicesTable invoices={serializedInvoices} />
        </div>
    );
}