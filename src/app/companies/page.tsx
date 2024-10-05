// ~/app/companies/page.tsx
"use server";

import React, { Suspense } from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import CompaniesTable from "../_components/companies/companiesTable";
import Link from "next/link";
import CompaniesChart from "../_components/companies/CompaniesChart";
import { type CompanyDashboardData } from "~/types/company";
import NoPermission from "~/app/_components/noPermission/noPremission";

export default async function CompaniesPage() {
    const session = await getServerAuthSession();

    if (!session || !session.user.Permissions.includes("company_read")) {
        return (
            <NoPermission />
        )
    }

    const companies: CompanyDashboardData[] = await api.companies.companyDashboard();
    const serializedData = companies;
    const totalCompanies = companies.length;
    const totalPendingWorkOrders = companies.reduce((sum, company) => sum + company.workOrderTotalPending, 0);
    const totalPendingOrders = companies.reduce((sum, company) => sum + company.orderTotalPending, 0);


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Companies</h1>
                <div className="text-sm breadcrumbs">
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li>Companies</li>
                    </ul>
                </div>
            </div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-4">
                    <div className="stat bg-base-100 shadow">
                        <div className="stat-title">Total Companies</div>
                        <div className="stat-value">{totalCompanies}</div>
                    </div>
                    <div className="stat bg-base-100 shadow">
                        <div className="stat-title">Pending Work Orders</div>
                        <div className="stat-value">${totalPendingWorkOrders.toFixed(2)}</div>
                    </div>
                    <div className="stat bg-base-100 shadow">
                        <div className="stat-title">Pending Orders</div>
                        <div className="stat-value">${totalPendingOrders.toFixed(2)}</div>
                    </div>
                </div>
                <Link className="btn btn-primary" href="/companies/create">
                    New Company
                </Link>
            </div>

            <div className="bg-base-100 shadow-xl rounded-lg p-6 mb-8">
                <Suspense fallback={<div>Loading chart...</div>}>
                    <CompaniesChart companies={serializedData} />
                </Suspense>
            </div>

            <div className="bg-base-100 shadow-xl rounded-lg p-6">
                <Suspense fallback={<div>Loading...</div>}>
                    <div className="mb-4">
                        <input type="text" placeholder="Search companies..." className="input input-bordered w-full max-w-xs" />
                    </div>
                    {companies.length > 0 ? (
                        <CompaniesTable companies={serializedData} />
                    ) : (
                        <p>No companies found</p>
                    )}
                </Suspense>
            </div>
        </div>
    );
}