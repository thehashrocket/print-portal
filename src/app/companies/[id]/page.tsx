// Show an individual company page, includes the company name and a list of offices
"use server";
import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import { Company } from "@prisma/client";

export default async function CompanyPage({
    params: { id },
}: {
    params: { id: string };
}) {
    // Fetch user session for authentication
    const session = await getServerAuthSession();

    // Check if user has permission to view the page
    if (!session || !session.user.Permissions.includes("company_read")) {
        return "You do not have permission to view this page";
    }

    // Fetch company data
    const company = await api.companies.getByID(id);

    return (
        <div className="container mx-auto">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">{company?.name}</a>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/companies">Companies</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="flex-none">
                    <button className="btn btn-square btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                    </button>
                </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
                <ul>
                    {company?.Offices.map((office) => (
                        <li key={office.id} >
                            <h3 className="text-lg font-medium">{office.name}</h3>
                            {/* Show the addresses */}
                            <ul>
                                {office.Addresses.map((address) => (
                                    <li key={address.id}>
                                        <p>{address.line1}</p>
                                        <p>{address.city}, {address.state} {address.zipCode}</p>
                                    </li>
                                ))}
                            </ul>
                            <div className="rounded-lg bg-white p-6 shadow-md mb-5">
                                <h3 className="text-lg">Work Orders</h3>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Work Order Number</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {office.WorkOrders.map((workOrder) => (
                                            <tr key={workOrder.id} className="hover:bg-base-200">
                                                <td>{workOrder.workOrderNumber}</td>
                                                <td>{workOrder.status}</td>
                                                <td>
                                                    <Link className="btn btn-primary" href={`/workOrders/${workOrder.id}`}>View</Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="rounded-lg bg-white p-6 shadow-md mb-5">
                                <h3 className="text-lg">Orders</h3>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Order Number</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {office.Orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-base-200">
                                                <td>{order.orderNumber}</td>
                                                <td>{order.status}</td>
                                                <td>
                                                    <Link className="btn btn-primary" href={`/orders/${order.id}`}>View</Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="divider"></div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}