import React from "react";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import InvoiceForm from "~/app/_components/invoices/invoiceForm";
import NoPermission from "~/app/_components/noPermission/noPermission";
import { RegMark } from "~/app/_components/primitives/RegMark";

export default async function CreateInvoicePage() {
  const session = await getServerAuthSession();

  if (!session || !session.user.Permissions.includes("invoice_create")) {
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
            New <em>Invoice</em>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/invoices" className="btn">
            Cancel
          </Link>
        </div>
      </div>

      <InvoiceForm />
    </>
  );
}
