"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./Icons";

interface Crumb {
  label: string;
  href?: string;
}

// Each entry: [{ section label, section root href }, { page label, page href }]
const SECTION_MAP: Record<string, Crumb[]> = {
  "/dashboard":  [{ label: "Workspace", href: "/dashboard" },  { label: "Dashboard",   href: "/dashboard" }],
  "/orders":     [{ label: "Workspace", href: "/dashboard" },  { label: "Orders",      href: "/orders" }],
  "/workOrders": [{ label: "Workspace", href: "/dashboard" },  { label: "Work Orders", href: "/workOrders" }],
  "/invoices":   [{ label: "Finance",   href: "/dashboard" },  { label: "Invoices",    href: "/invoices" }],
  "/companies":  [{ label: "Resources", href: "/dashboard" },  { label: "Companies",   href: "/companies" }],
  "/users":      [{ label: "Admin",     href: "/dashboard" },  { label: "Users",       href: "/users" }],
};

const SLUG_LABELS: Record<string, string> = {
  create: "Create",
  edit: "Edit",
  workOrderItem: "Item",
  print: "Print",
};

function getBreadcrumbs(pathname: string): Crumb[] {
  if (SECTION_MAP[pathname]) return SECTION_MAP[pathname]!;

  const key = Object.keys(SECTION_MAP)
    .filter((k) => pathname.startsWith(k + "/"))
    .sort((a, b) => b.length - a.length)[0];

  if (key) {
    const base = SECTION_MAP[key]!;
    const tail = pathname.slice(key.length).replace(/^\//, "").split("/").filter(Boolean);
    const tailCrumbs: Crumb[] = tail.map((seg) => ({
      label: SLUG_LABELS[seg] ?? (seg.length > 20 ? "Detail" : seg),
    }));
    return [...base, ...tailCrumbs];
  }

  return [{ label: pathname.replace(/^\//, "") }];
}

export function Topbar() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <div className="topbar">
      <div className="breadcrumbs">
        <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>THOMSON</Link>
        <span className="sep">/</span>
        {crumbs.map((crumb, i) => (
          <span key={i}>
            {crumb.href && i < crumbs.length - 1 ? (
              <Link href={crumb.href} style={{ color: "inherit", textDecoration: "none" }}>
                {crumb.label}
              </Link>
            ) : (
              <span className={i === crumbs.length - 1 ? "cur" : ""}>{crumb.label}</span>
            )}
            {i < crumbs.length - 1 && <span className="sep"> / </span>}
          </span>
        ))}
      </div>

      <div className="spacer" />

      <label className="search-box">
        {Icons.search}
        <input placeholder="Search orders, companies, items…" />
        <kbd>⌘K</kbd>
      </label>

      <button className="tb-btn" aria-label="New">
        {Icons.plus}
      </button>
      <button className="tb-btn" aria-label="Notifications">
        {Icons.bell}
        <span className="dot" />
      </button>
    </div>
  );
}
