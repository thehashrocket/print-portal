// ~/app/companies/page.tsx
"use server";

import React, { Suspense } from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import CompaniesTable from "../_components/companies/companiesTable";
import Link from "next/link";
import CompaniesChart from "../_components/companies/CompaniesChart";
import { type CompanyDashboardData } from "~/types/company";
import NoPermission from "~/app/_components/noPermission/noPermission";
import { Button } from "../_components/ui/button";
import { PlusCircle } from "lucide-react";

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
        <div className="container mx-auto px-4 py-4 sm:py-8">
            <div className="mb-4 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Companies</h1>
                <div className="text-sm breadcrumbs">
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li>Companies</li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">
                    <div className="stat bg-base-100 shadow p-4">
                        <div className="stat-title text-sm">Total Companies</div>
                        <div className="stat-value text-xl sm:text-2xl">{totalCompanies}</div>
                    </div>
                    <div className="stat bg-base-100 shadow p-4">
                        <div className="stat-title text-sm">Pending Estimates</div>
                        <div className="stat-value text-xl sm:text-2xl">${totalPendingWorkOrders.toFixed(2)}</div>
                    </div>
                    <div className="stat bg-base-100 shadow p-4">
                        <div className="stat-title text-sm">Pending Orders</div>
                        <div className="stat-value text-xl sm:text-2xl">${totalPendingOrders.toFixed(2)}</div>
                    </div>
                </div>
                <Link href="/companies/create" className="w-full sm:w-auto">
                    <Button
                        variant="default"
                        className="w-full sm:w-auto"
                    >
                        <PlusCircle className="w-4 h-4" /> Create Company
                    </Button>
                </Link>
            </div>

            <div className="bg-base-100 shadow-xl rounded-lg p-4 sm:p-6 mb-4 sm:mb-8">
                <Suspense fallback={<div>Loading chart...</div>}>
                    <CompaniesChart companies={serializedData} />
                </Suspense>
            </div>

            <div className="bg-base-100 shadow-xl rounded-lg p-4 sm:p-6">
                <Suspense fallback={<div>Loading...</div>}>
                    <div className="mb-4">
                        <input 
                            type="text" 
                            placeholder="Search companies..." 
                            className="input input-bordered w-full max-w-xs" 
                        />
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