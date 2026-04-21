export function RegMark({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      style={{ display: "inline-block", verticalAlign: "middle", color: "var(--ink-3)" }}
    >
      <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" strokeWidth="0.75" />
      <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}
