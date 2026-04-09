// ~/src/app/invoices/page.tsx
import React from "react";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import InvoicesTable from "../_components/invoices/invoicesTable";
import NoPermission from "~/app/_components/noPermission/noPermission";

export default async function InvoicesPage() {
    const session = await getServerAuthSession();

    if (!session || !session.user.Permissions.includes("invoice_read")) {
        return <NoPermission />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Invoices</h1>
                </div>
                <nav aria-label="breadcrumb" className="text-sm breadcrumbs">
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li>Invoices</li>
                    </ul>
                </nav>
            </header>
            <main>
                <section className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Invoices List</h2>
                    <InvoicesTable />
                </section>
            </main>
        </div>
    );
}
