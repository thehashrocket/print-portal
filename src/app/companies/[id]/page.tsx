// ~/app/companies/[id]/page.tsx
"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import { Company, Office, Address, WorkOrder, WorkOrderItem, Order, OrderItem, OrderStatus, AddressType } from "@prisma/client";
import IndividualCompanyPage, { SerializedCompany } from "~/app/_components/companies/individualCompanyComponent";
import { Decimal } from "@prisma/client/runtime/library";
import NoPermission from "~/app/_components/noPermission/noPremission";

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

type ExtendedOrder = Order & {
    OrderItems: OrderItem[];
    totalCost: Decimal | null;
};

type ExtendedWorkOrder = WorkOrder & {
    WorkOrderItems: WorkOrderItem[];
    totalCost: Decimal | null;
};

function serializeCompany(company: Company & {
    Offices: (Office & {
        Addresses: Address[],
        WorkOrders: (WorkOrder & {
            WorkOrderItems: WorkOrderItem[],
            totalCost?: Decimal | null
        })[],
        Orders: (Order & {
            OrderItems: OrderItem[],
            totalCost?: Decimal | null
        })[]
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
                addressType: address.addressType as AddressType,
            })),
            WorkOrders: office.WorkOrders.map(workOrder => ({
                ...workOrder,
                createdAt: workOrder.createdAt.toISOString(),
                updatedAt: workOrder.updatedAt.toISOString(),
                dateIn: workOrder.dateIn.toISOString(),
                inHandsDate: workOrder.inHandsDate.toISOString(),
                totalCost: workOrder.totalCost?.toString() ?? null,
                WorkOrderItems: workOrder.WorkOrderItems.map(item => ({
                    ...item,
                    createdAt: item.createdAt.toISOString(),
                    updatedAt: item.updatedAt.toISOString(),
                    expectedDate: item.expectedDate?.toISOString() ?? null,
                    amount: item.amount?.toString() ?? null,
                    cost: item.cost?.toString() ?? null,
                })),
            })),
            Orders: office.Orders.map(order => ({
                ...order,
                createdAt: order.createdAt.toISOString(),
                updatedAt: order.updatedAt.toISOString(),
                totalCost: order.totalCost?.toString() ?? null,
                deposit: order.deposit.toString(),
                status: order.status as OrderStatus,
                OrderItems: order.OrderItems.map(item => ({
                    ...item,
                    createdAt: item.createdAt.toISOString(),
                    updatedAt: item.updatedAt.toISOString(),
                    amount: item.amount?.toString() ?? null,
                    cost: item.cost?.toString() ?? null
                })),
            })),
        })),
    };
}

export default async function CompanyPage(
    { params: { id } }: { params: { id: string } }) {
    const session = await getServerAuthSession();
    const company = await api.companies.getByID(id);

    if (!session || !session.user.Permissions.includes("company_read")) {
        return (
            <NoPermission />
        )
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