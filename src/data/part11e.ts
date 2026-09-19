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

export interface BusinessRule {
  code: string;
  http: string;
  message: string;
}

export interface ApiEndpoint {
  number: number;
  method: string;
  path: string;
  headers: string;
}

export interface Event {
  event: string;
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
  { part: "0.2", uses: "LegacyWriteBridge, SCHEMA_MAP.columns" },
  { part: "0.3", uses: "UnitOfWork, AppError, IdempotencyInterceptor, envelope, $filter parser, pagination" },
  { part: "0.5A/B", uses: "Actor, QueryFilter.apply(entity, where, actor), FieldMasker.apply(), actor.restrictionsFor(), @RequiresPermission, @Actor()" },
  { part: "0.6", uses: "EVENT_REGISTRY" },
  { part: "1.1A", uses: "Shapes, RuleRunner, DeterminationEngine (writes), ENTITY_SCOPES registration, TEST_DOC, the Phase 0 contract (§0.5)" },
  { part: "1.1B", uses: "NumberingService.inUnitOfWork() / consume()" },
  { part: "1.1C", uses: "DocumentLockService.assertNotLocked() / lockState()" },
  { part: "1.1D", uses: "DocumentStore, DocumentVersionService, ActionExecutor, RefusalRecorder, the guard's any mode" },
];

export const prerequisites: Prerequisite[] = [
  { text: "1.1D's tests pass, including A3 (404), A6 (concurrency), A13 (same sentence), A22 (guard)." },
  { text: "QueryFilter.apply('TEST_DOC', …) changes the SQL — check the query log, not the code. A post-filter still transfers the whole table and gets page two's total wrong." },
  { text: "FieldMasker.apply() removes HIDE fields from the object rather than nulling them." },
];

export const deliverables: Deliverable[] = [
  { text: "DocumentService.create / update / read / list / actionsFor" },
  { text: "dx_document_draft and DraftService — save, list, get, discard, editors, activate" },
  { text: "DocumentController(def) — a module's whole REST surface in one line" },
  { text: "The API_CONTRACT.md section 1.7's generated screens depend on" },
];

export const draftTableSQL = `CREATE TABLE dx_document_draft (
  id             BIGSERIAL PRIMARY KEY,
  document_type  VARCHAR(40)  NOT NULL,
  active_id      BIGINT,                     -- NULL = a new document not yet created
  owner_user_id  BIGINT       NOT NULL,
  project_id     BIGINT,                     -- for edits: copied from the record, never the client
  payload        JSONB        NOT NULL,      -- { header, lines } as the client holds them
  base_version   VARCHAR(80),                -- for edits: set by the SERVER at first save
  device_id      VARCHAR(100),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMPTZ  NOT NULL
);
-- Expression index: a plain UNIQUE treats NULL active_ids as distinct — one user could hold
-- several "new document" drafts of one type.
CREATE UNIQUE INDEX uq_dx_draft ON dx_document_draft (document_type, COALESCE(active_id, -1), owner_user_id);
CREATE INDEX ix_dx_draft_owner  ON dx_document_draft (owner_user_id, updated_at DESC);
CREATE INDEX ix_dx_draft_active ON dx_document_draft (document_type, active_id);
CREATE INDEX ix_dx_draft_expiry ON dx_document_draft (expires_at);`;

export const stripUnownedCode = `function stripUnowned(def: CompiledDefinition<any, any>, actor: Actor, incoming: DocPayload,
                      mode: 'CREATE' | 'UPDATE'): { payload: DocPayload; ignored: string[] } {
  const ignored: string[] = [];
  const drop = (p: string) => { if (deletePath(incoming, p)) ignored.push(p); };

  ['header.status','header.documentNumber','header.id','header.createdBy'].forEach(drop);
  drop(\`lines[].\${logicalParentKey(def)}\`);         // logical name, via SCHEMA_MAP.columns
  if (mode === 'UPDATE') drop('header.projectId');        // never moved between projects by a patch
  for (const d of def.determinations) d.writes.forEach(drop);

  // Restricted fields are removed, never applied — header and line entities both, '*' expanded.
  for (const [entity, prefix] of [[def.type, 'header'], [def.type + '_LINE', 'lines[]']] as const)
    for (const r of actor.restrictionsFor(entity))
      (r.field === '*' ? fieldsOf(incoming, prefix) : [r.field]).forEach(f => drop(\`\${prefix}.\${f}\`));

  return { payload: incoming, ignored };
}`;

export const createCode = `async create(actor: Actor, type: string, body: DocPayload,
             opts: { draftId?: number } = {}): Promise<WriteResult> {
  const def = registryGet(type);
  try {
    return await this.numbering.inUnitOfWork(actor, async (ctx, allocate) => {
      const projectId = body.header?.projectId ?? null;
      if (def.projectScoped && projectId == null) throw new AppError('PROJECT_CONTEXT_MISSING', { type });
      actor.assertCan(\`\${def.permissionPrefix}.create\`, def.projectScoped ? projectId : undefined);
      await this.projects.assertOpen(ctx, projectId);                          // PROJECT_CLOSED

      const { payload, ignored } = stripUnowned(def, actor, body, 'CREATE');
      let c = this.hydrate(def, payload, { createdBy: actor.userId, status: def.states.physical(def.initialState) });
      c = await this.determinations.run(ctx, def, c);
      await this.rules.runOrThrow(ctx, def.validations, c, 'CREATE');
      this.assertMandatory(def, c);                                            // before the database

      let allocation: Allocation | null = null;
      if (def.numbering.allocateOn === 'CREATE') {
        allocation = await allocate({ seriesCode: def.numbering.seriesCode, documentType: type,
          projectId: def.numbering.projectScoped ? projectId : null });
        c.header.documentNumber = allocation.number;
      }
      const id = await this.store.insert(ctx, def, c);
      if (allocation) await this.numbering.consume(ctx, allocation.allocationId, id);
      if (opts.draftId) await this.drafts.consume(ctx, opts.draftId, type, null);   // same transaction

      ctx.audit.record({ entity: type, entityId: id, action: 'CREATE', documentType: type,
                         projectId: projectId ?? undefined, after: auditable(c) });
      ctx.outbox.emit('document.created', { documentType: type, documentId: id, projectId });
      return { documentId: id, state: def.initialState, number: c.header.documentNumber,
               version: await this.versions.of(ctx, def, id), ignoredFields: ignored };
    });
  } catch (e) {
    if (isRefusal(e)) await this.refusals.record(actor, type, null, 'CREATE', e as AppError);
    throw e;
  }
}`;

export const updateCode = `async update(actor: Actor, type: string, id: number, patch: DocPayload,
             opts: { ifMatch?: string; draftId?: number }): Promise<WriteResult> {
  const def = registryGet(type);
  if (!opts.ifMatch) throw new AppError('PRECONDITION_REQUIRED', {});
  try {
    return await this.uow.run(actor, async ctx => {
      const c = await this.store.load(ctx, def, id, { forUpdate: true });
      if (!c || !actor.can(\`\${def.permissionPrefix}.view\`, c.header.projectId ?? undefined))
        throw new AppError('NOT_FOUND', { type, id });
      actor.assertCan(\`\${def.permissionPrefix}.update\`, c.header.projectId ?? undefined);
      await this.projects.assertOpen(ctx, c.header.projectId);

      if (await this.versions.of(ctx, def, id) !== opts.ifMatch)
        throw new AppError('CONCURRENT_MODIFICATION',
          await this.versions.describeConflict(ctx, def, id, opts.ifMatch!));
      await this.locks.assertNotLocked(ctx, type, id, c.header);
      const state = def.states.stateOf(c.header);
      if (!def.states.isEditable(state)) throw new AppError('DOCUMENT_NOT_EDITABLE', { type, state });

      const before = auditable(c);
      const { payload, ignored } = stripUnowned(def, actor, patch, 'UPDATE');
      const changed = applyPatch(c, payload);                     // changed paths, 'lines[].x' form
      const after = await this.determinations.run(ctx, def, c, changed);
      await this.rules.runOrThrow(ctx, def.validations, after, 'UPDATE');
      this.assertMandatory(def, after);
      await this.store.update(ctx, def, id, after);
      if (opts.draftId) await this.drafts.consume(ctx, opts.draftId, type, id);

      ctx.audit.record({ entity: type, entityId: id, action: 'UPDATE', documentType: type,
        projectId: c.header.projectId ?? undefined, before, after: auditable(after) });
      ctx.outbox.emit('document.updated', { documentType: type, documentId: id,
        projectId: c.header.projectId, changedFields: changed });
      return { documentId: id, state, number: after.header.documentNumber,
               version: await this.versions.of(ctx, def, id), ignoredFields: ignored };
    });
  } catch (e) {
    if (isRefusal(e)) await this.refusals.record(actor, type, id, 'UPDATE', e as AppError);
    throw e;
  }
}`;

export const readListCode = `/** Load + visibility in one place, used by DocumentService and DraftService alike (a plain
 *  function, so the two services do not depend on each other). */
export async function loadVisible(store: DocumentStore, ctx: UowContext,
                                  def: CompiledDefinition<any, any>, id: number) {
  const c = await store.load(ctx, def, id, { forUpdate: false });
  if (!c || !ctx.actor.can(\`\${def.permissionPrefix}.view\`, c.header.projectId ?? undefined))
    throw new AppError('NOT_FOUND', { type: def.type, id });
  return c;
}

async read(actor: Actor, type: string, id: number, locale: string): Promise<DocumentView> {
  const def = registryGet(type);
  return this.uow.run(actor, async ctx => {
    const c = await loadVisible(this.store, ctx, def, id);
    return {
      header:  this.masker.apply(def.type, c.header, actor),
      lines:   c.lines.map(l => this.masker.apply(def.type + '_LINE', l, actor)),
      state:   def.states.stateOf(c.header),
      version: await this.versions.of(ctx, def, id),
      actions: await this.executor.available(ctx, def, c, locale),
      lock:    await this.locks.lockState(ctx, type, id, c.header),     // incl. legacy flags
      editors: await this.drafts.editors(ctx, type, id),
    };
  });
}

actionsFor(actor: Actor, type: string, id: number, locale: string) {
  const def = registryGet(type);
  return this.uow.run(actor, async ctx => this.executor.available(ctx, def, await loadVisible(this.store, ctx, def, id), locale));
}

async list(actor: Actor, type: string, q: ListQuery): Promise<Paged<DocumentRow>> {
  const def = registryGet(type);
  const base  = this.filterParser.compile(q.$filter, def.type);       // 0.3 grammar
  const where = this.filter.apply(def.type, base, actor);             // 0.5B, from ENTITY_SCOPES
  const page  = await this.lists.page(\`vw_dx_q_\${def.type.toLowerCase()}\`, where, q);
  return { ...page, rows: page.rows.map(r => this.masker.apply(def.type, r, actor)) };
}`;

export const draftServiceCode = `@Injectable()
export class DraftService {
  /** Autosave: every 10 s and on blur. No validation, no determinations, no side effects. */
  async save(ctx: UowContext, input: DraftSaveInput): Promise<DraftRef> {
    const def = registryGet(input.documentType);
    if (!def.draftable) throw new AppError('DOCUMENT_NOT_DRAFTABLE', { type: def.type });

    let projectId = input.projectId ?? null, baseVersion: string | null = null;
    if (input.activeId) {
      // Editing: the record must be visible and editable by this user; project and base version
      // come from the SERVER. base_version is fixed at the draft's first save only.
      const c = await loadVisible(this.store, ctx, def, input.activeId);
      ctx.actor.assertCan(\`\${def.permissionPrefix}.update\`, c.header.projectId ?? undefined);
      projectId = c.header.projectId;
      baseVersion = (await this.repo.existing(ctx, def.type, input.activeId, ctx.actor.userId))?.baseVersion
                    ?? await this.versions.of(ctx, def, input.activeId);
    } else {
      ctx.actor.assertCan(\`\${def.permissionPrefix}.create\`, def.projectScoped ? projectId ?? undefined : undefined);
    }
    const ref = await this.repo.upsert(ctx, { documentType: def.type, activeId: input.activeId ?? null,
      ownerUserId: ctx.actor.userId, projectId, payload: input.payload, baseVersion,
      deviceId: ctx.actor.ctx.deviceId, expiresAt: addDays(ctx.now, def.draftTtlDays ?? DEFAULT_DRAFT_TTL_DAYS) });
    if (input.activeId && ref.created)
      ctx.outbox.emit('document.draft.changed', { documentType: def.type, documentId: input.activeId,
                                                 userId: ctx.actor.userId, change: 'STARTED' });
    return ref;
  }

  list(ctx: UowContext)               { return this.repo.byOwner(ctx, ctx.actor.userId); }
  async get(ctx: UowContext, id: number) {                     // owner only; anyone else, 404
    const d = await this.repo.find(ctx, id);
    if (!d || d.ownerUserId !== ctx.actor.userId) throw new AppError('NOT_FOUND', { id });
    return d;
  }
  async discard(ctx: UowContext, id: number) { await this.consume(ctx, id, null, undefined); }
  editors(ctx: UowContext, type: string, activeId: number) { return this.repo.editorsOf(ctx, type, activeId); }

  /** Inside the caller's transaction. DELETE … RETURNING makes it a claim: of two concurrent
   *  activations of one draft, exactly one gets the row; the other gets NOT_FOUND and rolls back. */
  async consume(ctx: UowContext, id: number, type: string | null, activeId: number | null | undefined) {
    const d = await ctx.tx.maybeOne(
      \`DELETE FROM dx_document_draft WHERE id = $1 AND owner_user_id = $2 RETURNING *\`,
      [id, ctx.actor.userId]);
    if (!d) throw new AppError('NOT_FOUND', { id });
    if (type !== null && (d.document_type !== type || (d.active_id ?? null) !== activeId))
      throw new AppError('DRAFT_MISMATCH', { id });
    if (d.active_id) ctx.outbox.emit('document.draft.changed',
      { documentType: d.document_type, documentId: d.active_id, userId: d.ownerUserId, change: 'ENDED' });
  }
}

/** POST /drafts/:id/activate — in DraftActivationService, which depends on both services. */
async activate(actor: Actor, draftId: number): Promise<WriteResult> {
  const d = await this.uow.run(actor, ctx => this.drafts.get(ctx, draftId));
  if (!d.activeId) return this.docs.create(actor, d.documentType, d.payload, { draftId });
  // The server-set base version is the If-Match. If the record moved on, update() refuses with
  // CONCURRENT_MODIFICATION and the draft survives for the merge dialogue.
  return this.docs.update(actor, d.documentType, d.activeId, d.payload, { ifMatch: d.baseVersion!, draftId });
}`;

export const controllerCode = `export function DocumentController(def: CompiledDefinition<any, any>) {
  const P = def.permissionPrefix, ANY = { projectFrom: 'any' as const };
  @Controller('/api/dx/v1/documents/' + def.type)
  class C {
    constructor(private readonly docs: DocumentService, private readonly exec: ActionExecutor) {}

    @Get()        @RequiresPermission(P + '.view', ANY)
    list(@Actor() a, @Query() q)                                   { return this.docs.list(a, def.type, q); }
    @Get(':id')   @RequiresPermission(P + '.view', ANY)
    read(@Actor() a, @Param('id') id, @Locale() l)                 { return this.docs.read(a, def.type, id, l); }
    @Post()       @RequiresPermission(P + '.create', ANY) @UseInterceptors(IdempotencyInterceptor)
    create(@Actor() a, @Body() b)                                  { return this.docs.create(a, def.type, b); }
    @Patch(':id') @RequiresPermission(P + '.update', ANY) @UseInterceptors(IdempotencyInterceptor)
    update(@Actor() a, @Param('id') id, @Body() b, @IfMatch() v)   { return this.docs.update(a, def.type, id, b, { ifMatch: v }); }
    @Get(':id/actions') @RequiresPermission(P + '.view', ANY)
    actions(@Actor() a, @Param('id') id, @Locale() l)              { return this.docs.actionsFor(a, def.type, id, l); }
    @Post(':id/actions/:code') @RequiresPermission(P + '.view', ANY) @UseInterceptors(IdempotencyInterceptor)
    act(@Actor() a, @Param('id') id, @Param('code') code, @Body() b, @IfMatch() v)
                                                                   { return this.exec.execute(a, def.type, id, code, b, { ifMatch: v }); }
  }
  return C;
}
// New param decorators, declared here: @IfMatch() reads the If-Match header (quotes stripped);
// @Locale() reads the user's locale from RequestContext.`;

export const apiEndpoints: ApiEndpoint[] = [
  { number: 1, method: "GET", path: "/api/dx/v1/documents/:type", headers: "—" },
  { number: 2, method: "GET", path: "/api/dx/v1/documents/:type/:id", headers: "returns ETag" },
  { number: 3, method: "POST", path: "/api/dx/v1/documents/:type", headers: "Idempotency-Key" },
  { number: 4, method: "PATCH", path: "/api/dx/v1/documents/:type/:id", headers: "If-Match, Idempotency-Key" },
  { number: 5, method: "PUT", path: "/api/dx/v1/drafts", headers: "—" },
  { number: 6, method: "GET/DELETE", path: "/api/dx/v1/drafts · /drafts/:id", headers: "— (owner only)" },
  { number: 7, method: "POST", path: "/api/dx/v1/drafts/:id/activate", headers: "Idempotency-Key" },
];

export const businessRules: BusinessRule[] = [
  { code: "DOCUMENT_NOT_EDITABLE", http: "409", message: "This {type} cannot be edited while it is {state}." },
  { code: "PROJECT_CLOSED", http: "409", message: "Project {name} is closed. Documents cannot be created or changed against it." },
  { code: "MANDATORY_FIELD_MISSING", http: "422", message: "{field} is required. — raised before the database is reached" },
  { code: "DOCUMENT_NOT_DRAFTABLE", http: "400", message: "{type} cannot be saved as a draft." },
  { code: "DRAFT_MISMATCH", http: "500", message: "Defect; logged" },
  { code: "LINE_NOT_IN_DOCUMENT", http: "422", message: "Line {lineId} does not belong to this {type}." },
];

export const events: Event[] = [
  { event: "document.created", requiredFields: "documentType, documentId, projectId", uiOnly: "true until 1.5 subscribes" },
  { event: "document.updated", requiredFields: "documentType, documentId, projectId, changedFields", uiOnly: "true until 1.5 subscribes" },
  { event: "document.draft.changed", requiredFields: "documentType, documentId, userId, change", uiOnly: "true — editing indicator only" },
];

export const testCases: TestCase[] = [
  { id: "U1", test: "Create with a definition variant allocateOn: 'CREATE'", expected: "Number allocated, CONSUMED with the id" },
  { id: "U2", test: "Create TEST_DOC", expected: "No number" },
  { id: "U3", test: "Create on a closed project; update on a closed project", expected: "PROJECT_CLOSED both times" },
  { id: "U4", test: "Update in APPROVED", expected: "DOCUMENT_NOT_EDITABLE" },
  { id: "U5", test: "Update with a stale If-Match", expected: "CONCURRENT_MODIFICATION with changedFields; nothing written", starred: true },
  { id: "U6", test: "Create posting total: 1", expected: "Stored total computed; ignoredFields lists it", starred: true },
  { id: "U7", test: "User with a line restriction hiding rate posts rate: null", expected: "Stored rate unchanged", starred: true },
  { id: "U8", test: "PATCH { header: { projectId: 99 } }", expected: "Project unchanged; listed in ignoredFields", starred: true },
  { id: "U8b", test: "PATCH naming a line id from another document", expected: "LINE_NOT_IN_DOCUMENT; nothing written", starred: true },
  { id: "U8c", test: "POST …/actions/APPROVE through the registered route", expected: "ACTION_WORKFLOW_ONLY" },
  { id: "U9", test: "PATCH without If-Match", expected: "428" },
  { id: "U10", test: "Create missing a mandatory column", expected: "MANDATORY_FIELD_MISSING; database never reached" },
  { id: "U11", test: "Create with a FAST CREATE allocation whose insert fails", expected: "Number VOIDED with a reason", starred: true },
  { id: "U12", test: "CI scan of module controllers", expected: "None declares /documents/ routes", starred: true },
  { id: "U13", test: "Update on a locked document", expected: "DOCUMENT_LOCKED; WRITE_REFUSED row" },
  { id: "R1", test: "list for a user on project A only", expected: "Project B rows absent from the SQL (query log)", starred: true },
  { id: "R2", test: "list page 2 for that user", expected: "Total counts the scoped set only", starred: true },
  { id: "R3", test: "read with HIDE on line rate; list with HIDE on header partyId", expected: "Key absent in both, not null", starred: true },
  { id: "R4", test: "read of another project's document", expected: "404" },
  { id: "R5", test: "list of 50 rows", expected: "No SoD history queries — available() not called" },
  { id: "D1", test: "Autosave, kill the process, reopen", expected: "Draft restored", starred: true },
  { id: "D2", test: "Two 'new' drafts by one user", expected: "One row", starred: true },
  { id: "D3", test: "Another user — including Super Admin — reads, discards or lists the draft", expected: "404 / absent", starred: true },
  { id: "D4", test: "Edit draft on a record the user cannot see", expected: "404; no draft row; not in editors" },
  { id: "D5", test: "Edit draft sent with a client baseVersion and projectId", expected: "Both ignored; server values stored" },
  { id: "D6", test: "100 autosaves", expected: "Number series and every other table unchanged", starred: true },
  { id: "D7", test: "Activate a new-document draft", expected: "One record; draft gone; one transaction", starred: true },
  { id: "D8", test: "Activate where create fails validation", expected: "No record; draft still present", starred: true },
  { id: "D9", test: "Activate an edit draft after someone else changed the record", expected: "CONCURRENT_MODIFICATION; draft still present", starred: true },
  { id: "D10", test: "Two concurrent activations of one draft, different idempotency keys", expected: "Exactly one record; the other NOT_FOUND and rolled back", starred: true },
  { id: "I1", test: "Create → read → update → read, checking the ETag", expected: "Changes on update; stable across reads", starred: true },
  { id: "I2", test: "Create → SUBMIT → APPROVE (by another user, via WorkflowOrigin) → POST → PAY → CLOSE", expected: "One audit row per step; locked from POST; PAY/CLOSE allowed; creator's approval refused with SELF_APPROVAL_NOT_PERMITTED (as 1.1D A8b)", starred: true },
  { id: "I3", test: "Schema fingerprint before/after, excluding dx_ tables", expected: "Identical", starred: true },
];

export const completionChecklist: ChecklistItem[] = [
  { text: "dx_document_draft with the expression index; migration down verified" },
  { text: "Every column written is bridge-writable under a recorded ADR", starred: true },
  { text: "stripUnowned runs first on create, update and activation; U6, U7, U8 pass", starred: true },
  { text: "U5, U11, U12 pass; R1, R2 verified from the query log; R3 absent-not-null", starred: true },
  { text: "D7–D10 prove activation is atomic, loses nothing and cannot double-create", starred: true },
  { text: "D3–D5: drafts private, and server-owned fields not client-settable", starred: true },
  { text: "I2 runs the whole TEST_DOC lifecycle end to end", starred: true },
  { text: "The five contract points are in API_CONTRACT.md before 1.7 begins" },
  { text: "No existing table, column, relationship or row was altered.", starred: true },
];

export const contractPoints = [
  "A read returns { header, lines, state, actions, lock, editors } and an ETag; the form sends it as If-Match on every PATCH and action.",
  "Fields in any determination's writes render read-only; if sent they come back in meta.ignoredFields.",
  "A hidden field is absent; the form renders nothing for it.",
  "CONCURRENT_MODIFICATION carries changedFields; the form keeps the user's input and offers Reload — or, for MB lines, bill items and BOQ grids, a three-way merge (base, theirs, yours). A quantity surveyor who spent an hour on a measurement book will not accept 'reload and lose it'.",
  "Autosave is wired once in the form container: useAutosaveDraft(type, activeId, value, { intervalMs: 10_000, onBlur: true }). A resumable draft shows 'Unsaved changes from 14:22 — Resume or Discard'; others see 'Being edited by R. Sharma since 10:42'.",
];
