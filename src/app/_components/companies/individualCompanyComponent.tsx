// ~/app/_components/companies/individualCompanyComponent.tsx

"use client";

import React from "react";
import Link from "next/link";
import { AddressType, WorkOrderStatus, OrderStatus } from "@prisma/client";

function convertToSnakeCase(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '_');
}

function convertToCamelCase(str: string): string {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

export interface SerializedAddress {
    id: string;
    createdAt: string;
    updatedAt: string;
    officeId: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    telephoneNumber: string;
    addressType: AddressType;
}

export interface SerializedWorkOrder {
    id: string;
    createdAt: string;
    updatedAt: string;
    workOrderNumber: number;
    status: WorkOrderStatus;
    totalCost: string | null;
    // Add other necessary fields
}

export interface SerializedOrder {
    id: string;
    createdAt: string;
    updatedAt: string;
    orderNumber: number;
    status: OrderStatus;
    totalCost: string | null;
    // Add other necessary fields
}

export interface SerializedOffice {
    id: string;
    createdAt: string;
    updatedAt: string;
    createdById: string;
    companyId: string;
    name: string;
    Addresses: SerializedAddress[];
    WorkOrders: SerializedWorkOrder[];
    Orders: SerializedOrder[];
}

export interface SerializedCompany {
    id: string;
    name: string;
    Offices: SerializedOffice[];
}

const AddressList: React.FC<{ addresses: SerializedAddress[] }> = ({ addresses }) => (
    <ul className="list-none pl-0">
        {addresses.map((address) => (
            <li key={address.id} className="mb-2">
                <p>{address.line1}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
            </li>
        ))}
    </ul>
);

const DataTable: React.FC<{ data: any[], columns: string[], actionLink: string }> = ({ data, columns, actionLink }) => (
    <div className="overflow-x-auto">
        <table className="table w-full">
            <thead>
                <tr>
                    {columns.map((col) => (
                        <th key={col}>{col}</th>
                    ))}
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item) => (
                    <tr key={item.id} className="hover:bg-base-200">
                        {columns.map((col) => (
                            <td key={col}>
                                {col.toLowerCase().includes('total')
                                    ? `$${item['totalCost']}`
                                    : item[convertToCamelCase(col)]}
                            </td>
                        ))}
                        <td>
                            <Link className="btn btn-primary btn-sm" href={`${actionLink}/${item.id}`}>View</Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const OfficeCard: React.FC<{ office: SerializedOffice }> = ({ office }) => (
    <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
            <h2 className="card-title">{office.name}</h2>
            <AddressList addresses={office.Addresses} />
            <div className="divider">Work Orders</div>
            <DataTable
                data={office.WorkOrders}
                columns={['Work Order Number', 'Status', 'Total Cost']}
                actionLink="/workOrders"
            />
            <div className="divider">Orders</div>
            <DataTable
                data={office.Orders}
                columns={['Order Number', 'Status', 'Total Cost']}
                actionLink="/orders"
            />
        </div>
    </div>
);

interface IndividualCompanyPageProps {
    company: SerializedCompany;
}

const IndividualCompanyPage: React.FC<IndividualCompanyPageProps> = ({ company }) => {
    return (
        <div className="container mx-auto p-4">
            <main>
                {company?.Offices.map((office) => (
                    <OfficeCard key={office.id} office={office} />
                ))}
            </main>
        </div>
    );
}

export default IndividualCompanyPage;