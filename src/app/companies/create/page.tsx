// Create a New Company
"use server";
import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { Company } from "@prisma/client";
import Link from "next/link";
import { CreateCompany } from "~/app/_components/companies/createCompanyComponent";

export default async function CompaniesPage() {
    const session = await getServerAuthSession();

    if (
        !session ||
        session.user.Permissions.map((permission: string) => permission)
            .join(", ")
            .includes("company_create") === false
    ) {
        return "You do not have permission to view this page";
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">Companies</a>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/companies">Companies</Link></li>
                            <li><Link href="/companies/create">Create Company</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="flex-none">
                    <Link className="btn btn-primary" href="/companies/create">New Company</Link>
                </div>
            </div>
            <CreateCompany />
        </div>
    );
}