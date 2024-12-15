// ~/app/_components/companies/individualCompanyComponent.tsx

"use client";

import React from "react";
import Link from "next/link";
import { type AddressType, type WorkOrderStatus, type OrderStatus } from "@prisma/client";
import QuickbooksSyncOrdersButton from "./QuickbooksSyncOrdersButton";
import { toast } from "react-hot-toast";
import { type SerializedCompany, type SerializedOffice } from "~/types/serializedTypes";
import { formatCurrency } from "~/utils/formatters";
import { EyeIcon, FilePenLine } from 'lucide-react';
import { Button } from "../ui/button";

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
    <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="table w-full min-w-[600px]">
            <thead>
                <tr>
                    {columns.map((col) => (
                        <th key={col} className="text-sm">{col}</th>
                    ))}
                    <th className="text-sm">Actions</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item) => (
                    <tr key={item.id} className="hover:bg-base-200">
                        {columns.map((col) => (
                            <td key={col} className="text-sm">
                                {col.toLowerCase() === 'total cost'
                                    ? formatCurrency(item['totalCost'])
                                    : col.toLowerCase() === 'total amount'
                                        ? formatCurrency(item['totalAmount'])
                                        : item[convertToCamelCase(col)]}
                            </td>
                        ))}
                        <td>
                            <Link href={`${actionLink}/${item.id}`}>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="whitespace-nowrap"
                                >
                                    <EyeIcon className="w-4 h-4 mr-1" />
                                    View
                                </Button>
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const OfficeCard: React.FC<{ office: SerializedOffice }> = ({ office }) => (
    <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="card-title text-xl">{office.name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/companies/${office.companyId}/office/${office.id}/edit`}>
                        <Button
                            variant="default"
                            size="sm"
                            className="w-full sm:w-auto"
                        >
                            <FilePenLine className="w-4 h-4 mr-1" />
                            <span>Edit</span>
                        </Button>
                    </Link>
                    <div className={`flex items-center px-3 py-1 rounded-md ${
                        office.quickbooksCustomerId 
                        ? "bg-green-100 text-green-600" 
                        : "bg-red-100 text-red-600"
                    }`}>
                        {office.quickbooksCustomerId ? (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">Synced</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">Not Synced</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <AddressList addresses={office.Addresses} />
                </div>

                <div>
                    <div className="divider">Estimates</div>
                    <DataTable
                        data={office.WorkOrders}
                        columns={['Estimate Number', 'Status', 'Total Cost', 'Total Amount']}
                        actionLink="/workOrders"
                    />
                </div>

                <div>
                    <div className="divider">Orders</div>
                    <div className="mb-4">
                        <QuickbooksSyncOrdersButton 
                            office={{
                                ...office,
                                deleted: false,
                                createdAt: new Date(office.createdAt),
                                updatedAt: new Date(office.updatedAt),
                                syncToken: null,
                                fullyQualifiedName: null
                            }} 
                            onSyncSuccess={() => {
                                toast.success('Office synced with QuickBooks successfully');
                            }} 
                        />
                    </div>
                    <DataTable
                        data={office.Orders}
                        columns={['Order Number', 'Status', 'Total Cost', 'Total Amount']}
                        actionLink="/orders"
                    />
                </div>
            </div>
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