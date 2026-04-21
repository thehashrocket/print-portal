"use server";
import React from "react";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { CreateCompany } from "~/app/_components/companies/createCompanyComponent";
import NoPermission from "~/app/_components/noPermission/noPermission";
import { RegMark } from "~/app/_components/primitives/RegMark";

export default async function CreateCompanyPage() {
  const session = await getServerAuthSession();

  if (
    !session ||
    !session.user.Permissions.includes("company_create")
  ) {
    return <NoPermission />;
  }

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
            New <em>Company</em>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/companies" className="btn">
            Cancel
          </Link>
        </div>
      </div>

      <CreateCompany />
    </>
  );
}
