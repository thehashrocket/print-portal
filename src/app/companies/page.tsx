// This page will load the companies page when the user navigates to /companies
"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { Company } from "@prisma/client";
import CompaniesTable from "../_components/companies/companiesTable";

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
    const companies = await api.companies.getAll();

    const serializedData = companies.map((company) => ({
        ...company
    }));


    return (
        <div className="container mx-auto">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">Companies</a>
                </div>
                <div className="flex-none">
                    <button className="btn btn-square btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                    </button>
                </div>
            </div>
            {companies.length > 0 ? (<CompaniesTable companies={serializedData} />) : (<p>No companies found</p>)}
        </div>
    );
}