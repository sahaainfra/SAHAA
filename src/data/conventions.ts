export interface StackMapping {
  concept: string;
  node: string;
  dotnet: string;
  php: string;
  java: string;
}

export interface Technology {
  name: string;
  usedFor: string;
  introducedIn: string;
}

export interface NamingRule {
  thing: string;
  convention: string;
  example: string;
}

export interface PartSection {
  number: string;
  title: string;
  description: string;
}

export interface ImmutabilityRecord {
  record: string;
  lockedAt: string;
  correctionPath: string;
  enforcedIn: string;
}

export interface TestingLayer {
  layer: string;
  coverage: string;
  proves: string;
}

export interface PerformanceBudget {
  operation: string;
  desktop: string;
  phone: string;
}

export interface DoneItem {
  text: string;
  starred?: boolean;
}

export const stackMappings: StackMapping[] = [
  { concept: "Request guard", node: "CanActivate", dotnet: "Authorization filter", php: "Middleware", java: "HandlerInterceptor" },
  { concept: "Transaction scope", node: "DataSource.transaction", dotnet: "TransactionScope", php: "DB::transaction", java: "@Transactional" },
  { concept: "Background job", node: "BullMQ", dotnet: "Hangfire", php: "Horizon", java: "Quartz" },
  { concept: "Event bus", node: "Redis Streams", dotnet: "MassTransit", php: "Redis/Horizon", java: "Spring Events" },
  { concept: "ORM", node: "TypeORM / Prisma", dotnet: "EF Core", php: "Eloquent", java: "JPA" },
];

export const technologies: Technology[] = [
  { name: "React + Tailwind", usedFor: "All web UI", introducedIn: "0.7" },
  { name: "React Native", usedFor: "Mobile app shell (optional; PWA is the default)", introducedIn: "0.8" },
  { name: "Node + Express/Nest", usedFor: "All backend services", introducedIn: "0.1" },
  { name: "PostgreSQL", usedFor: "Primary database", introducedIn: "0.2" },
  { name: "Socket.IO / WebSocket", usedFor: "Real-time fan-out", introducedIn: "1.5" },
  { name: "Chart.js (or ECharts)", usedFor: "Dashboard charts", introducedIn: "1.8" },
  { name: "Redis", usedFor: "Permission cache, sessions, job queue", introducedIn: "0.5" },
  { name: "PDF renderer (Puppeteer or similar)", usedFor: "Bill, MB, payslip, register print", introducedIn: "1.9" },
];

export const namingRules: NamingRule[] = [
  { thing: "New table", convention: "dx_<domain>_<noun> singular", example: "dx_stock_ledger" },
  { thing: "New view", convention: "vw_dx_<layer>_<noun>", example: "vw_dx_q_project_cost" },
  { thing: "Permission key", convention: "module.entity.action", example: "procure.po.release" },
  { thing: "Event type", convention: "module.entity.pastTense", example: "procure.po.released" },
  { thing: "API route", convention: "/api/dx/v1/<module>/<plural>", example: "/api/dx/v1/procurement/purchase-orders" },
  { thing: "Named action", convention: "POST .../:id/actions/<name>", example: ".../actions/release" },
  { thing: "Service method", convention: "verb-first use case", example: "releasePurchaseOrder()" },
  { thing: "Migration file", convention: "<part>_<seq>_<slug>.{up,down}.sql", example: "06_1_001_stock_ledger.up.sql" },
];

export const viewLayers = [
  { prefix: "vw_dx_b_*", name: "basic", description: "1:1 to a table, logical field names, no joins" },
  { prefix: "vw_dx_c_*", name: "composite", description: "joins and derived semantics, still row-grain" },
  { prefix: "vw_dx_q_*", name: "consumption", description: "aggregated, ready for a tile or report" },
];

export const partSections: PartSection[] = [
  { number: "0", title: "BEFORE YOU START", description: "dependencies, entities used, what must already work" },
  { number: "1", title: "OBJECTIVE", description: "what this part delivers, in five lines" },
  { number: "2", title: "SCOPE", description: "in / out / deliberately not built" },
  { number: "STEP 1", title: "INSPECT", description: "exact queries; report output before writing code" },
  { number: "STEP 2", title: "REUSE CHECK", description: "what to search for before creating anything" },
  { number: "STEP 3", title: "DATABASE", description: "new dx_ tables, full DDL, migration up and down" },
  { number: "STEP 4", title: "BACKEND", description: "files to create, signatures, business logic" },
  { number: "STEP 5", title: "API", description: "endpoint table; request/response; error codes" },
  { number: "STEP 6", title: "PERMISSIONS", description: "keys, role matrix, SoD rules, field masking" },
  { number: "STEP 7", title: "BUSINESS RULES", description: "code, condition, severity, exact message" },
  { number: "STEP 8", title: "WORKFLOW", description: "states, transitions, approval routing" },
  { number: "STEP 9", title: "FRONTEND", description: "screens, fields, states, responsive behaviour" },
  { number: "STEP 10", title: "REALTIME", description: "events emitted, consumed, what refreshes" },
  { number: "STEP 11", title: "NOTIFICATIONS", description: "trigger, recipients, channel, content" },
  { number: "STEP 12", title: "REPORTS", description: "columns, filters, formats" },
  { number: "STEP 13", title: "DASHBOARD", description: "KPI cards with their exact SQL" },
  { number: "STEP 14", title: "ERROR HANDLING", description: "code, HTTP status, UI treatment" },
  { number: "STEP 15", title: "AUDIT", description: "what is logged, with which fields" },
  { number: "STEP 16", title: "TESTING", description: "named cases with expected results" },
  { number: "CHECKLIST", title: "COMPLETION", description: "every box verifiable; ★ items need evidence" },
];

export const immutabilityRecords: ImmutabilityRecord[] = [
  { record: "Audit log row", lockedAt: "insert", correctionPath: "none — append only", enforcedIn: "0.6" },
  { record: "Stock ledger row", lockedAt: "insert", correctionPath: "reversal row referencing original", enforcedIn: "1.4" },
  { record: "Posted voucher", lockedAt: "posting", correctionPath: "reversal voucher + fresh posting", enforcedIn: "1.4" },
  { record: "Certified MB", lockedAt: "certification", correctionPath: "revised MB, supersedes", enforcedIn: "8.4" },
  { record: "Certified client bill", lockedAt: "certification", correctionPath: "adjustment in next RA bill", enforcedIn: "9.6" },
  { record: "Approved payroll run", lockedAt: "approval", correctionPath: "supplementary run", enforcedIn: "3.5B" },
  { record: "Generated payslip", lockedAt: "generation", correctionPath: "superseding payslip", enforcedIn: "3.6B" },
  { record: "Filed statutory register", lockedAt: "filing", correctionPath: "revision that supersedes", enforcedIn: "3.7A" },
  { record: "Safety incident", lockedAt: "submission", correctionPath: "addendum record", enforcedIn: "12.7" },
  { record: "Approved baseline", lockedAt: "approval", correctionPath: "new baseline version", enforcedIn: "4.3" },
  { record: "Immutable backup", lockedAt: "creation", correctionPath: "none", enforcedIn: "21.1" },
];

export const testingLayers: TestingLayer[] = [
  { layer: "Unit (domain)", coverage: "≥90% of rules and calculators", proves: "Every rule's pass and fail branch; every formula against a hand-worked case" },
  { layer: "Integration", coverage: "Every use case", proves: "Transactions, locking, idempotency, audit, outbox" },
  { layer: "Contract", coverage: "Every endpoint", proves: "Response shape against published OpenAPI" },
  { layer: "Permission", coverage: "Every route × every role", proves: "Generated from the role matrix" },
  { layer: "End-to-end", coverage: "Ten business chains", proves: "Full document flows" },
  { layer: "Reconciliation", coverage: "20 checks", proves: "Cross-module consistency" },
  { layer: "Performance", coverage: "Budgets in Part 22.4", proves: "At five-year volume" },
  { layer: "Accessibility", coverage: "Every route", proves: "Axe clean, keyboard complete" },
];

export const performanceBudgets: PerformanceBudget[] = [
  { operation: "Login → first dashboard paint", desktop: "2.0s", phone: "3.5s" },
  { operation: "Dashboard fully populated", desktop: "2.5s", phone: "4.0s" },
  { operation: "List report first page (50 rows)", desktop: "1.0s", phone: "1.5s" },
  { operation: "Object page", desktop: "1.5s", phone: "2.5s" },
  { operation: "Form submit (validate + save)", desktop: "800ms", phone: "1.5s" },
  { operation: "KPI batch (20 tiles, one request)", desktop: "800ms", phone: "1.2s" },
  { operation: "Realtime event → rendered", desktop: "3.0s", phone: "3.0s" },
  { operation: "Export 50k rows", desktop: "60s, streamed, background", phone: "—" },
];

export const doneItems: DoneItem[] = [
  { text: "Migration contains only dx_/vw_dx_ objects; the additive-migration CI check passes" },
  { text: "Migration has been run down once and verified, then run up again" },
  { text: "Every new endpoint declares a permission key; the endpoint-coverage test passes" },
  { text: "Every write path goes through UnitOfWork and produces audit rows" },
  { text: "Every declared state change emits its declared outbox event" },
  { text: "Every validation rule has a stable code and a test for both branches" },
  { text: "Every figure in the UI has a documented source query; no client-side derivation of a business number" },
  { text: "Screens use the Part 1.7 generator or Part 1.8 components; no ad-hoc styling" },
  { text: "Responsive verified at 320 / 375 / 768 / 1440" },
  { text: "Unit, integration, contract and permission tests present and green" },
  { text: "Part-specific checklist fully ticked with evidence for ★ items", starred: true },
  { text: "SYSTEM_MAP.md, API_REGISTRY.md, DB_CHANGELOG.md updated in the same commit" },
  { text: "Confirmed: no existing table, column, relationship, constraint or row was altered", starred: true },
];

export const queryParameters = [
  "$top", "$skip", "$cursor", "$orderby", "$filter", "$select", "$expand", "$search", "$view", "$totals"
];

export const transactionRules = [
  "No repository method accepts a connection other than ctx.tx.",
  "No external HTTP call inside a transaction. Integration calls are outbox events executed after commit.",
  "No notification, email or push awaited inside a transaction.",
  "A service that writes accepts UowContext; a service that only reads does not.",
  "Long-running work runs as a batch job with progress, not inside a request transaction.",
  "Lock order is fixed globally: number_series → party → project → document → ledger. Deviating causes deadlock under load.",
  "Default isolation READ COMMITTED. Explicit FOR UPDATE where a business rule needs exclusivity. Never SERIALIZABLE.",
];

export const moneyRules = [
  "Never a JavaScript number for money. Use the Money value object (Part 0.3) with integer minor units and an explicit currency.",
  "Splitting an amount uses Money.allocate() with largest-remainder. Never amount × percentage per row — it loses paise and the reconciliations fail by amounts too small to find.",
  "Quantity carries a UoM. Arithmetic across different UoMs throws unless routed through the conversion service.",
];

export const dateRules = [
  "DATE for business dates (bill date, measurement date), no timezone.",
  "TIMESTAMPTZ for event times, UTC. Never mix.",
  "Business date is the project's timezone; event time is UTC.",
];

export const responsiveMinimums = [
  "No horizontal page scroll at 320px width",
  "Touch targets ≥44×44px with ≥8px separation on touch breakpoints",
  "Status conveyed by icon and text, never colour alone",
  "Axe scan clean: zero critical or serious violations",
  "Full keyboard operability on desktop, visible focus ring on every interactive element",
  "prefers-reduced-motion respected",
  "200% text zoom usable",
  "All four themes (light, dark, high-contrast light, high-contrast dark) render correctly",
];

export const trackingDocuments = [
  {
    name: "SYSTEM_MAP.md",
    description: "one row per dx_ table: name, creating part, owner, purpose, row-count estimate, retention position.",
  },
  {
    name: "API_REGISTRY.md",
    description: "generated from decorators, never hand-written: method, path, permission key, idempotency, part that created it.",
  },
  {
    name: "DB_CHANGELOG.md",
    description: "one row per migration: file, part, date, tables touched, rollback verified (yes/no), any DCR reference.",
  },
];

export const neverMocked = [
  "the database (use a real containerised PostgreSQL)",
  "the permission resolver",
  "the formula engine",
  "the outbox relay",
];

export const alwaysMocked = [
  "external integrations, with recorded real-response fixtures and a nightly contract test against the provider's sandbox",
];

export const requiredTechniques = [
  "indexes on every foreign key, filter column and sort column declared in UI metadata",
  "keyset pagination above 10k rows",
  "no N+1 (a lint rule flags repository calls inside loops, and the test harness counts queries per request)",
  "one batched KPI request per dashboard",
  "route-level code splitting so a site engineer's phone never downloads the finance bundle",
  "virtual scrolling above 100 rows desktop and 40 phone",
  "streamed exports",
];
