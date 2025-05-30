// ~/app/companies/[id]/office/[officeId]/edit/page.tsx
// TODO: Add edit page for office
"use server";

import React from "react";
import Link from "next/link";
import { type SerializedOffice } from "~/types/serializedTypes";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import NoPermission from "~/app/_components/noPermission/noPermission";
import OfficeForm from "~/app/_components/offices/OfficeForm";
import { PlusCircle } from "lucide-react";
import { Button } from "~/app/_components/ui/button";

export default async function EditOfficePage(props: { params: Promise<{ officeId: string }> }) {
    const params = await props.params;

    const {
        officeId
    } = params;

    const session = await getServerAuthSession();
    const office = await api.offices.getById(officeId);

    if (!session || !session.user.Permissions.includes("office_read")) {
        return <NoPermission />;
    }

    if (!office) {
        return <div className="alert alert-danger">Office not found</div>;
    }

    const serializedOffice: SerializedOffice = {
        ...office,
        createdAt: office.createdAt.toISOString(),
        updatedAt: office.updatedAt.toISOString(),
        Addresses: office.Addresses.map(address => ({
            ...address,
            createdAt: address.createdAt.toISOString(),
            updatedAt: address.updatedAt.toISOString()
        })),
        Company: office.Company,
        WorkOrders: [],
        Orders: []
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Office Details</h1>
                    <Link href="/workOrders/create">
                        <Button
                            variant="default"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Create Estimate
                        </Button>
                    </Link>
                </div>
                <nav aria-label="breadcrumb" className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/companies">Companies</Link></li>
                            <li><Link href={`/companies/${office.companyId}`}>{office.Company.name}</Link></li>
                            <li>Office</li>
                            <li>{office.name}</li>
                        </ul>
                </nav>
            </header>
            <OfficeForm office={serializedOffice} />
        </div>
    );
}