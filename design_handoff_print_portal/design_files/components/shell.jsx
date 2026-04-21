// App shell: sidebar + topbar
const Sidebar = ({ route, setRoute }) => {
  const groups = [
    {
      label: "Workspace",
      items: [
        { id: "dashboard",   label: "Dashboard",    icon: Icons.dashboard, badge: null },
        { id: "orders",      label: "Orders",       icon: Icons.orders,    badge: "142" },
        { id: "work-orders", label: "Work Orders",  icon: Icons.workOrders, badge: "24" },
      ],
    },
    {
      label: "Resources",
      items: [
        { id: "companies",   label: "Companies",    icon: Icons.companies },
        { id: "paper",       label: "Paper Catalog",icon: Icons.paper },
        { id: "typesetting", label: "Typesetting",  icon: Icons.typesetting },
        { id: "shipping",    label: "Shipping",     icon: Icons.shipping },
      ],
    },
    {
      label: "Admin",
      items: [
        { id: "reports",     label: "Reports",      icon: Icons.reports },
        { id: "settings",    label: "Settings",     icon: Icons.settings },
      ],
    },
  ];
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="mark">T</div>
        <div>
          <div className="name">Thomson</div>
          <div className="sub">Print Portal</div>
        </div>
      </div>

      {groups.map(g => (
        <div key={g.label} className="sb-group">
          <div className="sb-group-label">{g.label}</div>
          {g.items.map(it => (
            <button
              key={it.id}
              className={`sb-item ${route === it.id ? "active" : ""}`}
              onClick={() => setRoute(it.id)}
            >
              {it.icon}
              <span>{it.label}</span>
              {it.badge && <span className="badge mono tabnum">{it.badge}</span>}
            </button>
          ))}
        </div>
      ))}

      <div className="sb-user">
        <div className="avatar">JS</div>
        <div style={{lineHeight: 1.2, flex: 1, minWidth: 0}}>
          <div style={{fontSize: 12, color: "var(--paper)"}}>Jason Shultz</div>
          <div className="mono" style={{fontSize: 10, color: "oklch(60% 0.01 65)", letterSpacing: ".06em"}}>ADMIN</div>
        </div>
        <button className="btn ghost sm" style={{color: "oklch(70% 0.01 65)", padding: "0 6px"}}>{Icons.dotsV}</button>
      </div>
    </aside>
  );
};

const BREADCRUMBS = {
  "dashboard":   ["Workspace", "Dashboard"],
  "orders":      ["Workspace", "Orders"],
  "order-detail":["Workspace", "Orders", "24-0817"],
  "work-orders": ["Workspace", "Work Orders"],
  "create-wo":   ["Workspace", "Work Orders", "New"],
  "companies":   ["Resources", "Companies"],
  "paper":       ["Resources", "Paper Catalog"],
  "typesetting": ["Resources", "Typesetting"],
  "shipping":    ["Resources", "Shipping"],
  "reports":     ["Admin", "Reports"],
  "settings":    ["Admin", "Settings"],
};

const Topbar = ({ route }) => {
  const crumbs = BREADCRUMBS[route] || [route];
  return (
    <div className="topbar">
      <div className="breadcrumbs">
        <span>THOMSON</span>
        <span className="sep">/</span>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <span className={i === crumbs.length - 1 ? "cur" : ""}>{c}</span>
            {i < crumbs.length - 1 && <span className="sep">/</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="spacer"/>
      <label className="search-box">
        {Icons.search}
        <input placeholder="Search orders, companies, items…"/>
        <kbd>⌘K</kbd>
      </label>
      <button className="tb-btn">{Icons.plus}</button>
      <button className="tb-btn">{Icons.bell}<span className="dot"/></button>
    </div>
  );
};

Object.assign(window, { Sidebar, Topbar });
