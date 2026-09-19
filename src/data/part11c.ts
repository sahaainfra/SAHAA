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

export interface LockReason {
  code: string;
  label: string;
}

export interface BusinessRule {
  code: string;
  condition: string;
  severity: string;
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
  recorded: string;
}

export interface Event {
  event: string;
  payload: string;
  when: string;
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
  { part: "0.2", uses: "SCHEMA_MAP — to find existing freeze/lock flags" },
  { part: "0.3", uses: "UnitOfWork, UowContext, ctx.now, error catalogue" },
  { part: "0.6", uses: "AuditWriter, the pg_advisory_xact_lock chaining pattern, nightly chain verification" },
  { part: "1.1A", uses: "DocumentDefinition (incl. storage.legacyLockFlag), DOCUMENT_REGISTRY, DocContext, computeContentHash, the Phase 0 contract (§0.5)" },
];

export const prerequisites: Prerequisite[] = [
  { text: "dx_audit_log's hash chain verifies end to end (0.6). This part uses the same mechanism — an advisory lock around read-previous-then-insert — but with one chain per project rather than 0.6's single global chain, because lock volume per project is what matters and a global lock would serialise every posting in the company." },
  { text: "computeContentHash(def, c) returns a stable value across two reads of an unchanged document. Verify before proceeding — an unstable hash makes every lock unverifiable." },
];

export const deliverables: Deliverable[] = [
  { text: "dx_document_lock — append-only, per-project hash chain" },
  { text: "DocumentLockService — lockState, assertNotLocked, lock, isLocked, verifyChain, verifyContent" },
  { text: "DocumentLoader — the interface verification loads documents through (1.1D implements it)" },
  { text: "dx_lock_verification — one row per nightly verification run per project" },
  { text: "Legacy freeze flags honoured, read from each definition's storage.legacyLockFlag" },
  { text: "Nightly chain verification, alongside the audit chain verification from 0.6" },
];

export const inspectionQueries: InspectionQuery[] = [
  {
    title: "1.1 Existing immutability signals",
    language: "sql",
    code: `SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (column_name ILIKE '%lock%'   OR column_name ILIKE '%freeze%'
    OR column_name ILIKE '%posted%' OR column_name ILIKE '%finali%'
    OR column_name ILIKE '%is_closed%' OR column_name ILIKE '%certif%')
ORDER BY table_name, column_name;`,
  },
  {
    title: "1.2 Whether the existing system respects its own flags",
    language: "text",
    code: `Search the existing application code for updates to those tables and check whether the flag is tested before the write. Record the answer honestly in PHASE_1_FINDINGS.md. If the old screens can edit a posted voucher, that is a pre-existing condition — do not fix it by changing their code, and do not pretend our lock protects against it. It protects our write paths and it detects the result of theirs.`,
  },
  {
    title: "1.3 Existing data that should already be locked",
    language: "sql",
    code: `SELECT COUNT(*) FROM vouchers WHERE is_posted = true;
SELECT COUNT(*) FROM measurement_books WHERE status = 'CERTIFIED';`,
  },
];

export const reportQuestions = [
  { question: "Every legacy lock/freeze flag: table, column, semantics, row count." },
  { question: "Whether existing code honours each flag." },
  { question: "How many existing rows are in a state that our system would consider locked." },
];

export const lockReasons: LockReason[] = [
  { code: "POSTED", label: "posted to the ledger" },
  { code: "CERTIFIED", label: "certified" },
  { code: "FILED", label: "filed with the authority" },
  { code: "CLOSED", label: "closed with the period" },
  { code: "CANCELLED", label: "cancelled" },
];

export const documentLockSQL = `CREATE TABLE dx_document_lock (
  id                BIGSERIAL PRIMARY KEY,
  document_type     VARCHAR(40)  NOT NULL,
  document_id       BIGINT       NOT NULL,
  project_id        BIGINT       NULL,

  locked_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  locked_by         BIGINT       NOT NULL,
  locked_reason     VARCHAR(40)  NOT NULL,   -- POSTED | CERTIFIED | FILED | CLOSED | CANCELLED
  content_hash      CHAR(64)     NOT NULL,   -- document hash at the moment of locking
  chain_hash        CHAR(64)     NOT NULL,   -- sha256(prev_chain_hash || content_hash)
  prev_chain_hash   CHAR(64)     NULL,
  correction_path   VARCHAR(200) NOT NULL    -- 'Raise a debit note against this bill'
);

CREATE UNIQUE INDEX dx_document_lock_uq ON dx_document_lock (document_type, document_id);
CREATE INDEX dx_document_lock_project   ON dx_document_lock (project_id, id);

CREATE RULE dx_document_lock_no_update AS ON UPDATE TO dx_document_lock DO INSTEAD NOTHING;
CREATE RULE dx_document_lock_no_delete AS ON DELETE TO dx_document_lock DO INSTEAD NOTHING;`;

export const lockVerificationSQL = `CREATE TABLE dx_lock_verification (
  id                BIGSERIAL PRIMARY KEY,
  run_date          DATE         NOT NULL,
  project_id        BIGINT       NULL,
  locks_verified    INTEGER      NOT NULL,
  chain_ok          BOOLEAN      NOT NULL,
  chain_broken_at   BIGINT       NULL,          -- dx_document_lock.id
  content_problems  INTEGER      NOT NULL,
  detail            JSONB        NULL,          -- the problem list, when any
  finished_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX ix_dx_lockver_date ON dx_lock_verification (run_date, project_id);`;

export const apiEndpoints: ApiEndpoint[] = [
  { number: 1, method: "GET", path: "/api/dx/v1/locks/verify", purpose: "Run verification on demand", permission: "admin.audit.verify (projectFrom: 'none')" },
  { number: 2, method: "GET", path: "/api/dx/v1/locks", purpose: "Locked documents, filterable, scoped to the actor's projects", permission: "admin.audit.view (projectFrom: 'none')" },
];

export const permissionKeys: PermissionKey[] = [
  { key: "admin.audit.view", grants: "See the locked-document register", holders: "Super Admin; finance and audit staff by grant" },
  { key: "admin.audit.verify", grants: "Run verification on demand", holders: "Super Admin; audit staff by grant" },
];

export const businessRules: BusinessRule[] = [
  { code: "DOCUMENT_LOCKED", condition: "Lock row present", severity: "Error", message: "This document was locked on {lockedAt} ({reason}) and cannot be changed. {correctionPath}" },
  { code: "DOCUMENT_LOCKED_LEGACY", condition: "Legacy freeze flag set", severity: "Error (409)", message: "This {documentType} was {meaning} in the existing system and cannot be changed here." },
  { code: "ALREADY_LOCKED", condition: "lock() called on a locked document", severity: "Error (500)", message: "This document is already locked. — indicates a defect in the calling action, log it as such" },
  { code: "LOCK_CHAIN_BROKEN", condition: "Nightly verification fails", severity: "Critical", message: "Not user-facing. Pages the on-call engineer with project, row id and document." },
  { code: "LOCKED_DOCUMENT_MODIFIED", condition: "Content hash mismatch", severity: "Critical", message: "Not user-facing. Pages, and names the document." },
];

export const events: Event[] = [
  { event: "document.locked", payload: "documentType, documentId, projectId, reason", when: "on lock" },
];

export const notifications: Notification[] = [
  { trigger: "LOCK_CHAIN_BROKEN", recipients: "On-call engineer", channel: "Page (alerts.raiseP1)", content: "Project, row id, document" },
  { trigger: "LOCKED_DOCUMENT_MODIFIED", recipients: "On-call engineer", channel: "Page (alerts.raiseP1)", content: "Document type, number, when it was locked" },
];

export const auditActions: AuditAction[] = [
  { action: "LOCK", recorded: "Reason, content hash, chain hash (as after)" },
  { action: "WRITE_REFUSED", recorded: "Which document, which action, reason = the refusal code — written by 1.1D's RefusalRecorder after the failed transaction has rolled back, because an audit row written inside it would roll back too" },
];

export const testCases: TestCase[] = [
  { id: "L1", test: "assertNotLocked on a locked document", expected: "DOCUMENT_LOCKED; the i18n message contains the correction path" },
  { id: "L2", test: "assertNotLocked on an unlocked document", expected: "Returns; no error" },
  { id: "L3", test: "Lock 100 documents in one project concurrently", expected: "verifyChain passes; no fork", starred: true },
  { id: "L4", test: "UPDATE dx_document_lock SET content_hash = 'x' WHERE id = 1", expected: "Zero rows affected; the row is unchanged when re-read", starred: true },
  { id: "L5", test: "DELETE FROM dx_document_lock WHERE id = 1", expected: "Zero rows affected", starred: true },
  { id: "L6", test: "Locks in two different projects", expected: "Independent chains; the first row of each has prev_chain_hash IS NULL" },
  { id: "L7", test: "Code search across dx/ for unlock/unfreeze/reopen declared as action codes, method names or routes — excluding FORBIDDEN_ACTION_CODES in 1.1A's define.ts", expected: "Zero matches — a standing CI check, not a one-time test", starred: true },
  { id: "L8", test: "With the test DocumentLoader: change a locked document's stored rate, then run verifyContent", expected: "Reports it with CONTENT_CHANGED_SINCE_LOCK, naming type and id", starred: true },
  { id: "L9", test: "Legacy flag { field: 'isPosted', lockedValue: 'Y' }: header with 'Y', then 'N'", expected: "DOCUMENT_LOCKED_LEGACY, then no error" },
  { id: "L10", test: "With the test loader: remove the document, then verifyContent", expected: "Reports DOCUMENT_DELETED" },
  { id: "L11", test: "lock() on an already-locked document", expected: "ALREADY_LOCKED; no second row (unique index holds)" },
  { id: "L12", test: "verifyChain on a project with zero locks", expected: "{ ok: true, verified: 0 }, not an error" },
  { id: "L13", test: "Content hash computed twice on an unchanged document", expected: "Identical — if not, stop and fix hashFields in 1.1A before continuing", starred: true },
  { id: "L14", test: "lockState on a locked document inside a read-only unit of work", expected: "Returns the lock; reading is never blocked" },
  { id: "L18", test: "Boot with only 1.1C built (no 1.1D)", expected: "Starts; NoDocumentLoader bound; verifyContent returns []" },
  { id: "L16", test: "lock()", expected: "Emits exactly one document.locked and one LOCK audit entry" },
  { id: "L17", test: "Nightly job over three projects", expected: "Three dx_lock_verification rows for the date" },
  { id: "L15", test: "No POST/PATCH/DELETE route exists under /locks", expected: "Route table inspection confirms" },
];

export const integrationTests: TestCase[] = [
  { id: "I1", test: "Schema fingerprint before and after, excluding dx_ tables", expected: "Identical", starred: true },
  { id: "I2", test: "1.1D re-runs L8 with DocumentStore as the loader; 1.1D and 1.1E re-run L1 through their write paths", expected: "Refused — listed in their test tables" },
  { id: "I3", test: "Existing application updates a row our lock covers", expected: "Succeeds (we do not block it) and verifyContent reports it that night — confirm this matches the limitation recorded in Step 4.3" },
];

export const completionChecklist: ChecklistItem[] = [
  {
    category: "Database",
    items: [
      "Table created with both append-only rules; L4 and L5 assert row counts, not exceptions ★",
      "Unique index prevents a second lock row (L11)",
      "Backfill deliberately not performed; the decision and row counts are recorded ★",
      "dx_lock_verification written on every nightly run, one row per project",
      "Migration down drops two tables and two rules",
    ],
  },
  {
    category: "Service",
    items: [
      "storage.legacyLockFlag set on each affected definition from the Step 1.1 findings; L9 passes",
      "Advisory lock present in lock(); L3 passes under real concurrency ★",
      "verifyChain and verifyContent both implemented — they answer different questions",
      "L8 and L10 prove out-of-band changes are detected ★",
      "L13 confirms the content hash is stable ★",
    ],
  },
  {
    category: "The rule",
    items: [
      "L7 is wired as a standing CI check ★",
      "No /locks write endpoint exists (L15)",
      "No permission key authorises removing a lock",
    ],
  },
  {
    category: "Operations",
    items: [
      "Nightly job scheduled at 02:30, after the 0.6 audit verification",
      "Failures page a person; they do not only log",
      "Verification history retained indefinitely",
    ],
  },
  {
    category: "Final confirmation",
    items: [
      "No existing table, column, relationship or row was altered. ★ (I1)",
    ],
  },
];
