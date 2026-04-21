"use server";

import React, { Suspense } from "react";
import Link from "next/link";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import CompaniesTable from "~/app/_components/companies/companiesTable";
import { type CompanyDashboardData } from "~/types/company";
import NoPermission from "~/app/_components/noPermission/noPermission";
import { RegMark } from "~/app/_components/primitives/RegMark";

export default async function CompaniesPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user.Permissions.includes("company_read")) {
    return <NoPermission />;
  }

  const companies: CompanyDashboardData[] = await api.companies.companyDashboard();
  const totalCompanies = companies.length;
  const totalPendingWorkOrders = companies.reduce((sum, c) => sum + c.workOrderTotalPending, 0);
  const totalPendingOrders = companies.reduce((sum, c) => sum + c.orderTotalPending, 0);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">
            <RegMark />
            &nbsp;
            <span style={{ verticalAlign: "middle" }}>Resources</span>
          </div>
          <h1 className="page-title">
            Compa<em>nies</em>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/companies/create" className="btn primary">
            + New Company
          </Link>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat">
          <div className="stat-label"><span className="uppercase-label">Companies</span></div>
          <div className="stat-value">{totalCompanies}</div>
        </div>
        <div className="stat">
          <div className="stat-label"><span className="uppercase-label">Pending Estimates</span></div>
          <div className="stat-value">${totalPendingWorkOrders.toFixed(2)}</div>
        </div>
        <div className="stat">
          <div className="stat-label"><span className="uppercase-label">Pending Orders</span></div>
          <div className="stat-value">${totalPendingOrders.toFixed(2)}</div>
        </div>
      </div>

      <Suspense fallback={<div>Loading…</div>}>
        {companies.length > 0 ? (
          <CompaniesTable companies={companies} />
        ) : (
          <p style={{ color: "var(--ink-3)" }}>No companies found.</p>
        )}
      </Suspense>
    </>
  );
}
