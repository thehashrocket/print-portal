"use server";

import React from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { notFound } from "next/navigation";
import IndividualCompanyPage from "~/app/_components/companies/individualCompanyComponent";
import NoPermission from "~/app/_components/noPermission/noPermission";
import HeaderClient from "~/app/_components/companies/HeaderClient";
import { RegMark } from "~/app/_components/primitives/RegMark";
import { type SerializedCompany } from "~/types/serializedTypes";

export default async function CompanyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const session = await getServerAuthSession();

  if (!session || !session.user.Permissions.includes("company_read")) {
    return <NoPermission />;
  }

  const company = await api.companies.getByID(id);

  if (!company) {
    notFound();
  }

  const serializedCompany: SerializedCompany = company;

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
            <em>{serializedCompany.name}</em>
          </h1>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <HeaderClient
          companyName={serializedCompany.name || "Company"}
          companyId={id}
          isActive={serializedCompany.isActive}
          quickbooksId={serializedCompany.quickbooksId}
        />
      </div>

      <IndividualCompanyPage company={serializedCompany} />
    </>
  );
}
