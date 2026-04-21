import React from "react";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import InvoicesTable from "~/app/_components/invoices/invoicesTable";
import NoPermission from "~/app/_components/noPermission/noPermission";
import { RegMark } from "~/app/_components/primitives/RegMark";

export default async function InvoicesPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user.Permissions.includes("invoice_read")) {
    return <NoPermission />;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">
            <RegMark />
            &nbsp;
            <span style={{ verticalAlign: "middle" }}>Finance</span>
          </div>
          <h1 className="page-title">
            Invoi<em>ces</em>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/invoices/create" className="btn primary">
            + New Invoice
          </Link>
        </div>
      </div>

      <InvoicesTable />
    </>
  );
}
