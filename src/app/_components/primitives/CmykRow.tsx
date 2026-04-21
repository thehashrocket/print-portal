export function CmykRow() {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      <span style={{ width: 6, height: 6, background: "var(--cyan)", display: "block" }} />
      <span style={{ width: 6, height: 6, background: "var(--magenta)", display: "block" }} />
      <span style={{ width: 6, height: 6, background: "var(--yellow)", display: "block" }} />
      <span style={{ width: 6, height: 6, background: "var(--key)", display: "block" }} />
    </div>
  );
}
