import type { ReactNode } from "react";

interface MetaProps {
  label: string;
  mono?: boolean;
  children: ReactNode;
}

export function Meta({ label, mono, children }: MetaProps) {
  return (
    <div>
      <div className="uppercase-label" style={{ marginBottom: 3 }}>{label}</div>
      <div
        className={mono ? "mono tabnum" : undefined}
        style={{ fontSize: 13, color: "var(--ink)" }}
      >
        {children}
      </div>
    </div>
  );
}
