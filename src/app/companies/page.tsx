// This page will load the companies page when the user navigates to /companies
"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { Company } from "@prisma/client";
import CompaniesTable from "../_components/companies/companiesTable";
import Link from "next/link";

export default async function CompaniesPage() {

    const session = await getServerAuthSession();

    if (
        !session ||
        session.user.Permissions.map((permission) => permission)
            .join(", ")
            .includes("company_read") === false
    ) {
        return "You do not have permssion to view this page";
    }
    const companies = await api.companies.companyDashboard();

    const serializedData = companies.map((company) => ({
        ...company
    }));


    return (
        <div className="container mx-auto">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">Companies</a>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="flex-none">
                    <Link className="btn btn-primary" href="/companies/create">New Company</Link>
                </div>
            </div>
            {companies.length > 0 ? (<CompaniesTable companies={serializedData} />) : (<p>No companies found</p>)}
        </div>
    );
}