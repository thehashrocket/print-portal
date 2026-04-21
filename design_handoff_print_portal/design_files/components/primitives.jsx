// Shared primitives: icons, status pills, small helpers
const Icons = {
  dashboard: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="6" height="8"/><rect x="11" y="3" width="6" height="4"/><rect x="11" y="9" width="6" height="8"/><rect x="3" y="13" width="6" height="4"/></svg>,
  orders: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 3h9l3 3v11H4z"/><path d="M13 3v3h3"/><path d="M7 10h6M7 13h6M7 7h3"/></svg>,
  workOrders: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5h14v10H3z"/><path d="M3 9h14"/><path d="M6 5V3M14 5V3"/></svg>,
  companies: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 17V5l6-2v14"/><path d="M10 9h6v8h-6"/><path d="M6 7v1M6 10v1M6 13v1M12 12v1M12 15v1"/></svg>,
  paper: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2h7l4 4v12H5z"/><path d="M12 2v4h4"/></svg>,
  typesetting: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4h10M10 4v12M7 16h6"/></svg>,
  shipping: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 5h10v8H2z"/><path d="M12 8h4l2 2v3h-6"/><circle cx="6" cy="15" r="1.5"/><circle cx="15" cy="15" r="1.5"/></svg>,
  reports: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 17h14"/><path d="M5 14v-4M9 14V6M13 14v-7M17 14v-3"/></svg>,
  settings: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="2.5"/><path d="M10 3v2M10 15v2M3 10h2M15 10h2M5 5l1.5 1.5M13.5 13.5L15 15M5 15l1.5-1.5M13.5 6.5L15 5"/></svg>,
  search: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="9" r="5"/><path d="M13 13l4 4"/></svg>,
  plus: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 4v12M4 10h12"/></svg>,
  bell: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 14V9a5 5 0 0110 0v5"/><path d="M3 14h14M8 17h4"/></svg>,
  download: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3v10M6 9l4 4 4-4M4 17h12"/></svg>,
  upload: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 14V4M6 8l4-4 4 4M4 17h12"/></svg>,
  print: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h8v4H6z"/><path d="M4 7h12v7h-2M6 14v3h8v-3"/><circle cx="13" cy="10" r=".5" fill="currentColor"/></svg>,
  filter: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5h14l-5 7v4l-4 1v-5z"/></svg>,
  sort: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 4v12M6 16l-2-2M6 16l2-2M14 16V4M14 4l-2 2M14 4l2 2"/></svg>,
  calendar: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="14" height="12"/><path d="M3 9h14M7 3v4M13 3v4"/></svg>,
  users: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="7" r="3"/><path d="M3 17c0-3 2-5 5-5s5 2 5 5"/><circle cx="14" cy="6" r="2"/><path d="M13 12h1c2 0 3 1 3 3"/></svg>,
  dotsV: <svg viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="5" r="1.2"/><circle cx="10" cy="10" r="1.2"/><circle cx="10" cy="15" r="1.2"/></svg>,
  chevronL: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5l-5 5 5 5"/></svg>,
  chevronR: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 5l5 5-5 5"/></svg>,
  chevronD: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8l5 5 5-5"/></svg>,
  arrowR: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 10h12M12 6l4 4-4 4"/></svg>,
  check: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M4 10l4 4 8-8"/></svg>,
  x: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 5l10 10M15 5L5 15"/></svg>,
  eye: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/><circle cx="10" cy="10" r="2"/></svg>,
  truck: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 5h10v8H2z"/><path d="M12 8h4l2 2v3h-6"/><circle cx="6" cy="15" r="1.5"/><circle cx="15" cy="15" r="1.5"/></svg>,
  invoice: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2h10v16l-2.5-1.5L10 18l-2.5-1.5L5 18z"/><path d="M8 7h4M8 10h4M8 13h3"/></svg>,
  lock: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="9" width="12" height="8"/><path d="M7 9V6a3 3 0 016 0v3"/></svg>,
  drag: <svg viewBox="0 0 20 20" fill="currentColor"><circle cx="8" cy="5" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="10" r="1"/><circle cx="8" cy="15" r="1"/><circle cx="12" cy="15" r="1"/></svg>,
};

// Crosshair / registration mark — signature decoration
const RegMark = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" style={{display:"inline-block", verticalAlign:"middle"}}>
    <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="0.75"/>
    <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" strokeWidth="0.75"/>
    <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="0.75"/>
  </svg>
);

// CMYK color row — tiny data viz decoration
const CmykRow = () => (
  <div style={{display:"flex", gap: 2}}>
    <span style={{width: 6, height: 6, background: "var(--cyan)"}}/>
    <span style={{width: 6, height: 6, background: "var(--magenta)"}}/>
    <span style={{width: 6, height: 6, background: "var(--yellow)"}}/>
    <span style={{width: 6, height: 6, background: "var(--key)"}}/>
  </div>
);

// Bracketed mono tag
const Bracket = ({ children, color = "var(--ink-3)" }) => (
  <span className="mono" style={{fontSize: 10, color, letterSpacing: ".08em", textTransform: "uppercase"}}>
    [ {children} ]
  </span>
);

// Status mapping — keyed to production stages
const STATUS_MAP = {
  pending:      { label: "Pending",      tone: "" },
  approved:     { label: "Approved",     tone: "ok" },
  typesetting:  { label: "Typesetting",  tone: "info" },
  proof:        { label: "Proof Sent",   tone: "warn" },
  press:        { label: "On Press",     tone: "press" },
  bindery:      { label: "Bindery",      tone: "press" },
  shipped:      { label: "Shipped",      tone: "ok" },
  invoiced:     { label: "Invoiced",     tone: "ok" },
  cancelled:    { label: "Cancelled",    tone: "danger" },
};

const Pill = ({ status, label, tone, dot = false }) => {
  const m = status ? STATUS_MAP[status] : null;
  const _label = label || (m && m.label) || status;
  const _tone  = tone !== undefined ? tone : (m && m.tone) || "";
  return (
    <span className={`pill ${_tone}`}>
      {dot && <span className="dot"/>}
      {_label}
    </span>
  );
};

const Meta = ({ label, children, mono }) => (
  <div>
    <div className="uppercase-label" style={{marginBottom: 3}}>{label}</div>
    <div className={mono ? "mono tabnum" : ""} style={{fontSize: 13, color: "var(--ink)"}}>{children}</div>
  </div>
);

Object.assign(window, { Icons, RegMark, CmykRow, Bracket, Pill, Meta, STATUS_MAP });
