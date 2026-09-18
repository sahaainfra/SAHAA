export interface Dependency {
  part: string;
  provides: string;
  blocking: string;
}

export interface InspectionQuery {
  title: string;
  code: string;
  language: string;
}

export interface ReportQuestion {
  question: string;
  answer: string;
  consequence: string;
}

export interface ReuseCheckItem {
  searchFor: string;
  ifFound: string;
  ifNot: string;
}

export interface DatabaseTable {
  number: string;
  name: string;
  purpose: string;
  schema: string;
}

export interface BusinessRule {
  code: string;
  condition: string;
  severity: string;
  message: string;
}

export interface TestCase {
  id: string;
  case: string;
  expected: string;
  starred?: boolean;
}

export interface PerformanceTest {
  id: string;
  case: string;
  budget: string;
}

export interface ChecklistCategory {
  category: string;
  items: string[];
}

export interface ApiEndpoint {
  number: number;
  method: string;
  path: string;
  permission: string;
}

export interface Report {
  name: string;
  content: string;
}

export interface ScreenRoute {
  route: string;
  screen: string;
}

export const dependencies: Dependency[] = [
  { part: "0.3", provides: "UnitOfWork, AuditCollector and OutboxCollector interfaces", blocking: "Yes" },
  { part: "0.5A", provides: "Actor with resolved permissions", blocking: "Yes" },
  { part: "0.5B", provides: "ActionHistory interface, awaiting its audit-log implementation", blocking: "Yes" },
];

export const prerequisites = [
  "Part 0.5B checklist passed; all twenty enforcement tests green",
  "uow.run() commits and rolls back correctly",
  "ctx.audit.record() and ctx.outbox.emit() are callable but flush to nothing",
  "The boot warning about the no-op audit writer is still appearing — this part removes it",
];

export const deliverables = [
  "Two dx_ tables (plus delivery tracking table)",
  "The audit writer with its hash chain",
  "The outbox writer and relay",
  "The subscriber registry",
  "The chain verification job",
  "The AuditLogHistory implementation that completes Part 0.5B's SoD evaluator",
];

export const inspectionQueries: InspectionQuery[] = [
  {
    title: "1.1 Any existing audit or history table",
    language: "sql",
    code: `SELECT table_name FROM information_schema.tables
 WHERE table_schema='public'
   AND (table_name ILIKE '%audit%' OR table_name ILIKE '%history%'
        OR table_name ILIKE '%log%' OR table_name ILIKE '%trail%');`,
  },
  {
    title: "1.2 If one exists — its shape, volume and retention",
    language: "sql",
    code: `SELECT COUNT(*), MIN(<date_col>), MAX(<date_col>),
       pg_size_pretty(pg_total_relation_size('<audit_table>'))
  FROM <existing_audit_table>;`,
  },
  {
    title: "1.3 Do existing triggers already write history?",
    language: "sql",
    code: `SELECT event_object_table, trigger_name, action_statement
  FROM information_schema.triggers
 WHERE trigger_schema='public' AND action_statement ILIKE '%audit%';`,
  },
  {
    title: "1.4 Write volume estimate — this sizes partitioning",
    language: "sql",
    code: `SELECT relname, n_tup_ins + n_tup_upd + n_tup_del AS writes_since_stats_reset
  FROM pg_stat_user_tables ORDER BY 2 DESC LIMIT 15;`,
  },
];

export const reportQuestions: ReportQuestion[] = [
  { question: "Existing audit table?", answer: "", consequence: "Keeps running; new audit is separate" },
  { question: "Existing audit row count and growth", answer: "", consequence: "Retention planning" },
  { question: "Trigger-based history?", answer: "", consequence: "Do not duplicate it" },
  { question: "Highest write-volume tables", answer: "", consequence: "Estimates dx_audit_log growth" },
];

export const reuseChecks: ReuseCheckItem[] = [
  { searchFor: "Existing audit service", ifFound: "Leave it running; do not merge", ifNot: "Build per §4" },
  { searchFor: "crypto.createHash usage", ifFound: "Reuse the helper", ifNot: "Use Node crypto" },
  { searchFor: "BullMQ / job runner", ifFound: "Reuse for the relay", ifNot: "Add BullMQ, or use a cron for now" },
];

export const databaseTables: DatabaseTable[] = [
  {
    number: "3.1",
    name: "dx_audit_log",
    purpose: "Audit log — append only, hash chained",
    schema: `CREATE TABLE dx_audit_log (
  id              BIGSERIAL PRIMARY KEY,
  -- what
  entity          VARCHAR(80)  NOT NULL,
  entity_id       BIGINT       NOT NULL,
  action          VARCHAR(40)  NOT NULL,     -- CREATE|UPDATE|DELETE|SUBMIT|APPROVE|REJECT|
                                              -- POST|REVERSE|EXPORT|PRINT|VIEW_SENSITIVE|
                                              -- PERMISSION_DENIED|LOGIN|...
  field_name      VARCHAR(80),                -- set for field-level change rows
  old_value       TEXT,
  new_value       TEXT,
  -- business context
  document_type   VARCHAR(40),
  project_id      BIGINT,
  company_id      BIGINT,
  reason          TEXT,                       -- mandatory for overrides, reversals, deletions
  -- who
  actor_user_id   BIGINT       NOT NULL,
  impersonated_by BIGINT,
  acting_for      BIGINT,                     -- delegation attribution
  -- where and when
  correlation_id  UUID         NOT NULL,
  ip_address      VARCHAR(45),
  user_agent      VARCHAR(300),
  device_class    VARCHAR(20),
  occurred_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  -- integrity
  prev_hash       CHAR(64)     NOT NULL,
  row_hash        CHAR(64)     NOT NULL
);

CREATE INDEX ix_dx_audit_entity  ON dx_audit_log (entity, entity_id, occurred_at DESC);
CREATE INDEX ix_dx_audit_actor   ON dx_audit_log (actor_user_id, occurred_at DESC);
CREATE INDEX ix_dx_audit_corr    ON dx_audit_log (correlation_id);
CREATE INDEX ix_dx_audit_project ON dx_audit_log (project_id, occurred_at DESC);
CREATE INDEX ix_dx_audit_action  ON dx_audit_log (action, occurred_at DESC);
-- Supports the SoD query: "did this user perform this action on this document?"
CREATE INDEX ix_dx_audit_sod     ON dx_audit_log (actor_user_id, action, document_type, entity_id);

-- Immutability enforced at the database, not by convention.
CREATE RULE dx_audit_no_update AS ON UPDATE TO dx_audit_log DO INSTEAD NOTHING;
CREATE RULE dx_audit_no_delete AS ON DELETE TO dx_audit_log DO INSTEAD NOTHING;`,
  },
  {
    number: "3.2",
    name: "dx_event_outbox",
    purpose: "Event outbox",
    schema: `CREATE TABLE dx_event_outbox (
  id              BIGSERIAL PRIMARY KEY,
  event_type      VARCHAR(80)  NOT NULL,     -- module.entity.pastTense
  aggregate_type  VARCHAR(40)  NOT NULL,
  aggregate_id    BIGINT       NOT NULL,
  project_id      BIGINT,
  company_id      BIGINT,
  payload         JSONB        NOT NULL,
  correlation_id  UUID         NOT NULL,
  causation_id    UUID,                       -- the event that caused this one
  actor_user_id   BIGINT,
  occurred_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  -- delivery
  status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',  -- PENDING|PROCESSING|DONE|FAILED|DEAD
  attempts        SMALLINT     NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ,
  last_error      TEXT,
  processed_at    TIMESTAMPTZ
);

CREATE INDEX ix_dx_outbox_pending ON dx_event_outbox (status, next_attempt_at, id)
  WHERE status IN ('PENDING','FAILED');
CREATE INDEX ix_dx_outbox_agg ON dx_event_outbox (aggregate_type, aggregate_id);
CREATE INDEX ix_dx_outbox_type ON dx_event_outbox (event_type, occurred_at DESC);`,
  },
  {
    number: "3.3",
    name: "dx_outbox_delivery",
    purpose: "Subscriber delivery record — at-least-once needs idempotency tracking",
    schema: `CREATE TABLE dx_outbox_delivery (
  id              BIGSERIAL PRIMARY KEY,
  event_id        BIGINT       NOT NULL,
  subscriber      VARCHAR(100) NOT NULL,
  idempotency_key VARCHAR(160) NOT NULL,
  status          VARCHAR(20)  NOT NULL,     -- DONE | FAILED
  attempts        SMALLINT     NOT NULL DEFAULT 1,
  error           TEXT,
  delivered_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_dx_delivery UNIQUE (idempotency_key)
);
CREATE INDEX ix_dx_delivery_event ON dx_outbox_delivery (event_id);`,
  },
];

export const auditCollectorCode = `// dx/platform/audit/audit-collector.ts

export interface AuditEntry {
  entity: string;
  entityId: number;
  action: string;
  fieldName?: string;
  oldValue?: unknown;
  newValue?: unknown;
  /** whole-object before/after; expanded into field rows by the writer */
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  documentType?: string;
  projectId?: number;
  companyId?: number;
  reason?: string;
  context?: Record<string, unknown>;
}

export class AuditCollector {
  private entries: AuditEntry[] = [];
  record(e: AuditEntry): void { this.entries.push(e); }
  drain(): AuditEntry[] { const e = this.entries; this.entries = []; return e; }
  get count(): number { return this.entries.length; }
}`;

export const auditWriterCode = `@Injectable()
export class AuditWriter {
  /** Called by UnitOfWork INSIDE the transaction, before commit. */
  async flush(ctx: UowContext): Promise<void> {
    const entries = ctx.audit.drain();
    if (!entries.length) return;

    const rows = entries.flatMap(e => this.expand(e));

    // One advisory lock keeps the chain serial without blocking the whole table.
    // Transaction-scoped: released automatically on commit or rollback.
    await ctx.tx.query('SELECT pg_advisory_xact_lock($1)', [AUDIT_CHAIN_LOCK]);

    let prev = await ctx.tx
      .query('SELECT row_hash FROM dx_audit_log ORDER BY id DESC LIMIT 1')
      .then(r => r[0]?.row_hash ?? GENESIS_HASH);

    for (const row of rows) {
      const canonical = canonicalJson({
        entity: row.entity, entityId: row.entityId, action: row.action,
        fieldName: row.fieldName ?? null,
        oldValue: row.oldValue ?? null, newValue: row.newValue ?? null,
        documentType: row.documentType ?? null,
        projectId: row.projectId ?? null,
        reason: row.reason ?? null,
        actorUserId: ctx.actor.userId,
        impersonatedBy: ctx.actor.ctx.impersonatedBy ?? null,
        correlationId: ctx.correlationId,
        occurredAt: ctx.now.toISOString(),
        prevHash: prev,
      });
      const hash = sha256(canonical);

      await ctx.tx.query(
        \`INSERT INTO dx_audit_log
           (entity, entity_id, action, field_name, old_value, new_value,
            document_type, project_id, company_id, reason,
            actor_user_id, impersonated_by, acting_for,
            correlation_id, ip_address, user_agent, device_class,
            occurred_at, prev_hash, row_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)\`,
        [row.entity, row.entityId, row.action, row.fieldName ?? null,
         stringify(row.oldValue), stringify(row.newValue),
         row.documentType ?? null, row.projectId ?? null, row.companyId ?? null,
         row.reason ?? null,
         ctx.actor.userId, ctx.actor.ctx.impersonatedBy ?? null,
         ctx.actor.actingFor[0]?.userId ?? null,
         ctx.correlationId, ctx.actor.ctx.ip, ctx.actor.ctx.userAgent ?? null,
         ctx.actor.ctx.deviceClass,
         ctx.now, prev, hash]);

      prev = hash;
    }
  }

  /** A before/after pair becomes one row per changed field. */
  private expand(e: AuditEntry): AuditRow[] {
    if (!e.before && !e.after) return [{ ...e } as AuditRow];

    const keys = new Set([...Object.keys(e.before ?? {}), ...Object.keys(e.after ?? {})]);
    const changed = [...keys].filter(k =>
      !AUDIT_IGNORE_FIELDS.has(k) &&
      !deepEqual(e.before?.[k], e.after?.[k]));

    if (!changed.length) return [];                    // nothing material changed

    return changed.map(k => ({
      ...e, fieldName: k,
      oldValue: redactIfSensitive(e.entity, k, e.before?.[k]),
      newValue: redactIfSensitive(e.entity, k, e.after?.[k]),
    })) as AuditRow[];
  }
}

const AUDIT_IGNORE_FIELDS = new Set(['updated_at','updatedAt','row_version','rowVersion','_meta']);`;

export const chainVerifierCode = `@Injectable()
export class AuditChainVerifier {
  /** Nightly, and on demand from the admin console. */
  async verify(fromId = 0, batch = 10_000): Promise<VerificationResult> {
    let prev = fromId === 0
      ? GENESIS_HASH
      : await this.repo.hashOf(fromId - 1) ?? GENESIS_HASH;

    let cursor = fromId, checked = 0;

    while (true) {
      const rows = await this.repo.page(cursor, batch);
      if (!rows.length) break;

      for (const r of rows) {
        if (r.prev_hash !== prev)
          return this.fail(r, 'PREV_HASH_MISMATCH', { expected: prev, found: r.prev_hash });

        const recomputed = sha256(canonicalJson(toCanonical(r, prev)));
        if (recomputed !== r.row_hash)
          return this.fail(r, 'ROW_HASH_MISMATCH', { expected: r.row_hash, recomputed });

        prev = r.row_hash;
        checked++;
      }
      cursor = rows.at(-1)!.id + 1;
    }
    return { valid: true, rowsChecked: checked, lastHash: prev };
  }

  private async fail(row: AuditRow, code: string, ctx: object): Promise<VerificationResult> {
    // A broken chain is a P1 security incident, not a warning.
    await this.alerts.raiseP1('AUDIT_CHAIN_BROKEN', {
      code, auditId: row.id, occurredAt: row.occurred_at,
      entity: row.entity, entityId: row.entity_id, actor: row.actor_user_id, ...ctx,
      message: \`Audit chain integrity failed at row \${row.id}. Records at or after this point cannot be trusted.\`,
    });
    return { valid: false, brokenAt: row.id, code, ...ctx };
  }
}`;

export const outboxCollectorCode = `export class OutboxCollector {
  private events: PendingEvent[] = [];
  emit(type: string, payload: Record<string, unknown>): void {
    this.events.push({ type, payload, at: new Date() });
  }
  drain(): PendingEvent[] { const e = this.events; this.events = []; return e; }
}`;

export const outboxWriterCode = `@Injectable()
export class OutboxWriter {
  /** Called by UnitOfWork INSIDE the transaction. */
  async flush(ctx: UowContext): Promise<void> {
    const events = ctx.outbox.drain();
    if (!events.length) return;

    for (const e of events) {
      const spec = EVENT_REGISTRY[e.type];
      if (!spec)
        throw new ConfigError('UNREGISTERED_EVENT_TYPE', {
          eventType: e.type,
          remedy: \`Register "\${e.type}" in EVENT_REGISTRY before emitting it.\`,
        });

      await ctx.tx.query(
        \`INSERT INTO dx_event_outbox
           (event_type, aggregate_type, aggregate_id, project_id, company_id,
            payload, correlation_id, causation_id, actor_user_id, occurred_at, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'PENDING')\`,
        [e.type, spec.aggregateType,
         e.payload[spec.aggregateIdField] ?? e.payload.id ?? 0,
         e.payload.projectId ?? null, e.payload.companyId ?? null,
         e.payload, ctx.correlationId, ctx.causationId ?? null,
         ctx.actor.userId, ctx.now]);
    }
  }
}`;

export const outboxRelayCode = `@Injectable()
export class OutboxRelay {
  @Cron('*/5 * * * * *')                    // every five seconds
  async relay(): Promise<void> {
    // SKIP LOCKED lets several application nodes relay concurrently without collision.
    const batch = await this.db.query(\`
      UPDATE dx_event_outbox
         SET status = 'PROCESSING', attempts = attempts + 1
       WHERE id IN (
         SELECT id FROM dx_event_outbox
          WHERE status IN ('PENDING','FAILED')
            AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
          ORDER BY id
          LIMIT 200
          FOR UPDATE SKIP LOCKED)
      RETURNING *\`);

    for (const event of batch) {
      const subscribers = SUBSCRIBER_REGISTRY[event.event_type] ?? [];

      if (!subscribers.length && !EVENT_REGISTRY[event.event_type]?.uiOnly) {
        // An event nobody consumes is usually a wiring mistake, not a design choice.
        await this.markDone(event.id);
        this.logger.warn({ eventType: event.event_type, eventId: event.id },
          'Event has no subscriber and is not marked uiOnly');
        continue;
      }

      let allOk = true;
      for (const sub of subscribers) {
        const key = \`\${sub.name}:\${event.id}\`;

        // At-least-once delivery: the subscriber may have run and then the relay crashed.
        if (await this.deliveries.exists(key)) continue;

        try {
          await sub.handle(toDomainEvent(event));
          await this.deliveries.recordSuccess(event.id, sub.name, key);
        } catch (err) {
          allOk = false;
          await this.deliveries.recordFailure(event.id, sub.name, key, err);
          this.logger.error({ err, eventId: event.id, subscriber: sub.name },
            'Subscriber failed');
        }
      }

      if (allOk) { await this.markDone(event.id); continue; }

      const backoff = Math.min(2 ** event.attempts, 3600);      // seconds, capped at an hour
      const dead = event.attempts >= 10;
      await this.markFailed(event.id, backoff, dead);

      if (dead)
        await this.alerts.raiseP1('OUTBOX_EVENT_DEAD', {
          eventId: event.id, eventType: event.event_type,
          attempts: event.attempts, lastError: event.last_error,
          message: 'An event failed 10 delivery attempts and will not be retried automatically.',
        });
    }
  }
}`;

export const eventRegistryCode = `export interface EventSpec {
  aggregateType: string;
  aggregateIdField: string;
  description: string;
  /** true when no backend subscriber is expected — the event exists to drive the UI */
  uiOnly?: boolean;
  /** payload fields required; validated on emit in development */
  requiredFields: string[];
}

export const EVENT_REGISTRY: Record<string, EventSpec> = {
  'auth.session.revoked': {
    aggregateType: 'session', aggregateIdField: 'sessionId',
    description: 'A session was revoked; connected sockets must close.',
    requiredFields: ['sessionId','userId','reason'],
  },
  'permission.invalidated': {
    aggregateType: 'user', aggregateIdField: 'userId',
    description: 'A user\\'s permissions changed; clients must re-fetch their menu.',
    requiredFields: ['userIds'],
  },
  // Each later part registers its own events here.
};`;

export const auditLogHistoryCode = `@Injectable()
export class AuditLogHistory implements ActionHistory {
  async didUserPerform(userId: number, action: string, scope: HistoryScope): Promise<boolean> {
    const where = ['actor_user_id = $1', 'action = $2'];
    const params: unknown[] = [userId, action.toUpperCase()];

    if (scope.documentType) { where.push(\`document_type = $\${params.push(scope.documentType)}\`); }
    if (scope.documentId)   { where.push(\`entity_id = $\${params.push(scope.documentId)}\`); }
    if (scope.projectId)    { where.push(\`project_id = $\${params.push(scope.projectId)}\`); }
    if (scope.since)        { where.push(\`occurred_at >= $\${params.push(scope.since)}\`); }

    const { rows } = await this.db.query(
      \`SELECT 1 FROM dx_audit_log WHERE \${where.join(' AND ')} LIMIT 1\`, params);
    return rows.length > 0;
  }
}`;

export const apiEndpoints: ApiEndpoint[] = [
  { number: 1, method: "GET", path: "/api/dx/v1/audit", permission: "admin.audit.view" },
  { number: 2, method: "GET", path: "/api/dx/v1/audit/entity/:entity/:id", permission: "entity's own view key" },
  { number: 3, method: "GET", path: "/api/dx/v1/audit/correlation/:id", permission: "admin.audit.view" },
  { number: 4, method: "POST", path: "/api/dx/v1/admin/audit/verify", permission: "admin.audit.verify" },
  { number: 5, method: "GET", path: "/api/dx/v1/admin/outbox", permission: "admin.outbox.view" },
  { number: 6, method: "POST", path: "/api/dx/v1/admin/outbox/:id/retry", permission: "admin.outbox.retry" },
];

export const businessRules: BusinessRule[] = [
  { code: "UNREGISTERED_EVENT_TYPE", condition: "emit() with an unregistered type", severity: "BLOCK", message: "Register '{type}' in EVENT_REGISTRY before emitting it." },
  { code: "EVENT_PAYLOAD_INCOMPLETE", condition: "Required payload field missing", severity: "BLOCK", message: "Event '{type}' requires {fields}." },
  { code: "AUDIT_CHAIN_BROKEN", condition: "Verification failure", severity: "P1", message: "Audit chain integrity failed at row {id}." },
  { code: "OUTBOX_EVENT_DEAD", condition: "10 failed attempts", severity: "P1", message: "Event {id} failed 10 delivery attempts." },
  { code: "OUTBOX_LAG_EXCEEDED", condition: "Oldest pending > 5 minutes", severity: "P1", message: "Outbox lag is {n} minutes. Events are not reaching subscribers." },
];

export const screenRoutes: ScreenRoute[] = [
  { route: "/admin/audit", screen: "Audit explorer: filter by entity, actor, action, project, date, correlation" },
  { route: "/admin/audit/verify", screen: "Chain verification with last run, result, broken-row detail" },
  { route: "/admin/outbox", screen: "Event monitor: pending count, lag, failed and dead events with retry" },
];

export const reports: Report[] = [
  { name: "Audit trail", content: "Filtered rows with actor, action, field, before, after, reason" },
  { name: "Entity history", content: "One document's complete change history" },
  { name: "User activity", content: "Everything one user did in a period — the report an investigation starts with" },
  { name: "Correlation trace", content: "Every row and event for one request" },
  { name: "Chain verification history", content: "Run date, rows checked, result" },
  { name: "Event delivery report", content: "By type: volume, success rate, average latency" },
];

export const outboxHealthView = `CREATE VIEW vw_dx_q_outbox_health AS
SELECT COUNT(*) FILTER (WHERE status = 'PENDING')                       AS pending,
       COUNT(*) FILTER (WHERE status = 'FAILED')                        AS failed,
       COUNT(*) FILTER (WHERE status = 'DEAD')                          AS dead,
       EXTRACT(EPOCH FROM (NOW() - MIN(occurred_at) FILTER
              (WHERE status IN ('PENDING','FAILED'))))                  AS lag_seconds,
       COUNT(*) FILTER (WHERE processed_at > NOW() - INTERVAL '1 hour') AS processed_last_hour
  FROM dx_event_outbox;`;

export const auditHealthView = `CREATE VIEW vw_dx_q_audit_health AS
SELECT (SELECT COUNT(*) FROM dx_audit_log WHERE occurred_at > NOW() - INTERVAL '24 hours')
                                                                          AS rows_24h,
       (SELECT COUNT(*) FROM dx_audit_log
         WHERE action = 'PERMISSION_DENIED' AND occurred_at > NOW() - INTERVAL '24 hours')
                                                                          AS denials_24h,
       (SELECT last_verified_id FROM dx_audit_verification_state)         AS verified_upto,
       (SELECT MAX(id) FROM dx_audit_log)                                 AS latest_id,
       (SELECT verified_at FROM dx_audit_verification_state)              AS last_verified_at;`;

export const auditTests: TestCase[] = [
  { id: "D1", case: "Create through a service", expected: "Audit row with actor, correlation id, IP", starred: true },
  { id: "D2", case: "Update three fields", expected: "Three rows, one per changed field", starred: true },
  { id: "D3", case: "Update touching only updated_at", expected: "Zero rows", starred: true },
  { id: "D4", case: "Transaction rolls back", expected: "No audit row persists", starred: true },
  { id: "D5", case: "UPDATE dx_audit_log", expected: "Statement succeeds, row unchanged", starred: true },
  { id: "D6", case: "DELETE FROM dx_audit_log", expected: "Statement succeeds, row still present", starred: true },
  { id: "D7", case: "500 operations, then verify", expected: "Chain valid", starred: true },
  { id: "D8", case: "Tamper one row via superuser, verify", expected: "Fails, names that exact id", starred: true },
  { id: "D9", case: "Concurrent transactions", expected: "Chain stays serial and valid", starred: true },
  { id: "D10", case: "Password change", expected: "Hash appears in neither old nor new value", starred: true },
  { id: "D11", case: "Impersonated action", expected: "Both user ids recorded", starred: true },
  { id: "D12", case: "Delegated action", expected: "acting_for populated" },
];

export const outboxTests: TestCase[] = [
  { id: "O1", case: "Emit then commit", expected: "Exactly one outbox row" },
  { id: "O2", case: "Emit then roll back", expected: "Zero outbox rows", starred: true },
  { id: "O3", case: "Relay with a working subscriber", expected: "Delivered, marked DONE" },
  { id: "O4", case: "Subscriber throws", expected: "FAILED, retried with backoff", starred: true },
  { id: "O5", case: "Ten failures", expected: "DEAD, P1 raised", starred: true },
  { id: "O6", case: "Relay crashes after subscriber success", expected: "Replay does not double-execute", starred: true },
  { id: "O7", case: "Two relay instances concurrently", expected: "No event processed twice (SKIP LOCKED)", starred: true },
  { id: "O8", case: "Unregistered event type", expected: "UNREGISTERED_EVENT_TYPE at emit", starred: true },
  { id: "O9", case: "Registered type with no subscriber, not uiOnly", expected: "Warning logged; CI test fails", starred: true },
  { id: "O10", case: "Lag beyond five minutes", expected: "P1 raised" },
];

export const sodTests: TestCase[] = [
  { id: "S1", case: "User performs A, then attempts conflicting B on the same document", expected: "Refused, naming the rule", starred: true },
  { id: "S2", case: "Different user attempts B", expected: "Allowed", starred: true },
  { id: "S3", case: "Same user, different document", expected: "Allowed for SAME_DOCUMENT scope", starred: true },
  { id: "S4", case: "With an active exemption", expected: "Allowed, exemption use audited" },
];

export const performanceTests: PerformanceTest[] = [
  { id: "P1", case: "Transaction with 20 audit rows", budget: "Adds ≤ 30ms" },
  { id: "P2", case: "Relay batch of 200 events", budget: "≤ 2s" },
  { id: "P3", case: "Verify 100,000 rows", budget: "≤ 30s" },
  { id: "P4", case: "Entity history query, 10,000 rows on that entity", budget: "≤ 500ms" },
];

export const completionChecklist: ChecklistCategory[] = [
  {
    category: "Database",
    items: [
      "Both tables plus delivery table created; migration down verified ★",
      "Immutability rules present; update and delete leave rows unchanged ★",
      "ADR-006 records the partitioning decision with the volume estimate ★",
    ],
  },
  {
    category: "Audit",
    items: [
      "Written inside the transaction; rollback leaves nothing ★",
      "Field-level expansion; no row for ignored fields ★",
      "Sensitive values redacted — credential-pattern test passes ★",
      "Hash chain valid across 500 operations ★",
      "Deliberate tamper detected, naming the exact row ★",
      "Chain stays valid under concurrent transactions ★",
      "Impersonation and delegation both attributed ★",
      "Verification is incremental with stored last-good id",
      "Every audit read is itself audited ★",
    ],
  },
  {
    category: "Outbox",
    items: [
      "Written inside the transaction; rollback emits nothing ★",
      "Backoff and dead-lettering work; dead raises P1 ★",
      "Replay after a mid-delivery crash does not double-execute ★",
      "Two relay instances do not collide ★",
      "Unregistered event type refused at emit ★",
      "CI test: every emitted type registered, every registered type consumed or uiOnly ★",
      "Lag view exists and alerts beyond five minutes",
    ],
  },
  {
    category: "SoD completion",
    items: [
      "AuditLogHistory bound, replacing the 0.5B placeholder ★",
      "All four SoD tests pass — the deferred test from 0.5B now runs ★",
    ],
  },
  {
    category: "Platform",
    items: [
      "The no-op audit writer boot warning from Part 0.3 is gone ★",
      "UnitOfWork flushes both collectors inside the transaction",
    ],
  },
  {
    category: "Final confirmation",
    items: [
      "No existing table, column, relationship or row was altered. ★",
    ],
  },
];
