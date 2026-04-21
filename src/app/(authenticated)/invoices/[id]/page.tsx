"use server";
import React from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import InvoiceDetailClient from "~/app/_components/invoices/InvoiceDetailClient";
import NoPermission from "~/app/_components/noPermission/noPermission";
import { Pill } from "~/app/_components/primitives/Pill";
import { RegMark } from "~/app/_components/primitives/RegMark";
import { Decimal } from "decimal.js";
import { Prisma } from "~/generated/prisma/client";

export default async function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerAuthSession();

  if (!session || !session.user.Permissions.includes("invoice_read")) {
    return <NoPermission />;
  }

  const invoice = await api.invoices.getById(params.id);

  if (!invoice) {
    notFound();
  }

  function serializeDecimal(obj: any): any {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Decimal || obj instanceof Prisma.Decimal) return obj.toString();
    if (Array.isArray(obj)) return obj.map(serializeDecimal);
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serializeDecimal(v)]));
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">
            <RegMark />
            &nbsp;
            <span style={{ verticalAlign: "middle" }}>
              {invoice.Order.Office.Company.name} · Invoice #{invoice.invoiceNumber}
            </span>
          </div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span>Invoi<em>ce</em></span>
            <Pill status={invoice.status} />
          </h1>
        </div>
      </div>

      <InvoiceDetailClient initialInvoice={serializeDecimal(invoice)} invoiceId={params.id} />
    </>
  );
}
