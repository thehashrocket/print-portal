// ~/src/app/_components/invoices/InvoiceDetailClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { formatCurrency, formatDate } from "~/utils/formatters";
import AddPaymentForm from "~/app/_components/invoices/AddPaymentForm";
import { ShippingMethod } from "~/generated/prisma/browser";
import { type SerializedInvoice, type SerializedOrder } from "~/types/serializedTypes";
import { toast } from "react-hot-toast";
import { Download, Send } from "lucide-react";
import { Meta } from "~/app/_components/primitives/Meta";

interface InvoiceDetailClientProps {
  initialInvoice: SerializedInvoice | null;
  invoiceId: string;
}

const InvoiceDetailClient: React.FC<InvoiceDetailClientProps> = ({ initialInvoice, invoiceId }) => {
  const [invoice, setInvoice] = useState<SerializedInvoice | null>(initialInvoice);
  const [order, setOrder] = useState<SerializedOrder | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const utils = api.useUtils();

  const { data: invoiceData, error } = api.invoices.getById.useQuery<SerializedInvoice>(invoiceId, {
    initialData: initialInvoice || undefined,
  });

  const { mutate: getInvoicePdfMutation } = api.qbInvoices.getInvoicePdf.useMutation({
    onSuccess: (pdfBase64) => {
      const binaryString = window.atob(pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice?.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
      setIsPrinting(false);
    },
    onError: () => {
      toast.error("Failed to download PDF");
      setIsPrinting(false);
    },
  });

  const { mutate: createQuickbooksInvoice } = api.qbInvoices.createQbInvoiceFromInvoice.useMutation({
    onSuccess: () => {
      toast.success("Quickbooks invoice created");
      utils.invoices.getById.invalidate(invoiceId);
    },
    onError: () => toast.error("Failed to create Quickbooks invoice"),
  });

  const { mutate: sendInvoiceEmailMutation } = api.qbInvoices.sendInvoiceEmail.useMutation({
    onSuccess: () => {
      toast.success("Invoice sent successfully");
      utils.invoices.getById.invalidate(invoiceId);
    },
    onError: () => toast.error("Failed to send invoice"),
  });

  const { data: orderData, refetch: refetchOrder } = api.orders.getByID.useQuery<SerializedOrder>(
    invoice?.orderId ?? "",
    { enabled: !!invoice?.orderId, refetchOnMount: false, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (invoiceData) {
      setInvoice(invoiceData as SerializedInvoice);
      refetchOrder();
    }
    if (orderData) setOrder(orderData as SerializedOrder);
  }, [invoiceData, orderData, refetchOrder]);

  if (error || !invoice) {
    return <p style={{ color: "var(--danger)", padding: 32 }}>Invoice not found.</p>;
  }

  const handlePrint = (quickbooksId: string) => {
    setIsPrinting(true);
    if (!quickbooksId) { toast.error("No QuickBooks invoice ID available"); return; }
    getInvoicePdfMutation({ quickbooksId });
  };

  const handleSendEmail = (quickbooksId: string) => {
    sendInvoiceEmailMutation({
      quickbooksId,
      recipientEmail: invoice.createdBy.email ?? "",
    });
    utils.invoices.getById.invalidate(invoiceId);
  };

  const shipping = order?.ShippingInfo;

  return (
    <>
      {/* Action bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <Link href={`/orders/${invoice.orderId}`} className="btn">View Order</Link>
        {!invoice.quickbooksId && (
          <button className="btn" onClick={() => createQuickbooksInvoice({ invoiceId: invoice.id })}>
            Create QB Invoice
          </button>
        )}
        {invoice.quickbooksId && (
          <>
            <button className="btn" onClick={() => createQuickbooksInvoice({ invoiceId: invoice.id })}>
              Update QB Invoice
            </button>
            <button className="btn primary" onClick={() => handlePrint(invoice.quickbooksId!)} disabled={isPrinting}>
              <Download size={14} style={{ marginRight: 6 }} />
              {isPrinting ? "Downloading…" : "Download PDF"}
            </button>
            <button className="btn primary" onClick={() => handleSendEmail(invoice.quickbooksId!)}>
              <Send size={14} style={{ marginRight: 6 }} /> Email Invoice
            </button>
          </>
        )}
      </div>

      {/* Split layout */}
      <div className="split">
        {/* Main column */}
        <div style={{ flex: 2, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Items table */}
          <div className="card">
            <div className="uppercase-label" style={{ marginBottom: 12 }}>Invoice Items</div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Unit Price</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.InvoiceItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td style={{ textAlign: "right" }}>{item.quantity}</td>
                    <td style={{ textAlign: "right" }} className="mono tabnum">{formatCurrency(Number(item.unitPrice))}</td>
                    <td style={{ textAlign: "right" }} className="mono tabnum">{formatCurrency(Number(item.total))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: "right", paddingTop: 8, color: "var(--ink-3)", fontSize: 12 }}>Subtotal</td>
                  <td style={{ textAlign: "right" }} className="mono tabnum">{formatCurrency(Number(invoice.subtotal))}</td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ textAlign: "right", color: "var(--ink-3)", fontSize: 12 }}>Tax ({Number(invoice.taxRate).toFixed(2)}%)</td>
                  <td style={{ textAlign: "right" }} className="mono tabnum">{formatCurrency(Number(invoice.taxAmount))}</td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ textAlign: "right", fontWeight: 600 }}>Total</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }} className="mono tabnum">{formatCurrency(Number(invoice.total))}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payments */}
          <div className="card">
            <div className="uppercase-label" style={{ marginBottom: 12 }}>Payments</div>
            {invoice.InvoicePayments.length > 0 ? (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.InvoicePayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.paymentDate)}</td>
                      <td>{payment.paymentMethod}</td>
                      <td style={{ textAlign: "right" }} className="mono tabnum">{formatCurrency(Number(payment.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "var(--ink-3)", fontSize: 13 }}>No payments recorded.</p>
            )}
          </div>

          {/* Add payment */}
          <div className="card">
            <div className="uppercase-label" style={{ marginBottom: 12 }}>Add Payment</div>
            <AddPaymentForm invoiceId={invoice.id} onPaymentAdded={() => utils.invoices.getById.invalidate(invoiceId)} />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 16 }}>

          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="uppercase-label">Invoice Details</div>
            <Meta label="Date Issued">{formatDate(invoice.dateIssued)}</Meta>
            <Meta label="Due Date">{formatDate(invoice.dateDue)}</Meta>
            {invoice.quickbooksId && <Meta label="QB ID"><span className="mono" style={{ fontSize: 12 }}>{invoice.quickbooksId}</span></Meta>}
          </div>

          {order && (
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="uppercase-label">Order</div>
              <Meta label="Company">{order.Office?.Company.name}</Meta>
              <Meta label="Order #" mono>#{order.orderNumber}</Meta>
              <Meta label="Status">{order.status}</Meta>
            </div>
          )}

          {shipping && (
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="uppercase-label">Shipping</div>
              <Meta label="Method">{shipping.shippingMethod}</Meta>
              {shipping.shippingMethod === ShippingMethod.Delivery && shipping.Address && (
                <Meta label="Address">
                  <span style={{ display: "block", lineHeight: 1.6 }}>
                    {shipping.Address.line1}<br />
                    {shipping.Address.line2 && <>{shipping.Address.line2}<br /></>}
                    {shipping.Address.city}, {shipping.Address.state} {shipping.Address.zipCode}
                  </span>
                </Meta>
              )}
              {(shipping.shippingMethod === ShippingMethod.Other || shipping.shippingMethod === ShippingMethod.Pickup) && shipping.shippingNotes && (
                <Meta label="Notes">{shipping.shippingNotes}</Meta>
              )}
            </div>
          )}

          {order?.contactPerson && (
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="uppercase-label">Contact</div>
              <Meta label="Name">{order.contactPerson.name}</Meta>
              {order.contactPerson.email && <Meta label="Email">{order.contactPerson.email}</Meta>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InvoiceDetailClient;
