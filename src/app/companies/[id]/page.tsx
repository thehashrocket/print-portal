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

const Breadcrumbs: React.FC = () => (
    <div className="text-sm breadcrumbs mb-4">
        <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/companies">Companies</Link></li>
        </ul>
    </div>
);

function serializeCompany(company: {
    id: string;
    name: string;
    quickbooksId: string | null;
    syncToken: string | null;
    createdAt: Date;
    updatedAt: Date;
    Offices: SerializedOffice[];
}): SerializedCompany {
    return {
        id: company.id,
        name: company.name,
        quickbooksId: company.quickbooksId,
        Offices: company.Offices
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

    const serializedOffices: SerializedOffice[] = company.Offices.map(office => ({
        ...office,
        createdAt: office.createdAt.toISOString(),
        updatedAt: office.updatedAt.toISOString(),
        Company: { name: office.Company.name },
        Addresses: office.Addresses.map(address => ({
            ...address,
            deleted: false,
            createdAt: address.createdAt.toISOString(),
            updatedAt: address.updatedAt.toISOString()
        })),
        WorkOrders: office.WorkOrders.map(workOrder => ({
            ...workOrder,
            workOrderNumber: workOrder.workOrderNumber.toString(),
            createdAt: workOrder.createdAt.toISOString(),
            updatedAt: workOrder.updatedAt.toISOString(),
            dateIn: workOrder.dateIn.toISOString(),
            inHandsDate: workOrder.inHandsDate.toISOString(),
            calculatedSalesTax: workOrder.calculatedSalesTax?.toString() ?? "0",
            calculatedSubTotal: workOrder.calculatedSubTotal?.toString() ?? "0",
            totalAmount: workOrder.totalAmount?.toString() ?? "0",
            totalItemAmount: workOrder.totalItemAmount?.toString() ?? "0",
            totalShippingAmount: workOrder.totalShippingAmount?.toString() ?? "0",
            totalCost: workOrder.totalCost?.toString() ?? "0",
            contactPerson: { id: "", name: null },
            createdBy: { id: "", name: null },
            Office: { Company: { name: office.name }, id: office.id, name: office.name },
            Order: null,
            ShippingInfo: null,
            WorkOrderItems: [],
            WorkOrderNotes: [],
            WorkOrderVersions: []
        })),
        Orders: office.Orders.map(order => ({
            ...order,
            deposit: order.deposit.toString(),
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
            inHandsDate: order.inHandsDate?.toISOString() ?? null,
            dateInvoiced: order.dateInvoiced?.toISOString() ?? null,
            balance: "0",
            calculatedSalesTax: order.calculatedSalesTax?.toString() ?? "0",
            calculatedSubTotal: order.calculatedSubTotal?.toString() ?? "0",
            totalAmount: order.totalAmount?.toString() ?? "0",
            totalItemAmount: "0",
            totalShippingAmount: "0",
            totalCost: order.totalCost?.toString() ?? "0",
            totalPaid: "0",
            OrderItems: [],
            OrderNotes: [],
            OrderPayments: [],
            ShippingInfo: null,
            Invoice: null,
            WorkOrder: { purchaseOrderNumber: "" },
            contactPerson: { id: "", name: null, email: null },
            createdBy: { id: "", name: null },
            Office: { Company: { name: office.name }, id: office.id, name: office.name }
        }))
    }));

    const serializedCompany = serializeCompany({
        ...company,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        Offices: serializedOffices
    });

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