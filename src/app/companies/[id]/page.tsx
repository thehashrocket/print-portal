// ~/app/companies/[id]/page.tsx
"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import { type Company, type Office, type Address, type WorkOrder, type WorkOrderItem, type Order, type OrderItem, type OrderStatus, type AddressType } from "@prisma/client";
import IndividualCompanyPage, { type SerializedCompany } from "~/app/_components/companies/individualCompanyComponent";
import { type Decimal } from "@prisma/client/runtime/library";
import NoPermission from "~/app/_components/noPermission/noPremission";
import HeaderClient from "~/app/_components/companies/HeaderClient";

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
        quickbooksId: company.quickbooksId,
        Offices: company.Offices.map(office => ({
            id: office.id,
            createdAt: office.createdAt.toISOString(),
            updatedAt: office.updatedAt.toISOString(),
            createdById: office.createdById,
            fullyQualifiedName: office.fullyQualifiedName,
            syncToken: office.syncToken,
            companyId: office.companyId,
            name: office.name,
            quickbooksCustomerId: office.quickbooksCustomerId,
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
                workOrderNumber: Number(workOrder.workOrderNumber ?? 0),
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
            <HeaderClient 
                companyName={serializedCompany.name || "Company"} 
                companyId={id}
                quickbooksId={serializedCompany.quickbooksId}
            />
            <Breadcrumbs />
            <IndividualCompanyPage company={serializedCompany} />
        </div>
    );
}