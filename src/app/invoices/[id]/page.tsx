// ~/src/app/invoices/[id]/page.tsx
"use server";
import React from 'react';
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import Link from 'next/link';
import InvoiceDetailClient from '~/app/_components/invoices/InvoiceDetailClient';
import { Decimal } from '@prisma/client/runtime/library';

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const session = await getServerAuthSession();

    if (!session || !session.user.Permissions.includes("invoice_read")) {
        return <div className="alert alert-error">You do not have permission to view this page.</div>;
    }

    const invoice = await api.invoices.getById(params.id);

    if (!invoice) {
        return <div className="alert alert-error">Invoice not found.</div>;
    }

    // return the invoice data as a string
    function serializeDecimal(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Decimal) {
            return obj.toString();
        }

        if (Array.isArray(obj)) {
            return obj.map(serializeDecimal);
        }

        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, serializeDecimal(value)])
        );
    }

    // Serialize the invoice data
    const serializedInvoice = serializeDecimal(invoice);

    return (
        <InvoiceDetailClient initialInvoice={serializedInvoice} invoiceId={params.id} />
    );
}