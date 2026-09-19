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

export interface PartDivision {
  part: string;
  builds: string;
  uses: string;
}

export interface ContractItem {
  need: string;
  use: string;
  never: string;
}

export interface Phase0Addition {
  number: number;
  title: string;
  description: string;
}

export interface InspectionQuery {
  title: string;
  code: string;
  language: string;
}

export interface ReportQuestion {
  question: string;
  consequence: string;
}

export interface ReuseCheckItem {
  searchFor: string;
  ifFound: string;
  ifNot: string;
}

export interface BusinessRule {
  code: string;
  http: string;
  message: string;
}

export interface TestCase {
  id: string;
  case: string;
  expected: string;
  starred?: boolean;
}

export interface ChecklistItem {
  text: string;
  starred?: boolean;
}

export const dependencies: Dependency[] = [
  { part: "0.2", uses: "SCHEMA_MAP (statusValues, columns), LegacyRepository status mapping" },
  { part: "0.3", uses: "UnitOfWork, UowContext, AppError + ERRORS + i18n, Money" },
  { part: "0.5A", uses: "Actor.can() / assertCan(), dx_permission" },
  { part: "0.5B", uses: "ENTITY_SCOPES, StandardPolicyChecks option names" },
  { part: "0.6", uses: "AuditEntry, EVENT_REGISTRY / EventSpec" },
  { part: "0.7", uses: "DOCUMENT_STATUS (label, tone, icon per state)" },
  { part: "0.8", uses: "OFFLINE_ALLOWED" },
];

export const prerequisites: Prerequisite[] = [
  { text: "Phase 0 acceptance passed — all seven items" },
  { text: "SCHEMA_BASELINE.md §3 records the actual status values of every legacy document table" },
  { text: "new AppError('SOME_CODE', {...}) for a registered code produces the envelope with the i18n message and the catalogue's HTTP status" },
];

export const deliverables: Deliverable[] = [
  { text: "DocumentDefinition, DocumentAction, DocContext, BusinessRule — the shapes modules fill in" },
  { text: "defineDocument() — compiles a definition and derives its state machine from its actions" },
  { text: "DOCUMENT_REGISTRY, the boot sync, and the mirror tables dx_document_type_registry, dx_status_map" },
  { text: "StateMachine and the 19-state vocabulary; RuleRunner; DeterminationEngine" },
  { text: "computeContentHash()" },
  { text: "SQL helpers on ctx.tx" },
  { text: "TEST_DOC — a self-contained test document every Phase 1 test uses" },
];

export const partDivision: PartDivision[] = [
  { part: "1.1A", builds: "The model: what a document is", uses: "Phase 0" },
  { part: "1.1B", builds: "Numbering", uses: "1.1A" },
  { part: "1.1C", builds: "Locking", uses: "1.1A" },
  { part: "1.1D", builds: "Storage, versions, executing actions", uses: "1.1A–C" },
  { part: "1.1E", builds: "Create, update, read, list, drafts, the controller", uses: "1.1A–D" },
];

export const contractItems: ContractItem[] = [
  { need: "Permission check", use: "actor.can(key, projectId) / actor.assertCan(key, projectId)", never: "require(), hasPermission()" },
  { need: "May I see this record?", use: "actor.can(prefix + '.view', record.projectId); false → NOT_FOUND", never: "canSeeProject(); a 403" },
  { need: "Action controls (permission, value authority, self-approval, SoD, impersonation, device)", use: "StandardPolicyChecks.run() (0.5B)", never: "per-module checks" },
  { need: "SoD rules", use: "rows in dx_sod_rule naming bare audit action codes (SUBMIT, APPROVE)", never: "lists in code" },
  { need: "Errors", use: "throw new AppError(CODE, context); CODE in ERRORS with HTTP status and in i18n with its message", never: "English strings as the message" },
  { need: "Audit", use: "ctx.audit.record(AuditEntry) — entity, entityId, action, fieldName, oldValue, newValue, before, after, documentType, projectId, reason", never: "other field names; context (0.6 does not store it); a severity (no such column)" },
  { need: "Comment on an action", use: "reason", never: "context" },
  { need: "A person must be told", use: "a registered event → 1.6; for operations, alerts.raiseP1 (0.6)", never: "audit severity" },
  { need: "Events", use: "ctx.outbox.emit(type, payload), type in EVENT_REGISTRY with aggregateType, aggregateIdField, requiredFields", never: "unregistered types" },
  { need: "Idempotency", use: "IdempotencyInterceptor on the route", never: "code in services" },
  { need: "List scoping", use: "QueryFilter.apply(entity, where, actor) with entity in ENTITY_SCOPES", never: "post-filtering" },
  { need: "Field masking", use: "FieldMasker.apply(entity, row, actor)", never: "per-screen hiding" },
  { need: "Route permission", use: "@RequiresPermission(key, opts) / @PublicEndpoint(); actor via @Actor()", never: "undecorated routes" },
];

export const phase0Additions: Phase0Addition[] = [
  { number: 1, title: "SQL helpers", description: "0.3's tx is TypeORM's QueryRunner, which has only query(). Phase 1 code calls one / maybeOne / many / insert / insertReturningId / update. Write them once in dx/platform/uow/sql-helpers.ts as withSqlHelpers(x), accepting anything with query(sql, params). Apply it wherever a runner is created: in UnitOfWork.run (so ctx.tx has them), in 1.1B's IndependentTransaction, and as an injectable Db = withSqlHelpers(dataSource) for reads and jobs outside any unit of work. Every helper is parameterised; one throws NOT_FOUND on zero rows." },
  { number: 2, title: "Status mapping", description: "0.2 implements it as protected toLogicalStatus / toPhysicalStatus on the abstract LegacyRepository. Move their bodies into exported functions logicalStatus(entity, raw) / physicalStatus(entity, state) in the same file, have the protected methods call them, and use the functions here. One mapping, not two." },
  { number: 3, title: "Nested units of work", description: "0.3's run always opens its own connection, so a run called from inside another is an independent transaction — it never joins. Resolve 0.3's open test U4 that way, in writing. 1.1B and 1.1D rely on it." },
];

export const inspectionQueries: InspectionQuery[] = [
  {
    title: "1.1 For EACH legacy document entity in SCHEMA_MAP: are the status values still as recorded?",
    language: "sql",
    code: `SELECT <status_column>, COUNT(*) FROM <legacy_document_table> GROUP BY 1 ORDER BY 2 DESC;`,
  },
  {
    title: "1.2 Existing transition logic — the rules modules must preserve",
    language: "bash",
    code: `grep -rn "status ==\\|status ===\\|setStatus\\|->status =" \\
  --include=*.{php,js,ts,java,cs} ../existing-erp/src | head -40`,
  },
];

export const reportQuestions: ReportQuestion[] = [
  { question: "Any value not in SCHEMA_MAP.statusValues?", consequence: "Blocks this part" },
  { question: "Which logical states does each legacy table have a stored value for?", consequence: "A definition cannot use a state its table cannot store (§4.3 rule 3) — list them now" },
  { question: "Transitions found in code", consequence: "Each must be expressible as an action in that module's definition" },
  { question: "Status changed by a trigger or stored procedure?", consequence: "Must not be duplicated by an action effect" },
];

export const reuseChecks: ReuseCheckItem[] = [
  { searchFor: "State machine library (xstate)", ifFound: "Do not use — ours is derived from actions", ifNot: "§4.4" },
  { searchFor: "A validation-rule runner in the codebase", ifFound: "Use it if it returns every failure, not the first", ifNot: "§4.5" },
  { searchFor: "Existing document-type list or menu table", ifFound: "Seed registry labels from it", ifNot: "§4.3" },
];

export const statusMapSQL = `-- 3.1 Status map for legacy documents — for SQL views, generated from SCHEMA_MAP
CREATE TABLE dx_status_map (
  id            BIGSERIAL PRIMARY KEY,
  entity        VARCHAR(60)  NOT NULL,
  legacy_value  VARCHAR(40)  NOT NULL,
  state         VARCHAR(30)  NOT NULL,
  is_current    BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT uq_dx_statusmap UNIQUE (entity, legacy_value)
);`;

export const registrySQL = `-- 3.2 Document type registry — for SQL, reports and dashboards (1.2A reads it)
CREATE TABLE dx_document_type_registry (
  code               VARCHAR(40)  PRIMARY KEY,
  label              VARCHAR(80)  NOT NULL,
  permission_prefix  VARCHAR(60)  NOT NULL,
  project_scoped     BOOLEAN      NOT NULL,
  requires_approval  BOOLEAN      NOT NULL,
  draftable          BOOLEAN      NOT NULL,
  offline_capable    BOOLEAN      NOT NULL,
  legacy_entity      VARCHAR(60),
  is_active          BOOLEAN      NOT NULL DEFAULT TRUE,
  synced_at          TIMESTAMPTZ  NOT NULL
);`;

export const testDocumentSQL = `-- 3.3 TEST ONLY — migration 01_1A_900_test_document, applied when NODE_ENV=test, never in production
CREATE TABLE dx_test_document (
  id              BIGSERIAL PRIMARY KEY,
  project_id      BIGINT        NOT NULL,
  document_number VARCHAR(80),
  status          VARCHAR(30)   NOT NULL,
  party_id        BIGINT        NOT NULL,
  total           NUMERIC(18,2) NOT NULL DEFAULT 0,
  remarks         TEXT,
  created_by      BIGINT        NOT NULL,
  row_version     INTEGER       NOT NULL DEFAULT 1
);
CREATE TABLE dx_test_document_line (
  id              BIGSERIAL PRIMARY KEY,
  document_id     BIGINT        NOT NULL REFERENCES dx_test_document(id),
  item_id         BIGINT        NOT NULL,
  quantity        NUMERIC(18,3) NOT NULL,
  rate            NUMERIC(18,2) NOT NULL,
  amount          NUMERIC(18,2) NOT NULL DEFAULT 0,
  row_version     INTEGER       NOT NULL DEFAULT 1
);
-- Consumption views use logical names (what read, masking and $filter use), plus project_id
-- for QueryFilter.
CREATE VIEW vw_dx_q_test_doc AS
  SELECT id, project_id, project_id AS "projectId", document_number AS "documentNumber", status,
         party_id AS "partyId", total, created_by AS "createdBy" FROM dx_test_document;
INSERT INTO dx_permission (permission_key, module, entity, action, label, scope_type, is_sensitive, registered_by_part)
SELECT 'test.doc.' || a, 'test', 'doc', a, 'Test document ' || a, 'PROJECT', false, '1.1A'
FROM unnest(ARRAY['view','create','update','submit','approve','post','pay','cancel']) a;
-- The TEST_DOC number series is seeded by 1.1B's test migration, which owns dx_number_series.`;

export const documentStates = [
  'DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'PARTIALLY_APPROVED', 'APPROVED', 'REJECTED',
  'RETURNED', 'RELEASED', 'IN_PROGRESS', 'PARTIALLY_EXECUTED', 'EXECUTED', 'CERTIFIED',
  'POSTED', 'PARTIALLY_PAID', 'PAID', 'CLOSED', 'CANCELLED', 'SUPERSEDED', 'ON_HOLD',
];

export const terminalStates = ['CLOSED', 'CANCELLED', 'SUPERSEDED', 'REJECTED'];

export const forbiddenActionCodes = ['UNLOCK', 'UNFREEZE', 'REOPEN', 'UNPOST', 'SET_STATUS'];

export const businessRules: BusinessRule[] = [
  { code: "DOCUMENT_DEFINITION_INVALID", http: "500", message: "Boot failure naming the type, rule and detail" },
  { code: "TEST_DOC_NEEDS_LINES", http: "422", message: "Add at least one line. (test only)" },
];

export const compilationTests: TestCase[] = [
  { id: "C1", case: "TEST_DOC", expected: "Compiles; registered once" },
  { id: "C2", case: "Action coded UNLOCK", expected: "FORBIDDEN_ACTION", starred: true },
  { id: "C3", case: "Action with startsWorkflow and triggersPosting", expected: "Refused" },
  { id: "C4", case: "approval.onRecalled names a USER action", expected: "APPROVAL_OUTCOME_MUST_BE_WORKFLOW_ONLY", starred: true },
  { id: "C5", case: "allocateOn: 'RELEASE' with no such action", expected: "Refused" },
  { id: "C6", case: "hashFields with header.updatedAt, then with computed.x", expected: "VOLATILE_HASH_FIELD, then HASH_FIELD_NOT_STORED", starred: true },
  { id: "C7", case: "A reachable non-terminal state with no exit", expected: "DEAD_END_STATE naming it", starred: true },
  { id: "C8", case: "Action from POSTED to DRAFT", expected: "BACKWARD_FROM_FROZEN_STATE", starred: true },
  { id: "C9", case: "allowedWhenLocked action with an effect, then with locks", expected: "LOCKED_ACTION_WITH_SIDE_EFFECTS both times" },
  { id: "C10", case: "Boot sync with test.doc.pay removed from dx_permission", expected: "Boot fails, PERMISSION_KEY_MISSING", starred: true },
  { id: "C11", case: "A legacy definition using a state its table has no value for", expected: "Boot fails, UNMAPPED_STATE, naming the action", starred: true },
];

export const stateMachineTests: TestCase[] = [
  { id: "S1", case: "Exhaustive, generated: every action × every state", expected: "Exactly the derived edges pass assert", starred: true },
  { id: "S2", case: "oneOf target", expected: "Each listed target valid; nothing else" },
  { id: "S3", case: "stateOf on a legacy header", expected: "Via 0.2's mapping; an unknown value throws UNMAPPED_STATUS_VALUE" },
  { id: "R1", case: "dx_status_map and dx_document_type_registry after boot", expected: "Equal to their sources", starred: true },
  { id: "R2", case: "Definition removed, reboot", expected: "Registry row is_active = false" },
  { id: "R3", case: "ENTITY_SCOPES['TEST_DOC'] after boot", expected: "Registered" },
  { id: "R4", case: "Two failing rules", expected: "BUSINESS_RULE_VIOLATION listing both" },
];

export const determinationTests: TestCase[] = [
  { id: "T1", case: "Change one line's rate only", expected: "lineAmount then total run — the cascade reaches the header", starred: true },
  { id: "T2", case: "Change remarks only", expected: "No determination runs", starred: true },
  { id: "T3", case: "Two determinations writing each other's trigger alternately", expected: "DETERMINATION_DID_NOT_CONVERGE", starred: true },
  { id: "T4", case: "A cascade that settles on exactly the fifth pass", expected: "Returns; does not throw" },
  { id: "H1", case: "Same material content, different remarks", expected: "Same content hash", starred: true },
  { id: "H2", case: "Rate changed", expected: "Different content hash" },
];

export const helperTests: TestCase[] = [
  { id: "Q1", case: "ctx.tx.one with zero rows", expected: "NOT_FOUND" },
  { id: "Q2", case: "Any helper given a value containing '; DROP TABLE", expected: "Bound as a parameter" },
];

export const completionChecklist: ChecklistItem[] = [
  { text: "Two mirror tables; test tables only in the test environment; migrations down verified", starred: true },
  { text: "Shapes exactly as §4.1; transitions derived from actions — no transition list anywhere", starred: true },
  { text: "C1–C11 pass; C2, C4, C6, C7, C8, C10, C11 with evidence", starred: true },
  { text: "Status mapping calls 0.2's code; no second mapping exists", starred: true },
  { text: "T1 proves cascades reach the header", starred: true },
  { text: "The three Phase 0 code changes in §0.6 made and recorded; 0.3 test U4 resolved as independent" },
  { text: "§0.5 contract table copied into PHASE_1_FINDINGS.md" },
  { text: "No existing table, column, relationship or row was altered.", starred: true },
];
