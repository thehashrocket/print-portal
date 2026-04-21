import React from "react";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { CmykRow } from "~/app/_components/primitives/CmykRow";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <div className="auth-root">
      {/* Hero column */}
      <div className="auth-hero">
        <div>
          <div style={{
            fontSize: 13, fontFamily: "var(--font-jetbrains)",
            letterSpacing: "0.12em", textTransform: "uppercase",
            opacity: 0.5, marginBottom: 32,
          }}>
            Thomson Print Portal
          </div>
          <h1 style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "clamp(48px, 6vw, 80px)",
            fontWeight: 300, lineHeight: 1.05, margin: 0,
          }}>
            The Press<br />
            <em style={{ fontStyle: "italic" }}>Room</em>
          </h1>
          <p style={{
            marginTop: 24, opacity: 0.55, fontSize: 15,
            lineHeight: 1.6, maxWidth: 340,
          }}>
            Production management for print professionals. Track jobs from estimate to delivery.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 24, fontSize: 13, opacity: 0.5 }}>
            <span>Orders</span>
            <span>Estimates</span>
            <span>Invoices</span>
            <span>Companies</span>
          </div>
          <CmykRow />
          <span style={{
            fontSize: 11, opacity: 0.35,
            fontFamily: "var(--font-jetbrains)", letterSpacing: "0.08em",
          }}>
            THOMSON PRINT · PRODUCTION SYSTEM
          </span>
        </div>
      </div>

      {/* CTA column */}
      <div className="auth-form-col">
        <div className="auth-form">
          {session ? (
            <>
              <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: 28, fontWeight: 400, marginBottom: 8 }}>
                Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}.
              </h2>
              <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 32 }}>
                You&apos;re signed in and ready to go.
              </p>
              <Link href="/dashboard" className="btn primary" style={{ display: "block", textAlign: "center", width: "100%" }}>
                Go to Dashboard
              </Link>
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <Link href="/orders" style={{ fontSize: 13, color: "var(--ink-3)" }}>View Orders</Link>
                <span style={{ margin: "0 8px", color: "var(--ink-3)" }}>·</span>
                <Link href="/workOrders" style={{ fontSize: 13, color: "var(--ink-3)" }}>Estimates</Link>
                <span style={{ margin: "0 8px", color: "var(--ink-3)" }}>·</span>
                <Link href="/companies" style={{ fontSize: 13, color: "var(--ink-3)" }}>Companies</Link>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: 28, fontWeight: 400, marginBottom: 8 }}>
                Sign in to continue.
              </h2>
              <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 32 }}>
                Access the production dashboard, orders, and estimates.
              </p>
              <Link href="/auth/signin" className="btn primary" style={{ display: "block", textAlign: "center", width: "100%" }}>
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
