"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import { Company } from "@prisma/client";
import IndividualCompanyPage from "~/app/_components/companies/individualCompanyComponent";

const Header: React.FC<{ companyName: string }> = ({ companyName }) => (
    <div className="navbar bg-base-100 shadow-lg rounded-box mb-4">
        <div className="flex-1">
            <h1 className="text-2xl font-bold">{companyName}</h1>
        </div>
        <div className="flex-none">
            <Link href="/companies/create" className="btn btn-primary">Create Company</Link>
        </div>
    </div>
);

const Breadcrumbs: React.FC = () => (
    <div className="text-sm breadcrumbs mb-4">
        <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/companies">Companies</Link></li>
        </ul>
    </div>
);



export default async function CompanyPage(
    { params: { id } }: { params: { id: string } }) {
    const session = await getServerAuthSession();
    const company = await api.companies.getByID(id);

    if (!session || !session.user.Permissions.includes("company_read")) {
        return <div className="alert alert-warning">You do not have permission to view this page</div>;
    }

    if (!company) {
        return <div className="alert alert-danger">Company not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <Header companyName={company?.name || "Company"} />
            <Breadcrumbs />
            <IndividualCompanyPage company={company} />
        </div>
    );
}