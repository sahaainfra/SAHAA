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

export interface SoDRule {
  code: string;
  actionA: string;
  actionB: string;
  scope: string;
  severity: string;
  description: string;
}

export interface BusinessRule {
  code: string;
  http: string;
  message: string;
}

export interface ApiEndpoint {
  number: number;
  method: string;
  path: string;
  handler: string;
}

export interface Event {
  event: string;
  aggregateType: string;
  idField: string;
  requiredFields: string;
  uiOnly: string;
}

export interface TestCase {
  id: string;
  test: string;
  expected: string;
  starred?: boolean;
}

export interface ChecklistItem {
  text: string;
  starred?: boolean;
}

export const dependencies: Dependency[] = [
  { part: "0.2", uses: "SCHEMA_MAP (columns, numberColumn, writable), LegacyWriteBridge" },
  { part: "0.3", uses: "UnitOfWork, AppError + ERRORS + i18n, IdempotencyInterceptor" },
  { part: "0.5A", uses: "Actor.can(), actor.authorityFor() (read inside the policy checks)" },
  { part: "0.5B", uses: "StandardPolicyChecks, SodEvaluator + its rule repository, dx_sod_rule, PermissionGuard, @RequiresPermission, @Actor()" },
  { part: "0.6", uses: "AuditLogHistory, EVENT_REGISTRY" },
  { part: "1.1A", uses: "Shapes, CompiledDefinition, StateMachine, RuleRunner, DeterminationEngine, computeContentHash, TEST_DOC, the Phase 0 contract (§0.5)" },
  { part: "1.1B", uses: "NumberingService.inUnitOfWork() / consume()" },
  { part: "1.1C", uses: "DocumentLockService (lockState, assertNotLocked, lock), DocumentLoader" },
];

export const prerequisites: Prerequisite[] = [
  { text: "StandardPolicyChecks.run() returns every reason and never consults isSuperAdmin." },
  { text: "SodEvaluator uses AuditLogHistory — the 0.6 swap is made; the deferred 0.5B test passes." },
  { text: "1.1A C1, 1.1B N4 and 1.1C L1 pass on TEST_DOC." },
  { text: "For each legacy document table, the status column and numberColumn are in LegacyWriteBridge.writable under an approved ADR. Find out now, not when a module is built." },
];

export const deliverables: Deliverable[] = [
  { text: "DocumentStore — the only code that reads or writes a document's tables; implements 1.1C's DocumentLoader" },
  { text: "DocumentVersionService — the ETag, and the conflict description" },
  { text: "ActionExecutor.execute() / executeIn() / available()" },
  { text: "RefusalRecorder, the boot policy check, generic SoD rules, WorkflowOrigin" },
  { text: "The projectFrom: 'any' guard mode and <DocumentActionBar/>; the two action routes are registered by 1.1E's controller, which calls execute and available" },
];

export const sodRules: SoDRule[] = [
  { code: "SOD-DOC-01", actionA: "SUBMIT", actionB: "APPROVE", scope: "SAME_DOCUMENT", severity: "BLOCK", description: "Whoever submitted a document may not approve it." },
  { code: "SOD-DOC-02", actionA: "CREATE", actionB: "APPROVE", scope: "SAME_DOCUMENT", severity: "BLOCK", description: "Whoever created a document may not approve it." },
  { code: "SOD-DOC-03", actionA: "MEASURE", actionB: "CERTIFY", scope: "SAME_DOCUMENT", severity: "BLOCK", description: "Whoever recorded a measurement may not certify it." },
  { code: "SOD-DOC-04", actionA: "APPROVE", actionB: "RELEASE_PAYMENT", scope: "SAME_DOCUMENT", severity: "BLOCK", description: "Whoever approved a payment may not release it." },
];

export const sodRulesSQL = `-- Bare audit action codes; SAME_DOCUMENT scope makes AuditLogHistory filter by this document's
-- type and id, so one rule serves every document type.
INSERT INTO dx_sod_rule (rule_code, action_a, action_b, scope, severity, description) VALUES
 ('SOD-DOC-01','SUBMIT','APPROVE','SAME_DOCUMENT','BLOCK','Whoever submitted a document may not approve it.'),
 ('SOD-DOC-02','CREATE','APPROVE','SAME_DOCUMENT','BLOCK','Whoever created a document may not approve it.'),
 ('SOD-DOC-03','MEASURE','CERTIFY','SAME_DOCUMENT','BLOCK','Whoever recorded a measurement may not certify it.'),
 ('SOD-DOC-04','APPROVE','RELEASE_PAYMENT','SAME_DOCUMENT','BLOCK','Whoever approved a payment may not release it.');`;

export const documentStoreCode = `@Injectable()
export class DocumentStore implements DocumentLoader {   // this part rebinds 1.1C's DOCUMENT_LOADER to it
  /** Header (legacy row + dx_ extension row merged into logical names via SCHEMA_MAP.columns) and
   *  lines. forUpdate: SELECT … FOR UPDATE on the header row, which serialises actions. */
  load(ctx: UowContext, def: CompiledDefinition<any, any>, id: number,
       o: { forUpdate: boolean }): Promise<DocContext<any, any> | null>;

  /** DocumentLoader: as stored, no determinations, in its own read-only transaction. */
  load(type: string, id: number): Promise<DocContext<any, any> | null>;

  /** Status (via states.physical) and document number only. Legacy columns go through
   *  LegacyWriteBridge; a unique violation on the number column becomes DUPLICATE_NUMBER. */
  writeState(ctx: UowContext, def: CompiledDefinition<any, any>,
             c: DocContext<any, any>, to: DocumentState): Promise<void>;

  /** Raw rows, header then lines by primary key — for DocumentVersionService only. */
  rowsOf(ctx: UowContext, def: CompiledDefinition<any, any>, id: number):
    Promise<Array<{ table: string; isDx: boolean; row: Record<string, unknown> }>>;
}`;

export const workflowOriginCode = `const WORKFLOW_ORIGIN = Symbol('workflow-origin');
export class WorkflowOrigin {
  private readonly brand = WORKFLOW_ORIGIN;
  private constructor(readonly instanceId: number, readonly taskId: number | null) {}
  /** Imported only by the workflow engine module — enforced by an import-boundary lint rule. */
  static issue(instanceId: number, taskId: number | null) { return new WorkflowOrigin(instanceId, taskId); }
}`;

export const versionServiceCode = `@Injectable()
export class DocumentVersionService {
  /** Per row: dx_ tables use row_version; legacy tables hash the whole row (0.3's rule, since
   *  0.2 found no version column to add). Combined in a fixed order. */
  async of(ctx: UowContext, def: CompiledDefinition<any, any>, id: number): Promise<string> {
    const rows = await this.store.rowsOf(ctx, def, id);
    return sha256(rows.map(r => r.isDx ? \`\${r.table}:\${r.row.row_version}\`
                                       : \`\${r.table}:\${sha256(canonicalJson(r.row))}\`).join('|'));
  }

  /** Context for CONCURRENT_MODIFICATION: who changed it and when (from the latest UPDATE or
   *  action audit row), and which fields changed since the version the client holds — known only
   *  by name, from audit rows after the client's read. */
  async describeConflict(ctx: UowContext, def: CompiledDefinition<any, any>, id: number,
                         clientVersion: string): Promise<{ user: string; time: Date; changedFields: string[] }>;
}`;

export const executeCode = `@Injectable()
export class ActionExecutor {
  /** API entry point: its own unit of work. */
  async execute(actor: Actor, type: string, id: number, code: string,
                input: ActionInput, opts: ExecOpts): Promise<ActionResult> {
    try {
      return await this.numbering.inUnitOfWork(actor, (ctx, allocate) =>
        this.executeIn(ctx, allocate, type, id, code, input, opts));
    } catch (e) {
      if (isRefusal(e)) await this.refusals.record(actor, type, id, code, e as AppError);
      throw e;
    }
  }

  /** For callers already inside a unit of work — the workflow engine. Same transaction. */
  async executeIn(ctx: UowContext, allocate: Allocator, type: string, id: number, code: string,
                  input: ActionInput, opts: ExecOpts): Promise<ActionResult> {
    const actor = ctx.actor;
    const def = registryGet(type);
    const action = def.actions.find(a => a.code === code);
    if (!action) throw new AppError('ACTION_UNKNOWN', { documentType: type, action: code });
    const fromEngine = opts.origin instanceof WorkflowOrigin;

    // 1 ── Load with a row lock.
    const c = await this.store.load(ctx, def, id, { forUpdate: true });

    // 2 ── Visibility first: not visible is 404, never 403.
    if (!c || !actor.can(\`\${def.permissionPrefix}.view\`, c.header.projectId ?? undefined))
      throw new AppError('NOT_FOUND', { documentType: type, id });
    if (def.projectScoped && c.header.projectId == null)
      throw new AppError('PROJECT_CONTEXT_MISSING', { documentType: type, id });

    // 3 ── Workflow-only actions: only the engine.
    if (action.invokedBy === 'WORKFLOW' && !fromEngine)
      throw new AppError('ACTION_WORKFLOW_ONLY', { action: action.label });

    // 4 ── Offered in this state?
    const from = def.states.stateOf(c.header);
    if (!action.from.includes(from))
      throw new AppError('STATE_TRANSITION_INVALID', { action: code, actionLabel: action.label,
        state: from, allowed: def.states.actionsFrom(from) });

    // 5 ── Concurrency. Every API action requires If-Match (conventions §6). The engine holds the
    //      row lock in its own transaction and checks content with its tamper hash instead.
    if (!fromEngine) {
      if (!opts.ifMatch) throw new AppError('PRECONDITION_REQUIRED', {});
      if (await this.versions.of(ctx, def, id) !== opts.ifMatch)
        throw new AppError('CONCURRENT_MODIFICATION',
          await this.versions.describeConflict(ctx, def, id, opts.ifMatch));
    }

    // 6 ── Locks. Content-freezing: only allowedWhenLocked actions may run on a locked document.
    const lockState = await this.locks.lockState(ctx, type, id, c.header);
    if (lockState && !action.allowedWhenLocked) throw new AppError(lockState.code, lockState.context);
    const hashBefore = lockState ? computeContentHash(def, c) : null;

    // 7 ── Phase 0's policies: permission, value authority, self-approval, SoD, impersonation, device.
    const reasons = await this.policy.run(this.recordLike(def, c), actor, this.policyOpts(def, action));
    if (reasons.length) throw await this.policyError(ctx, reasons, def, c);

    // 8 ── Required input.
    if (action.requiresComment && !input.comment?.trim())
      throw new AppError('COMMENT_REQUIRED', { action: action.label });
    if (action.requiresReason && !action.requiresReason.options.includes(input.reasonCode ?? ''))
      throw new AppError('REASON_REQUIRED', { action: action.label, options: action.requiresReason.options });

    // 9 ── Precondition, then the definition's rules for this action.
    const pre = action.precondition?.(c, actor);
    if (pre) throw new AppError(pre.code, pre.context ?? {});
    await this.rules.runOrThrow(ctx, def.validations, c, code);

    // 10 ── Target, against the derived state machine.
    const to = typeof action.to === 'string' ? action.to : action.to.pick(c);
    def.states.assert(from, to, code);

    // 11 ── Number, if this is the allocating action.
    const numberBefore = c.header.documentNumber;
    if (def.numbering.allocateOn === code && !numberBefore) {
      const a = await allocate({ seriesCode: def.numbering.seriesCode, documentType: type,
        projectId: def.numbering.projectScoped ? c.header.projectId : null });
      c.header.documentNumber = a.number;
      await this.numbering.consume(ctx, a.allocationId, id);
    }

    // 12 ── State; then effects in a fixed order: the action's own, workflow, posting.
    await this.store.writeState(ctx, def, c, to);
    await action.effect?.(ctx, c, input);
    if (action.startsWorkflow)  await this.workflow.start(ctx, def, c, code);
    if (action.triggersPosting) await this.posting.post(ctx, def, c, code);

    // 13 ── Content after the action, as stored. Locking hashes this, never the in-memory copy
    //       an effect may have left stale; a locked-state action must not have moved it.
    const stored = await this.store.load(ctx, def, id, { forUpdate: false });
    if (hashBefore && computeContentHash(def, stored!) !== hashBefore)
      throw new AppError('LOCKED_CONTENT_CHANGED', { action: action.label });
    if (action.locks) await this.locks.lock(ctx, def, stored!, action.locks.reason, action.locks.correctionPath);

    // 14 ── Audit and event. No before/after objects: 0.6 expands those per changed field and
    //       writes NOTHING when nothing changed, which would lose a same-state action (MEASURE)
    //       and the SoD evidence with it. One explicit row, always.
    ctx.audit.record({ entity: type, entityId: id, action: code, documentType: type,
      projectId: c.header.projectId ?? undefined, fieldName: 'status',
      oldValue: from, newValue: to, reason: joinReason(input.reasonCode, input.comment) });
    if (c.header.documentNumber !== numberBefore)
      ctx.audit.record({ entity: type, entityId: id, action: code, documentType: type,
        projectId: c.header.projectId ?? undefined, fieldName: 'documentNumber',
        oldValue: numberBefore, newValue: c.header.documentNumber });
    ctx.outbox.emit('document.action', { documentType: type, documentId: id,
      projectId: c.header.projectId, action: code, from, to, actorId: actor.userId });

    return { documentId: id, state: to, number: c.header.documentNumber,
             version: await this.versions.of(ctx, def, id) };
  }
}`;

export const availableCode = `async available(ctx: UowContext, def: CompiledDefinition<any, any>, c: DocContext<any, any>,
                locale: string): Promise<AvailableAction[]> {
  const state = def.states.stateOf(c.header);
  const lock = await this.locks.lockState(ctx, def.type, c.header.id!, c.header);  // incl. legacy
  const out: AvailableAction[] = [];
  for (const a of def.actions) {
    if (!a.from.includes(state) || a.invokedBy === 'WORKFLOW') continue;   // not a button
    let err: { code: string; context?: object } | null = lock && !a.allowedWhenLocked ? lock : null;
    if (!err) {
      const reasons = await this.policy.run(this.recordLike(def, c), ctx.actor, this.policyOpts(def, a));
      if (reasons.length) { const e = await this.policyError(ctx, reasons, def, c); err = { code: e.code, context: e.context }; }
    }
    if (!err) err = a.precondition?.(c, ctx.actor) ?? null;
    out.push({ code: a.code, label: a.label, available: !err, reasonCode: err?.code ?? null,
               reason: err ? this.i18n.translate(err.code, err.context ?? {}, locale) : null,
               requiresComment: !!a.requiresComment, reasonOptions: a.requiresReason?.options,
               destructive: !!a.destructive });
  }
  return out;
}`;

export const apiEndpoints: ApiEndpoint[] = [
  { number: 1, method: "GET", path: "/api/dx/v1/documents/:type/:id/actions", handler: "available()" },
  { number: 2, method: "POST", path: "/api/dx/v1/documents/:type/:id/actions/:code", handler: "execute(); If-Match and Idempotency-Key required" },
];

export const businessRules: BusinessRule[] = [
  { code: "ACTION_UNKNOWN", http: "400", message: "That action does not exist for {documentType}." },
  { code: "ACTION_WORKFLOW_ONLY", http: "403", message: "{action} is taken from your approvals inbox, not from here." },
  { code: "COMMENT_REQUIRED", http: "422", message: "{action} needs a comment explaining the decision." },
  { code: "PROJECT_CONTEXT_MISSING", http: "422", message: "This document must belong to a project." },
  { code: "SELF_APPROVAL_NOT_PERMITTED", http: "403", message: "You created this {documentType}, so {actionLabel} must be done by someone else." },
  { code: "LOCKED_CONTENT_CHANGED", http: "500", message: "{action} would change a locked document. — definition defect" },
  { code: "ENGINE_NOT_BUILT", http: "500", message: "This step is not available yet ({engine})." },
  { code: "DUPLICATE_NUMBER", http: "500", message: "See 1.1B" },
];

export const events: Event[] = [
  { event: "document.action", aggregateType: "document", idField: "documentId", requiredFields: "documentType, documentId, projectId, action, from, to, actorId", uiOnly: "true until 1.2/1.5/1.6 subscribe" },
];

export const testCases: TestCase[] = [
  { id: "A1", test: "POST from DRAFT", expected: "STATE_TRANSITION_INVALID, allowed actions listed" },
  { id: "A2", test: "Action without its key", expected: "PERMISSION_DENIED; a WRITE_REFUSED row exists afterwards" },
  { id: "A3", test: "Action on a document in a project the user is not on", expected: "404; no refusal row", starred: true },
  { id: "A4", test: "No If-Match", expected: "428" },
  { id: "A5", test: "One Idempotency-Key replayed 10× concurrently", expected: "One execution; ten identical responses", starred: true },
  { id: "A6", test: "Two users act with the same If-Match simultaneously", expected: "One succeeds, one CONCURRENT_MODIFICATION naming the other", starred: true },
  { id: "A7", test: "SUBMIT (allocates) whose workflow double throws", expected: "Rolled back; the FAST number VOIDED with the error code", starred: true },
  { id: "A8", test: "User A creates, user B submits, B's APPROVE via WorkflowOrigin", expected: "SOD_CONFLICT citing SOD-DOC-01 with its description", starred: true },
  { id: "A8b", test: "Creator's APPROVE via WorkflowOrigin", expected: "SELF_APPROVAL_NOT_PERMITTED" },
  { id: "A9", test: "Super Admin submits (someone else created) then approves", expected: "SOD_CONFLICT", starred: true },
  { id: "A10", test: "execute(…'APPROVE'…) without a WorkflowOrigin (the API path; the route itself is re-tested in 1.1E)", expected: "ACTION_WORKFLOW_ONLY, and a WRITE_REFUSED row", starred: true },
  { id: "A11", test: "SUBMIT with the real stub", expected: "ENGINE_NOT_BUILT; rolled back" },
  { id: "A12", test: "Code search for status writes outside DocumentStore.writeState", expected: "None", starred: true },
  { id: "A13", test: "For each unavailable action — including a legacy-frozen document — available() reason vs the thrown message", expected: "Byte-identical", starred: true },
  { id: "A14", test: "Approver with no authority row", expected: "APPROVAL_AUTHORITY_EXCEEDED, limit: none" },
  { id: "A15", test: "Total exactly at the limit", expected: "Allowed" },
  { id: "A16", test: "Approval while impersonating", expected: "IMPERSONATION_CANNOT_PERFORM_THIS_ACTION" },
  { id: "A17", test: "PAY on a POSTED (locked) document", expected: "Succeeds — allowedWhenLocked", starred: true },
  { id: "A18", test: "CANCEL-like action without allowedWhenLocked on a locked document", expected: "DOCUMENT_LOCKED with correction path", starred: true },
  { id: "A19", test: "POST whose effect changes the rate after the state write", expected: "The lock row's content hash equals a fresh stored load's hash", starred: true },
  { id: "A20", test: "Action with from === to and no number", expected: "Still exactly one audit row with fieldName: 'status'", starred: true },
  { id: "A21", test: "executeIn inside an outer unit of work that then throws", expected: "The action is rolled back with it" },
  { id: "A22", test: "Route guard any: user holding test.doc.view on no project", expected: "403 at the guard; on one project, passes the guard" },
  { id: "B1", test: "APPROVE without preventSelfApproval", expected: "Boot fails", starred: true },
  { id: "B2", test: "sodAction on a code no rule names", expected: "Boot fails", starred: true },
  { id: "L8r", test: "1.1C's L8 with DocumentStore as the loader", expected: "Detects the change", starred: true },
  { id: "I1", test: "Schema fingerprint before/after, excluding dx_ tables", expected: "Identical", starred: true },
];

export const completionChecklist: ChecklistItem[] = [
  { text: "No SoD list, authority comparison or idempotency store in this part's code", starred: true },
  { text: "DocumentStore is the only writer of document tables (A12)", starred: true },
  { text: "A3, A5, A6, A7, A8, A9, A10, A13 pass with evidence", starred: true },
  { text: "A17–A20 prove the lock and audit behaviour", starred: true },
  { text: "executeIn exists for 1.2C; execute wraps it" },
  { text: "Guard any mode added and recorded as a Phase 0 code change" },
  { text: "Four SoD rules seeded; B1, B2 stop the boot", starred: true },
  { text: "Status and number columns bridge-writable under recorded ADRs", starred: true },
  { text: "No existing table, column, relationship or row was altered.", starred: true },
];
