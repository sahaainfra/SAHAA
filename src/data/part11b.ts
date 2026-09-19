export interface Dependency {
  part: string;
  uses: string;
}

export interface Prerequisite {
  text: string;
}

export interface Deliverable {
  text: string;
}

export interface InspectionQuery {
  title: string;
  code: string;
  language: string;
}

export interface AllocationMode {
  series: string;
  mode: string;
  why: string;
}

export interface BusinessRule {
  code: string;
  condition: string;
  http: string;
  message: string;
}

export interface ApiEndpoint {
  number: number;
  method: string;
  path: string;
  purpose: string;
  permission: string;
}

export interface PermissionKey {
  key: string;
  grants: string;
  holders: string;
}

export interface AuditAction {
  action: string;
  reason: string;
  recorded: string;
}

export interface Event {
  event: string;
  payload: string;
  emittedWhen: string;
}

export interface Notification {
  trigger: string;
  recipients: string;
  channel: string;
  content: string;
}

export interface TestCase {
  id: string;
  test: string;
  expected: string;
  starred?: boolean;
}

export interface ChecklistItem {
  category: string;
  items: string[];
}

export const dependencies: Dependency[] = [
  { part: "0.2", uses: "SCHEMA_MAP, LegacyRepository (reading existing number columns)" },
  { part: "0.3", uses: "UnitOfWork, UowContext, ctx.now, AppError + ERRORS, API envelope" },
  { part: "0.5A", uses: "Actor, actor.can(), actor.assertCan()" },
  { part: "0.6", uses: "AuditWriter" },
  { part: "1.1A", uses: "DocumentDefinition.numbering, the Phase 0 contract (§0.5)" },
];

export const prerequisites: Prerequisite[] = [
  { text: "UnitOfWork.run() commits and rolls back audit and business writes together." },
  { text: "The connection pool can open a second, independent connection and transaction while a unit of work is open. IndependentTransaction (§4.1) depends on it. If your ORM silently reuses the ambient transaction, every FAST series behaves as GAPLESS without telling you — test N4 catches this." },
];

export const deliverables: Deliverable[] = [
  { text: "dx_number_series — series definition, format, reset policy, allocation mode" },
  { text: "dx_number_allocation — one row per number issued, ever" },
  { text: "NumberingService — inUnitOfWork() (the only allocation entry point), consume, format" },
  { text: "IndependentTransaction — a short committed transaction outside the unit of work" },
  { text: "Fiscal-year rollover job" },
  { text: "Number gap report" },
];

export const inspectionQueries: InspectionQuery[] = [
  {
    title: "1.1 Existing series infrastructure",
    language: "sql",
    code: `SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (table_name ILIKE '%series%' OR table_name ILIKE '%counter%'
       OR table_name ILIKE '%sequence%' OR table_name ILIKE '%numbering%')
ORDER BY table_name;`,
  },
  {
    title: "1.2 What existing numbers look like",
    language: "sql",
    code: `SELECT po_number FROM purchase_orders ORDER BY id DESC LIMIT 20;

SELECT po_number, COUNT(*) AS c
FROM purchase_orders GROUP BY po_number HAVING COUNT(*) > 1;   -- duplicates already present?`,
  },
  {
    title: "1.3 Existing gaps",
    language: "sql",
    code: `WITH n AS (
  SELECT (regexp_match(po_number, '(\\d+)$'))[1]::bigint AS seq
  FROM purchase_orders WHERE po_number ~ '\\d+$'
)
SELECT MIN(seq) AS lo, MAX(seq) AS hi, COUNT(*) AS present,
       MAX(seq) - MIN(seq) + 1 - COUNT(*) AS missing
FROM n;`,
  },
  {
    title: "1.4 Concurrency exposure in existing code",
    language: "text",
    code: `Search the existing application source for:

MAX(          in the same statement as a number/code column
COUNT(*) + 1
lastNumber, nextNumber, generateCode, getNextNo
Date.now()    used inside a document number
uuid          used as a user-visible number`,
  },
];

export const reportQuestions = [
  { question: "Does a usable series table exist? Can it be read without modification?", consequence: "Reading is always allowed. Writing to it needs a DCR and an ADR." },
  { question: "Are duplicate numbers present today?", consequence: "If yes, seeding in Step 3.4 starts above the maximum and you must tell the client that historical duplicates exist — do not silently renumber anything." },
  { question: "Is any format mandated by a client, an auditor or a statutory body?", consequence: "Reproduce it exactly. Improving a format that appears on filed returns creates a reconciliation problem." },
];

export const allocationModes: AllocationMode[] = [
  { series: "Tax invoice, client bill, receipt, credit/debit note, statutory register", mode: "GAPLESS", why: "An auditor asks what happened to invoice 41. 'A transaction rolled back' does not end that conversation." },
  { series: "PO, indent, RFQ, GRN, issue, work order, MB, logsheet, WIR, NCR, permit", mode: "FAST", why: "Gaps are operationally irrelevant; throughput matters." },
];

export const seriesSeedList = `INDENT, RFQ, QUOTE, PO, WO, GRN, ISSUE, RETURN, TRANSFER      (FAST)
MB, WIR, NCR, PERMIT, LOGSHEET, INSPECTION, SNAG              (FAST)
CLIENT_BILL, RA_BILL, CREDIT_NOTE, DEBIT_NOTE, RECEIPT,
VOUCHER, JOURNAL, PAYMENT, TDS_CERT                           (GAPLESS)
PAYROLL_RUN, ADVANCE, EXPENSE_CLAIM                           (FAST)`;

export const numberSeriesSQL = `CREATE TABLE dx_number_series (
  id                BIGSERIAL PRIMARY KEY,
  code              VARCHAR(40)  NOT NULL,       -- 'PO', 'MB', 'CLIENT_BILL'
  project_id        BIGINT       NULL,           -- NULL = company-wide series
  company_id        BIGINT       NULL,
  fiscal_year       VARCHAR(9)   NULL,           -- '2026-27'; NULL = no year segmentation

  format            VARCHAR(120) NOT NULL,       -- 'PO/{PROJECT}/{FY}/{SEQ:5}'
  current_value     BIGINT       NOT NULL DEFAULT 0,
  start_value       BIGINT       NOT NULL DEFAULT 1,
  increment_by      INTEGER      NOT NULL DEFAULT 1,

  reset_policy      VARCHAR(20)  NOT NULL DEFAULT 'FISCAL_YEAR',
                    -- NEVER | FISCAL_YEAR | CALENDAR_YEAR | MONTHLY
  allocation_mode   VARCHAR(20)  NOT NULL DEFAULT 'FAST',
                    -- FAST    : allocated in its own transaction; gaps possible on rollback
                    -- GAPLESS : allocated inside the business transaction; no gaps; serialises
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,

  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX dx_number_series_uq
  ON dx_number_series (code, COALESCE(project_id, -1), COALESCE(fiscal_year, ''));`;

export const numberAllocationSQL = `CREATE TABLE dx_number_allocation (
  id                BIGSERIAL PRIMARY KEY,
  series_id         BIGINT       NOT NULL REFERENCES dx_number_series(id),
  allocated_number  VARCHAR(80)  NOT NULL,
  sequence_value    BIGINT       NOT NULL,

  document_type     VARCHAR(40)  NOT NULL,
  document_id       BIGINT       NULL,           -- set on consume; NULL = issued but unused
  project_id        BIGINT       NULL,

  status            VARCHAR(20)  NOT NULL DEFAULT 'ALLOCATED',
                    -- ALLOCATED | CONSUMED | VOIDED
  void_reason       TEXT         NULL,
  allocated_by      BIGINT       NOT NULL,
  allocated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  consumed_at       TIMESTAMPTZ  NULL
);

CREATE UNIQUE INDEX dx_number_allocation_uq  ON dx_number_allocation (series_id, sequence_value);
CREATE INDEX dx_number_allocation_doc        ON dx_number_allocation (document_type, document_id);
CREATE INDEX dx_number_allocation_open       ON dx_number_allocation (series_id)
                                             WHERE status = 'ALLOCATED';

-- Append-only delete rule
CREATE RULE dx_number_allocation_no_delete AS ON DELETE TO dx_number_allocation DO INSTEAD NOTHING;`;

export const fiscalYearTS = `// dx/platform/numbering/fiscal-year.ts
// Read once at boot. A change needs a restart — mid-run it would split a series silently.
const FY_START_MONTH = Number(process.env.DX_FISCAL_YEAR_START_MONTH ?? 4);   // 4 = April
const BUSINESS_TZ    = process.env.DX_BUSINESS_TIMEZONE ?? 'Asia/Kolkata';

/** The business date of an instant, in the business timezone (conventions §8), then its FY.
 *  Never getMonth() on a UTC Date: 00:30 IST on 1 April is 19:00 UTC on 31 March. */
export function fiscalYearOf(instant: Date, tz = BUSINESS_TZ): string {
  const { year, month } = calendarPartsIn(instant, tz);          // month 1–12, via Intl
  const start = month >= FY_START_MONTH ? year : year - 1;
  return FY_START_MONTH === 1 ? \`\${start}\`
       : \`\${start}-\${String((start + 1) % 100).padStart(2, '0')}\`;   // '2026-27'
}`;

export const testSeriesSeedSQL = `-- Test-only seed (migration 01_1B_900_test_series, NODE_ENV=test only)
INSERT INTO dx_number_series (code, project_id, fiscal_year, format, reset_policy, allocation_mode)
VALUES ('TEST_DOC', NULL, NULL, 'TD/{FY}/{SEQ:5}', 'NEVER', 'FAST');`;

export const apiEndpoints: ApiEndpoint[] = [
  { number: 1, method: "GET", path: "/api/dx/v1/numbering/series", purpose: "List series", permission: "admin.numbering.view" },
  { number: 2, method: "POST", path: "/api/dx/v1/numbering/series", purpose: "Create a series", permission: "admin.numbering.manage" },
  { number: 3, method: "PATCH", path: "/api/dx/v1/numbering/series/:id", purpose: "Format, mode, active flag", permission: "admin.numbering.manage" },
  { number: 4, method: "POST", path: "/api/dx/v1/numbering/series/:id/reset", purpose: "Set current_value", permission: "admin.numbering.reset" },
  { number: 5, method: "GET", path: "/api/dx/v1/numbering/gaps", purpose: "Allocated-not-consumed and voided", permission: "admin.numbering.view" },
  { number: 6, method: "GET", path: "/api/dx/v1/numbering/preview", purpose: "Show the next number without allocating", permission: "admin.numbering.view" },
];

export const permissionKeys: PermissionKey[] = [
  { key: "admin.numbering.view", grants: "Series list, gap report, preview", holders: "Super Admin; finance and project administrators by grant" },
  { key: "admin.numbering.manage", grants: "Create series, change format/mode/active", holders: "Super Admin; finance staff by grant" },
  { key: "admin.numbering.reset", grants: "Set the counter", holders: "Super Admin only" },
];

export const businessRules: BusinessRule[] = [
  { code: "SERIES_NOT_CONFIGURED", condition: "No series for code/project/year", http: "409", message: "No number series is configured for {code} in {fy}. An administrator must create one in Settings › Number Series before this document can be saved." },
  { code: "SERIES_INACTIVE", condition: "Series exists but inactive", http: "409", message: "Number series {code} is not active for {fy}. An administrator must activate it in Settings › Number Series." },
  { code: "SERIES_FORMAT_VARIABLE_MISSING", condition: "Format uses an unsupplied variable", http: "500", message: "Series format uses {var} but no value was supplied." },
  { code: "SERIES_FORMAT_NO_SEQUENCE", condition: "Format has no {SEQ}", http: "422", message: "A number format must contain {SEQ}. Without it every document would receive the same number." },
  { code: "RESET_BELOW_ISSUED", condition: "Reset target < highest issued", http: "409", message: "Number {n} has already been issued from this series. The counter cannot be set below {n}, because that would reissue an existing number." },
  { code: "MODE_CHANGE_ON_ACTIVE_SERIES", condition: "GAPLESS → FAST after issuance, not yet acknowledged", http: "409", message: "This series has already issued {n} numbers under gapless allocation. Switching to fast allocation means future gaps are possible. Statutory series should stay gapless." },
  { code: "DUPLICATE_NUMBER", condition: "Raised by 1.1D's DocumentStore when a document number's unique index is violated", http: "500", message: "Document number {n} already exists. This indicates a numbering configuration problem — contact your administrator." },
];

export const events: Event[] = [
  { event: "numbering.series.changed", payload: "seriesId, code, projectId, changedFields", emittedWhen: "create, update, activate" },
  { event: "numbering.series.reset", payload: "seriesId, code, from, to", emittedWhen: "reset" },
];

export const notifications: Notification[] = [
  { trigger: "Series reset", recipients: "Super Admins and anyone granted the matching admin key", channel: "In-app + email", content: "Who reset which series, from what to what, and the comment" },
];

export const auditActions: AuditAction[] = [
  { action: "SERIES_CREATE", reason: "—", recorded: "Full row as after" },
  { action: "SERIES_UPDATE", reason: "acknowledgement text on a mode change", recorded: "Before/after per field" },
  { action: "SERIES_RESET", reason: "the mandatory comment", recorded: "Before/after current_value" },
  { action: "ROLLOVER", reason: "—", recorded: "New year, source series" },
  { action: "NUMBER_VOID", reason: "the void reason", recorded: "Number, originating document type" },
];

export const testCases: TestCase[] = [
  { id: "N1", test: "Allocate 1,000 numbers sequentially from a FAST series", expected: "1,000 distinct values" },
  { id: "N2", test: "50 concurrent allocations from one series (real threads, not a loop)", expected: "50 distinct values; verify with SELECT COUNT(*), COUNT(DISTINCT sequence_value)", starred: true },
  { id: "N3", test: "GAPLESS: allocate inside a transaction, roll back, allocate again", expected: "Second allocation returns the same value — no gap", starred: true },
  { id: "N4", test: "FAST, inside inUnitOfWork: allocate, then throw; allocate again", expected: "Second value is higher; the first is VOIDED with a reason in the gap report and is never reissued", starred: true },
  { id: "N4a", test: "FAST: allocate, then kill the process before commit", expected: "The first stays ALLOCATED and appears in the stale-allocation report after an hour", starred: true },
  { id: "N4b", test: "Code search for calls to allocate( outside NumberingService", expected: "None — it is private" },
  { id: "N5", test: "Series with start_value = 1000, current_value = 0", expected: "First number is 1000" },
  { id: "N6", test: "First save on 1 April with reset_policy = FISCAL_YEAR", expected: "New series row created; sequence restarts at start_value; prior year's row untouched", starred: true },
  { id: "N7", test: "20 concurrent saves at the exact moment of rollover", expected: "Exactly one new series row — advisory lock holds" },
  { id: "N8", test: "Gap report over a GAPLESS series after 200 mixed commit/rollback operations", expected: "Zero rows", starred: true },
  { id: "N9", test: "Seed from an existing table whose maximum is 312", expected: "First new number is 313" },
  { id: "N10", test: "Format PO/{PROJECT}/{FY}/{SEQ:5} with projectId omitted", expected: "SERIES_FORMAT_VARIABLE_MISSING; does not emit PO//2026-27/00001" },
  { id: "N11", test: "Format without {SEQ}", expected: "Rejected at save with SERIES_FORMAT_NO_SEQUENCE" },
  { id: "N12", test: "Preview called 10×", expected: "current_value unchanged; no allocation rows" },
  { id: "N13", test: "Reset below the highest issued number", expected: "RESET_BELOW_ISSUED; counter unchanged", starred: true },
  { id: "N14", test: "Reset without a comment", expected: "Rejected" },
  { id: "N15", test: "DELETE FROM dx_number_allocation WHERE id = …", expected: "Zero rows affected", starred: true },
  { id: "N16", test: "Series resolution with project-specific and company-wide rows both present", expected: "The project-specific one wins" },
  { id: "N17", test: "Allocation when no series exists", expected: "SERIES_NOT_CONFIGURED with the remedy in the message" },
];

export const permissionTests: TestCase[] = [
  { id: "P1", test: "admin.numbering.view only, attempting a reset", expected: "403" },
  { id: "P2", test: "Project-scoped admin.numbering.manage, editing a company-wide series", expected: "403" },
  { id: "P3", test: "Project A administrator listing series", expected: "Project B's series absent from the response body entirely, not merely hidden in the UI", starred: true },
];

export const integrationTests: TestCase[] = [
  { id: "I1", test: "Schema fingerprint before and after this part, excluding dx_ tables", expected: "Identical", starred: true },
  { id: "I2", test: "Existing application's own numbering still works", expected: "Unchanged — nothing was written to its table" },
];

export const completionChecklist: ChecklistItem[] = [
  {
    category: "Database",
    items: [
      "Two tables created; unique index created as an index, not a constraint",
      "Delete rule on dx_number_allocation verified by N15 ★",
      "Series seeded from existing maxima; N9 passes ★",
      "Only series for already-built modules are seeded",
      "Migration down drops exactly two tables and one rule",
    ],
  },
  {
    category: "Allocation",
    items: [
      "N2, N3, N4, N8 pass with pasted output ★",
      "IndependentTransaction confirmed to open a genuinely independent transaction — verified by N4, which fails if it does not ★",
      "Every statutory series is GAPLESS; list them in PHASE_1_FINDINGS.md",
      "No MAX(…)+1 or COUNT(*)+1 in new code — code search confirms ★",
      "Voided numbers are never reissued; no code path sets status back to ALLOCATED ★",
    ],
  },
  {
    category: "Rollover",
    items: [
      "N6 and N7 pass; rollover is lazy, not scheduled ★",
      "Fiscal year start month read once at boot",
    ],
  },
  {
    category: "Admin surface",
    items: [
      "Preview does not allocate (N12)",
      "Reset requires a comment (stored as audit reason), emits its event, and refuses to go backwards (N13, N14) ★",
      "P3 confirms cross-project series are absent from the payload ★",
      "Reset recorded in DEVICE_EXCEPTIONS.md as desktop/tablet only",
    ],
  },
  {
    category: "Final confirmation",
    items: [
      "No existing table, column, relationship or row was altered. ★ (I1, I2)",
    ],
  },
];
