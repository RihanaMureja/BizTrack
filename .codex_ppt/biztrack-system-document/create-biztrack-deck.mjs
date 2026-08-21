import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = "C:/Users/Asku PC/Herd/BizTrack-main";
const OUT_DIR = `${ROOT}/.codex_ppt/biztrack-system-document/output`;
const FINAL = `${ROOT}/docs/BizTrack-System-Document-Updated.pptx`;

const W = 1280;
const H = 720;
const M = 64;
const brand = {
  ink: "#092033",
  muted: "#53657A",
  green: "#008C4A",
  emerald: "#00A96B",
  blue: "#075985",
  cyan: "#0EA5E9",
  teal: "#0F766E",
  gold: "#F5B942",
  rose: "#B4235A",
  bg: "#F6FBF8",
  soft: "#E9F7EF",
  white: "#FFFFFF",
  line: "#CFE1D9",
};

const logo = `${ROOT}/public/brand/biztrack-logo.jpg`;
const icon = `${ROOT}/public/brand/biztrack-icon.jpg`;
const images = [
  `${ROOT}/assets/new images/hero-bg.png.png`,
  `${ROOT}/assets/new images/5227a4b3c6c2999c5850c10dc9f39b8b.jpg`,
  `${ROOT}/assets/new images/b3f3743f15d27aec911389d80c3a9c7c.jpg`,
  `${ROOT}/assets/new images/d432096c74d423af0a4732dce3107970.jpg`,
];
const paymentLogos = {
  telebirr: `${ROOT}/assets/payment option logos/telebirr logo.png`,
  mpesa: `${ROOT}/assets/payment option logos/mpesa logo.png`,
  cbebirr: `${ROOT}/assets/payment option logos/cbebirr logo.jpg`,
  apollo: `${ROOT}/assets/payment option logos/apollo logo.png`,
};

async function writeBlob(file, blob) {
  await fs.writeFile(file, new Uint8Array(await blob.arrayBuffer()));
}

async function imageBlob(file) {
  const bytes = await fs.readFile(file);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

function addText(slide, text, x, y, w, h, style = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    fontSize: style.fontSize ?? 18,
    bold: style.bold ?? false,
    color: style.color ?? brand.ink,
    alignment: style.alignment ?? "left",
  };
  return box;
}

function addTitle(slide, title, subtitle = "") {
  addText(slide, title, M, 54, 860, 58, { fontSize: 38, bold: true, color: brand.ink });
  if (subtitle) addText(slide, subtitle, M, 110, 940, 46, { fontSize: 18, color: brand.muted });
}

function addFooter(slide, n) {
  addText(slide, "BizTrack", M, 672, 170, 22, { fontSize: 12, bold: true, color: brand.green });
  addText(slide, String(n).padStart(2, "0"), 1156, 672, 60, 22, { fontSize: 12, bold: true, color: brand.muted, alignment: "right" });
}

function addPill(slide, text, x, y, w, color = brand.green) {
  slide.shapes.add({
    geometry: "roundRect",
    position: { left: x, top: y, width: w, height: 34 },
    fill: `${color}18`,
    line: { style: "solid", fill: `${color}55`, width: 1 },
    borderRadius: "rounded-full",
  });
  addText(slide, text, x + 14, y + 8, w - 28, 18, { fontSize: 12, bold: true, color });
}

function addPanel(slide, x, y, w, h, opts = {}) {
  return slide.shapes.add({
    geometry: "roundRect",
    position: { left: x, top: y, width: w, height: h },
    fill: opts.fill ?? brand.white,
    line: { style: "solid", fill: opts.line ?? brand.line, width: opts.width ?? 1 },
    borderRadius: opts.radius ?? "rounded-2xl",
    shadow: opts.shadow ?? "shadow-sm",
  });
}

function addMetric(slide, label, value, x, y, w, color) {
  addPanel(slide, x, y, w, 116, { fill: "#FFFFFFE8", line: `${color}55` });
  addText(slide, value, x + 22, y + 24, w - 44, 34, { fontSize: 28, bold: true, color });
  addText(slide, label, x + 22, y + 67, w - 44, 32, { fontSize: 15, color: brand.muted });
}

function addBullets(slide, bullets, x, y, w, h, color = brand.ink) {
  addText(slide, bullets.map((b) => `• ${b}`).join("\n"), x, y, w, h, { fontSize: 18, color });
}

async function addImage(slide, file, x, y, w, h, fit = "cover", radius = "rounded-2xl") {
  const config = {
    blob: await imageBlob(file),
    contentType: contentType(file),
    alt: path.basename(file),
    fit,
    position: { left: x, top: y, width: w, height: h },
    geometry: "roundRect",
  };

  if (radius !== "rect") {
    config.borderRadius = radius;
  } else {
    config.geometry = "rect";
  }

  slide.images.add(config);
}

async function logoMark(slide, x = 1060, y = 48) {
  await addImage(slide, logo, x, y, 130, 58, "contain", "rounded-lg");
}

function notes(slide, text) {
  slide.speakerNotes.textFrame.setText(`${text}\n\n[Sources] Internal BizTrack project scope, implemented module list, database table split, and system decisions from the local project conversation. No external research claims were used.`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(FINAL), { recursive: true });
  const deck = Presentation.create({ slideSize: { width: W, height: H } });
  let s = 0;

  // 1
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = brand.bg;
    await addImage(slide, images[0], 0, 0, W, H, "cover", "rect");
    slide.shapes.add({ geometry: "rect", position: { left: 0, top: 0, width: W, height: H }, fill: "#F8FFFBCC", line: { style: "solid", fill: "none", width: 0 } });
    await addImage(slide, logo, M, 54, 172, 76, "contain", "rounded-lg");
    addPill(slide, "SYSTEM DOCUMENT", M, 160, 170, brand.green);
    addText(slide, "BizTrack", M, 225, 560, 72, { fontSize: 62, bold: true, color: brand.ink });
    addText(slide, "A Complete Internal Operations Management System for Businesses", M, 305, 760, 72, { fontSize: 28, bold: true, color: brand.green });
    addText(slide, "Designed to manage sales, inventory, payments, employees, customers, subscriptions, reporting, and business performance from one platform.", M, 400, 720, 88, { fontSize: 21, color: brand.muted });
    addMetric(slide, "Integrated operating modules", "18+", 830, 220, 300, brand.green);
    addMetric(slide, "Domain database tables", "27", 830, 356, 300, brand.blue);
    addMetric(slide, "Built-in platform roles", "3+", 830, 492, 300, brand.rose);
    notes(slide, "Open by positioning BizTrack as a complete operating system for business owners rather than a single sales or inventory tool.");
  }

  // 2
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#FFF9F5";
    addTitle(slide, "Many businesses lose control because daily work is scattered", "Owners usually do not lack effort; they lack one connected place where sales, stock, money, people, and decisions meet.");
    await logoMark(slide);
    const problems = [
      ["Sales and stock are disconnected", "A product can be sold without the owner seeing the stock impact immediately.", brand.rose],
      ["Customer credit becomes risky", "Manual credit records make it hard to know who owes money and how much is still safe to allow.", brand.gold],
      ["Employee access is unclear", "Cashiers, managers, and staff may receive too much access or the wrong access.", brand.blue],
      ["Payments and receipts lack traceability", "Cash, mobile money, and credit payments are difficult to audit when records are separated.", brand.green],
      ["Reports arrive too late", "Owners make decisions after the problem has already affected cash flow or stock.", brand.teal],
    ];
    problems.forEach(([title, body, color], i) => {
      const x = i < 3 ? M + i * 380 : 250 + (i - 3) * 390;
      const y = i < 3 ? 188 : 420;
      addPanel(slide, x, y, 330, 132, { fill: `${color}12`, line: `${color}55` });
      addText(slide, title, x + 22, y + 24, 280, 28, { fontSize: 21, bold: true, color });
      addText(slide, body, x + 22, y + 64, 284, 50, { fontSize: 15, color: brand.ink });
    });
    addFooter(slide, s);
    notes(slide, "This slide explicitly states the operational problems BizTrack is built to solve.");
  }

  // 3
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F4FBF7";
    addTitle(slide, "BizTrack fixes the problem by connecting every daily action to the next record", "Instead of forcing owners to check many places, the system turns daily work into one controlled operating flow.");
    await logoMark(slide);
    const fixes = [
      ["Sell", "POS sale is created", brand.blue],
      ["Update", "Stock is reduced FIFO", brand.green],
      ["Collect", "Cash, wallet, account, or credit is recorded", brand.rose],
      ["Trace", "Receipt, QR, audit log, and customer credit update", brand.teal],
      ["Decide", "Dashboard and reports show what changed", brand.gold],
    ];
    fixes.forEach(([title, body, color], i) => {
      const x = 90 + i * 220;
      addPanel(slide, x, 226, 172, 170, { fill: `${color}14`, line: `${color}55` });
      addText(slide, String(i + 1), x + 20, 250, 36, 32, { fontSize: 26, bold: true, color });
      addText(slide, title, x + 20, 300, 130, 28, { fontSize: 23, bold: true, color: brand.ink });
      addText(slide, body, x + 20, 342, 128, 36, { fontSize: 14, color: brand.muted });
      if (i < fixes.length - 1) addText(slide, "→", x + 181, 288, 34, 40, { fontSize: 28, bold: true, color: brand.muted });
    });
    addPanel(slide, 170, 480, 940, 74, { fill: "#FFFFFF", line: "#B7DCC7" });
    addText(slide, "The result is simple: every sale, restock, payment, employee action, and customer credit decision becomes visible, reportable, and auditable.", 210, 506, 860, 28, { fontSize: 21, bold: true, color: brand.green, alignment: "center" });
    addFooter(slide, s);
    notes(slide, "This slide gives the audience a direct before/after logic: scattered action becomes connected records.");
  }

  // 2
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F4FBF7";
    addTitle(slide, "BizTrack turns daily business activity into one controlled workflow", "The system reduces scattered tools by connecting core operations, money movement, employees, and reporting.");
    await logoMark(slide);
    const pillars = [
      ["Control", "Owners see activity, access, stock, credit, and cash movement clearly."],
      ["Speed", "Cashiers and employees perform daily work through focused, role-aware screens."],
      ["Trust", "Audit logs, receipts, payments, and permissions make actions traceable."],
      ["Growth", "Subscriptions, analytics, and notifications support recurring platform revenue."],
    ];
    pillars.forEach(([h, b], i) => {
      const x = M + i * 290;
      addPanel(slide, x, 230, 250, 220, { fill: ["#EAF8EF", "#EAF5FF", "#FFF7E2", "#FDECF4"][i], line: ["#99D9B2", "#A9D7F6", "#F3D27D", "#EEB3CA"][i] });
      addText(slide, h, x + 24, 260, 200, 34, { fontSize: 26, bold: true, color: [brand.green, brand.blue, "#A16207", brand.rose][i] });
      addText(slide, b, x + 24, 315, 198, 92, { fontSize: 17, color: brand.ink });
    });
    addFooter(slide, s);
    notes(slide, "Explain the four benefits as management outcomes, not just software features.");
  }

  // 3
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#FFFDF7";
    addTitle(slide, "The target business problem is operational fragmentation", "Small and growing businesses often manage stock, sales, credit, payments, and staff in disconnected places.");
    await addImage(slide, images[1], 728, 168, 440, 390, "cover");
    addPanel(slide, M, 178, 580, 390, { fill: "#FFFFFFF0" });
    addBullets(slide, [
      "Sales records do not automatically update inventory.",
      "Customer credit is tracked manually and becomes risky.",
      "Employees often have too much or too little access.",
      "Reports are delayed because data is spread across modules.",
      "Payments, receipts, and audit history are difficult to verify.",
    ], 100, 220, 520, 250);
    addText(slide, "BizTrack’s purpose is to make the business easier to control every day.", 100, 492, 520, 38, { fontSize: 20, bold: true, color: brand.green });
    addFooter(slide, s);
    notes(slide, "Use this slide to frame the pain before introducing modules.");
  }

  // 4
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F5FAFF";
    addTitle(slide, "The solution is a connected business operating layer", "BizTrack connects the actions that happen during the day to the records owners need at night.");
    const steps = ["Onboard", "Catalog", "Stock", "Sell", "Collect", "Report"];
    steps.forEach((step, i) => {
      const x = 90 + i * 190;
      addPanel(slide, x, 260, 140, 120, { fill: i % 2 ? "#EAF8EF" : "#E8F4FF", line: i % 2 ? "#8FD6AD" : "#9FD3F4" });
      addText(slide, String(i + 1), x + 20, 280, 36, 32, { fontSize: 26, bold: true, color: i % 2 ? brand.green : brand.blue });
      addText(slide, step, x + 20, 326, 96, 30, { fontSize: 20, bold: true, color: brand.ink });
      if (i < steps.length - 1) addText(slide, "→", x + 150, 302, 34, 40, { fontSize: 28, bold: true, color: brand.muted });
    });
    addText(slide, "Each module feeds the next: inventory informs sales, payments inform credit and reports, and audit logs preserve accountability.", 150, 458, 980, 64, { fontSize: 22, color: brand.muted, alignment: "center" });
    await logoMark(slide);
    addFooter(slide, s);
    notes(slide, "Highlight the workflow logic: this is not a collection of separate pages.");
  }

  // 5
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#FAFFF9";
    addTitle(slide, "Role-based access keeps every user inside the right boundary", "BizTrack combines fixed platform roles with flexible employee permissions owned by each business.");
    const cols = [
      ["Super Admin", ["Manage platform visibility", "View businesses and users", "Monitor health and audit logs", "Manage subscriptions and inbox"]],
      ["Business Owner", ["Complete onboarding", "Manage catalog and stock", "Create employees and permissions", "Review reports and transactions"]],
      ["Employee", ["Access only assigned modules", "Sell, stock, or support workflows", "Use dashboard when a module is granted", "Cannot cross business boundaries"]],
    ];
    cols.forEach(([title, bullets], i) => {
      const x = M + i * 384;
      addPanel(slide, x, 190, 340, 370, { fill: ["#E8F4FF", "#EAF8EF", "#FFF7E2"][i], line: ["#9FD3F4", "#8FD6AD", "#ECCA73"][i] });
      addText(slide, title, x + 26, 224, 280, 36, { fontSize: 26, bold: true, color: [brand.blue, brand.green, "#A16207"][i] });
      addBullets(slide, bullets, x + 30, 292, 286, 190, brand.ink);
    });
    addFooter(slide, s);
    notes(slide, "Mention that business owners can define employee roles dynamically while platform roles remain protected.");
  }

  // 6
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F6FBF8";
    addTitle(slide, "Onboarding is intentionally simple before access is granted", "A new owner signs up, verifies email and phone, creates a minimal business profile, then chooses trial or paid access.");
    const stages = [
      ["Sign up", "Create account with strong password"],
      ["Verify", "Email and phone confirm identity"],
      ["Profile", "Business name, category, optional logo"],
      ["Plan", "Trial or paid subscription"],
      ["Access", "Dashboard opens after trial or payment"],
    ];
    stages.forEach(([h, b], i) => {
      const x = 100 + i * 215;
      addPanel(slide, x, 230, 178, 190, { fill: "#FFFFFF", line: i === 4 ? brand.green : brand.line });
      addText(slide, h, x + 20, 260, 132, 30, { fontSize: 24, bold: true, color: i === 4 ? brand.green : brand.ink });
      addText(slide, b, x + 20, 310, 132, 68, { fontSize: 16, color: brand.muted });
    });
    addText(slide, "Document upload review is no longer the gate for access; access is driven by verified trial or payment status.", 150, 492, 980, 50, { fontSize: 21, bold: true, color: brand.green, alignment: "center" });
    addFooter(slide, s);
    notes(slide, "Clarify the modern onboarding decision: identity and payment/trial drive access.");
  }

  // 7
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F9FBFF";
    addTitle(slide, "The owner workspace centers the modules used every day", "The sidebar is organized by work context so the system feels professional and predictable.");
    const groups = [
      ["Workspace", "Dashboard, notifications"],
      ["Catalog", "Categories, products, inventory"],
      ["Operations", "Sales, payments, customers, credit, transactions, reports"],
      ["Team", "Employees, roles, permissions"],
      ["Settings", "Profile, business, appearance, plan"],
    ];
    groups.forEach(([h, b], i) => {
      const x = i < 3 ? M + i * 390 : 260 + (i - 3) * 390;
      const y = i < 3 ? 198 : 420;
      addPanel(slide, x, y, 330, 140, { fill: i % 2 ? "#EAF8EF" : "#E8F4FF" });
      addText(slide, h, x + 22, y + 26, 270, 30, { fontSize: 24, bold: true, color: i % 2 ? brand.green : brand.blue });
      addText(slide, b, x + 22, y + 70, 270, 36, { fontSize: 17, color: brand.muted });
    });
    addFooter(slide, s);
    notes(slide, "This slide communicates the navigation philosophy and shows why modules are grouped.");
  }

  // 8
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#FFFDF6";
    addTitle(slide, "Catalog and inventory create the product source of truth", "Products are simplified while inventory batches carry cost, selling price, expiry, stock health, and FIFO movement.");
    await addImage(slide, images[2], 760, 170, 360, 380, "cover");
    addPanel(slide, M, 178, 620, 372, { fill: "#FFFFFFF0" });
    addBullets(slide, [
      "Categories are created before products for clean reporting.",
      "Product barcode and QR labels are generated automatically.",
      "Restocks create batch and lot records with unit cost and selling price.",
      "Sales consume stock FIFO, oldest batch first.",
      "Inventory cards show stock health, available stock, and batch breakdown.",
    ], 102, 220, 560, 250);
    addFooter(slide, s);
    notes(slide, "Explain why product creation is kept clean while inventory carries pricing and batch data.");
  }

  // 9
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F4FBF7";
    addTitle(slide, "The POS connects sales, stock, payments, credit, and receipts", "A sale is not just a record; it updates inventory, payment history, customer credit, receipt QR, and reports.");
    const left = [
      ["Cart", "Products added from catalog"],
      ["Checkout", "Cash, wallet, account, and credit split"],
      ["Receipt", "Invoice, payment breakdown, QR verification"],
    ];
    left.forEach(([h, b], i) => {
      addPanel(slide, M, 188 + i * 128, 410, 96, { fill: ["#EAF8EF", "#E8F4FF", "#FFF7E2"][i] });
      addText(slide, h, 96, 212 + i * 128, 150, 28, { fontSize: 24, bold: true, color: [brand.green, brand.blue, "#A16207"][i] });
      addText(slide, b, 260, 216 + i * 128, 180, 40, { fontSize: 16, color: brand.muted });
    });
    addPanel(slide, 560, 188, 600, 352, { fill: "#FFFFFF" });
    addText(slide, "Payment methods now supported in POS", 596, 220, 470, 34, { fontSize: 28, bold: true, color: brand.ink });
    const methods = [
      ["Cash", null],
      ["Telebirr", paymentLogos.telebirr],
      ["M-Pesa", paymentLogos.mpesa],
      ["CBE Birr", paymentLogos.cbebirr],
      ["Apollo", paymentLogos.apollo],
      ["Credit", null],
    ];
    for (let i = 0; i < methods.length; i++) {
      const [name, img] = methods[i];
      const x = 596 + (i % 3) * 170;
      const y = 286 + Math.floor(i / 3) * 92;
      addPanel(slide, x, y, 138, 62, { fill: "#F8FCFA", line: brand.line, radius: "rounded-xl" });
      if (img) await addImage(slide, img, x + 12, y + 12, 42, 34, "contain", "rounded-md");
      addText(slide, name, x + (img ? 62 : 16), y + 21, 70, 20, { fontSize: 15, bold: true, color: brand.ink });
    }
    addFooter(slide, s);
    notes(slide, "Use this slide to explain the recent split payment enhancement and why it matters.");
  }

  // 10
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F8FAFC";
    addTitle(slide, "Customer logic combines identity, credit, and loyalty behavior", "Customers can be individuals, companies, or government accounts, with credit and discount logic derived from real activity.");
    addMetric(slide, "Flexible customer identity", "3 types", M, 194, 300, brand.blue);
    addMetric(slide, "Credit starts safely", "0 ETB", 410, 194, 300, brand.green);
    addMetric(slide, "Discounts can be automatic", "Rules", 756, 194, 300, brand.rose);
    addPanel(slide, M, 370, 1040, 150, { fill: "#FFFFFF" });
    addText(slide, "The owner can define spend-based discounts and override credit limits, while the system suggests limits from purchase and payment behavior.", 106, 414, 920, 54, { fontSize: 24, bold: true, color: brand.ink, alignment: "center" });
    addFooter(slide, s);
    notes(slide, "Explain the core customer design: credit is not typed casually during creation; it grows from activity and owner decisions.");
  }

  // 11
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#FFFBF2";
    addTitle(slide, "Transactions unify money movement into one view", "Expense and revenue history are easier to understand when they are shown together and separately.");
    slide.charts.add("bar", {
      position: { left: M, top: 196, width: 530, height: 310 },
      categories: ["Revenue", "Expense", "Net"],
      series: [{ name: "Illustrative view", values: [80, 42, 38], fill: brand.green }],
      hasLegend: false,
      yAxis: { majorGridlines: { style: "solid", fill: "#E5E7EB", width: 1 } },
    });
    addPanel(slide, 690, 198, 420, 300, { fill: "#FFFFFF" });
    addBullets(slide, [
      "Manual expenses remain supported.",
      "Restock expenses are generated automatically.",
      "Payroll expenses can be scheduled.",
      "Reports can filter by transaction source.",
    ], 728, 240, 354, 170);
    addFooter(slide, s);
    notes(slide, "The chart is an illustrative visual treatment showing revenue, expense, and net logic rather than audited business data.");
  }

  // 12
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F3FBFF";
    addTitle(slide, "Reporting turns operational records into owner decisions", "Reports combine sales, inventory, product performance, credit, expenses, and profit analytics.");
    addPanel(slide, M, 178, 340, 340, { fill: "#FFFFFF" });
    addText(slide, "Reports answer", 100, 216, 240, 30, { fontSize: 26, bold: true, color: brand.blue });
    addBullets(slide, [
      "Which products sell best?",
      "Which items are stagnant?",
      "What is real product profit?",
      "Where is money going?",
      "Which customers carry credit?",
    ], 100, 274, 270, 176);
    slide.charts.add("line", {
      position: { left: 480, top: 190, width: 610, height: 300 },
      categories: ["W1", "W2", "W3", "W4", "W5"],
      series: [
        { name: "Sales trend", values: [18, 32, 26, 44, 58], fill: brand.green },
        { name: "Product movement", values: [14, 18, 25, 31, 42], fill: brand.cyan },
      ],
      hasLegend: true,
      yAxis: { majorGridlines: { style: "solid", fill: "#DCE9EF", width: 1 } },
    });
    addFooter(slide, s);
    notes(slide, "Describe reports as decision support. Trend values are illustrative visual examples.");
  }

  // 13
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F8F7FF";
    addTitle(slide, "Super admin manages the platform, not each owner’s business choices", "The super admin monitors platform health, subscriptions, businesses, users, inbox, notifications, and audit explorer.");
    const items = [
      ["Platform dashboard", brand.blue],
      ["Business directory", brand.green],
      ["Users and account status", brand.rose],
      ["System health", brand.gold],
      ["Inbox and notifications", brand.teal],
      ["Audit explorer", "#7C3AED"],
    ];
    items.forEach(([label, color], i) => {
      const x = M + (i % 3) * 380;
      const y = 198 + Math.floor(i / 3) * 150;
      addPanel(slide, x, y, 330, 104, { fill: `${color}14`, line: `${color}55` });
      addText(slide, label, x + 22, y + 36, 270, 28, { fontSize: 22, bold: true, color });
    });
    addText(slide, "Plan changes belong to business owners through their subscription flow; the admin directory is display and oversight focused.", 140, 548, 1000, 42, { fontSize: 20, bold: true, color: brand.ink, alignment: "center" });
    addFooter(slide, s);
    notes(slide, "Clarify the platform governance boundary.");
  }

  // 14
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F6FBF8";
    addTitle(slide, "The business model is subscription-led", "BizTrack monetizes through recurring business subscriptions while payment gateways remain swappable integration points.");
    addPanel(slide, M, 178, 1080, 360, { fill: "#FFFFFF" });
    const tiers = [
      ["Starter", "Trial / entry access", "#EAF8EF"],
      ["Growth", "Paid plan for active operations", "#E8F4FF"],
      ["Enterprise", "Larger team and operational limits", "#FFF7E2"],
    ];
    tiers.forEach(([name, desc, fill], i) => {
      const x = 120 + i * 350;
      addPanel(slide, x, 240, 280, 210, { fill, line: i === 1 ? brand.green : brand.line });
      addText(slide, name, x + 28, 276, 220, 32, { fontSize: 28, bold: true, color: i === 1 ? brand.green : brand.ink });
      addText(slide, desc, x + 28, 332, 220, 56, { fontSize: 18, color: brand.muted });
      addText(slide, "Payment confirmation gates active access", x + 28, 402, 220, 34, { fontSize: 15, bold: true, color: brand.ink });
    });
    addFooter(slide, s);
    notes(slide, "State that service fee was decommissioned and subscriptions are the main revenue mechanism.");
  }

  // 15
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#FFFDFC";
    addTitle(slide, "Gateway design is demo-ready now and integration-ready later", "The UI already models real provider selection, customer references, confirmation, receipts, and ledger history.");
    const providers = [
      ["Telebirr", paymentLogos.telebirr],
      ["M-Pesa", paymentLogos.mpesa],
      ["CBE Birr", paymentLogos.cbebirr],
      ["Apollo", paymentLogos.apollo],
    ];
    for (let i = 0; i < providers.length; i++) {
      const [name, img] = providers[i];
      const x = 140 + i * 250;
      addPanel(slide, x, 220, 190, 180, { fill: "#F8FCFA", line: brand.line });
      await addImage(slide, img, x + 45, 250, 100, 62, "contain", "rounded-lg");
      addText(slide, name, x + 24, 340, 142, 24, { fontSize: 21, bold: true, color: brand.ink, alignment: "center" });
    }
    addText(slide, "The current demo checkout can later hand off to real APIs without changing the business workflow.", 180, 480, 920, 46, { fontSize: 24, bold: true, color: brand.green, alignment: "center" });
    addFooter(slide, s);
    notes(slide, "Explain that gateway choice is represented structurally even before production API credentials are connected.");
  }

  // 16
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F8FAFC";
    addTitle(slide, "The database separates BizTrack business data from Laravel system support", "This keeps domain logic readable while the framework tables handle sessions, jobs, cache, and authentication support.");
    addMetric(slide, "BizTrack domain tables", "27", 110, 210, 340, brand.green);
    addMetric(slide, "Laravel/system tables", "9", 470, 210, 340, brand.blue);
    addMetric(slide, "Total current tables", "36", 830, 210, 340, brand.rose);
    addPanel(slide, 110, 390, 500, 150, { fill: "#EAF8EF" });
    addText(slide, "BizTrack tables", 140, 420, 300, 28, { fontSize: 24, bold: true, color: brand.green });
    addText(slide, "Businesses, products, inventory, sales, payments, customers, credits, reports, notifications, audit logs, subscriptions, employees, and transactions.", 140, 466, 430, 52, { fontSize: 16, color: brand.ink });
    addPanel(slide, 670, 390, 500, 150, { fill: "#E8F4FF" });
    addText(slide, "Laravel/system tables", 700, 420, 330, 28, { fontSize: 24, bold: true, color: brand.blue });
    addText(slide, "Cache, sessions, jobs, failed jobs, migrations, password reset tokens, passkeys, and framework support records.", 700, 466, 430, 52, { fontSize: 16, color: brand.ink });
    addFooter(slide, s);
    notes(slide, "Use this as a database summary slide rather than listing every table one by one.");
  }

  // 17
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#FFFBF7";
    addTitle(slide, "Security is built into identity, access, and traceability", "BizTrack protects the platform through verification, strong passwords, role boundaries, and audit records.");
    addBullets(slide, [
      "Email verification happens during sign-up before onboarding continues.",
      "Phone OTP supports trial activation and account trust.",
      "Temporary employee passwords must be reset.",
      "Employee permissions are scoped to the owner’s business.",
      "Super admin cannot silently change owner plans from the business directory.",
      "Audit logs answer who did what, where, when, and what changed.",
    ], 120, 190, 760, 250);
    addPanel(slide, 930, 210, 210, 230, { fill: "#0B2B1D", line: "#0B2B1D" });
    addText(slide, "Trust", 962, 250, 150, 40, { fontSize: 34, bold: true, color: "#FFFFFF" });
    addText(slide, "is not a feature; it is the behavior of the whole system.", 962, 316, 150, 76, { fontSize: 18, color: "#DFF7E8" });
    addFooter(slide, s);
    notes(slide, "Position security as a cross-cutting design, not only a login page.");
  }

  // 18
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F5FFF9";
    addTitle(slide, "BizTrack can feel like each business’s own workspace", "Tenant themes use business category, logo-driven palettes, and manual appearance settings.");
    await addImage(slide, images[3], 720, 160, 400, 400, "cover");
    addPanel(slide, 90, 192, 520, 330, { fill: "#FFFFFFF0" });
    addBullets(slide, [
      "Business category is selected during onboarding.",
      "Uploaded logos can influence brand palette.",
      "Manual color pickers let owners adjust without knowing hex codes.",
      "CSS variables allow the UI to change consistently.",
      "Dashboard guidance can adapt to business type.",
    ], 126, 232, 460, 220);
    addFooter(slide, s);
    notes(slide, "Explain that multi-tenant theming is about emotional ownership as well as brand consistency.");
  }

  // 19
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#F4FBF7";
    addTitle(slide, "The business owner benefits from clarity, control, and faster decisions", "BizTrack makes daily business management less dependent on memory, notebooks, and scattered conversations.");
    const benefits = [
      ["Clarity", "One dashboard for sales, stock, payments, credit, and performance."],
      ["Control", "Permissions, audit logs, and business-scoped data reduce risk."],
      ["Speed", "POS, restock, receipts, and reports reduce repeated manual work."],
      ["Confidence", "Analytics and notifications show what needs attention."],
    ];
    benefits.forEach(([h, b], i) => {
      const x = M + (i % 2) * 570;
      const y = 190 + Math.floor(i / 2) * 170;
      addPanel(slide, x, y, 500, 126, { fill: i % 2 ? "#E8F4FF" : "#EAF8EF" });
      addText(slide, h, x + 26, y + 28, 180, 30, { fontSize: 28, bold: true, color: i % 2 ? brand.blue : brand.green });
      addText(slide, b, x + 210, y + 30, 250, 54, { fontSize: 17, color: brand.ink });
    });
    addFooter(slide, s);
    notes(slide, "This is the executive value slide. Keep it practical and owner-centered.");
  }

  // 20
  {
    const slide = deck.slides.add();
    s++;
    slide.background.fill = "#0B2B1D";
    await addImage(slide, logo, M, 54, 160, 72, "contain", "rounded-lg");
    addText(slide, "Recommended next steps", M, 178, 760, 58, { fontSize: 44, bold: true, color: "#FFFFFF" });
    addText(slide, "BizTrack already has a strong operating foundation. The next focus should be production readiness, payment gateway integration, stronger demos, and deployment discipline.", M, 250, 820, 78, { fontSize: 22, color: "#DFF7E8" });
    addPanel(slide, M, 382, 1080, 142, { fill: "#FFFFFF12", line: "#FFFFFF35" });
    addBullets(slide, [
      "Connect real gateway APIs after demo checkout flows are approved.",
      "Prepare clean seeded demo businesses for presentations.",
      "Run full Herd PHP test suite before every shared push.",
      "Finalize deployment environment, mail domain, storage, and backups.",
    ], 100, 414, 980, 86, "#FFFFFF");
    addText(slide, "BizTrack: one business workspace, many daily decisions made easier.", M, 598, 980, 36, { fontSize: 24, bold: true, color: brand.gold });
    notes(slide, "Close by giving a concrete forward path.");
  }

  for (const [index, slide] of deck.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    const png = await deck.export({ slide, format: "png", scale: 1 });
    await writeBlob(`${OUT_DIR}/${stem}.png`, png);
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(`${OUT_DIR}/${stem}.layout.json`, await layout.text());
  }

  const montage = await deck.export({ format: "webp", montage: true, scale: 1 });
  await writeBlob(`${OUT_DIR}/montage.webp`, montage);
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(FINAL);
  console.log(FINAL);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
