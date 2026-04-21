type Tone = "ok" | "warn" | "info" | "press" | "danger" | "";

const STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  // Prisma OrderItemStatus (PascalCase)
  Pending:    { label: "Pending",     tone: "" },
  Prepress:   { label: "Prepress",    tone: "info" },
  Press:      { label: "On Press",    tone: "press" },
  Bindery:    { label: "Bindery",     tone: "press" },
  Shipping:   { label: "Shipping",    tone: "ok" },
  Invoiced:   { label: "Invoiced",    tone: "ok" },
  Completed:  { label: "Completed",   tone: "ok" },
  Cancelled:  { label: "Cancelled",   tone: "danger" },
  Hold:       { label: "On Hold",     tone: "warn" },
  Outsourced: { label: "Outsourced",  tone: "info" },
  // Prisma OrderStatus
  PaymentReceived: { label: "Paid",   tone: "ok" },
  // Prisma InvoiceStatus
  Draft:    { label: "Draft",     tone: "" },
  Sent:     { label: "Sent",      tone: "info" },
  Paid:     { label: "Paid",      tone: "ok" },
  Overdue:  { label: "Overdue",   tone: "danger" },
};

interface PillProps {
  status?: string;
  label?: string;
  tone?: Tone;
  dot?: boolean;
}

export function Pill({ status, label, tone, dot = false }: PillProps) {
  const mapped = status ? STATUS_MAP[status] : null;
  const resolvedLabel = label ?? mapped?.label ?? status ?? "";
  const resolvedTone = tone !== undefined ? tone : (mapped?.tone ?? "");

  return (
    <span className={`pill ${resolvedTone}`}>
      {dot && <span className="dot" />}
      {resolvedLabel}
    </span>
  );
}

export { STATUS_MAP };
