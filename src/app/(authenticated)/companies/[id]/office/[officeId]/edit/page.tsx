"use server";

import React from "react";
import Link from "next/link";
import { type SerializedOffice } from "~/types/serializedTypes";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import NoPermission from "~/app/_components/noPermission/noPermission";
import OfficeForm from "~/app/_components/offices/OfficeForm";
import { RegMark } from "~/app/_components/primitives/RegMark";

export default async function EditOfficePage(props: { params: Promise<{ officeId: string }> }) {
  const params = await props.params;
  const { officeId } = params;

  const session = await getServerAuthSession();
  const office = await api.offices.getById(officeId);

  if (!session || !session.user.Permissions.includes("office_read")) {
    return <NoPermission />;
  }

  if (!office) {
    notFound();
  }

  const serializedOffice: SerializedOffice = {
    ...office,
    createdAt: office.createdAt.toISOString(),
    updatedAt: office.updatedAt.toISOString(),
    Addresses: office.Addresses.map((address) => ({
      ...address,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    })),
    Company: office.Company,
    WorkOrders: [],
    Orders: [],
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">
            <RegMark />
            &nbsp;
            <span style={{ verticalAlign: "middle" }}>
              <Link href={`/companies/${office.companyId}`} style={{ color: "inherit" }}>
                {office.Company.name}
              </Link>
              {" · "}Office
            </span>
          </div>
          <h1 className="page-title">
            <em>{office.name}</em>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/workOrders/create" className="btn primary">
            + New Estimate
          </Link>
        </div>
      </div>

      <OfficeForm office={serializedOffice} />
    </>
  );
}
