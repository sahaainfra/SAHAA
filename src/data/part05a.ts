export interface Dependency {
  part: string;
  provides: string;
  blocking: string;
}

export interface ExistingEntity {
  entity: string;
  access: string;
  purpose: string;
}

export interface PermissionLayer {
  layer: string;
  name: string;
  description: string;
  example: string;
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
  starred?: boolean;
}

export interface ChecklistCategory {
  category: string;
  items: string[];
}

export interface CacheInvalidation {
  change: string;
  invalidate: string;
}

export const dependencies: Dependency[] = [
  { part: "0.2", provides: "SCHEMA_MAP including user and project entities", blocking: "Yes" },
  { part: "0.3", provides: "UnitOfWork, Actor shape (with can() throwing)", blocking: "Yes" },
  { part: "0.4", provides: "Authenticated session carrying userId", blocking: "Yes" },
];

export const existingEntities: ExistingEntity[] = [
  { entity: "Existing user table", access: "READ", purpose: "Identity, active flag, global role if present" },
  { entity: "Existing project table", access: "READ", purpose: "Project existence and active state" },
  { entity: "Existing role table, if any", access: "READ", purpose: "Seeds global roles" },
];

export const prerequisites = [
  "Part 0.4 checklist passed",
  "A user can authenticate and receive a session",
  "SCHEMA_MAP.project mapped and validated",
  "At least 3 projects and 10 users exist in the development database",
  "SCHEMA_BASELINE.md records whether the existing system has any role or permission concept",
];

export const deliverables = [
  "Eleven dx_ tables",
  "The permission resolver",
  "The completed Actor",
  "The cache with its invalidation",
  "The seed data: permission keys, responsibility templates and SoD rules",
];

export const permissionLayers: PermissionLayer[] = [
  {
    layer: "LAYER 1",
    name: "GLOBAL ROLE",
    description: "What this person is in the company. One per user. Grants company-wide keys only (master data, admin functions).",
    example: "Procurement Manager",
  },
  {
    layer: "LAYER 2",
    name: "PROJECT ASSIGNMENT",
    description: "Which projects this person touches at all. Many per user. No permissions of its own — it is the gate that makes layers 3 and 4 apply.",
    example: "",
  },
  {
    layer: "LAYER 3",
    name: "RESPONSIBILITY TEMPLATE",
    description: "What this person does ON that project. A named bundle of permission keys. The SAME user may be 'Site Engineer' on Project A and 'Project Manager' on Project B.",
    example: "",
  },
  {
    layer: "LAYER 4",
    name: "EXPLICIT OVERRIDE",
    description: "Per-assignment GRANT or DENY of a single key. DENY always wins. Used sparingly; every one is an exception that should have a reason.",
    example: "",
  },
];

export const qualifiers = [
  "Approval authority — per document type, a value ceiling and a chain level",
  "Row scope — narrower than the project: specific sites, cost codes, categories",
  "Field restriction — columns this person may not see, per entity",
];

export const inspectionQueries: InspectionQuery[] = [
  {
    title: "1.1 Does any permission concept already exist?",
    language: "sql",
    code: `SELECT table_name FROM information_schema.tables
 WHERE table_schema='public'
   AND (table_name ILIKE '%role%' OR table_name ILIKE '%permission%'
        OR table_name ILIKE '%access%' OR table_name ILIKE '%right%'
        OR table_name ILIKE '%privilege%' OR table_name ILIKE '%user_project%');`,
  },
  {
    title: "1.6 How does the existing application decide access today?",
    language: "bash",
    code: `grep -rn "is_admin\\|hasRole\\|checkPermission\\|canAccess\\|user_type" \\
  --include=*.{php,js,ts,java,cs} ../existing-erp/src | head -40`,
  },
];

export const reportQuestions: ReportQuestion[] = [
  { question: "Existing role values and their meanings", answer: "", consequence: "Seeds global roles" },
  { question: "Existing user-project link, if any", answer: "", consequence: "May seed dx_project_assignment" },
  { question: "Active user count", answer: "", consequence: "Cache sizing" },
  { question: "Active project count", answer: "", consequence: "Resolver cost" },
  { question: "Average projects per user", answer: "", consequence: "If above ~20, read §5.4 on cache strategy" },
  { question: "How the existing app checks access", answer: "", consequence: "Determines whether both systems can coexist" },
];

export const reuseChecks: ReuseCheckItem[] = [
  { searchFor: "Existing role constants", ifFound: "Map them to global roles in seed data", ifNot: "Define per §6.2" },
  { searchFor: "Redis client", ifFound: "Reuse", ifNot: "Already added in 0.1" },
  { searchFor: "Existing @Roles() decorator", ifFound: "Do not reuse — it is role-based, not key-based", ifNot: "Build in 0.5B" },
];

export const databaseTables: DatabaseTable[] = [
  {
    number: "3.1",
    name: "dx_permission",
    purpose: "The permission key registry — every key the system knows",
    schema: `CREATE TABLE dx_permission (
  id            BIGSERIAL PRIMARY KEY,
  permission_key VARCHAR(100) NOT NULL UNIQUE,   -- module.entity.action
  module        VARCHAR(40)  NOT NULL,
  entity        VARCHAR(60)  NOT NULL,
  action        VARCHAR(40)  NOT NULL,
  label         VARCHAR(200) NOT NULL,
  description   TEXT,
  scope_type    VARCHAR(20)  NOT NULL,   -- PROJECT | GLOBAL
  is_sensitive  BOOLEAN      NOT NULL DEFAULT FALSE,  -- needs MFA / extra audit
  registered_by_part VARCHAR(10) NOT NULL,           -- traceability: which part added it
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT ck_dx_perm_key CHECK (permission_key ~ '^[a-z_]+\\.[a-z_]+\\.[a-z_]+$')
);
CREATE INDEX ix_dx_perm_module ON dx_permission (module, entity);`,
  },
  {
    number: "3.2",
    name: "dx_responsibility_template",
    purpose: "Responsibility templates — named bundles of keys",
    schema: `CREATE TABLE dx_responsibility_template (
  id            BIGSERIAL PRIMARY KEY,
  template_code VARCHAR(60)  NOT NULL UNIQUE,
  label         VARCHAR(200) NOT NULL,
  description   TEXT,
  category      VARCHAR(40),          -- SITE|COMMERCIAL|FINANCE|HR|PLANT|QUALITY|ADMIN
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,   -- system templates cannot be deleted
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT, created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by BIGINT, updated_at TIMESTAMPTZ
);

CREATE TABLE dx_responsibility_template_permission (
  id            BIGSERIAL PRIMARY KEY,
  template_id   BIGINT NOT NULL REFERENCES dx_responsibility_template(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL REFERENCES dx_permission(permission_key),
  CONSTRAINT uq_dx_rtp UNIQUE (template_id, permission_key)
);`,
  },
  {
    number: "3.3",
    name: "dx_global_role",
    purpose: "Global roles — company-wide, one per user",
    schema: `CREATE TABLE dx_global_role (
  id            BIGSERIAL PRIMARY KEY,
  role_code     VARCHAR(60)  NOT NULL UNIQUE,
  label         VARCHAR(200) NOT NULL,
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  requires_mfa  BOOLEAN NOT NULL DEFAULT FALSE,
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE dx_global_role_permission (
  id             BIGSERIAL PRIMARY KEY,
  role_id        BIGINT NOT NULL REFERENCES dx_global_role(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL REFERENCES dx_permission(permission_key),
  CONSTRAINT uq_dx_grp UNIQUE (role_id, permission_key)
);

CREATE TABLE dx_user_global_role (
  user_id     BIGINT PRIMARY KEY,                  -- existing user PK
  role_id     BIGINT NOT NULL REFERENCES dx_global_role(id),
  assigned_by BIGINT, assigned_at TIMESTAMPTZ DEFAULT NOW()
);`,
  },
  {
    number: "3.4",
    name: "dx_project_assignment",
    purpose: "Project assignment — the gate",
    schema: `CREATE TABLE dx_project_assignment (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL,                   -- existing user PK
  project_id    BIGINT NOT NULL,                   -- existing project PK
  template_id   BIGINT NOT NULL REFERENCES dx_responsibility_template(id),
  valid_from    DATE   NOT NULL DEFAULT CURRENT_DATE,
  valid_to      DATE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,    -- the user's "home" project
  assigned_by   BIGINT NOT NULL,
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deactivated_by BIGINT, deactivated_at TIMESTAMPTZ, deactivation_reason VARCHAR(200),
  CONSTRAINT uq_dx_pa UNIQUE (user_id, project_id, template_id, valid_from),
  CONSTRAINT ck_dx_pa_dates CHECK (valid_to IS NULL OR valid_to >= valid_from)
);
CREATE INDEX ix_dx_pa_user ON dx_project_assignment (user_id, is_active);
CREATE INDEX ix_dx_pa_project ON dx_project_assignment (project_id, is_active);`,
  },
  {
    number: "3.5",
    name: "dx_assignment_permission",
    purpose: "Explicit overrides — GRANT adds, DENY removes; DENY always wins",
    schema: `CREATE TABLE dx_assignment_permission (
  id             BIGSERIAL PRIMARY KEY,
  assignment_id  BIGINT NOT NULL REFERENCES dx_project_assignment(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL REFERENCES dx_permission(permission_key),
  effect         VARCHAR(6) NOT NULL,              -- GRANT | DENY
  reason         VARCHAR(300) NOT NULL,            -- mandatory: an override is an exception
  granted_by     BIGINT NOT NULL,
  granted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMPTZ,
  CONSTRAINT uq_dx_ap UNIQUE (assignment_id, permission_key),
  CONSTRAINT ck_dx_ap_effect CHECK (effect IN ('GRANT','DENY'))
);`,
  },
  {
    number: "3.6",
    name: "dx_approval_authority",
    purpose: "Approval authority — per assignment, per document type",
    schema: `CREATE TABLE dx_approval_authority (
  id            BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES dx_project_assignment(id) ON DELETE CASCADE,
  document_type VARCHAR(40)  NOT NULL,             -- PO | INDENT | CLIENT_BILL | PAYMENT | ...
  max_value     NUMERIC(18,2),                     -- NULL = unlimited
  currency_code CHAR(3) NOT NULL DEFAULT 'INR',
  chain_level   SMALLINT NOT NULL DEFAULT 1,       -- position in the approval chain
  can_final_approve BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_dx_aa UNIQUE (assignment_id, document_type),
  CONSTRAINT ck_dx_aa_value CHECK (max_value IS NULL OR max_value >= 0)
);`,
  },
  {
    number: "3.7",
    name: "dx_assignment_scope",
    purpose: "Row scope — narrower than the project",
    schema: `CREATE TABLE dx_assignment_scope (
  id            BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES dx_project_assignment(id) ON DELETE CASCADE,
  scope_type    VARCHAR(30) NOT NULL,   -- SITE|COST_CODE|ITEM_CATEGORY|WORK_CATEGORY|VENDOR|WBS
  scope_id      BIGINT NOT NULL,
  CONSTRAINT uq_dx_as UNIQUE (assignment_id, scope_type, scope_id)
);`,
  },
  {
    number: "3.8",
    name: "dx_field_restriction",
    purpose: "Field restrictions — column-level",
    schema: `CREATE TABLE dx_field_restriction (
  id            BIGSERIAL PRIMARY KEY,
  -- exactly one of these two is set
  template_id   BIGINT REFERENCES dx_responsibility_template(id) ON DELETE CASCADE,
  user_id       BIGINT,
  entity        VARCHAR(60) NOT NULL,
  field         VARCHAR(60) NOT NULL,              -- '*' means every field of the entity
  mode          VARCHAR(10) NOT NULL,              -- HIDE | MASK | REDACT
  reason        VARCHAR(200),
  CONSTRAINT ck_dx_fr_target CHECK (
    (template_id IS NOT NULL AND user_id IS NULL) OR
    (template_id IS NULL AND user_id IS NOT NULL)),
  CONSTRAINT ck_dx_fr_mode CHECK (mode IN ('HIDE','MASK','REDACT'))
);
CREATE INDEX ix_dx_fr_entity ON dx_field_restriction (entity, field);`,
  },
  {
    number: "3.9",
    name: "dx_delegation",
    purpose: "Delegation — temporary transfer of specific keys",
    schema: `CREATE TABLE dx_delegation (
  id              BIGSERIAL PRIMARY KEY,
  from_user_id    BIGINT NOT NULL,
  to_user_id      BIGINT NOT NULL,
  project_ids     JSONB,                           -- NULL = all the delegator's projects
  permission_keys JSONB NOT NULL,                  -- explicit list; never "everything"
  valid_from      TIMESTAMPTZ NOT NULL,
  valid_to        TIMESTAMPTZ NOT NULL,
  reason          VARCHAR(300) NOT NULL,
  created_by      BIGINT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at      TIMESTAMPTZ, revoked_by BIGINT,
  CONSTRAINT ck_dx_del_self CHECK (from_user_id <> to_user_id),
  CONSTRAINT ck_dx_del_dates CHECK (valid_to > valid_from)
);
CREATE INDEX ix_dx_del_to ON dx_delegation (to_user_id, valid_from, valid_to)
  WHERE revoked_at IS NULL;`,
  },
  {
    number: "3.10",
    name: "dx_sod_rule",
    purpose: "Segregation of duties rules — evaluated in 0.5B",
    schema: `CREATE TABLE dx_sod_rule (
  id            BIGSERIAL PRIMARY KEY,
  rule_code     VARCHAR(40) NOT NULL UNIQUE,
  action_a      VARCHAR(100) NOT NULL,
  action_b      VARCHAR(100) NOT NULL,
  scope         VARCHAR(20) NOT NULL,   -- SAME_DOCUMENT | SAME_PROJECT | GLOBAL
  severity      VARCHAR(10) NOT NULL,   -- BLOCK | WARN
  description   TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT ck_dx_sod_scope CHECK (scope IN ('SAME_DOCUMENT','SAME_PROJECT','GLOBAL')),
  CONSTRAINT ck_dx_sod_diff CHECK (action_a <> action_b)
);

CREATE TABLE dx_sod_exemption (
  id          BIGSERIAL PRIMARY KEY,
  rule_code   VARCHAR(40) NOT NULL REFERENCES dx_sod_rule(rule_code),
  user_id     BIGINT NOT NULL,
  project_id  BIGINT,                              -- NULL = all projects
  reason      TEXT NOT NULL,
  approved_by BIGINT NOT NULL,
  valid_from  DATE NOT NULL, valid_to DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ck_dx_sodex_dates CHECK (valid_to >= valid_from)
);`,
  },
  {
    number: "3.11",
    name: "dx_assignment_audit",
    purpose: "Assignment audit — every permission change, forever",
    schema: `CREATE TABLE dx_assignment_audit (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL,
  project_id   BIGINT,
  action       VARCHAR(40) NOT NULL,   -- ASSIGNED|DEACTIVATED|TEMPLATE_CHANGED|OVERRIDE_ADDED|
                                        -- OVERRIDE_REMOVED|AUTHORITY_CHANGED|SCOPE_CHANGED|
                                        -- DELEGATED|DELEGATION_REVOKED|GLOBAL_ROLE_CHANGED
  before_state JSONB,
  after_state  JSONB,
  reason       VARCHAR(300),
  actor_user_id BIGINT NOT NULL,
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address   VARCHAR(45)
);
CREATE INDEX ix_dx_aa_user ON dx_assignment_audit (user_id, occurred_at DESC);
CREATE INDEX ix_dx_aa_actor ON dx_assignment_audit (actor_user_id, occurred_at DESC);`,
  },
];

export const resolverCode = `@Injectable()
export class PermissionResolver {
  constructor(
    private repo: PermissionRepository,
    private cache: PermissionCache,
    private clock: Clock,
  ) {}

  async resolve(userId: number, opts: { bypassCache?: boolean } = {}): Promise<EffectivePermissionSet> {
    if (!opts.bypassCache) {
      const hit = await this.cache.get(userId);
      if (hit) return hit;
    }

    const now = this.clock.now();

    // ── 1. User must be active. Inactive short-circuits to an empty set. ──
    const user = await this.repo.getUser(userId);
    if (!user || !user.isActive) return EMPTY_SET(userId);

    // ── 2. Global role and its keys ──
    const role = await this.repo.getGlobalRole(userId);
    const globalKeys = role ? await this.repo.getGlobalRolePermissions(role.id) : [];

    // ── 3. Super Admin. Grants breadth, never removes a control. ──
    //    SoD rules, two-person rules and immutability still apply to Super Admins.
    const isSuperAdmin = role?.isSuperAdmin ?? false;

    // ── 4. Active assignments only. Every condition matters. ──
    const assignments = (await this.repo.getAssignments(userId)).filter(a =>
      a.isActive &&
      a.validFrom <= today(now) &&
      (a.validTo === null || a.validTo >= today(now)) &&
      a.projectIsActive);

    // ── 5. Template keys per assignment ──
    const byProject = new Map<number, Set<PermissionKey>>();
    for (const a of assignments) {
      const keys = await this.repo.getTemplatePermissions(a.templateId);
      const set = byProject.get(a.projectId) ?? new Set<PermissionKey>();
      keys.forEach(k => set.add(k));
      byProject.set(a.projectId, set);
    }

    // ── 6. Overrides. GRANT first, then DENY — so DENY always wins. ──
    const overrides = (await this.repo.getAssignmentPermissions(assignments.map(a => a.id)))
      .filter(o => !o.expiresAt || o.expiresAt > now);

    for (const o of overrides.filter(o => o.effect === 'GRANT'))
      byProject.get(o.projectId)?.add(o.permissionKey);
    for (const o of overrides.filter(o => o.effect === 'DENY'))
      byProject.get(o.projectId)?.delete(o.permissionKey);

    // ── 7. Approval authority ──
    const authority = await this.repo.getApprovalAuthority(assignments.map(a => a.id));

    // ── 8. Row scopes ──
    const scopes = await this.repo.getAssignmentScopes(assignments.map(a => a.id));

    // ── 9. Delegations received. The delegate inherits specific keys on specific
    //      projects — never the delegator's global role, never everything. ──
    const actingFor: EffectivePermissionSet['actingFor'] = [];
    for (const d of await this.repo.getActiveDelegationsFor(userId, now)) {
      const from = await this.resolve(d.fromUserId, { bypassCache: true });
      const projects = d.projectIds ?? [...from.byProject.keys()];

      for (const pid of projects) {
        const theirs = from.byProject.get(pid);
        if (!theirs) continue;
        const set = byProject.get(pid) ?? new Set<PermissionKey>();
        for (const k of d.permissionKeys) if (theirs.has(k)) set.add(k);
        byProject.set(pid, set);
      }
      actingFor.push({ userId: d.fromUserId, delegationId: d.id, expiresAt: d.validTo });
    }

    const set: EffectivePermissionSet = {
      userId,
      globalRole: role?.roleCode ?? 'NONE',
      isSuperAdmin,
      requiresMfa: role?.requiresMfa ?? false,
      global: new Set(globalKeys),
      byProject,
      authority,
      scopes,
      fieldRestrictions: await this.repo.getFieldRestrictions(userId, assignments.map(a => a.templateId)),
      actingFor,
      computedAt: now,
      version: this.computeVersion(user, role, assignments, overrides, actingFor),
    };

    await this.cache.set(userId, set, { ttlSeconds: 300 });
    return set;
  }

  /** Changes whenever anything affecting this user changes. Clients compare it. */
  private computeVersion(...inputs: unknown[]): string {
    return sha256(canonicalJson(inputs)).slice(0, 16);
  }
}`;

export const actorCode = `export class Actor {
  constructor(
    readonly userId: number,
    readonly displayName: string,
    private readonly perms: EffectivePermissionSet,
    readonly ctx: RequestContext,
  ) {}

  can(key: PermissionKey, projectId?: number): boolean {
    if (this.perms.global.has(key)) return true;
    if (projectId === undefined) return false;          // project key without a project = no
    return this.perms.byProject.get(projectId)?.has(key) ?? false;
  }

  assertCan(key: PermissionKey, projectId?: number): void {
    if (!this.can(key, projectId))
      throw new ForbiddenError('PERMISSION_DENIED', {
        key, projectId, userId: this.userId,
        message: this.explainDenial(key, projectId),
      });
  }

  /** Every denial explains itself. A blank 403 generates a support ticket. */
  private explainDenial(key: PermissionKey, projectId?: number): string {
    if (projectId !== undefined && !this.perms.byProject.has(projectId))
      return \`You are not assigned to this project.\`;
    return \`You do not have the "\${key}" permission on this project.\`;
  }

  /** Every project where this actor holds the key. Used by the query filter (0.5B). */
  projectsWith(key: PermissionKey): number[] {
    return [...this.perms.byProject.entries()]
      .filter(([, keys]) => keys.has(key))
      .map(([pid]) => pid);
  }

  hasGlobal(key: PermissionKey): boolean { return this.perms.global.has(key); }

  authorityFor(documentType: string, projectId: number): AuthorityLimit | null {
    return this.perms.authority.get(projectId)?.get(documentType) ?? null;
  }

  scope(projectId: number): ScopeSet | undefined { return this.perms.scopes.get(projectId); }

  restrictionsFor(entity: string): FieldRestriction[] {
    return this.perms.fieldRestrictions.get(entity) ?? [];
  }

  get isSuperAdmin(): boolean { return this.perms.isSuperAdmin; }
  get permVersion(): string { return this.perms.version; }
  get actingFor() { return this.perms.actingFor; }
}`;

export const cacheInvalidations: CacheInvalidation[] = [
  { change: "Assignment created, updated or deactivated", invalidate: "that user" },
  { change: "Template permissions changed", invalidate: "every user holding that template" },
  { change: "Override added or removed", invalidate: "that user" },
  { change: "Approval authority changed", invalidate: "that user" },
  { change: "Scope changed", invalidate: "that user" },
  { change: "Delegation created or revoked", invalidate: "the delegate" },
  { change: "Global role changed, or role's keys changed", invalidate: "affected users" },
  { change: "User deactivated", invalidate: "that user" },
  { change: "Project closed or deactivated", invalidate: "every user assigned to it" },
  { change: "Field restriction changed", invalidate: "affected users" },
];

export const businessRules: BusinessRule[] = [
  { code: "PERMISSION_DENIED", condition: "Key not held", severity: "BLOCK", message: "You do not have the \"{key}\" permission on this project." },
  { code: "PROJECT_NOT_ASSIGNED", condition: "No assignment to the project", severity: "BLOCK", message: "You are not assigned to this project." },
  { code: "UNKNOWN_PERMISSION_KEY", condition: "Code checks an unregistered key", severity: "BLOCK", message: "Config error; fails at boot" },
  { code: "DELEGATION_EXCEEDS_DELEGATOR", condition: "Delegation lists a key the delegator lacks", severity: "BLOCK", message: "You cannot delegate \"{key}\" — you do not hold it." },
  { code: "DELEGATION_TO_SELF", condition: "from = to", severity: "BLOCK", message: "You cannot delegate to yourself." },
  { code: "OVERRIDE_REASON_REQUIRED", condition: "Override without a reason", severity: "BLOCK", message: "State why this permission is being granted or denied." },
  { code: "ASSIGNMENT_DATES_INVALID", condition: "valid_to before valid_from", severity: "BLOCK", message: "The end date cannot be before the start date." },
];

export const resolverTests: TestCase[] = [
  { id: "R1", case: "User with one assignment", expected: "Holds exactly that template's keys, on that project only", starred: true },
  { id: "R2", case: "Same user, two projects, different templates", expected: "Different key sets per project", starred: true },
  { id: "R3", case: "Key held on project A, checked on project B", expected: "can() returns false", starred: true },
  { id: "R4", case: "Explicit DENY on a key the template grants", expected: "Denied", starred: true },
  { id: "R5", case: "DENY and GRANT on the same key", expected: "Denied — DENY wins regardless of row order", starred: true },
  { id: "R6", case: "Assignment with valid_to yesterday", expected: "Not counted" },
  { id: "R7", case: "Assignment with valid_from tomorrow", expected: "Not counted" },
  { id: "R8", case: "Assignment to a closed project", expected: "Not counted", starred: true },
  { id: "R9", case: "Inactive user", expected: "Empty set, regardless of assignments", starred: true },
  { id: "R10", case: "Delegation of a key the delegator holds", expected: "Delegate gains it on the named projects", starred: true },
  { id: "R11", case: "Delegation of a key the delegator does not hold", expected: "Delegate does not gain it", starred: true },
  { id: "R12", case: "Expired delegation", expected: "Not counted" },
  { id: "R13", case: "Super Admin", expected: "Holds global admin keys; still subject to SoD", starred: true },
  { id: "R14", case: "Authority: exactly at limit / limit + 1", expected: "At limit allowed, over refused", starred: true },
  { id: "R15", case: "projectsWith('project.view')", expected: "Returns exactly the assigned active projects" },
  { id: "R16", case: "Global key checked without a project", expected: "Returns true" },
  { id: "R17", case: "Project key checked without a project", expected: "Returns false, never true", starred: true },
];

export const cacheTests: TestCase[] = [
  { id: "C1", case: "Second resolve within TTL", expected: "Served from cache; no database query", starred: true },
  { id: "C2", case: "Assignment deactivated", expected: "Next resolve reflects it immediately, not after TTL", starred: true },
  { id: "C3", case: "Template permissions changed", expected: "Every user holding it is invalidated", starred: true },
  { id: "C4", case: "User deactivated", expected: "Cache cleared and sessions revoked", starred: true },
  { id: "C5", case: "Project closed", expected: "Every assigned user invalidated", starred: true },
  { id: "C6", case: "permVersion after a change", expected: "Differs from before", starred: true },
];

export const performanceTests: PerformanceTest[] = [
  { id: "P1", case: "Cold resolve, 5 projects", budget: "≤ 50ms" },
  { id: "P2", case: "Cold resolve, 50 projects", budget: "≤ 200ms", starred: true },
  { id: "P3", case: "Cached resolve", budget: "≤ 5ms", starred: true },
  { id: "P4", case: "200 concurrent resolves", budget: "No pool exhaustion" },
];

export const completionChecklist: ChecklistCategory[] = [
  {
    category: "Database",
    items: [
      "All eleven tables created; migration down verified ★",
      "Permission key format constraint rejects a malformed key ★",
      "Seed data loaded: 13 keys, 12 global roles, 13 templates, 2 SoD rules",
      "Every template holds project.view and nothing else at this stage",
    ],
  },
  {
    category: "Resolver",
    items: [
      "All seventeen resolver tests pass; R3, R5, R8, R9, R11, R17 with evidence ★",
      "DENY wins deterministically, proven by inserting rows in both orders ★",
      "Delegation cannot escalate beyond the delegator ★",
      "Closed project grants nothing ★",
      "Project-scoped key checked without a project returns false ★",
    ],
  },
  {
    category: "Actor",
    items: [
      "Actor.can() no longer throws; the Part 0.3 stub is fully replaced ★",
      "Every denial message explains itself",
      "/auth/me returns projects and permVersion but not the key list ★",
    ],
  },
  {
    category: "Cache",
    items: [
      "All six cache tests pass; C2, C4 with evidence ★",
      "Every trigger in §4.4's table invalidates correctly ★",
      "Performance budgets met, P2 and P3 with evidence ★",
    ],
  },
  {
    category: "Audit",
    items: [
      "dx_assignment_audit written for every change type with before/after state ★",
      "Reason captured and non-empty for overrides and delegations",
    ],
  },
  {
    category: "Discipline",
    items: [
      "No is_admin boolean anywhere in new code — code search confirms ★",
      "No permission decision is made on the client",
      "SYSTEM_MAP.md, API_REGISTRY.md, DB_CHANGELOG.md updated",
    ],
  },
  {
    category: "Final confirmation",
    items: [
      "No existing table, column, relationship or row was altered. ★",
    ],
  },
];
