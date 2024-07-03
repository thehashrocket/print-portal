// ~/app/_components/companies/individualCompanyComponent.tsx

"use client";

import React from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Company, Office, Address, WorkOrder, Order } from "@prisma/client";

function convertToSnakeCase(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '_');
}

function convertToCamelCase(str: string): string {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

const AddressList: React.FC<{ addresses: Address[] }> = ({ addresses }) => (
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

const OfficeCard: React.FC<{ office: Office & { Addresses: Address[], WorkOrders: WorkOrder[], Orders: Order[] } }> = ({ office }) => (
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

type IndividualCompanyPageProps = {
    company: Company & { Offices: Office[] };
};

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