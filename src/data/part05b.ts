export interface Dependency {
  part: string;
  provides: string;
  blocking: string;
}

export interface EnforcementPoint {
  number: number;
  name: string;
  description: string;
  catches: string[];
}

export interface InspectionCommand {
  title: string;
  code: string;
  language: string;
}

export interface ReuseCheckItem {
  searchFor: string;
  ifFound: string;
  ifNot: string;
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
  permission: string;
}

export interface TestCase {
  id: string;
  case: string;
  expected: string;
  starred?: boolean;
}

export interface ChecklistCategory {
  category: string;
  items: string[];
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
  { part: "0.5A", provides: "Resolver, Actor, eleven permission tables, seed data", blocking: "Yes" },
  { part: "0.4", provides: "Authenticated session", blocking: "Yes" },
  { part: "0.3", provides: "API envelope, error catalogue, filter compiler", blocking: "Yes" },
];

export const prerequisites = [
  "Part 0.5A checklist passed; all seventeen resolver tests green",
  "Actor.can() returns correct answers for a user with two projects and different templates",
  "/auth/me returns projects and permVersion",
  "Cache invalidation proven on assignment change",
];

export const deliverables = [
  "The four enforcement points",
  "The SoD evaluator",
  "The menu endpoint",
  "The Super Admin permission console",
];

export const enforcementPoints: EnforcementPoint[] = [
  {
    number: 1,
    name: "ROUTE GUARD",
    description: "May this actor invoke this operation at all?",
    catches: [
      "Direct API calls to endpoints the menu never showed",
    ],
  },
  {
    number: 2,
    name: "QUERY FILTER",
    description: "Which rows may this actor see?",
    catches: [
      "List endpoints returning other projects' data",
      "Dashboard totals including invisible rows",
    ],
  },
  {
    number: 3,
    name: "FIELD MASKING",
    description: "Which columns of those rows?",
    catches: [
      "Rates visible to a site engineer via the API",
    ],
  },
  {
    number: 4,
    name: "ACTION VALIDATION",
    description: "May this actor do THIS, to THIS record, at THIS value, NOW?",
    catches: [
      "Approving beyond authority",
      "Self-approval",
      "SoD conflicts",
      "Approving from a phone where forbidden",
    ],
  },
];

export const inspectionCommands: InspectionCommand[] = [
  {
    title: "1.1 Every route that exists today",
    language: "bash",
    code: `grep -rn "@Get\\|@Post\\|@Patch\\|@Put\\|@Delete" --include=*.controller.ts dx/ | wc -l`,
  },
  {
    title: "1.2 Any repository method building SQL without a scope parameter",
    language: "bash",
    code: `grep -rn "createQueryBuilder\\|\\.query(" --include=*.repository.ts dx/ | head -30`,
  },
  {
    title: "1.3 Existing serialisation — where masking must hook in",
    language: "bash",
    code: `grep -rn "ClassSerializerInterceptor\\|@Exclude\\|toJSON" --include=*.ts dx/ | head -20`,
  },
];

export const reuseChecks: ReuseCheckItem[] = [
  { searchFor: "Existing guard or middleware", ifFound: "Extend rather than parallel", ifNot: "Build per §4.1" },
  { searchFor: "Existing serialiser interceptor", ifFound: "Hook masking into it", ifNot: "Build per §4.3" },
  { searchFor: "Existing query builder base", ifFound: "Add the scope parameter to it", ifNot: "Build per §4.2" },
];

export const effectiveAssignmentView = `CREATE VIEW vw_dx_effective_assignment AS
SELECT pa.id                AS assignment_id,
       pa.user_id,
       pa.project_id,
       rt.template_code,
       rt.label             AS responsibility,
       pa.valid_from, pa.valid_to, pa.is_active, pa.is_primary,
       (SELECT COUNT(*) FROM dx_assignment_permission ap
         WHERE ap.assignment_id = pa.id AND ap.effect = 'GRANT')  AS grants,
       (SELECT COUNT(*) FROM dx_assignment_permission ap
         WHERE ap.assignment_id = pa.id AND ap.effect = 'DENY')   AS denies,
       (SELECT COUNT(*) FROM dx_approval_authority aa
         WHERE aa.assignment_id = pa.id)                          AS authority_count,
       (SELECT COUNT(*) FROM dx_assignment_scope sc
         WHERE sc.assignment_id = pa.id)                          AS scope_count
  FROM dx_project_assignment pa
  JOIN dx_responsibility_template rt ON rt.id = pa.template_id;`;

export const routeGuardCode = `// dx/platform/permission/requires-permission.decorator.ts

export interface PermMeta {
  key: PermissionKey | ((req: Request) => PermissionKey);
  /** where to find the project id this check applies to */
  projectFrom?: 'body' | 'query' | 'param' | 'resource' | 'none';
  projectField?: string;
}

export const RequiresPermission = (key: PermMeta['key'], opts: Omit<PermMeta,'key'> = {}) =>
  SetMetadata(PERM_META, { key, projectFrom: 'body', projectField: 'projectId', ...opts });

/** For endpoints that genuinely need no permission (login, health). Explicit, never implied. */
export const PublicEndpoint = () => SetMetadata(PUBLIC_META, true);`;

export const permissionGuardCode = `@Injectable()
export class PermissionGuard implements CanActivate {
  async canActivate(execCtx: ExecutionContext): Promise<boolean> {
    const handler = execCtx.getHandler();

    if (this.reflector.get(PUBLIC_META, handler)) return true;

    const meta = this.reflector.get<PermMeta>(PERM_META, handler);
    if (!meta) {
      // FAIL CLOSED. An endpoint without a declared permission is a defect, not a public route.
      throw new InternalError('ENDPOINT_MISSING_PERMISSION_DECLARATION', {
        handler: handler.name,
        controller: execCtx.getClass().name,
        remedy: 'Add @RequiresPermission(...) or @PublicEndpoint() to this handler.',
      });
    }

    const req = execCtx.switchToHttp().getRequest();
    const actor: Actor = req.actor;
    if (!actor) throw new AuthError('UNAUTHENTICATED');

    const key = typeof meta.key === 'function' ? meta.key(req) : meta.key;
    const projectId = await this.resolveProjectId(req, meta);

    if (!actor.can(key, projectId)) {
      await this.audit.recordDenied({
        actor, key, projectId, route: req.route?.path, method: req.method, ip: req.ip,
      });
      throw new ForbiddenError('PERMISSION_DENIED', { key, projectId });
    }
    return true;
  }

  /** 'resource' loads the record first — needed for GET /purchase-orders/:id */
  private async resolveProjectId(req: Request, meta: PermMeta): Promise<number | undefined> {
    switch (meta.projectFrom) {
      case 'none':     return undefined;
      case 'body':     return req.body?.[meta.projectField!];
      case 'query':    return req.query?.[meta.projectField!] as any;
      case 'param':    return Number(req.params?.[meta.projectField!]);
      case 'resource': return this.resourceLocator.projectIdFor(req);
      default:         return undefined;
    }
  }
}`;

export const bootAssertionCode = `export function assertEveryRouteDeclaresPermission(app: INestApplication): void {
  const missing = enumerateRoutes(app).filter(r =>
    !Reflect.getMetadata(PERM_META, r.handler) &&
    !Reflect.getMetadata(PUBLIC_META, r.handler));

  if (missing.length) {
    console.error('✗ ROUTES WITHOUT A PERMISSION DECLARATION\\n');
    missing.forEach(r => console.error(\`  \${r.method} \${r.path} → \${r.controller}.\${r.handler.name}\`));
    throw new Error('Every route must declare @RequiresPermission or @PublicEndpoint.');
  }
}`;

export const queryFilterCode = `// dx/platform/permission/entity-scope.registry.ts

export interface EntityScopeSpec {
  /** column holding the project id, or a join to reach it */
  projectColumn?: string;
  projectJoin?: { sql: string; column: string };
  /** permission key granting visibility of this entity */
  viewKey: PermissionKey;
  /** optional narrower scopes */
  siteColumn?: string;
  costCodeColumn?: string;
  vendorColumn?: string;
  wbsColumn?: string;
  /** entities visible only to their owner unless a wider key is held */
  ownerColumn?: string;
  ownerBypassKey?: PermissionKey;
  /** true for entities with no project dimension (global masters) */
  isGlobal?: boolean;
}

export const ENTITY_SCOPES: Record<string, EntityScopeSpec> = {
  // Populated by each part as it creates entities. Phase 0 registers none.
};`;

export const queryFilterApplyCode = `@Injectable()
export class QueryFilter {
  apply(entity: string, base: CompiledWhere, actor: Actor): CompiledWhere {
    const spec = ENTITY_SCOPES[entity];
    if (!spec)
      throw new InternalError('ENTITY_SCOPE_NOT_DECLARED', {
        entity,
        remedy: \`Register \${entity} in ENTITY_SCOPES before querying it.\`,
      });

    if (spec.isGlobal) {
      return actor.hasGlobal(spec.viewKey) ? base : DENY_ALL;
    }

    const allowed = actor.projectsWith(spec.viewKey);
    if (allowed.length === 0 && !actor.hasGlobal(spec.viewKey)) {
      return DENY_ALL;      // "1=0" — an empty list, not an exception
    }

    const clauses = [base.sql];
    const params = [...base.params];

    // Project scope, plus narrower scopes as OR-of-AND groups so that a user scoped
    // to Site 3 on Project A and unscoped on Project B sees both correctly.
    if (!actor.hasGlobal(spec.viewKey) && spec.projectColumn) {
      const groups: string[] = [];
      for (const pid of allowed) {
        const sc = actor.scope(pid);
        const g = [\`\${spec.projectColumn} = \${push(params, pid)}\`];
        if (sc?.siteIds?.size && spec.siteColumn)
          g.push(\`\${spec.siteColumn} = ANY(\${push(params, [...sc.siteIds])})\`);
        if (sc?.costCodeIds?.size && spec.costCodeColumn)
          g.push(\`\${spec.costCodeColumn} = ANY(\${push(params, [...sc.costCodeIds])})\`);
        if (sc?.wbsIds?.size && spec.wbsColumn)
          g.push(\`\${spec.wbsColumn} = ANY(\${push(params, [...sc.wbsIds])})\`);
        groups.push(\`(\${g.join(' AND ')})\`);
      }
      clauses.push(\`(\${groups.join(' OR ')})\`);
    }

    if (spec.ownerColumn && !(spec.ownerBypassKey && actor.can(spec.ownerBypassKey)))
      clauses.push(\`\${spec.ownerColumn} = \${push(params, actor.userId)}\`);

    return { sql: clauses.join(' AND '), params };
  }
}`;

export const fieldMaskerCode = `@Injectable()
export class FieldMasker {
  /** Applied in the serialiser. New controllers get it automatically. */
  apply<T extends Record<string, any>>(entity: string, row: T, actor: Actor): T {
    const restrictions = actor.restrictionsFor(entity);
    if (!restrictions.length) return row;

    const out: any = { ...row };
    for (const r of restrictions) {
      const fields = r.field === '*' ? Object.keys(out) : [r.field];
      for (const f of fields) {
        if (!(f in out)) continue;
        switch (r.mode) {
          case 'HIDE':   delete out[f]; break;
          case 'REDACT': out[f] = null; break;
          case 'MASK':   out[f] = maskValue(out[f], f); break;   // ₹•••••• / XXXX4471
        }
        this.record(\`\${entity}.\${f}\`);
      }
    }
    return out;
  }

  /** Suppress an aggregate whose underlying field is masked. */
  applyToTotals(entity: string, totals: Record<string, string>, actor: Actor): Record<string, string> {
    const hidden = new Set(actor.restrictionsFor(entity).map(r => r.field));
    return Object.fromEntries(Object.entries(totals).filter(([k]) => !hidden.has(k)));
  }
}`;

export const actionPolicyCode = `export interface ActionPolicy<TRecord> {
  action: string;                       // 'po.release'
  permission: PermissionKey;
  evaluate(record: TRecord, actor: Actor, ctx: PolicyContext): Promise<PolicyResult>;
}

export interface PolicyResult {
  allowed: boolean;
  reasons: string[];                    // every reason, not the first
}`;

export const standardPolicyChecksCode = `/** The checks nearly every document action needs. Compose, do not copy. */
@Injectable()
export class StandardPolicyChecks {
  async run(record: DocumentLike, actor: Actor, opts: PolicyOpts): Promise<string[]> {
    const reasons: string[] = [];

    if (!actor.can(opts.permission, record.projectId)) reasons.push('PERMISSION_DENIED');

    if (opts.valueAuthority) {
      const auth = actor.authorityFor(opts.valueAuthority.documentType, record.projectId);
      if (!auth) reasons.push('NO_APPROVAL_AUTHORITY');
      else if (auth.maxValue && record.totalValue?.gt(auth.maxValue))
        reasons.push(\`AUTHORITY_EXCEEDED:\${auth.maxValue.format()}\`);
    }

    if (opts.preventSelfApproval && record.createdBy === actor.userId)
      reasons.push('SELF_APPROVAL_NOT_PERMITTED');

    if (opts.sodAction) {
      const sod = await this.sod.check(actor.userId, opts.sodAction, {
        documentType: record.documentType, documentId: record.id, projectId: record.projectId,
      });
      if (sod.conflict) reasons.push(\`SOD_CONFLICT:\${sod.ruleCode}\`);
    }

    if (opts.deviceRestricted?.includes(actor.ctx.deviceClass))
      reasons.push('DEVICE_NOT_PERMITTED');

    // Impersonation may read. It may never approve, post, pay, certify or restore.
    if (opts.forbidUnderImpersonation && actor.ctx.isImpersonation)
      reasons.push('IMPERSONATION_CANNOT_PERFORM_THIS_ACTION');

    return reasons;
  }
}`;

export const sodEvaluatorCode = `@Injectable()
export class SodEvaluator {
  async check(userId: number, action: string, ctx: SodContext): Promise<SodResult> {
    for (const rule of await this.repo.rulesInvolving(action)) {
      const other = rule.actionA === action ? rule.actionB : rule.actionA;

      // The question is not "could this person have done X" but "DID this person do X,
      // on THIS document". That is an audit query, not a role comparison.
      const performed = await this.history.didUserPerform(userId, other, {
        documentType: rule.scope === 'SAME_DOCUMENT' ? ctx.documentType : undefined,
        documentId:   rule.scope === 'SAME_DOCUMENT' ? ctx.documentId   : undefined,
        projectId:    rule.scope === 'SAME_PROJECT'  ? ctx.projectId    : undefined,
      });
      if (!performed) continue;

      const exemption = await this.repo.activeExemption(userId, rule.ruleCode, ctx.projectId);
      if (exemption) {
        await this.audit.record({ action: 'SOD_EXEMPTION_USED',
          context: { rule: rule.ruleCode, exemptionId: exemption.id, approvedBy: exemption.approvedBy } });
        continue;
      }

      if (rule.severity === 'BLOCK')
        return { conflict: true, ruleCode: rule.ruleCode, description: rule.description };

      await this.audit.record({ action: 'SOD_WARNING', context: { rule: rule.ruleCode } });
    }
    return { conflict: false };
  }
}

/** Two implementations behind one interface. */
export interface ActionHistory {
  didUserPerform(userId: number, action: string, scope: HistoryScope): Promise<boolean>;
}
// 0.5B: AssignmentAuditHistory — covers administrative SoD rules
// 0.6:  AuditLogHistory        — covers document-scoped rules; swapped in by DI`;

export const menuEndpointCode = `@Get('/api/dx/v1/shell/menu')
@PublicEndpoint()   // authenticated, but no specific key — the response IS the permission answer
async menu(@Actor() actor: Actor, @Query('projectId') projectId?: number) {
  const items = await this.menuRepo.all();
  const visible = items.filter(i =>
    !i.permissionKey || actor.can(i.permissionKey, i.projectScoped ? projectId : undefined));

  return ok(buildTree(pruneEmptyParents(visible)), {
    contextProjects: actor.projectsWith('project.view'),
    permVersion: actor.permVersion,
  });
}`;

export const impersonationCode = `async startImpersonation(ctx: UowContext, targetUserId: number, reason: string): Promise<SessionRef> {
  ctx.actor.assertCan('admin.impersonate.execute');
  if (!reason?.trim()) throw new ApiError('REASON_REQUIRED');

  const target = await this.users.get(ctx, targetUserId);
  const targetRole = await this.repo.getGlobalRole(targetUserId);

  // Never impersonate upward, and never a Super Admin.
  if (targetRole?.isSuperAdmin)
    throw new ForbiddenError('CANNOT_IMPERSONATE_SUPER_ADMIN');
  if (ctx.actor.ctx.isImpersonation)
    throw new ForbiddenError('CANNOT_NEST_IMPERSONATION');

  const session = await this.sessions.create(ctx, targetUserId, ctx.actor.ctx,
    { mfaSatisfied: true, impersonatedBy: ctx.actor.userId });

  ctx.audit.record({ entity: 'user', entityId: targetUserId, action: 'IMPERSONATION_STARTED',
    after: { by: ctx.actor.userId }, reason });
  await this.notify.toUser(targetUserId, 'IMPERSONATION_NOTICE',
    { by: ctx.actor.displayName, reason });   // the impersonated user is told
  return session;
}`;

export const apiEndpoints: ApiEndpoint[] = [
  { number: 1, method: "GET", path: "/api/dx/v1/shell/menu", permission: "authenticated" },
  { number: 2, method: "GET", path: "/api/dx/v1/admin/permissions/users/:id", permission: "admin.permission.view" },
  { number: 3, method: "GET", path: "/api/dx/v1/admin/permissions/projects/:id", permission: "admin.permission.view" },
  { number: 4, method: "GET", path: "/api/dx/v1/admin/permissions/matrix", permission: "admin.permission.view" },
  { number: 5, method: "POST", path: "/api/dx/v1/admin/assignments", permission: "admin.permission.assign" },
  { number: 6, method: "PATCH", path: "/api/dx/v1/admin/assignments/:id", permission: "admin.permission.assign" },
  { number: 7, method: "DELETE", path: "/api/dx/v1/admin/assignments/:id", permission: "admin.permission.assign" },
  { number: 8, method: "POST", path: "/api/dx/v1/admin/assignments/preview", permission: "admin.permission.assign" },
  { number: 9, method: "POST", path: "/api/dx/v1/admin/assignments/:id/overrides", permission: "admin.permission.override" },
  { number: 10, method: "PUT", path: "/api/dx/v1/admin/assignments/:id/authority", permission: "admin.permission.assign" },
  { number: 11, method: "PUT", path: "/api/dx/v1/admin/assignments/:id/scopes", permission: "admin.permission.assign" },
  { number: 12, method: "GET/POST", path: "/api/dx/v1/admin/templates", permission: "admin.template.view / manage" },
  { number: 13, method: "GET/POST", path: "/api/dx/v1/admin/delegations", permission: "admin.delegation.view / manage" },
  { number: 14, method: "POST", path: "/api/dx/v1/admin/impersonate", permission: "admin.impersonate.execute" },
  { number: 15, method: "POST", path: "/api/dx/v1/admin/impersonate/end", permission: "authenticated" },
];

export const businessRules: BusinessRule[] = [
  { code: "ENDPOINT_MISSING_PERMISSION_DECLARATION", condition: "Route without a decorator", severity: "BLOCK", message: "Boot failure naming the handler" },
  { code: "ENTITY_SCOPE_NOT_DECLARED", condition: "Query on an unregistered entity", severity: "BLOCK", message: "Register {entity} in ENTITY_SCOPES." },
  { code: "ORPHANED_APPROVALS", condition: "Removing the only approver", severity: "BLOCK", message: "{user} is the only approver for {n} pending documents." },
  { code: "SOD_CONFLICT", condition: "Rule violated", severity: "BLOCK", message: "{description}" },
  { code: "CANNOT_IMPERSONATE_SUPER_ADMIN", condition: "Target is Super Admin", severity: "BLOCK", message: "Super Admin accounts cannot be impersonated." },
  { code: "CANNOT_NEST_IMPERSONATION", condition: "Already impersonating", severity: "BLOCK", message: "End the current impersonation first." },
  { code: "IMPERSONATION_CANNOT_PERFORM_THIS_ACTION", condition: "Restricted action while impersonating", severity: "BLOCK", message: "This action cannot be performed while impersonating." },
  { code: "LAST_SUPER_ADMIN", condition: "Removing the final Super Admin", severity: "BLOCK", message: "At least one Super Admin must remain." },
];

export const screenRoutes: ScreenRoute[] = [
  { route: "/admin/permissions/by-user", screen: "Pick a user → their projects, responsibilities, authority, overrides" },
  { route: "/admin/permissions/by-project", screen: "Pick a project → its team, responsibilities, gaps" },
  { route: "/admin/permissions/matrix", screen: "Users × projects grid, responsibility in each cell" },
  { route: "/admin/permissions/assign", screen: "Five-tab editor: Responsibility · Authority · Scope · Overrides · Review" },
  { route: "/admin/templates", screen: "Template editor with key picker grouped by module" },
  { route: "/admin/delegations", screen: "Active and historical delegations" },
  { route: "/admin/sod", screen: "Rules and exemptions with expiry" },
];

export const reports: Report[] = [
  { name: "User access report", content: "Every project, responsibility, authority, override for one user" },
  { name: "Project team report", content: "Every user on a project with their responsibility" },
  { name: "Permission matrix", content: "Users × projects, exportable — the report auditors ask for" },
  { name: "Override register", content: "Every explicit grant and deny with its reason and who granted it" },
  { name: "SoD conflicts and exemptions", content: "Active exemptions with expiry" },
  { name: "Permission change log", content: "From dx_assignment_audit, filterable by user, actor, date" },
];

export const permissionHealthView = `CREATE VIEW vw_dx_q_permission_health AS
SELECT
  (SELECT COUNT(*) FROM dx_project_assignment WHERE is_active)                  AS active_assignments,
  (SELECT COUNT(DISTINCT user_id) FROM dx_project_assignment WHERE is_active)   AS users_with_access,
  (SELECT COUNT(*) FROM dx_assignment_permission
    WHERE effect='GRANT' AND (expires_at IS NULL OR expires_at > NOW()))        AS active_grants,
  (SELECT COUNT(*) FROM dx_sod_exemption WHERE valid_to >= CURRENT_DATE)        AS active_exemptions,
  (SELECT COUNT(*) FROM dx_sod_exemption
    WHERE valid_to BETWEEN CURRENT_DATE AND CURRENT_DATE + 30)                  AS exemptions_expiring_30d,
  (SELECT COUNT(*) FROM dx_user_global_role ugr
     JOIN dx_global_role gr ON gr.id = ugr.role_id WHERE gr.is_super_admin)     AS super_admins,
  (SELECT COUNT(*) FROM dx_delegation
    WHERE revoked_at IS NULL AND NOW() BETWEEN valid_from AND valid_to)         AS active_delegations;`;

export const enforcementTests: TestCase[] = [
  { id: "E1", case: "Route without a decorator", expected: "Boot fails naming the handler", starred: true },
  { id: "E2", case: "Endpoint called without the key", expected: "403, audit row written", starred: true },
  { id: "E3", case: "List endpoint, user assigned to Project A only", expected: "Only Project A rows", starred: true },
  { id: "E4", case: "Aggregate endpoint, same user", expected: "Total covers only Project A rows", starred: true },
  { id: "E5", case: "GET by id, record in Project B", expected: "404, not 403", starred: true },
  { id: "E6", case: "Site-scoped user lists project records", expected: "Only their site's rows", starred: true },
  { id: "E7", case: "Masked field in JSON", expected: "Absent", starred: true },
  { id: "E8", case: "Masked field in Excel export", expected: "Column absent", starred: true },
  { id: "E9", case: "Masked field in PDF", expected: "Absent", starred: true },
  { id: "E10", case: "$orderby on a masked field", expected: "403 FILTER_FIELD_FORBIDDEN", starred: true },
  { id: "E11", case: "Totals including a masked field", expected: "Suppressed", starred: true },
  { id: "E12", case: "Approve at authority limit / limit + ₹1", expected: "Allowed / refused naming the limit", starred: true },
  { id: "E13", case: "Approve own document", expected: "Refused", starred: true },
  { id: "E14", case: "Super Admin approves own document", expected: "Refused — breadth is not immunity", starred: true },
  { id: "E15", case: "SoD: same user performs both actions", expected: "Second refused naming the rule", starred: true },
  { id: "E16", case: "SoD with an active exemption", expected: "Allowed, exemption use audited", starred: true },
  { id: "E17", case: "Impersonated session attempts to approve", expected: "Refused", starred: true },
  { id: "E18", case: "Impersonating a Super Admin", expected: "Refused", starred: true },
  { id: "E19", case: "Nested impersonation", expected: "Refused" },
  { id: "E20", case: "Menu for a user with no Finance keys", expected: "No Finance node, no empty parent", starred: true },
];

export const consoleTests: TestCase[] = [
  { id: "A1", case: "Preview deactivating the only approver", expected: "ORPHANED_APPROVALS blocker", starred: true },
  { id: "A2", case: "Save with that blocker unresolved", expected: "422; nothing changed", starred: true },
  { id: "A3", case: "Save with a substitute nominated", expected: "Both changes in one transaction", starred: true },
  { id: "A4", case: "Removing the last Super Admin", expected: "LAST_SUPER_ADMIN", starred: true },
  { id: "A5", case: "Override without a reason", expected: "400" },
  { id: "A6", case: "Assignment change", expected: "Cache invalidated; next request reflects it", starred: true },
  { id: "A7", case: "Bulk assign 50 users", expected: "Dry run, progress, one audit batch id" },
  { id: "A8", case: "Assignment editing on a phone", expected: "Explanatory message, not a broken screen" },
];

export const completionChecklist: ChecklistCategory[] = [
  {
    category: "Route guard",
    items: [
      "Boot assertion fires on an undeclared route ★",
      "Guard fails closed — a missing decorator throws rather than allowing ★",
      "Every denial audited ★",
    ],
  },
  {
    category: "Query filter",
    items: [
      "Registered for every entity queried so far",
      "Cross-project isolation proven on lists ★",
      "Cross-project isolation proven on aggregates and chart series ★",
      "Narrower scopes (site, cost code) applied correctly ★",
      "Repository methods accept only a CompiledWhere; lint rule active ★",
    ],
  },
  {
    category: "Field masking",
    items: [
      "Applied in the serialiser, not per controller ★",
      "Verified absent in JSON, Excel, PDF, aggregates ★",
      "Filtering and sorting on a masked field refused ★",
    ],
  },
  {
    category: "Action policies",
    items: [
      "StandardPolicyChecks composes all six checks",
      "Authority boundary exact at limit and limit + 1 ★",
      "Self-approval prevented ★",
      "Super Admin subject to SoD and self-approval rules ★",
      "Impersonation cannot approve, post, pay, certify or restore ★",
    ],
  },
  {
    category: "SoD",
    items: [
      "Evaluator queries history, not roles ★",
      "ActionHistory interface defined; 0.6 swaps in the audit-log implementation",
      "Exemptions honoured, audited and expiring",
    ],
  },
  {
    category: "Console",
    items: [
      "All three views work (by user, by project, matrix)",
      "Impact preview computes correctly ★",
      "Orphaned approvals block the save ★",
      "Last Super Admin cannot be removed ★",
      "Every change writes dx_assignment_audit with before/after ★",
    ],
  },
  {
    category: "Impersonation",
    items: [
      "Requires permission and a reason",
      "Cannot target a Super Admin; cannot nest ★",
      "Impersonated user is notified ★",
      "Banner visible throughout; both ids in every audit row ★",
    ],
  },
  {
    category: "Coverage",
    items: [
      "Generated permission coverage test green across every route ★",
      "All twenty enforcement tests pass",
    ],
  },
  {
    category: "Final confirmation",
    items: [
      "No existing table, column, relationship or row was altered. ★",
    ],
  },
];
