// Dashboard — kanban + stats + items table
const Dashboard = () => {
  const [tab, setTab] = useState("orders");
  const stages = [
    { id: "pending",     label: "Pending",     count: 4 },
    { id: "typesetting", label: "Typesetting", count: 6 },
    { id: "proof",       label: "Proof Sent",  count: 3 },
    { id: "press",       label: "On Press",    count: 5 },
    { id: "bindery",     label: "Bindery / Ship", count: 4 },
  ];

  const byStage = (stageId) => orders.filter(o => {
    if (stageId === "pending") return o.status === "pending";
    if (stageId === "typesetting") return o.status === "typesetting";
    if (stageId === "proof") return o.status === "proof";
    if (stageId === "press") return o.status === "press";
    if (stageId === "bindery") return ["bindery","shipped"].includes(o.status);
    return false;
  });

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub"><RegMark /> &nbsp; <span style={{verticalAlign:"middle"}}>Production · Thu, Apr 20 · 09:41 CT</span></div>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div style={{display:"flex", gap: 8}}>
          <div className="seg">
            <button className="on">Today</button>
            <button>Week</button>
            <button>Month</button>
          </div>
          <button className="btn">{Icons.download} Export</button>
          <button className="btn primary">{Icons.plus} New Work Order</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label"><span className="uppercase-label">Open Orders</span><Bracket>LIVE</Bracket></div>
          <div className="stat-value">142</div>
          <div className="stat-delta">↑ 8 this week · 38 due ≤ 5d</div>
        </div>
        <div className="stat">
          <div className="stat-label"><span className="uppercase-label">On Press Now</span><CmykRow /></div>
          <div className="stat-value">7</div>
          <div className="progress-rail" style={{marginTop: 12}}>
            <span style={{flex: 3, background: "var(--cyan)"}}/>
            <span style={{flex: 2, background: "var(--magenta)"}}/>
            <span style={{flex: 1, background: "var(--yellow)"}}/>
            <span style={{flex: 1, background: "var(--key)"}}/>
          </div>
        </div>
        <div className="stat">
          <div className="stat-label"><span className="uppercase-label">Proofs Awaiting</span><span className="pill warn"><span className="dot"/>3 overdue</span></div>
          <div className="stat-value">11</div>
          <div className="stat-delta">Oldest: 4 days · Compass Health</div>
        </div>
        <div className="stat">
          <div className="stat-label"><span className="uppercase-label">Revenue, MTD</span><Bracket>APR</Bracket></div>
          <div className="stat-value">$284,120</div>
          <div className="stat-delta">72% to monthly target</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sec-head" style={{marginTop: 28}}>
        <div className="tabs" style={{margin: 0, flex: 1}}>
          <button className={`tab ${tab==="orders"?"active":""}`} onClick={() => setTab("orders")}>Orders<span className="count">142</span></button>
          <button className={`tab ${tab==="items"?"active":""}`} onClick={() => setTab("items")}>Order Items<span className="count">368</span></button>
          <button className={`tab ${tab==="outsourced"?"active":""}`} onClick={() => setTab("outsourced")}>Outsourced<span className="count">12</span></button>
        </div>
        <div style={{display:"flex", gap: 8}}>
          <button className="btn sm">{Icons.filter} Filter</button>
          <button className="btn sm">{Icons.sort} Sort</button>
        </div>
      </div>

      {tab === "orders" && (
        <div className="kanban">
          {stages.map(s => (
            <div key={s.id} className="k-col">
              <div className="k-col-head">
                <div style={{display:"flex", alignItems:"center", gap: 8}}>
                  <Pill status={s.id} dot={true}>{s.label}</Pill>
                </div>
                <span className="mono tabnum" style={{fontSize: 11, color:"var(--ink-3)"}}>{byStage(s.id).length}</span>
              </div>
              <div className="k-col-body">
                {byStage(s.id).slice(0, 4).map(o => (
                  <div key={o.id} className="k-card">
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 6}}>
                      <span className="mono tabnum" style={{fontSize: 11, color:"var(--ink-3)"}}>{o.id}</span>
                      <span className="mono" style={{fontSize: 10, color:"var(--ink-4)"}}>{Icons.drag}</span>
                    </div>
                    <div style={{fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 2, lineHeight: 1.3}}>{o.company}</div>
                    <div style={{fontSize: 12, color: "var(--ink-3)", marginBottom: 10}}>{o.desc}</div>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)"}}>
                      <span>{o.qty.toLocaleString()} QTY</span>
                      <span>DUE {o.due}</span>
                    </div>
                  </div>
                ))}
                <button className="btn ghost sm" style={{justifyContent:"center", color: "var(--ink-3)"}}>+ View all {byStage(s.id).length}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "items" && <ItemsTable rows={orderItems} />}
      {tab === "outsourced" && <ItemsTable rows={orderItems.filter(i => i.outsourced)} />}
    </>
  );
};

const ItemsTable = ({ rows }) => (
  <div className="card" style={{overflow:"hidden"}}>
    <table className="tbl">
      <thead>
        <tr>
          <th style={{width: 96}}>Item</th>
          <th>Description</th>
          <th>Company</th>
          <th>Order</th>
          <th style={{textAlign:"right"}}>Qty</th>
          <th>Paper</th>
          <th>Stage</th>
          <th>Assigned</th>
          <th style={{textAlign:"right"}}>Due</th>
          <th style={{width: 40}}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td><span className="mono tabnum" style={{color:"var(--ink-3)"}}>{r.id}</span></td>
            <td style={{color:"var(--ink)", fontWeight: 500}}>{r.desc}</td>
            <td>{r.company}</td>
            <td><span className="mono tabnum" style={{color:"var(--press)"}}>{r.order}</span></td>
            <td className="mono tabnum" style={{textAlign:"right"}}>{r.qty.toLocaleString()}</td>
            <td style={{color:"var(--ink-3)", fontSize: 12}}>{r.paper}</td>
            <td><Pill label={r.stage} tone={r.stage === "Shipped" ? "ok" : r.stage === "On Press" ? "press" : "info"} /></td>
            <td style={{color:"var(--ink-3)"}}>{r.assigned}</td>
            <td className="mono tabnum" style={{textAlign:"right"}}>{r.due}</td>
            <td><button className="btn ghost sm" style={{padding:"0 6px"}}>{Icons.dotsV}</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

Object.assign(window, { Dashboard, ItemsTable });
