"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Icons } from "./Icons";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard",   label: "Dashboard",    icon: "dashboard" },
      { href: "/orders",      label: "Orders",       icon: "orders" },
      { href: "/workOrders",  label: "Work Orders",  icon: "workOrders" },
      { href: "/invoices",    label: "Invoices",     icon: "invoices" },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/companies",   label: "Companies",    icon: "companies" },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/users",       label: "Users",        icon: "users" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="mark">T</div>
        <div>
          <div className="name">Thomson</div>
          <div className="sub">Print Portal</div>
        </div>
      </div>

      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="sb-group">
          <div className="sb-group-label">{group.label}</div>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sb-item ${isActive(pathname, item.href) ? "active" : ""}`}
            >
              {Icons[item.icon]}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      ))}

      <div className="sb-user">
        <div className="avatar">{initials}</div>
        <div style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "var(--paper)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session?.user?.name ?? "User"}
          </div>
          <div className="mono" style={{ fontSize: 10, color: "oklch(60% 0.01 65)", letterSpacing: ".06em" }}>
            {(session?.user as any)?.Roles?.[0] ?? ""}
          </div>
        </div>
        <button className="btn ghost sm" style={{ color: "oklch(70% 0.01 65)", padding: "0 6px" }}>
          {Icons.dotsV}
        </button>
      </div>
    </aside>
  );
}
