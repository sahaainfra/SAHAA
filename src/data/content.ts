export interface Defect {
  id: string;
  title: string;
  description: string;
  resolution: string;
}

export interface CapabilityOwner {
  capability: string;
  owner: string;
  interface: string;
}

export interface Phase {
  phase: string;
  name: string;
  parts: number;
  startsWhen: string;
  parallel: string;
}

export const defects: Defect[] = [
  {
    id: "C1",
    title: "The numbering implied the wrong build order",
    description:
      "Volume I (Parts 1–10) specified the platform. Volume II (Parts 11–24) specified the modules. Volume III (Parts 30–44) specified how the platform engines are actually implemented. A developer reading in numerical order would build Part 12 (master data) before Part 32 (the permission engine it depends on).",
    resolution:
      "The new sequence is strictly build-ordered. Part N never depends on Part N+1. This is verified mechanically — see §4.",
  },
  {
    id: "C2",
    title: "The same capability was specified twice, in two different styles",
    description:
      "Permission engine, Real-time engine, Approval workflow, Stock ledger, GL posting, Measurement formulas, and Component library were each specified as a concept in one volume and as an implementation in another, with no statement of which governs.",
    resolution:
      "One part per capability, containing both the model and the implementation. Nothing in the new series is specified in two places.",
  },
  {
    id: "C3",
    title: "Genuine duplicate coverage across volumes",
    description:
      "Fixed assets (3 specs), Temporary works (2 specs), Statutory returns (2 owners), Quantity surveying (described twice), CFO dashboard (role vs workspace), Project closure (3 checklists).",
    resolution:
      "§3 assigns exactly one owning part to every capability. Where another part needs it, it calls the owner's service — it does not re-specify it.",
  },
  {
    id: "C4",
    title: "Parts were numbered by topic, not by dependency",
    description:
      "Backup and restore was Part 9 — but it cannot be built until the schema is stable. The responsive framework was Part 11 — but it must exist before the first screen. Master data was Part 12 — but every module needs it.",
    resolution:
      "The new sequence is a dependency-ordered topological sort. Where two parts are genuinely independent, that is stated so they can run in parallel.",
  },
  {
    id: "C5",
    title: '"Existing database" was never actually established',
    description:
      'Every part said "do not change the existing database" and each contained its own Step Zero inspection. There was no single authoritative record of what the existing database is.',
    resolution:
      "Part 0.2 performs the inspection once, produces SCHEMA_BASELINE.md and config/schema-map.ts, and every later part reads from those. No part re-inspects.",
  },
  {
    id: "C6",
    title: "Module parts assumed platform services that had no build instruction",
    description:
      "Volume II parts referenced actor.can(), UnitOfWork, WorkflowEngine, Money.allocate() and the outbox as though they existed. Volume III specified them — 20 parts later.",
    resolution:
      "Phase 1 builds every shared engine before any module part begins. A module part that needs a service names the exact interface and the part that built it.",
  },
  {
    id: "C7",
    title: "The design system was specified before the components that use it",
    description:
      "Volume I Part 1 defined tokens; Part 5 defined components; Volume III Part 38 defined the metadata-driven generator. Three layers, three volumes, no single instruction for 'build the UI foundation'.",
    resolution:
      "Parts 0.7 and 1.7–1.8 build tokens, components and generator as one continuous sequence, before any module screen exists.",
  },
  {
    id: "C8",
    title: "Acceptance criteria were not mechanically verifiable",
    description:
      'Checklist items such as "the system feels like one integrated ERP" cannot be ticked objectively. Roughly a fifth of the previous checklist items were of this kind.',
    resolution:
      "Every checklist item in the new series is a query to run, a test to execute, a file to produce or a specific observable behaviour. Anything unverifiable has been removed or rewritten.",
  },
  {
    id: "C9",
    title: "Prompt length was managed inconsistently",
    description:
      "Several parts exceeded 40,000 characters and had to be split retrospectively, which broke their internal cross-references.",
    resolution:
      "Every part in the new series is written to a 32,000-character target with a 38,000 hard ceiling, verified before delivery. Splits are designed, not retrofitted.",
  },
];

export const capabilityOwners: CapabilityOwner[] = [
  { capability: "Existing schema knowledge", owner: "0.2", interface: "SCHEMA_MAP, LegacyRepository" },
  { capability: "Transactions, actor, correlation", owner: "0.3", interface: "UnitOfWork.run(actor, fn)" },
  { capability: "Money, quantity, rounding", owner: "0.3", interface: "Money, Quantity" },
  { capability: "API envelope, errors, filtering", owner: "0.3", interface: "ApiSuccess, ApiFailure, compileFilter" },
  { capability: "Authentication, session, MFA", owner: "0.4", interface: "AuthService, session middleware" },
  { capability: "Permission resolution & enforcement", owner: "0.5", interface: "actor.can(), QueryFilter, FieldMasker, ActionPolicy" },
  { capability: "Audit trail & hash chain", owner: "0.6", interface: "ctx.audit.record()" },
  { capability: "Event outbox & relay", owner: "0.6", interface: "ctx.outbox.emit()" },
  { capability: "Design tokens & shell", owner: "0.7", interface: "CSS custom properties, <AppShell>" },
  { capability: "Breakpoints & responsive", owner: "0.8", interface: "useBreakpoint(), <Responsive>" },
  { capability: "Document lifecycle, states, numbering", owner: "1.1", interface: "DocumentDefinition, DocumentService" },
  { capability: "Approval routing & SLA", owner: "1.2", interface: "WorkflowEngine.start(), .decide()" },
  { capability: "Formulas, rates, tax, deductions", owner: "1.3", interface: "resolveRate(), TaxEngine, FormulaRegistry" },
  { capability: "Stock ledger posting", owner: "1.4", interface: "StockPostingService.post()" },
  { capability: "GL posting & period lock", owner: "1.4", interface: "GlPostingService.postFromEvent(), PeriodLockService" },
  { capability: "WebSocket, fan-out, KPI service", owner: "1.5", interface: "RealtimeFanout, KpiService.batch()" },
  { capability: "Notification dispatch", owner: "1.6", interface: "NotificationService.dispatch()" },
  { capability: "List report / object page generation", owner: "1.7", interface: "EntityUiMetadata, <ListReport>, <ObjectPage>" },
  { capability: "Shared components", owner: "1.8", interface: "<SmartTable>, <KpiCard>, <FilterBar>" },
  { capability: "Reports, export, print", owner: "1.9", interface: "ExportService, PrintService" },
  { capability: "External connectors", owner: "1.10", interface: "IntegrationFramework" },
  { capability: "Organisation hierarchy", owner: "2.1", interface: "resolveOrgPath(), getSubtree()" },
  { capability: "Project master & config", owner: "2.2", interface: "getProjectConfig()" },
  { capability: "Vendors, clients, subcontractors", owner: "2.3", interface: "isVendorCompliant()" },
  { capability: "Items, UoM", owner: "2.4", interface: "getUomFactor()" },
  { capability: "Cost codes & WBS structure", owner: "2.5", interface: "validateCostDestination()" },
  { capability: "BOQ", owner: "2.6", interface: "getActiveBoqVersion()" },
  { capability: "Rates", owner: "2.7", interface: "resolveRate() — impl in 1.3, data in 2.7" },
  { capability: "Workforce, attendance, payroll", owner: "3.1–3.8", interface: "checkCompetency(), getLabourCost()" },
  { capability: "Planning, WBS progress", owner: "4.x", interface: "getWbsProgress(), getPlannedValue()" },
  { capability: "Procurement", owner: "5.x", interface: "getCommittedCost(), getOpenPoQuantity()" },
  { capability: "Stores & inventory", owner: "6.x", interface: "getStockPosition()" },
  { capability: "Subcontract", owner: "7.x", interface: "getFreeIssueExcess()" },
  { capability: "Measurement (single engine)", owner: "8.x", interface: "getCertifiedQuantity(), computeQuantity()" },
  { capability: "Client billing", owner: "9.x", interface: "getReceivable(), getUnbilledWip()" },
  { capability: "Finance & costing", owner: "10.x", interface: "getAvailableBudget(), getProjectCost()" },
  { capability: "Plant, fuel, RMC", owner: "11.x", interface: "getEquipmentCost()" },
  { capability: "Quality, safety, documents", owner: "12.x", interface: "hasApprovedWir(), isInducted()" },
  { capability: "Role dashboards incl. CFO", owner: "13.x", interface: "dashboard definitions" },
  { capability: "QS workbench", owner: "14.x", interface: "composes 8.x/9.x — owns no transaction" },
  { capability: "Enterprise chat", owner: "15.x", interface: "ChatService" },
  { capability: "Integrations & statutory", owner: "16.x", interface: "connector implementations" },
  { capability: "Tender, contract, obligations", owner: "17.x", interface: "createProjectFromTender()" },
  { capability: "Fixed assets & temporary works", owner: "18.x", interface: "getTwAmortisation()" },
  { capability: "Labour welfare & competency", owner: "19.x", interface: "checkCompetency()" },
  { capability: "Handover, DLP, knowledge", owner: "20.x", interface: "getRetentionReleaseDue()" },
  { capability: "Backup & restore", owner: "21.x", interface: "BackupService" },
  { capability: "Consolidation, UAT, go-live", owner: "22.x", interface: "reconciliation suite" },
];

export const phases: Phase[] = [
  { phase: "0", name: "Foundation", parts: 8, startsWhen: "Day one", parallel: "No — strictly sequential" },
  { phase: "1", name: "Platform engines", parts: 10, startsWhen: "Phase 0 complete", parallel: "1.7–1.9 parallel with 1.3–1.4" },
  { phase: "2", name: "Master data", parts: 9, startsWhen: "Phase 1 complete", parallel: "2.3–2.7 parallel after 2.1–2.2" },
  { phase: "3", name: "Workforce, attendance, payroll", parts: 17, startsWhen: "Phase 2 complete", parallel: "A/B splits parallel" },
  { phase: "4", name: "Planning & progress", parts: 6, startsWhen: "Phase 2 complete", parallel: "Parallel with Phase 3" },
  { phase: "5", name: "Procurement", parts: 8, startsWhen: "Phase 4", parallel: "—" },
  { phase: "6", name: "Stores & inventory", parts: 8, startsWhen: "Phase 5", parallel: "—" },
  { phase: "7", name: "Subcontract", parts: 7, startsWhen: "Phase 6", parallel: "—" },
  { phase: "8", name: "Measurement", parts: 7, startsWhen: "Phase 7", parallel: "—" },
  { phase: "9", name: "Client billing", parts: 8, startsWhen: "Phase 8", parallel: "—" },
  { phase: "10", name: "Finance & costing", parts: 10, startsWhen: "Phase 9", parallel: "—" },
  { phase: "11", name: "Plant, fuel, RMC", parts: 8, startsWhen: "Phase 6", parallel: "Parallel with 7–9" },
  { phase: "12", name: "Quality, safety, documents", parts: 9, startsWhen: "Phase 8", parallel: "Parallel with 9–10" },
  { phase: "13", name: "Role dashboards & CFO", parts: 6, startsWhen: "Phase 10", parallel: "—" },
  { phase: "14", name: "QS workbench", parts: 6, startsWhen: "Phase 9", parallel: "—" },
  { phase: "15", name: "Enterprise chat", parts: 4, startsWhen: "Phase 1", parallel: "Parallel with anything" },
  { phase: "16", name: "Integrations & statutory", parts: 8, startsWhen: "Phase 10", parallel: "—" },
  { phase: "17", name: "Tender, contract, obligations", parts: 8, startsWhen: "Phase 2", parallel: "Parallel with 3–6" },
  { phase: "18", name: "Fixed assets & temporary works", parts: 6, startsWhen: "Phase 10", parallel: "—" },
  { phase: "19", name: "Labour welfare & competency", parts: 5, startsWhen: "Phase 3, 12", parallel: "—" },
  { phase: "20", name: "Handover, DLP, knowledge", parts: 6, startsWhen: "Phase 9, 12", parallel: "—" },
  { phase: "21", name: "Backup & restore", parts: 4, startsWhen: "Phase 10", parallel: "—" },
  { phase: "22", name: "Consolidation, UAT, go-live", parts: 6, startsWhen: "All", parallel: "No" },
];

export const rules = [
  {
    id: 1,
    title: "The existing database is frozen",
    description:
      "No ALTER, DROP, RENAME or retype against any existing table, column, index, constraint, view or trigger. No modification of existing rows except through the application's own existing write paths. All new storage is additive: tables prefixed dx_, views prefixed vw_dx_. Where a field appears missing, extend via a dx_ side table keyed to the existing primary key.",
    exception:
      "If a change is genuinely unavoidable, raise a Database Change Request naming the existing table, the required field or table, its data type, its relationship, the reason, the migration, and the backward-compatibility plan.",
  },
  {
    id: 2,
    title: "No fabricated data",
    description:
      "Every figure on every screen traces to a real row. No placeholder series, no sample records, no demo-mode numbers, no hard-coded totals. Where data is absent, render the defined empty state.",
    exception: null,
  },
  {
    id: 3,
    title: "Permission is server-side",
    description:
      "Enforced at four points: route guard, query filter, field masking, action validation. Hiding a control in the UI is presentation, never enforcement.",
    exception: null,
  },
  {
    id: 4,
    title: "One part at a time",
    description:
      "Do not begin a part until the previous part's checklist passes in full. Update SYSTEM_MAP.md, API_REGISTRY.md and DB_CHANGELOG.md at the end of every part.",
    exception: null,
  },
];

export const preservedCapabilities = [
  "The four non-negotiable rules (frozen database, no fabricated data, server-side permission, one part at a time)",
  "Project-wise permission model with four enforcement points",
  "SAP Fiori Horizon design tokens and the single-visual-language requirement",
  "Real-time architecture with per-subscriber payload construction",
  "The 19-state transaction status model",
  "Append-only stock ledger; immutable certified MB; immutable posted voucher",
  "Cost allocation from attendance to cost codes",
  "Enterprise chat, CFO dashboard, advanced QS workbench",
  "Backup and restore with two-person controls",
  "Offline mobile capture with an explicit allow-list",
  "Every statutory, welfare, contract, asset and handover capability from Volume II-B",
  "The construction-specific workflows: BOQ, MB, RA bills, subcontract, free-issue, RMC, plant, tender, DLP",
];

export const duplicateCoverage = [
  { subject: "Fixed assets", appeared: "Vol II-B Part 27, Vol II-B Part 28, supplement Part 46", overlap: "Three partial specifications, inconsistent DDL" },
  { subject: "Temporary works", appeared: "Vol II-B Part 27, supplement Part 46", overlap: "Two amortisation designs" },
  { subject: "Statutory returns", appeared: "Vol II Part 23, Part 20 rebuild 20.7", overlap: "Two owners" },
  { subject: "Quantity surveying", appeared: "Vol II Parts 17/18, Vol III Parts 41/42", overlap: "Measurement engine described twice" },
  { subject: "CFO dashboard", appeared: "Vol I Part 6, Vol III Part 40", overlap: "Role dashboard vs dedicated workspace" },
  { subject: "Project closure", appeared: "Vol II Part 12, Vol II-B Part 27, Vol II-B Part 29", overlap: "Three closure checklists" },
];

export const dualSpecifiedCapabilities = [
  { capability: "Permission engine", concept: "Vol I Part 3", implementation: "Vol III Part 32" },
  { capability: "Real-time engine", concept: "Vol I Part 4", implementation: "Vol III Part 37" },
  { capability: "Approval workflow", concept: "Vol I Part 7", implementation: "Vol III Part 33" },
  { capability: "Stock ledger", concept: "Vol II Part 15", implementation: "Vol III Part 35" },
  { capability: "GL posting", concept: "Vol II Part 19", implementation: "Vol III Part 35" },
  { capability: "Measurement formulas", concept: "Vol II Part 17", implementation: "Vol III Part 36" },
  { capability: "Component library / UI", concept: "Vol I Part 5", implementation: "Vol III Part 38" },
];

export const verificationChecks = [
  {
    step: "1",
    name: "Topological sort",
    description: "Every part's dependencies resolve to a lower-numbered part. No cycles.",
  },
  {
    step: "2",
    name: "Interface completeness",
    description: "Every service a part calls is published by an earlier part, with a named signature.",
  },
  {
    step: "3",
    name: "Database ownership",
    description: "Every dx_ table has exactly one creating part. No table is created twice. Foreign keys resolve only to tables created earlier or to existing tables.",
  },
  {
    step: "4",
    name: "Permission key uniqueness",
    description: "Every key is registered by exactly one part.",
  },
  {
    step: "5",
    name: "Event coverage",
    description: "Every emitted event has at least one registered subscriber, or is explicitly marked ui-only.",
  },
  {
    step: "6",
    name: "No orphan references",
    description: 'Every "see Part X" reference resolves.',
  },
];
