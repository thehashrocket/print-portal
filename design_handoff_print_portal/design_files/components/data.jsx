// Sample data — realistic for a small print shop portal
const orders = [
  { id: "24-0817", po: "PO-10283", company: "Compass Health",      desc: "Q2 Intake Packet · 4 items",           items: 4, qty: 9000,  status: "press",       rep: "A. Shultz",  due: "Apr 24", amount: 6881 },
  { id: "24-0816", po: "PO-10279", company: "Midwest Bank & Trust", desc: "Branch signage refresh · 12 items",    items: 12, qty: 340,  status: "proof",       rep: "M. Alvarez", due: "Apr 28", amount: 12480 },
  { id: "24-0815", po: "PO-10277", company: "Lindenwood Univ.",     desc: "Commencement program, saddle-stitch",  items: 2, qty: 2400,  status: "bindery",     rep: "A. Shultz",  due: "Apr 21", amount: 4290 },
  { id: "24-0814", po: "PO-10271", company: "St. Charles School District", desc: "Report card NCR forms",       items: 3, qty: 18000, status: "press",       rep: "D. Kim",     due: "Apr 30", amount: 3840 },
  { id: "24-0813", po: "PO-10265", company: "Bellavia Law",         desc: "Letterhead + business cards",          items: 2, qty: 3500,  status: "approved",    rep: "M. Alvarez", due: "May 02", amount: 1290 },
  { id: "24-0812", po: "PO-10258", company: "Ozarks Coffee Roasters", desc: "12oz coffee bag labels 4/0",         items: 1, qty: 15000, status: "typesetting", rep: "D. Kim",     due: "May 05", amount: 2180 },
  { id: "24-0811", po: "PO-10252", company: "Faith Lutheran Church", desc: "Weekly bulletins, 11×17 fold",        items: 1, qty: 500,   status: "shipped",     rep: "A. Shultz",  due: "Apr 19", amount: 420 },
  { id: "24-0810", po: "PO-10249", company: "Riverside Dental",      desc: "Appt reminder postcards 4/4",         items: 1, qty: 5000,  status: "pending",     rep: "M. Alvarez", due: "May 08", amount: 640 },
  { id: "24-0809", po: "PO-10241", company: "Compass Health",         desc: "HR policy booklet, perfect-bound",   items: 2, qty: 220,   status: "proof",       rep: "A. Shultz",  due: "Apr 27", amount: 3420 },
  { id: "24-0808", po: "PO-10238", company: "Gateway Construction",   desc: "Safety tags, NCR 3-part",            items: 1, qty: 4000,  status: "press",       rep: "D. Kim",     due: "Apr 25", amount: 1180 },
  { id: "24-0807", po: "PO-10230", company: "Sunrise Realty",         desc: "Yard signs, corrugated 18×24",       items: 1, qty: 150,   status: "typesetting", rep: "M. Alvarez", due: "Apr 29", amount: 890 },
  { id: "24-0806", po: "PO-10224", company: "Missouri Baptist Med.",  desc: "Discharge instruction forms",        items: 4, qty: 12000, status: "pending",     rep: "A. Shultz",  due: "May 06", amount: 2240 },
  { id: "24-0805", po: "PO-10218", company: "Maplewood Library",      desc: "Summer reading bookmarks",           items: 1, qty: 8000,  status: "bindery",     rep: "D. Kim",     due: "Apr 22", amount: 480 },
  { id: "24-0804", po: "PO-10211", company: "Elmwood Academy",        desc: "Yearbook, hardcover 96pp",           items: 1, qty: 380,   status: "proof",       rep: "M. Alvarez", due: "May 12", amount: 9120 },
];

const orderItems = [
  { id: "IT-4201", order: "24-0817", desc: "Intake form, 2-part NCR",     company: "Compass Health",       qty: 2500,  paper: "NCR 2-part White/Canary", stage: "On Press",    assigned: "D. Kim",     due: "Apr 24", outsourced: false },
  { id: "IT-4202", order: "24-0817", desc: "Consent booklet, 8pp",        company: "Compass Health",       qty: 1000,  paper: "80# Matte Text",          stage: "Bindery",     assigned: "A. Shultz",  due: "Apr 24", outsourced: false },
  { id: "IT-4203", order: "24-0817", desc: "Welcome card, 4×6 4/4",       company: "Compass Health",       qty: 5000,  paper: "14pt C2S",                stage: "On Press",    assigned: "D. Kim",     due: "Apr 24", outsourced: false },
  { id: "IT-4204", order: "24-0817", desc: "Folder, pocket 9×12 4/0",     company: "Compass Health",       qty: 500,   paper: "12pt C1S",                stage: "Typesetting", assigned: "M. Alvarez", due: "Apr 24", outsourced: true },
  { id: "IT-4195", order: "24-0816", desc: "Window cling 24×36",          company: "Midwest Bank & Trust", qty: 24,    paper: "Vinyl perf",              stage: "Proof",       assigned: "A. Shultz",  due: "Apr 28", outsourced: true },
  { id: "IT-4188", order: "24-0815", desc: "Commencement program 16pp",   company: "Lindenwood Univ.",     qty: 2400,  paper: "100# Silk Text",          stage: "Bindery",     assigned: "D. Kim",     due: "Apr 21", outsourced: false },
  { id: "IT-4179", order: "24-0814", desc: "Report card, NCR 2-part",     company: "St. Charles Schools",  qty: 18000, paper: "NCR 2-part",              stage: "On Press",    assigned: "A. Shultz",  due: "Apr 30", outsourced: false },
  { id: "IT-4170", order: "24-0813", desc: "Business cards 4/4",          company: "Bellavia Law",         qty: 3000,  paper: "14pt Matte",              stage: "Approved",    assigned: "M. Alvarez", due: "May 02", outsourced: false },
  { id: "IT-4165", order: "24-0812", desc: "Coffee bag label 4/0",        company: "Ozarks Coffee",        qty: 15000, paper: "Kraft label stock",       stage: "Typesetting", assigned: "D. Kim",     due: "May 05", outsourced: false },
  { id: "IT-4158", order: "24-0811", desc: "Bulletin, 11×17 half-fold",   company: "Faith Lutheran",       qty: 500,   paper: "70# Opaque",              stage: "Shipped",     assigned: "A. Shultz",  due: "Apr 19", outsourced: false },
];

Object.assign(window, { orders, orderItems });
