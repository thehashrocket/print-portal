// Orders list, Work Orders list, Order detail, Create Work Order, Login
const OrdersList = () => {
  const [f, setF] = useState("all");
  const filters = [
    { id: "all", label: "All", n: 142 },
    { id: "press", label: "In Production", n: 42 },
    { id: "proof", label: "Awaiting Proof", n: 11 },
    { id: "ship", label: "Ready to Ship", n: 7 },
    { id: "invoiced", label: "Invoiced", n: 64 },
    { id: "overdue", label: "Overdue", n: 3 },
  ];
  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">Accounts · Orders</div>
          <h1 className="page-title">Orders</h1>
        </div>
        <div style={{display:"flex", gap: 8}}>
          <button className="btn">{Icons.download} Export CSV</button>
          <button className="btn primary">{Icons.plus} New Order</button>
        </div>
      </div>

      <div className="tabs">
        {filters.map(x => (
          <button key={x.id} className={`tab ${f===x.id?"active":""}`} onClick={() => setF(x.id)}>
            {x.label}<span className="count">{x.n}</span>
          </button>
        ))}
      </div>

      <div style={{display:"flex", gap: 8, marginBottom: 14, flexWrap:"wrap"}}>
        <label className="search-box" style={{flex: 1, minWidth: 240, maxWidth: 420}}>
          {Icons.search}
          <input placeholder="Search order #, PO, company…"/>
        </label>
        <button className="btn sm">{Icons.filter} Stage</button>
        <button className="btn sm">{Icons.calendar} Date range</button>
        <button className="btn sm">{Icons.users} Rep</button>
        <button className="btn sm">{Icons.sort} Sort: Due date</button>
      </div>

      <div className="card" style={{overflow:"hidden"}}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width: 40}}><input type="checkbox"/></th>
              <th>Order</th>
              <th>PO #</th>
              <th>Company</th>
              <th>Description</th>
              <th style={{textAlign:"right"}}>Items</th>
              <th style={{textAlign:"right"}}>Qty</th>
              <th>Stage</th>
              <th>Rep</th>
              <th style={{textAlign:"right"}}>Due</th>
              <th style={{textAlign:"right"}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td><input type="checkbox" onClick={e => e.stopPropagation()}/></td>
                <td><span className="mono tabnum" style={{color:"var(--press)", fontWeight: 500}}>{o.id}</span></td>
                <td className="mono" style={{color:"var(--ink-3)"}}>{o.po}</td>
                <td style={{color:"var(--ink)", fontWeight: 500}}>{o.company}</td>
                <td style={{color:"var(--ink-3)"}}>{o.desc}</td>
                <td className="mono tabnum" style={{textAlign:"right", color:"var(--ink-2)"}}>{o.items}</td>
                <td className="mono tabnum" style={{textAlign:"right", color:"var(--ink-2)"}}>{o.qty.toLocaleString()}</td>
                <td><Pill status={o.status}/></td>
                <td style={{color:"var(--ink-3)"}}>{o.rep}</td>
                <td className="mono tabnum" style={{textAlign:"right"}}>{o.due}</td>
                <td className="mono tabnum" style={{textAlign:"right", color:"var(--ink)", fontWeight: 500}}>${o.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{display:"flex", justifyContent:"space-between", marginTop: 14, alignItems:"center"}}>
        <span className="uppercase-label">Showing 1–14 of 142</span>
        <div style={{display:"flex", gap: 6}}>
          <button className="btn sm">{Icons.chevronL}</button>
          <button className="btn sm">{Icons.chevronR}</button>
        </div>
      </div>
    </>
  );
};

const WorkOrdersList = () => (
  <>
    <div className="page-head">
      <div>
        <div className="page-sub">Work · Estimates &amp; Quotes</div>
        <h1 className="page-title">Work Orders</h1>
      </div>
      <div style={{display:"flex", gap: 8}}>
        <button className="btn">{Icons.upload} Import</button>
        <button className="btn primary">{Icons.plus} New Work Order</button>
      </div>
    </div>

    <div className="tabs">
      <button className="tab active">Draft<span className="count">8</span></button>
      <button className="tab">Pending<span className="count">14</span></button>
      <button className="tab">Approved<span className="count">16</span></button>
      <button className="tab">Converted<span className="count">104</span></button>
      <button className="tab">Rejected<span className="count">3</span></button>
    </div>

    <div className="card" style={{overflow:"hidden"}}>
      <table className="tbl">
        <thead>
          <tr>
            <th>WO #</th>
            <th>Company</th>
            <th>Description</th>
            <th style={{textAlign:"right"}}>Est. Qty</th>
            <th>Stage</th>
            <th>Created</th>
            <th>Rep</th>
            <th style={{textAlign:"right"}}>Estimate</th>
            <th style={{width: 40}}></th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 10).map((o, i) => (
            <tr key={o.id}>
              <td><span className="mono tabnum" style={{color:"var(--press)"}}>WO-{4100 + i}</span></td>
              <td style={{fontWeight: 500}}>{o.company}</td>
              <td style={{color:"var(--ink-3)"}}>{o.desc}</td>
              <td className="mono tabnum" style={{textAlign:"right"}}>{o.qty.toLocaleString()}</td>
              <td>{i < 3 ? <Pill label="Draft" tone=""/> : i < 6 ? <Pill status="pending"/> : <Pill status="approved"/>}</td>
              <td className="mono" style={{color:"var(--ink-3)", fontSize: 12}}>Apr {10 + i}, 2026</td>
              <td style={{color:"var(--ink-3)"}}>{o.rep}</td>
              <td className="mono tabnum" style={{textAlign:"right", fontWeight: 500}}>${o.amount.toLocaleString()}</td>
              <td><button className="btn ghost sm" style={{padding:"0 6px"}}>{Icons.dotsV}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

// ————————————————————————————
// Order detail
// ————————————————————————————
const OrderDetail = () => {
  const [tab, setTab] = useState("items");
  return (
    <>
      <div className="page-head" style={{alignItems:"flex-start", borderBottom: 0, paddingBottom: 0, marginBottom: 16}}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display:"flex", alignItems:"center", gap: 10, marginBottom: 8}}>
            <span className="mono tabnum" style={{fontSize: 12, color:"var(--ink-3)"}}>ORDER</span>
            <span className="mono tabnum" style={{fontSize: 22, color:"var(--ink)", letterSpacing:"-.01em"}}>24-0817</span>
            <Pill status="press" />
            <span className="mono" style={{fontSize: 11, color:"var(--ink-3)"}}>PO-10283</span>
          </div>
          <h1 className="page-title" style={{fontSize: 28}}>Compass Health · Q2 Patient Intake Packet</h1>
        </div>
        <div style={{display:"flex", gap: 8}}>
          <button className="btn">{Icons.print} Print</button>
          <button className="btn">{Icons.download} PDF</button>
          <button className="btn">{Icons.invoice} Generate Invoice</button>
          <button className="btn primary">{Icons.arrowR} Advance Stage</button>
        </div>
      </div>

      {/* Progress rail */}
      <div className="card" style={{padding: 20, marginBottom: 20}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom: 14}}>
          <span className="uppercase-label">Production Timeline</span>
          <span className="mono" style={{fontSize: 11, color:"var(--ink-3)"}}>6 OF 9 STAGES · EST. DELIVERY APR 24</span>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(9, 1fr)", gap: 2}}>
          {["Quoted","Approved","Typeset","Proof 1","Proof 2","Press","Bindery","Ship","Invoice"].map((s, i) => (
            <div key={s} style={{textAlign:"center"}}>
              <div style={{
                height: 4,
                background: i <= 5 ? "var(--press)" : i === 6 ? "color-mix(in oklch, var(--press) 50%, var(--paper-3))" : "var(--paper-3)",
                marginBottom: 8
              }}/>
              <div className="mono" style={{fontSize: 10, color: i <= 5 ? "var(--ink)" : "var(--ink-4)", textTransform:"uppercase", letterSpacing:".06em"}}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="split">
        <div>
          <div className="tabs">
            {[["items","Items",4],["proofs","Proofs",3],["stock","Stock",5],["shipping","Shipping",2],["notes","Notes",8],["payments","Payments",1]].map(([id,l,n]) => (
              <button key={id} className={`tab ${tab===id?"active":""}`} onClick={() => setTab(id)}>{l}<span className="count">{n}</span></button>
            ))}
          </div>

          {tab === "items" && (
            <div className="card" style={{overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Item</th><th>Description</th><th style={{textAlign:"right"}}>Qty</th><th>Paper</th><th>Stage</th><th style={{textAlign:"right"}}>Amount</th></tr></thead>
                <tbody>
                  {[
                    { id: "IT-4201", desc: "Intake form, 2-part NCR", qty: 2500, paper: "NCR 2-part White/Canary", stage: "On Press", amt: 1240 },
                    { id: "IT-4202", desc: "Consent booklet, 8pp saddle-stitch", qty: 1000, paper: "80# Matte Text", stage: "Bindery", amt: 2480 },
                    { id: "IT-4203", desc: "Welcome card, 4×6 4/4", qty: 5000, paper: "14pt C2S", stage: "On Press", amt: 890 },
                    { id: "IT-4204", desc: "Folder, pocket 9×12 4/0", qty: 500, paper: "12pt C1S", stage: "Typesetting", amt: 1850 },
                  ].map(r => (
                    <tr key={r.id}>
                      <td><span className="mono tabnum" style={{color:"var(--ink-3)"}}>{r.id}</span></td>
                      <td style={{fontWeight: 500}}>{r.desc}</td>
                      <td className="mono tabnum" style={{textAlign:"right"}}>{r.qty.toLocaleString()}</td>
                      <td style={{color:"var(--ink-3)", fontSize: 12}}>{r.paper}</td>
                      <td><Pill label={r.stage} tone={r.stage==="On Press"?"press":r.stage==="Bindery"?"press":"info"}/></td>
                      <td className="mono tabnum" style={{textAlign:"right", fontWeight: 500}}>${r.amt.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "proofs" && (
            <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap: 12}}>
              {[
                { n: 1, method: "Digital PDF", date: "Apr 16", status: "approved" },
                { n: 2, method: "Hard Copy", date: "Apr 18", status: "approved" },
                { n: 3, method: "Digital PDF", date: "Apr 19", status: "pending" },
              ].map(p => (
                <div key={p.n} className="card" style={{padding: 16}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom: 10}}>
                    <span className="mono" style={{fontSize: 11, color:"var(--ink-3)"}}>PROOF / {String(p.n).padStart(2, "0")}</span>
                    <Pill status={p.status === "approved" ? "approved" : "pending"} label={p.status === "approved" ? "Approved" : "Awaiting"} tone={p.status === "approved" ? "ok" : "warn"}/>
                  </div>
                  <div style={{fontFamily:"var(--font-display)", fontSize: 20, marginBottom: 6}}>{p.method}</div>
                  <div className="mono" style={{fontSize: 11, color:"var(--ink-3)"}}>SENT {p.date} · REVIEWER: A. KELLEHER</div>
                  <div style={{display:"flex", gap: 6, marginTop: 12}}>
                    <button className="btn sm">{Icons.eye} View</button>
                    <button className="btn sm">{Icons.download} Download</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab !== "items" && tab !== "proofs" && (
            <div className="card" style={{padding: 60, textAlign:"center", color:"var(--ink-3)"}}>
              <div style={{display:"inline-block", marginBottom: 12}}><RegMark size={20}/></div>
              <div className="mono uppercase-label">{tab} panel</div>
              <div style={{marginTop: 6, fontSize: 13}}>Content for this tab renders here.</div>
            </div>
          )}
        </div>

        {/* Sidebar meta */}
        <aside style={{display:"flex", flexDirection:"column", gap: 16}}>
          <div className="card" style={{padding: 16}}>
            <div className="uppercase-label" style={{marginBottom: 12}}>Customer</div>
            <div style={{fontSize: 15, fontWeight: 500, marginBottom: 2}}>Compass Health</div>
            <div style={{fontSize: 12, color:"var(--ink-3)"}}>Springfield Office · 4401 N Kansas Ave</div>
            <div style={{marginTop: 10, paddingTop: 12, borderTop: "1px solid var(--rule)", display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12}}>
              <Meta label="Contact">A. Kelleher</Meta>
              <Meta label="Phone" mono>417-555-0134</Meta>
            </div>
          </div>

          <div className="card" style={{padding: 16}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom: 12}}>
              <span className="uppercase-label">Financials</span>
              <Bracket color="var(--press)">QB SYNCED</Bracket>
            </div>
            <div style={{display:"grid", gap: 10}}>
              {[["Subtotal","$6,240.00"],["Tax (8.225%)","$513.24"],["Shipping","$128.00"],["Deposit","−$2,000.00"]].map(([k,v]) => (
                <div key={k} style={{display:"flex", justifyContent:"space-between", fontSize: 13}}>
                  <span style={{color:"var(--ink-3)"}}>{k}</span>
                  <span className="mono tabnum">{v}</span>
                </div>
              ))}
              <div style={{display:"flex", justifyContent:"space-between", paddingTop: 10, borderTop: "1px solid var(--rule)", alignItems:"baseline"}}>
                <span className="uppercase-label">Balance Due</span>
                <span className="mono tabnum" style={{fontSize: 20, fontWeight: 600}}>$4,881.24</span>
              </div>
            </div>
          </div>

          <div className="card" style={{padding: 16}}>
            <div className="uppercase-label" style={{marginBottom: 12}}>Shipping</div>
            <div style={{display:"flex", alignItems:"center", gap: 10, marginBottom: 8}}>
              {Icons.truck}
              <span style={{fontSize: 13, fontWeight: 500}}>FedEx Ground</span>
              <Pill status="shipped" label="In Transit" tone="ok"/>
            </div>
            <div className="mono" style={{fontSize: 11, color:"var(--ink-3)"}}>TRK 7849 2201 0032 · ETA APR 24</div>
          </div>

          <div className="card" style={{padding: 16}}>
            <div className="uppercase-label" style={{marginBottom: 12}}>Activity</div>
            <div style={{display:"flex", flexDirection:"column", gap: 10}}>
              {[
                ["09:12", "Press started · Run #2"],
                ["Yesterday", "Proof #3 sent"],
                ["Apr 18", "Proof #2 approved"],
                ["Apr 16", "Proof #1 approved"],
                ["Apr 14", "Converted from WO-4102"],
              ].map(([t, txt], i) => (
                <div key={i} style={{display:"flex", gap: 10, fontSize: 12}}>
                  <span className="mono" style={{color:"var(--ink-4)", minWidth: 64}}>{t}</span>
                  <span style={{color:"var(--ink-2)"}}>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

// ————————————————————————————
// Create Work Order (form)
// ————————————————————————————
const CreateWO = () => (
  <>
    <div className="page-head">
      <div>
        <div className="page-sub">Work Orders · New</div>
        <h1 className="page-title">New Work Order</h1>
      </div>
      <div style={{display:"flex", gap: 8}}>
        <button className="btn">Save draft</button>
        <button className="btn primary">{Icons.check} Submit for approval</button>
      </div>
    </div>

    <div className="split">
      <div style={{display:"flex", flexDirection:"column", gap: 18}}>
        <section className="card" style={{padding: 20}}>
          <div className="sec-head" style={{margin:"0 0 14px"}}><h3>01 · Customer</h3><Bracket>REQUIRED</Bracket></div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12}}>
            <div><label className="uppercase-label">Company</label><select className="select"><option>Compass Health</option><option>Midwest Bank &amp; Trust</option></select></div>
            <div><label className="uppercase-label">Office / Location</label><select className="select"><option>Springfield Office</option><option>Columbia Office</option></select></div>
            <div><label className="uppercase-label">Contact</label><input className="input" defaultValue="A. Kelleher"/></div>
            <div><label className="uppercase-label">PO Number</label><input className="input mono" placeholder="PO-10283"/></div>
          </div>
        </section>

        <section className="card" style={{padding: 20}}>
          <div className="sec-head" style={{margin:"0 0 14px"}}><h3>02 · Line Items</h3><button className="btn sm">{Icons.plus} Add item</button></div>
          <div style={{display:"flex", flexDirection:"column", gap: 10}}>
            {[1, 2].map(i => (
              <div key={i} style={{border: "1px solid var(--rule)", borderRadius: "var(--r-sm)", padding: 14, background: "var(--paper-2)"}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom: 10}}>
                  <span className="mono uppercase-label">Item · {String(i).padStart(2, "0")}</span>
                  <button className="btn ghost sm">{Icons.x}</button>
                </div>
                <div style={{display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap: 10}}>
                  <div><label className="uppercase-label">Description</label><input className="input" defaultValue={i === 1 ? "Intake form, 2-part NCR" : "Consent booklet, 8pp"}/></div>
                  <div><label className="uppercase-label">Quantity</label><input className="input mono tabnum" defaultValue={i === 1 ? "2500" : "1000"}/></div>
                  <div><label className="uppercase-label">Unit Price</label><input className="input mono tabnum" defaultValue={i === 1 ? "0.496" : "2.48"}/></div>
                </div>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: 10, marginTop: 10}}>
                  <div><label className="uppercase-label">Paper</label><select className="select"><option>NCR 2-part White/Canary</option><option>80# Matte Text</option></select></div>
                  <div><label className="uppercase-label">Ink</label><select className="select"><option>1/1 Black</option><option>4/4 CMYK</option></select></div>
                  <div><label className="uppercase-label">Processing</label><input className="input" defaultValue="Pad 50, drill 1 hole"/></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{padding: 20}}>
          <div className="sec-head" style={{margin:"0 0 14px"}}><h3>03 · Shipping &amp; Delivery</h3></div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: 12}}>
            <div><label className="uppercase-label">Method</label><select className="select"><option>FedEx Ground</option><option>Customer pickup</option><option>Local delivery</option></select></div>
            <div><label className="uppercase-label">In-Hands Date</label><input className="input mono" defaultValue="2026-04-24"/></div>
            <div><label className="uppercase-label">Ship To</label><input className="input" defaultValue="Springfield Office"/></div>
          </div>
        </section>
      </div>

      <aside style={{display:"flex", flexDirection:"column", gap: 16}}>
        <div className="card" style={{padding: 16}}>
          <div className="uppercase-label" style={{marginBottom: 12}}>Estimate Summary</div>
          <div style={{display:"grid", gap: 10, fontSize: 13}}>
            {[["Items","2"],["Subtotal","$3,720.00"],["Tax","$306.09"],["Shipping","$128.00"]].map(([k,v]) => (
              <div key={k} style={{display:"flex", justifyContent:"space-between"}}>
                <span style={{color:"var(--ink-3)"}}>{k}</span>
                <span className="mono tabnum">{v}</span>
              </div>
            ))}
            <div style={{display:"flex", justifyContent:"space-between", paddingTop: 10, borderTop: "1px solid var(--rule)", alignItems:"baseline"}}>
              <span className="uppercase-label">Total</span>
              <span className="mono tabnum" style={{fontSize: 20, fontWeight: 600}}>$4,154.09</span>
            </div>
          </div>
        </div>
        <div className="card" style={{padding: 16}}>
          <div className="uppercase-label" style={{marginBottom: 10}}>Internal Notes</div>
          <textarea className="textarea" placeholder="Rush job. Verify paper stock in-house before press."/>
        </div>
        <div className="card" style={{padding: 16}}>
          <div className="uppercase-label" style={{marginBottom: 10}}>Attachments</div>
          <button className="btn" style={{width:"100%", justifyContent:"center"}}>{Icons.upload} Drop files or browse</button>
          <div className="mono" style={{fontSize: 10, color:"var(--ink-4)", marginTop: 8, textAlign:"center"}}>PDF · AI · INDD · PSD up to 500MB</div>
        </div>
      </aside>
    </div>
  </>
);

// ————————————————————————————
// Login / Landing
// ————————————————————————————
const Login = ({ onEnter }) => (
  <div className="auth-root">
    <div className="auth-hero">
      <div style={{display:"flex", alignItems:"center", gap: 10, position:"relative", zIndex: 1}}>
        <div style={{width: 32, height: 32, background: "var(--press)", color:"var(--press-on)", display:"grid", placeItems:"center", borderRadius: 3, fontFamily:"var(--font-display)", fontSize: 20, fontStyle:"italic"}}>T</div>
        <div style={{display:"flex", flexDirection:"column", lineHeight: 1}}>
          <span style={{fontFamily:"var(--font-display)", fontSize: 19}}>Thomson</span>
          <span className="mono" style={{fontSize: 10, textTransform:"uppercase", letterSpacing:".14em", color:"color-mix(in oklch, var(--paper) 60%, transparent)", marginTop: 2}}>Print Portal</span>
        </div>
      </div>

      {/* Large typographic mark */}
      <div style={{position:"relative", zIndex: 1}}>
        <div style={{display:"flex", gap: 4, marginBottom: 28}}>
          <span style={{width: 40, height: 6, background:"var(--cyan)"}}/>
          <span style={{width: 40, height: 6, background:"var(--magenta)"}}/>
          <span style={{width: 40, height: 6, background:"var(--yellow)"}}/>
          <span style={{width: 40, height: 6, background:"var(--paper)"}}/>
        </div>
        <h1 style={{fontFamily:"var(--font-display)", fontSize: 72, lineHeight: 0.95, margin: 0, letterSpacing:"-.02em", fontWeight: 400}}>
          From proof<br/>to press<br/><em style={{color:"color-mix(in oklch, var(--press) 60%, var(--paper))"}}>since 1905.</em>
        </h1>
        <div style={{marginTop: 32, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: 20, maxWidth: 480}}>
          {[["142","orders in motion"],["9","stages tracked"],["120","years of craft"]].map(([n, l]) => (
            <div key={l}>
              <div className="mono tabnum" style={{fontSize: 28, fontWeight: 500}}>{n}</div>
              <div className="mono" style={{fontSize: 10, textTransform:"uppercase", letterSpacing:".1em", color:"color-mix(in oklch, var(--paper) 55%, transparent)", marginTop: 4}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration mark ornaments */}
      <div style={{position:"absolute", top: 40, right: 40, display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap: 24, opacity: .35}}>
        {[0,1,2,3].map(i => (
          <svg key={i} width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="12" fill="none" stroke="var(--paper)" strokeWidth="0.75"/>
            <line x1="14" y1="0" x2="14" y2="28" stroke="var(--paper)" strokeWidth="0.75"/>
            <line x1="0" y1="14" x2="28" y2="14" stroke="var(--paper)" strokeWidth="0.75"/>
          </svg>
        ))}
      </div>

      <div className="mono" style={{fontSize: 10, color:"color-mix(in oklch, var(--paper) 50%, transparent)", letterSpacing:".1em", position:"relative", zIndex: 1}}>
        ST. CHARLES, MO · INTERNAL PORTAL · v4.2.0
      </div>
    </div>

    <div className="auth-form-col">
      <div className="auth-form">
        <div className="bracket-rule" style={{marginBottom: 20}}>SIGN IN</div>
        <h2 style={{fontFamily:"var(--font-display)", fontSize: 32, margin:"0 0 8px", letterSpacing:"-.01em"}}>Welcome back.</h2>
        <p style={{color:"var(--ink-3)", margin:"0 0 28px", fontSize: 14}}>Sign in to your Thomson Printing workspace.</p>

        <div style={{display:"flex", flexDirection:"column", gap: 14}}>
          <div>
            <label className="uppercase-label">Email</label>
            <input className="input" defaultValue="jshultz@thomsonprinting.com"/>
          </div>
          <div>
            <label className="uppercase-label">Password</label>
            <input className="input" type="password" defaultValue="••••••••••"/>
          </div>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <label style={{display:"flex", alignItems:"center", gap: 8, fontSize: 12, color:"var(--ink-3)"}}>
              <input type="checkbox" defaultChecked/> Keep me signed in
            </label>
            <a style={{fontSize: 12, color:"var(--press)"}}>Forgot password?</a>
          </div>
          <button className="btn primary lg" onClick={onEnter} style={{width:"100%", justifyContent:"center", marginTop: 6}}>{Icons.lock} Sign in</button>
          <div className="bracket-rule" style={{margin:"12px 0"}}>OR</div>
          <button className="btn lg" style={{width:"100%", justifyContent:"center"}}>Continue with Google</button>
          <button className="btn lg" style={{width:"100%", justifyContent:"center"}}>Email me a magic link</button>
        </div>

        <div style={{marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--rule)", display:"flex", justifyContent:"space-between", fontSize: 11, color:"var(--ink-4)"}}>
          <span className="mono">© 2026 THOMSON PRINTING, INC.</span>
          <span className="mono">EST. 1905</span>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { OrdersList, WorkOrdersList, OrderDetail, CreateWO, Login });
