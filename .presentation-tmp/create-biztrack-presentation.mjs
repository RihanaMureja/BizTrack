import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = "C:\\Users\\Asku PC\\Herd\\BizTrack-main";
const OUT = path.join(ROOT, "docs", "BizTrack-professional-presentation.pptx");
const TMP = path.join(ROOT, ".presentation-tmp", "rendered");
const LOGO = path.join(ROOT, "public", "brand", "biztrack-logo.jpg");
const HERO_IMAGES = [
  path.join(ROOT, "assets", "images", "1 img.png"),
  path.join(ROOT, "assets", "images", "2 img.png"),
  path.join(ROOT, "assets", "images", "3 img.png"),
  path.join(ROOT, "assets", "images", "4 img.png"),
];

const colors = {
  ink: "#102033",
  muted: "#64748b",
  faint: "#e2e8f0",
  bg: "#f8fafc",
  white: "#ffffff",
  teal: "#0f766e",
  tealSoft: "#ccfbf1",
  green: "#16a34a",
  amber: "#f59e0b",
  blue: "#2563eb",
  red: "#dc2626",
  dark: "#071826",
};

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function readImage(filePath) {
  const bytes = await fs.readFile(filePath);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function addText(slide, text, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontFace: "Aptos",
    fontSize: style.fontSize ?? 18,
    color: style.color ?? colors.ink,
    bold: style.bold ?? false,
    alignment: style.alignment ?? "left",
  };
  return shape;
}

function addPanel(slide, position, fill = colors.white, line = colors.faint) {
  return slide.shapes.add({
    geometry: "roundRect",
    position,
    fill,
    line: { style: "solid", fill: line, width: 1 },
    borderRadius: "rounded-xl",
  });
}

function addHeader(slide, title, section = "BizTrack") {
  addText(slide, section.toUpperCase(), { left: 72, top: 38, width: 230, height: 24 }, {
    fontSize: 13,
    bold: true,
    color: colors.teal,
  });
  addText(slide, title, { left: 72, top: 70, width: 900, height: 54 }, {
    fontSize: 36,
    bold: true,
    color: colors.ink,
  });
  slide.shapes.add({
    geometry: "line",
    position: { left: 72, top: 133, width: 1136, height: 0 },
    line: { style: "solid", fill: colors.faint, width: 1 },
  });
}

function addFooter(slide, n) {
  addText(slide, "BizTrack Business Management System", { left: 72, top: 674, width: 420, height: 20 }, {
    fontSize: 11,
    color: colors.muted,
  });
  addText(slide, String(n).padStart(2, "0"), { left: 1166, top: 672, width: 42, height: 22 }, {
    fontSize: 12,
    bold: true,
    color: colors.teal,
    alignment: "right",
  });
}

function addBulletList(slide, items, left, top, width, lineHeight = 42, fontSize = 21) {
  items.forEach((item, i) => {
    const y = top + i * lineHeight;
    slide.shapes.add({
      geometry: "ellipse",
      position: { left, top: y + 7, width: 10, height: 10 },
      fill: item.color ?? colors.teal,
      line: { style: "solid", fill: "none", width: 0 },
    });
    addText(slide, item.text ?? item, { left: left + 26, top: y, width, height: lineHeight - 4 }, {
      fontSize,
      color: item.muted ? colors.muted : colors.ink,
      bold: item.bold ?? false,
    });
  });
}

function addKpi(slide, label, value, x, y, color = colors.teal) {
  addPanel(slide, { left: x, top: y, width: 246, height: 118 });
  addText(slide, value, { left: x + 22, top: y + 22, width: 190, height: 38 }, {
    fontSize: 31,
    bold: true,
    color,
  });
  addText(slide, label, { left: x + 22, top: y + 68, width: 198, height: 30 }, {
    fontSize: 15,
    color: colors.muted,
  });
}

function addNotes(slide, sourceText) {
  slide.speakerNotes.textFrame.setText(`[Sources]\n${sourceText}`);
}

function addFlowStep(slide, n, title, body, x, y, color = colors.teal) {
  slide.shapes.add({
    geometry: "ellipse",
    position: { left: x, top: y, width: 54, height: 54 },
    fill: color,
    line: { style: "solid", fill: color, width: 1 },
  });
  addText(slide, String(n), { left: x, top: y + 11, width: 54, height: 28 }, {
    fontSize: 22,
    bold: true,
    color: colors.white,
    alignment: "center",
  });
  addText(slide, title, { left: x + 72, top: y - 4, width: 360, height: 30 }, {
    fontSize: 24,
    bold: true,
  });
  addText(slide, body, { left: x + 72, top: y + 32, width: 420, height: 58 }, {
    fontSize: 17,
    color: colors.muted,
  });
}

async function main() {
  await fs.mkdir(TMP, { recursive: true });
  const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  const logo = await readImage(LOGO);
  const heroImages = await Promise.all(HERO_IMAGES.map(readImage));

  // 1
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.bg;
    slide.images.add({
      blob: heroImages[0],
      contentType: "image/png",
      alt: "Business dashboard workspace",
      fit: "cover",
      position: { left: 704, top: 0, width: 576, height: 720 },
    });
    slide.shapes.add({
      geometry: "rect",
      position: { left: 704, top: 0, width: 576, height: 720 },
      fill: { color: colors.dark, transparency: 25000 },
      line: { style: "solid", fill: "none", width: 0 },
    });
    slide.images.add({ blob: logo, contentType: "image/jpeg", alt: "BizTrack logo", fit: "contain", position: { left: 72, top: 62, width: 230, height: 72 } });
    addText(slide, "Smart business management for growing SMEs", { left: 72, top: 210, width: 560, height: 155 }, {
      fontSize: 54,
      bold: true,
      color: colors.ink,
    });
    addText(slide, "A professional platform for owners to manage sales, products, inventory, employees, credits, payments, expenses, reports, subscriptions, and verification in one secure system.", { left: 76, top: 390, width: 556, height: 96 }, {
      fontSize: 22,
      color: colors.muted,
    });
    addKpi(slide, "BizTrack domain tables", "27", 76, 535, colors.teal);
    addKpi(slide, "Laravel/system tables", "9", 344, 535, colors.amber);
    addNotes(slide, "Prepared from the BizTrack project scope, database table list, and implemented module phases in this repository.");
  }

  // 2
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.white;
    addHeader(slide, "BizTrack brings daily business operations into one controlled workflow", "System purpose");
    addText(slide, "The platform replaces disconnected notebooks, spreadsheets, manual receipts, and informal employee controls with a verified, role-aware digital operating system.", { left: 72, top: 166, width: 840, height: 70 }, { fontSize: 24, color: colors.muted });
    addBulletList(slide, [
      { text: "Owners see performance, cash movement, credit exposure, expenses, and stock health." },
      { text: "Employees work only inside the permissions assigned by the owner." },
      { text: "Super admins protect platform quality through verification, subscriptions, and oversight." },
      { text: "Audit logs and notifications create traceability across sensitive actions." },
    ], 96, 282, 870, 58, 24);
    addPanel(slide, { left: 946, top: 170, width: 262, height: 398 }, colors.tealSoft, "#99f6e4");
    addText(slide, "Core promise", { left: 978, top: 210, width: 200, height: 32 }, { fontSize: 25, bold: true, color: colors.teal });
    addText(slide, "Make small and medium businesses easier to run, easier to monitor, and safer to scale.", { left: 978, top: 266, width: 198, height: 160 }, { fontSize: 25, color: colors.ink });
    addFooter(slide, 2);
    addNotes(slide, "Prepared from the BizTrack system overview and implemented module behavior.");
  }

  // 3
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.bg;
    addHeader(slide, "The current framework is built for professional expansion", "Technology");
    const items = [
      ["Laravel", "Backend structure, authentication, policies, middleware, migrations, queues, notifications, tests."],
      ["Inertia + React", "Modern single-page user experience without separating the project into two disconnected apps."],
      ["MySQL", "Relational database for business operations, transactions, permissions, and audit history."],
      ["Tailwind CSS", "Consistent, custom product styling instead of default Laravel starter-kit visuals."],
    ];
    items.forEach((it, i) => {
      const x = 72 + (i % 2) * 568;
      const y = 178 + Math.floor(i / 2) * 188;
      addPanel(slide, { left: x, top: y, width: 520, height: 138 });
      addText(slide, it[0], { left: x + 28, top: y + 24, width: 250, height: 34 }, { fontSize: 27, bold: true, color: i === 0 ? colors.teal : i === 1 ? colors.blue : i === 2 ? colors.amber : colors.green });
      addText(slide, it[1], { left: x + 28, top: y + 70, width: 456, height: 48 }, { fontSize: 18, color: colors.muted });
    });
    addFooter(slide, 3);
    addNotes(slide, "Prepared from the repository technology stack and installed Laravel/Inertia/React project structure.");
  }

  // 4
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.white;
    addHeader(slide, "BizTrack earns from both access and platform usage", "Business model");
    addPanel(slide, { left: 92, top: 188, width: 498, height: 348 }, "#ecfeff", "#a5f3fc");
    addText(slide, "Subscription revenue", { left: 128, top: 228, width: 390, height: 40 }, { fontSize: 31, bold: true, color: colors.teal });
    addBulletList(slide, [
      "Business owners choose an active plan.",
      "Plans can control limits such as employees, features, and reporting access.",
      "Inactive or expired subscriptions can block premium workflows.",
    ], 138, 300, 390, 58, 21);
    addPanel(slide, { left: 690, top: 188, width: 498, height: 348 }, "#fffbeb", "#fde68a");
    addText(slide, "Service fee revenue", { left: 726, top: 228, width: 390, height: 40 }, { fontSize: 31, bold: true, color: colors.amber });
    addBulletList(slide, [
      "A configurable percentage is calculated from recorded payments.",
      "Owners can see how each fee was created and what is owed.",
      "The percentage can be negotiated per business.",
    ], 736, 300, 390, 58, 21);
    addFooter(slide, 4);
    addNotes(slide, "Prepared from the implemented subscription and platform service fee modules in BizTrack.");
  }

  // 5
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.bg;
    addHeader(slide, "Three primary roles separate platform control from business work", "Roles");
    const roles = [
      ["Super Admin", "Owns platform oversight: verification review, business status, subscriptions, service fees, users, and platform reports.", colors.teal],
      ["Business Owner", "Runs the business: profile, products, inventory, employees, sales, payments, expenses, reports, notifications, and settings.", colors.blue],
      ["Employee", "Works inside owner-assigned permissions. The role name can be cashier, manager, inventory officer, or another custom role.", colors.amber],
    ];
    roles.forEach((r, i) => {
      const y = 176 + i * 142;
      slide.shapes.add({ geometry: "ellipse", position: { left: 86, top: y + 15, width: 76, height: 76 }, fill: r[2], line: { style: "solid", fill: r[2], width: 1 } });
      addText(slide, String(i + 1), { left: 86, top: y + 34, width: 76, height: 32 }, { fontSize: 26, bold: true, color: colors.white, alignment: "center" });
      addText(slide, r[0], { left: 194, top: y + 8, width: 330, height: 38 }, { fontSize: 30, bold: true });
      addText(slide, r[1], { left: 196, top: y + 54, width: 830, height: 52 }, { fontSize: 20, color: colors.muted });
    });
    addFooter(slide, 5);
    addNotes(slide, "Prepared from BizTrack RBAC design and implemented role modules.");
  }

  // 6
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.white;
    addHeader(slide, "Permissions are fixed for platform safety and dynamic for business teams", "RBAC");
    addPanel(slide, { left: 86, top: 178, width: 512, height: 362 });
    addText(slide, "Static platform guardrails", { left: 122, top: 222, width: 390, height: 34 }, { fontSize: 29, bold: true, color: colors.teal });
    addBulletList(slide, [
      "Super admin access is protected and cannot be casually reassigned.",
      "Owner-only and employee-only routes are guarded by middleware and policies.",
      "Sensitive modules are separated by role-aware sidebar navigation.",
    ], 132, 294, 390, 58, 21);
    addPanel(slide, { left: 682, top: 178, width: 512, height: 362 });
    addText(slide, "Dynamic business permissions", { left: 718, top: 222, width: 410, height: 34 }, { fontSize: 29, bold: true, color: colors.amber });
    addBulletList(slide, [
      "Owners create employee roles with custom names.",
      "Owners decide which modules each employee can access.",
      "The sidebar adapts so employees see only useful, allowed navigation.",
    ], 728, 294, 390, 58, 21);
    addFooter(slide, 6);
    addNotes(slide, "Prepared from the dynamic employee roles and permissions module and RBAC sidebar behavior.");
  }

  // 7
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.bg;
    addHeader(slide, "The owner gains control over money, people, stock, and decisions", "Owner value");
    addBulletList(slide, [
      { text: "Sales and POS: record customer purchases, sale items, payments, and receipts." },
      { text: "Inventory: track stock movement, restocks, adjustments, low stock, and stagnant products." },
      { text: "Customers and credit: manage customer records, unpaid balances, and repayment history." },
      { text: "Expenses and reports: compare sales, payments, expenses, inventory value, and revenue trends." },
      { text: "Security: verification, audit logs, strong passwords, temporary passwords, and role-based access." },
    ], 96, 178, 980, 67, 24);
    addFooter(slide, 7);
    addNotes(slide, "Prepared from BizTrack module phases: POS, inventory, customers, customer credit, expenses, reports, audit logging, and security.");
  }

  // 8
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.white;
    addHeader(slide, "Business verification protects the platform before access is granted", "Verification workflow");
    addFlowStep(slide, 1, "Owner signs up", "The account is created, but full system access waits for verification.", 100, 190, colors.teal);
    addFlowStep(slide, 2, "Documents submitted", "National ID photo, FAN number, trade license, TIN, and dynamic VAT or rental documents.", 100, 318, colors.blue);
    addFlowStep(slide, 3, "Super admin reviews", "Documents can be approved, rejected with reason, or marked for resubmission.", 690, 190, colors.amber);
    addFlowStep(slide, 4, "Business activated", "A verified business can complete setup, select subscription, and use the system.", 690, 318, colors.green);
    addFooter(slide, 8);
    addNotes(slide, "Prepared from implemented business verification review and resubmission workflow.");
  }

  // 9
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.bg;
    addHeader(slide, "Subscription controls whether a verified business can operate normally", "Subscription workflow");
    addFlowStep(slide, 1, "Plan selection", "The owner chooses an available plan based on business needs.", 98, 184, colors.teal);
    addFlowStep(slide, 2, "Payment handling", "Payment gateway integration can later connect Chapa, Santim Pay, or Telebirr-backed providers.", 98, 318, colors.blue);
    addFlowStep(slide, 3, "Activation", "An active plan unlocks subscribed limits and protected modules.", 688, 184, colors.green);
    addFlowStep(slide, 4, "Renewal or restriction", "Expired or inactive plans can trigger notices, renewal flows, and access limits.", 688, 318, colors.amber);
    addFooter(slide, 9);
    addNotes(slide, "Prepared from BizTrack subscription design and planned Ethiopian payment gateway integration path.");
  }

  // 10
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.white;
    addHeader(slide, "The database separates BizTrack business data from Laravel system support", "Database");
    addKpi(slide, "Total database tables", "36", 92, 178, colors.ink);
    addKpi(slide, "BizTrack application tables", "27", 374, 178, colors.teal);
    addKpi(slide, "Laravel/system tables", "9", 656, 178, colors.amber);
    addPanel(slide, { left: 92, top: 350, width: 1096, height: 166 }, "#f8fafc", colors.faint);
    addText(slide, "BizTrack tables store business identity, products, inventory, customers, sales, payments, credits, expenses, reports, notifications, audit logs, verification, permissions, service fees, and product insights.", { left: 126, top: 384, width: 1018, height: 52 }, { fontSize: 23, color: colors.ink });
    addText(slide, "Laravel tables support framework operations such as sessions, password resets, passkeys, jobs, cache, failed jobs, batches, and migration history.", { left: 126, top: 450, width: 1018, height: 42 }, { fontSize: 20, color: colors.muted });
    addFooter(slide, 10);
    addNotes(slide, "Prepared from the current database table list supplied for BizTrack.");
  }

  // 11
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.bg;
    addHeader(slide, "The 27 BizTrack tables cover the real business domain", "BizTrack tables");
    const left = "users, businesses, subscriptions, categories, products, inventory, inventory_transactions, customers, sales, sale_items, payments, customer_credits, expense_categories, expenses";
    const right = "reports, notifications, audit_logs, business_verification_documents, business_verification_reviews, business_permissions, business_roles, business_permission_business_role, security_questions, user_security_questions, service_fee_settings, service_fees, product_movement_insights";
    addPanel(slide, { left: 88, top: 178, width: 522, height: 386 });
    addText(slide, "Operational tables", { left: 122, top: 214, width: 410, height: 34 }, { fontSize: 29, bold: true, color: colors.teal });
    addText(slide, left, { left: 122, top: 276, width: 440, height: 224 }, { fontSize: 20, color: colors.ink });
    addPanel(slide, { left: 670, top: 178, width: 522, height: 386 });
    addText(slide, "Governance and intelligence", { left: 704, top: 214, width: 420, height: 34 }, { fontSize: 29, bold: true, color: colors.amber });
    addText(slide, right, { left: 704, top: 276, width: 440, height: 224 }, { fontSize: 20, color: colors.ink });
    addFooter(slide, 11);
    addNotes(slide, "Prepared from the current BizTrack database table list. Table names are shown as implemented/planned database objects.");
  }

  // 12
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.white;
    addHeader(slide, "Customer logic connects sales, payments, credit, and follow-up", "Customer workflow");
    addFlowStep(slide, 1, "Customer record", "The business stores customer identity and contact information.", 94, 182, colors.teal);
    addFlowStep(slide, 2, "Sale is recorded", "Items, quantities, prices, discounts, and totals are attached to the sale.", 94, 316, colors.blue);
    addFlowStep(slide, 3, "Payment or credit", "Full payment completes the sale; unpaid balance creates customer credit.", 686, 182, colors.amber);
    addFlowStep(slide, 4, "Reports and reminders", "Credit balances become visible in dashboards, reports, and notifications.", 686, 316, colors.green);
    addFooter(slide, 12);
    addNotes(slide, "Prepared from implemented customer, sale, payment, customer credit, report, and notification modules.");
  }

  // 13
  {
    const slide = presentation.slides.add();
    slide.background.fill = colors.dark;
    slide.images.add({ blob: heroImages[3], contentType: "image/png", alt: "Modern business operations background", fit: "cover", position: { left: 680, top: 0, width: 600, height: 720 } });
    slide.shapes.add({ geometry: "rect", position: { left: 680, top: 0, width: 600, height: 720 }, fill: { color: colors.dark, transparency: 15000 }, line: { style: "solid", fill: "none", width: 0 } });
    slide.images.add({ blob: logo, contentType: "image/jpeg", alt: "BizTrack logo", fit: "contain", position: { left: 72, top: 72, width: 230, height: 72 } });
    addText(slide, "BizTrack is ready to move from product build to market readiness", { left: 72, top: 205, width: 570, height: 150 }, { fontSize: 47, bold: true, color: colors.white });
    addText(slide, "Next priorities: real Ethiopian payment gateway integration, subscription enforcement, production deployment, security hardening, and onboarding support for early businesses.", { left: 76, top: 386, width: 550, height: 100 }, { fontSize: 22, color: "#cbd5e1" });
    addText(slide, "A scalable foundation for verified business operations, recurring revenue, and data-driven owner decisions.", { left: 76, top: 550, width: 560, height: 62 }, { fontSize: 25, bold: true, color: "#99f6e4" });
    addNotes(slide, "Prepared from BizTrack project status and planned commercialization direction.");
  }

  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(path.join(TMP, `${stem}.png`), await presentation.export({ slide, format: "png", scale: 1 }));
    await fs.writeFile(path.join(TMP, `${stem}.layout.json`), await (await slide.export({ format: "layout" })).text());
  }
  await writeBlob(path.join(TMP, "deck-montage.webp"), await presentation.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(OUT);
  console.log(OUT);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
