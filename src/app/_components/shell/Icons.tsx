import type { ReactNode } from "react";

export const Icons: Record<string, ReactNode> = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="6" height="8" />
      <rect x="11" y="3" width="6" height="4" />
      <rect x="11" y="9" width="6" height="8" />
      <rect x="3" y="13" width="6" height="4" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 3h9l3 3v11H4z" />
      <path d="M13 3v3h3" />
      <path d="M7 10h6M7 13h6M7 7h3" />
    </svg>
  ),
  workOrders: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5h14v10H3z" />
      <path d="M3 9h14" />
      <path d="M6 5V3M14 5V3" />
    </svg>
  ),
  companies: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 17V5l6-2v14" />
      <path d="M10 9h6v8h-6" />
      <path d="M6 7v1M6 10v1M6 13v1M12 12v1M12 15v1" />
    </svg>
  ),
  paper: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 2h7l4 4v12H5z" />
      <path d="M12 2v4h4" />
    </svg>
  ),
  typesetting: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 4h10M10 4v12M7 16h6" />
    </svg>
  ),
  shipping: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 5h10v8H2z" />
      <path d="M12 8h4l2 2v3h-6" />
      <circle cx="6" cy="15" r="1.5" />
      <circle cx="15" cy="15" r="1.5" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 17h14" />
      <path d="M5 14v-4M9 14V6M13 14v-7M17 14v-3" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5 5l1.5 1.5M13.5 13.5L15 15M5 15l1.5-1.5M13.5 6.5L15 5" />
    </svg>
  ),
  invoices: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 2h10v16l-2.5-1.5L10 18l-2.5-1.5L5 18z" />
      <path d="M8 7h4M8 10h4M8 13h3" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="7" r="3" />
      <path d="M3 17c0-3 2-5 5-5s5 2 5 5" />
      <circle cx="14" cy="6" r="2" />
      <path d="M13 12h1c2 0 3 1 3 3" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="5" />
      <path d="M13 13l4 4" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 4v12M4 10h12" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 14V9a5 5 0 0110 0v5" />
      <path d="M3 14h14M8 17h4" />
    </svg>
  ),
  dotsV: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="5" r="1.2" />
      <circle cx="10" cy="10" r="1.2" />
      <circle cx="10" cy="15" r="1.2" />
    </svg>
  ),
  chevronD: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 8l5 5 5-5" />
    </svg>
  ),
};
