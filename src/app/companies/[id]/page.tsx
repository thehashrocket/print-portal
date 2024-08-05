// ~/app/companies/[id]/page.tsx
"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import { Company, Office, Address, WorkOrder, Order } from "@prisma/client";
import IndividualCompanyPage, { SerializedCompany } from "~/app/_components/companies/individualCompanyComponent";
import { Decimal } from "@prisma/client/runtime/library";

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

function serializeCompany(company: Company & {
    Offices: (Office & {
        Addresses: Address[],
        WorkOrders: WorkOrder[],
        Orders: Order[]
    })[]
}): SerializedCompany {
    return {
        id: company.id,
        name: company.name,
        Offices: company.Offices.map(office => ({
            id: office.id,
            createdAt: office.createdAt.toISOString(),
            updatedAt: office.updatedAt.toISOString(),
            createdById: office.createdById,
            companyId: office.companyId,
            name: office.name,
            Addresses: office.Addresses.map(address => ({
                ...address,
                createdAt: address.createdAt.toISOString(),
                updatedAt: address.updatedAt.toISOString(),
            })),
            WorkOrders: office.WorkOrders.map(workOrder => ({
                ...workOrder,
                createdAt: workOrder.createdAt.toISOString(),
                updatedAt: workOrder.updatedAt.toISOString(),
                totalCost: workOrder.totalCost?.toString() ?? null,
                deposit: workOrder.deposit.toString(),
            })),
            Orders: office.Orders.map(order => ({
                ...order,
                createdAt: order.createdAt.toISOString(),
                updatedAt: order.updatedAt.toISOString(),
                totalCost: order.totalCost?.toString() ?? null,
                deposit: order.deposit?.toString() ?? null,
            })),
        })),
    };
}

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

    const serializedCompany = serializeCompany(company);

    return (
        <div className="container mx-auto px-4 py-8">
            <Header companyName={serializedCompany.name || "Company"} />
            <Breadcrumbs />
            <IndividualCompanyPage company={serializedCompany} />
        </div>
    );
}