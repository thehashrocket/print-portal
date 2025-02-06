// ~/app/companies/[id]/page.tsx
"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import IndividualCompanyPage from "~/app/_components/companies/individualCompanyComponent";
import NoPermission from "~/app/_components/noPermission/noPermission"
import HeaderClient from "~/app/_components/companies/HeaderClient";

import { type SerializedCompany, type SerializedOffice } from "~/types/serializedTypes";

const Breadcrumbs: React.FC<{ companyName: string }> = ({ companyName }) => (
    <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
            <li><Link href="/" className="text-sm">Home</Link></li>
            <li><Link href="/companies" className="text-sm before:content-['>'] before:mx-2">Companies</Link></li>
            <li className="text-sm before:content-['>'] before:mx-2">{companyName}</li>
        </ol>
    </nav>
);

export default async function CompanyPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const session = await getServerAuthSession();
    const company = await api.companies.getByID(id);

    if (!session || !session.user.Permissions.includes("company_read")) {
        return <NoPermission />;
    }

    if (!company) {
        return <div className="alert alert-danger">Company not found</div>;
    }

    const serializedCompany: SerializedCompany = company;

    return (
        <div className="flex flex-col min-h-screen bg-base-200">
            <div className="p-4">
                <div className="bg-base-100 rounded-lg shadow-lg p-4 mb-4 overflow-hidden">
                    <div className="w-full overflow-x-auto">
                        <HeaderClient 
                            companyName={serializedCompany.name || "Company"} 
                            companyId={id}
                            isActive={serializedCompany.isActive}
                            quickbooksId={serializedCompany.quickbooksId}
                        />
                    </div>
                </div>

                <Breadcrumbs companyName={serializedCompany.name || "Company"} />

                <div className="bg-base-100 rounded-lg shadow-lg p-4">
                    <IndividualCompanyPage company={serializedCompany} />
                </div>
            </div>
        </div>
    );
}