"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { CmykRow } from "~/app/_components/primitives/CmykRow";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [mode, setMode] = useState<"credentials" | "magic">("credentials");

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push(callbackUrl);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await signIn("email", { email, redirect: false, callbackUrl });
    setLoading(false);
    setMagicSent(true);
  };

  const handleGoogle = () => {
    void signIn("google", { callbackUrl });
  };

  return (
    <div className="auth-root">
      {/* Hero column */}
      <div className="auth-hero">
        <div>
          <div style={{ fontSize: 13, fontFamily: "var(--font-jetbrains)", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginBottom: 32 }}>
            Thomson Print Portal
          </div>
          <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 300, lineHeight: 1.05, margin: 0 }}>
            The Press<br />
            <em style={{ fontStyle: "italic" }}>Room</em>
          </h1>
          <p style={{ marginTop: 24, opacity: 0.55, fontSize: 15, lineHeight: 1.6, maxWidth: 340 }}>
            Production management for print professionals. Track jobs from estimate to delivery.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CmykRow />
          <span style={{ fontSize: 11, opacity: 0.35, fontFamily: "var(--font-jetbrains)", letterSpacing: "0.08em" }}>
            THOMSON PRINT · PRODUCTION SYSTEM
          </span>
        </div>
      </div>

      {/* Form column */}
      <div className="auth-form-col">
        <div className="auth-form">
          <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: 28, fontWeight: 400, marginBottom: 6 }}>
            Sign in
          </h2>
          <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 32 }}>
            Welcome back. Enter your credentials to continue.
          </p>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 0, marginBottom: 24, border: "1px solid var(--rule)", borderRadius: 6, overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setMode("credentials")}
              style={{
                flex: 1, padding: "8px 0", fontSize: 12, fontFamily: "var(--font-jetbrains)",
                letterSpacing: "0.06em", textTransform: "uppercase", border: "none", cursor: "pointer",
                background: mode === "credentials" ? "var(--ink)" : "transparent",
                color: mode === "credentials" ? "var(--paper)" : "var(--ink-3)",
              }}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode("magic")}
              style={{
                flex: 1, padding: "8px 0", fontSize: 12, fontFamily: "var(--font-jetbrains)",
                letterSpacing: "0.06em", textTransform: "uppercase", border: "none", cursor: "pointer",
                background: mode === "magic" ? "var(--ink)" : "transparent",
                color: mode === "magic" ? "var(--paper)" : "var(--ink-3)",
              }}
            >
              Magic Link
            </button>
          </div>

          {magicSent ? (
            <div style={{ padding: 20, background: "oklch(96% 0.03 145)", borderRadius: 8, fontSize: 14, color: "var(--ink)", textAlign: "center" }}>
              Check your email — a sign-in link is on its way.
            </div>
          ) : (
            <form onSubmit={mode === "credentials" ? handleCredentials : handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-jetbrains)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  style={{ width: "100%" }}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              {mode === "credentials" && (
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-jetbrains)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 6 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              )}

              {error && (
                <p style={{ fontSize: 13, color: "var(--danger)", margin: 0 }}>{error}</p>
              )}

              <button type="submit" className="btn primary" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? "Signing in…" : mode === "credentials" ? "Sign in" : "Send magic link"}
              </button>
            </form>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
            <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-jetbrains)", textTransform: "uppercase", letterSpacing: "0.06em" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="btn"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
