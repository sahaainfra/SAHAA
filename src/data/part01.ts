export interface InspectionQuery {
  title: string;
  code: string;
  language: string;
}

export interface DecisionOption {
  option: string;
  structure: string;
  when: string;
  consequences: string;
}

export interface TrackingDocument {
  filename: string;
  title: string;
  content: string;
}

export interface TestCase {
  id: string;
  case: string;
  expected: string;
  starred?: boolean;
}

export interface ChecklistItem {
  category: string;
  items: string[];
}

export const inspectionQueries: InspectionQuery[] = [
  {
    title: "The existing application",
    language: "bash",
    code: `# Language, framework, versions
cat package.json 2>/dev/null || cat composer.json 2>/dev/null || cat pom.xml 2>/dev/null
node --version; npm --version
psql --version

# Repository shape
git log --oneline -20
git branch -a
find . -maxdepth 2 -type d -not -path './node_modules*' -not -path './.git*' | head -40

# How does it run today?
cat README.md 2>/dev/null | head -60
ls -la | grep -iE 'docker|compose|makefile|procfile'`,
  },
  {
    title: "The database connection",
    language: "sql",
    code: `SELECT version();
SELECT current_database(), current_user;
SELECT schema_name FROM information_schema.schemata
 WHERE schema_name NOT IN ('information_schema','pg_catalog','pg_toast');

-- Size and scale
SELECT COUNT(*) AS table_count FROM information_schema.tables
 WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size;

-- The ten largest tables — these determine your performance work later
SELECT relname AS table_name,
       n_live_tup AS approx_rows,
       pg_size_pretty(pg_total_relation_size(relid)) AS total_size
  FROM pg_stat_user_tables
 ORDER BY n_live_tup DESC
 LIMIT 10;

-- Does anything already use a dx_ prefix? (it must not)
SELECT table_name FROM information_schema.tables
 WHERE table_schema = 'public' AND table_name LIKE 'dx_%';`,
  },
];

export const inspectionQuestions = [
  "Existing language and framework",
  "Existing ORM or query layer",
  "PostgreSQL version",
  "Table count",
  "Database size",
  "Ten largest tables by row count",
  "Does dx_ prefix collide with anything?",
  "Existing test framework, if any",
  "Existing CI, if any",
  "How the app is deployed today",
];

export const repositoryOptions: DecisionOption[] = [
  {
    option: "A — New code inside the existing repository (recommended)",
    structure: `existing-erp/
  src/              ← existing application, untouched
  dx/               ← everything from these 174 parts
    platform/
    modules/
    shared/
  migrations/
    existing/       ← untouched
    dx/             ← all new migrations`,
    when: "the existing app is actively maintained, you want one deployment, and the team is small.",
    consequences: "shared dependency tree, shared build, one deploy. Conflicts in package.json must be resolved rather than avoided.",
  },
  {
    option: "B — Separate service, shared database",
    structure: `existing-erp/       ← untouched
erp-dx/             ← new service, same database`,
    when: "the existing app uses a stack you cannot extend (an old PHP version, a framework you are retiring), or you need independent deployment.",
    consequences: "two deployments, shared database connection pool (size it for both), session sharing must be solved explicitly in Part 0.4, and CORS/reverse-proxy configuration is real work.",
  },
];

export const folderStructure = `dx/
  platform/
    uow/                  Part 0.3 — UnitOfWork, transaction context
    money/                Part 0.3 — Money, Quantity, rounding
    api/                  Part 0.3 — envelope, filter grammar, errors
    auth/                 Part 0.4 — authentication, session, MFA
    permission/           Part 0.5 — resolver, guard, query filter, masking
    audit/                Part 0.6 — audit writer, hash chain
    outbox/               Part 0.6 — publisher, relay, subscriber registry
    document/             Part 1.1 — document framework, states, numbering
    workflow/             Part 1.2 — approval engine
    calc/                 Part 1.3 — formulas, rates, tax, deductions
    posting/              Part 1.4 — stock ledger, general ledger
    realtime/             Part 1.5 — gateway, fan-out, KPI service
    notification/         Part 1.6 — dispatcher, transports, templates
    ui-meta/              Part 1.7 — metadata model and generators
    reporting/            Part 1.9 — export, print
    integration/          Part 1.10 — connector framework
  modules/
    masters/              Phase 2
    hr/                   Phase 3
    planning/             Phase 4
    procurement/          Phase 5
    inventory/            Phase 6
    subcontract/          Phase 7
    measurement/          Phase 8
    billing/              Phase 9
    finance/              Phase 10
    plant/                Phase 11
    quality/              Phase 12
    dashboards/           Phase 13
    qs/                   Phase 14
    chat/                 Phase 15
    tender/               Phase 17
    assets/               Phase 18
    welfare/              Phase 19
    handover/             Phase 20
    admin/                Phase 21 — backup and restore
  shared/
    db/                   schema map, legacy repository base
    types/
    errors/
    utils/
    testing/              fixtures, seed, test helpers
  web/
    src/
      app/                shell, routing
      design/             tokens, theme (Part 0.7)
      components/         shared components (Part 1.8)
      generated/          metadata-driven screens (Part 1.7)
      modules/            per-module screens
migrations/
  dx/
tools/
  ci/
docs/
  SYSTEM_MAP.md
  API_REGISTRY.md
  DB_CHANGELOG.md
  SCHEMA_BASELINE.md      produced by Part 0.2
  ARCHITECTURE_DECISIONS.md`;

export const moduleStructure = `modules/<module>/
  domain/         entities, value objects, validators, state machines
  application/    use-case services
  api/            controllers, DTOs, mappers
  config/         document definitions, workflows, posting rules, UI metadata, permissions
  __tests__/`;

export const environmentVariables = `# .env.example — commit this; never commit .env
NODE_ENV=development
PORT=3000

# Database — a RESTORED COPY in development, never production
DATABASE_URL=postgresql://user:pass@localhost:5432/erp_dev
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20
DATABASE_STATEMENT_TIMEOUT_MS=30000

# Read pool for reports, so a heavy query cannot starve transactional traffic
DATABASE_READ_URL=postgresql://user:pass@localhost:5432/erp_dev
DATABASE_READ_POOL_MAX=10

# Redis — permission cache, sessions, job queue
REDIS_URL=redis://localhost:6379

# Session and auth (Part 0.4)
SESSION_SECRET=<32+ random bytes, different per environment>
SESSION_TTL_MINUTES=480
JWT_PUBLIC_KEY_PATH=./keys/jwt.pub
JWT_PRIVATE_KEY_PATH=./keys/jwt.key

# Secrets — Part 1.10 requires a real secret manager in production
SECRET_MANAGER=env            # env | aws-sm | vault | azure-kv
SECRET_MANAGER_PREFIX=erp/dx/

# File storage
FILE_STORAGE=local            # local | s3 | azure-blob
FILE_STORAGE_PATH=./storage
FILE_MAX_UPLOAD_MB=25

# Feature flags — every dx_ surface can be switched off (see §6)
DX_FEATURES_ENABLED=true

# Observability
LOG_LEVEL=info
LOG_FORMAT=json`;

export const databaseConnections = `// shared/db/connections.ts
export const writePool = new Pool({
  connectionString: env.DATABASE_URL,
  min: env.DATABASE_POOL_MIN,
  max: env.DATABASE_POOL_MAX,
  statement_timeout: env.DATABASE_STATEMENT_TIMEOUT_MS,
  application_name: 'erp-dx-write',
});

export const readPool = new Pool({
  connectionString: env.DATABASE_READ_URL ?? env.DATABASE_URL,
  max: env.DATABASE_READ_POOL_MAX,
  statement_timeout: 120_000,          // reports may legitimately take longer
  application_name: 'erp-dx-read',
});`;

export const additiveMigrationCheck = `// tools/ci/assert-additive-migrations.ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const PREFIX = /^(dx_|vw_dx_)/;
const DDL = /\\b(ALTER|DROP|RENAME|TRUNCATE)\\s+(TABLE|COLUMN|INDEX|CONSTRAINT|VIEW|SEQUENCE)\\b/i;
const TARGET = /\\b(?:TABLE|INDEX|VIEW|SEQUENCE)\\s+(?:IF\\s+EXISTS\\s+)?"?([a-z0-9_]+)"?/i;

export function assertAdditive(sql: string, file: string): string[] {
  const violations: string[] = [];
  // strip comments and string literals so a comment mentioning ALTER does not trip it
  const cleaned = sql
    .replace(/--[^\\n]*/g, '')
    .replace(/\\/\\*[\\s\\S]*?\\*\\//g, '')
    .replace(/'(?:[^']|'')*'/g, "''");

  for (const stmt of cleaned.split(';')) {
    if (!DDL.test(stmt)) continue;
    const target = TARGET.exec(stmt)?.[1];
    if (!target || !PREFIX.test(target)) {
      violations.push(\`\${file}: statement targets non-dx object "\${target ?? 'unknown'}":\\n  \${stmt.trim().slice(0, 200)}\`);
    }
  }
  return violations;
}

// runner
const dir = 'migrations/dx';
const all = readdirSync(dir).filter(f => f.endsWith('.sql'))
  .flatMap(f => assertAdditive(readFileSync(join(dir, f), 'utf8'), f));

if (all.length) {
  console.error('\\n✗ ADDITIVE MIGRATION CHECK FAILED\\n');
  all.forEach(v => console.error('  ' + v + '\\n'));
  console.error('Rule 1: the existing database is frozen. If a change is genuinely');
  console.error('unavoidable, raise a DCR per 02_BUILD_CONVENTIONS.md §5.\\n');
  process.exit(1);
}
console.log(\`✓ additive migration check passed (\${readdirSync(dir).length} files)\`);`;

export const ormSynchroniseGuard = `// shared/db/data-source.ts
export const dataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  synchronize: false,          // NEVER true, in any environment
  migrationsRun: false,        // migrations run explicitly, never on boot
  entities: [...],
  migrations: ['migrations/dx/*.js'],
});

// Boot-time assertion — fail loudly rather than silently altering production
if ((dataSource.options as any).synchronize === true) {
  throw new Error('FATAL: ORM synchronize is enabled. This would alter the existing schema.');
}

// Every entity mapped to an existing table is declared read-shape-only:
@Entity({ name: 'tbl_purchase_order', synchronize: false })
export class LegacyPurchaseOrder { /* ... */ }`;

export const secretLiteralCheck = `// tools/ci/assert-no-secrets.ts
const PATTERNS = [
  /['"](?:[A-Za-z0-9+/]{40,}={0,2})['"]/,        // base64-ish blobs
  /(?:password|passwd|pwd|secret|api[_-]?key|token)\\s*[:=]\\s*['"][^'"]{8,}['"]/i,
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
  /postgres(?:ql)?:\\/\\/[^:]+:[^@]+@/,             // connection string with password
];
// scan dx/** and migrations/**, excluding *.example and __tests__ fixtures`;

export const ciPipeline = `# .github/workflows/dx.yml  (adapt to your CI)
name: dx
on: [push, pull_request]

jobs:
  guards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - name: Additive migration check
        run: npx tsx tools/ci/assert-additive-migrations.ts
      - name: Secret literal check
        run: npx tsx tools/ci/assert-no-secrets.ts
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    needs: guards
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test, POSTGRES_DB: erp_test }
        options: >-
          --health-cmd pg_isready --health-interval 10s
          --health-timeout 5s --health-retries 5
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run migrate:test
      - run: npm test`;

export const featureKillSwitch = `// shared/config/features.ts
export const features = {
  enabled: env.DX_FEATURES_ENABLED === 'true',
  module: (name: string) => env[\`DX_MODULE_\${name.toUpperCase()}\`] !== 'false',
};

// Applied at the router level, not per endpoint
if (!features.enabled) {
  app.use('/api/dx', (_req, res) =>
    res.status(503).json({
      ok: false,
      error: { code: 'DX_DISABLED', message: 'Enhanced features are currently disabled.' },
    }));
}`;

export const trackingDocuments: TrackingDocument[] = [
  {
    filename: "docs/SYSTEM_MAP.md",
    title: "System Map",
    content: `# System Map — every dx_ table
| Table | Created in | Owner | Purpose | Est. rows/yr | Retention |
|---|---|---|---|---|---|`,
  },
  {
    filename: "docs/API_REGISTRY.md",
    title: "API Registry",
    content: `# API Registry — generated, do not hand-edit
| Method | Path | Permission key | Idempotent | Part |
|---|---|---|---|---|`,
  },
  {
    filename: "docs/DB_CHANGELOG.md",
    title: "Database Changelog",
    content: `# Database Changelog
| Migration | Part | Date | Tables | Rollback verified | DCR |
|---|---|---|---|---|---|`,
  },
  {
    filename: "docs/ARCHITECTURE_DECISIONS.md",
    title: "Architecture Decisions",
    content: `# Architecture Decisions
## ADR-001 — Repository layout
**Decision:** <Option A or B from Step 2>
**Date:** <date>  **Reason:** <why>  **Consequences:** <what this makes harder>`,
  },
];

export const testCases: TestCase[] = [
  { id: "T1", case: "npm ci && npm run build on a clean clone", expected: "Succeeds" },
  { id: "T2", case: "Application starts and connects to the dev database", expected: "Health endpoint returns 200" },
  { id: "T3", case: "Migration with ALTER TABLE <existing>", expected: "Additive check fails the build", starred: true },
  { id: "T4", case: "Migration creating dx_test_table", expected: "Additive check passes" },
  { id: "T5", case: "ORM synchronize: true", expected: "Boot assertion throws", starred: true },
  { id: "T6", case: "File containing a connection string with a password", expected: "Secret check fails", starred: true },
  { id: "T7", case: "DX_FEATURES_ENABLED=false", expected: "/api/dx/* returns 503; existing app unaffected", starred: true },
  { id: "T8", case: "Integration test suite against the PostgreSQL container", expected: "Runs and passes" },
  { id: "T9", case: "Both pools visible in pg_stat_activity with distinct application_name", expected: "Confirmed" },
];

export const completionChecklist: ChecklistItem[] = [
  {
    category: "Environment",
    items: [
      "Clean clone builds and runs",
      "Development database is a restored copy, never production ★",
      ".env.example complete; .env git-ignored",
      "Separate read and write pools with distinct application_name ★",
      "Statement timeouts set on both pools",
    ],
  },
  {
    category: "Repository",
    items: [
      "Folder structure per Step 3 created exactly",
      "ADR-001 records the one-repository-or-two decision with its reason ★",
      "dx_ prefix confirmed non-colliding, or an alternative chosen and recorded ★",
    ],
  },
  {
    category: "Guards",
    items: [
      "Additive migration check implemented and observed failing on a deliberate violation ★",
      "ORM synchronize is false everywhere; boot assertion present and observed throwing ★",
      "Secret literal check implemented and observed failing on a planted credential ★",
      "All three guards wired into CI and blocking",
    ],
  },
  {
    category: "Kill switch",
    items: [
      "DX_FEATURES_ENABLED=false disables all /api/dx routes ★",
      "With it disabled, the original application behaves exactly as before ★",
    ],
  },
  {
    category: "Documents",
    items: [
      "SYSTEM_MAP.md, API_REGISTRY.md, DB_CHANGELOG.md, ARCHITECTURE_DECISIONS.md created",
      "Step 1 inspection output recorded in ARCHITECTURE_DECISIONS.md as ADR-002",
    ],
  },
  {
    category: "Final confirmation",
    items: [
      "No existing table, column, relationship, constraint or row was altered. ★",
    ],
  },
];

export const prerequisites = [
  "Access to the existing ERP source code repository (read access is enough for now)",
  "Access to a copy of the production database, restored into a development instance",
  "Confirmation of the existing stack: language, framework, database version, ORM",
  "A decision on whether the new code lives in the existing repository or a new one (§2)",
];

export const environmentRules = [
  ".env is never committed. .env.example always is, with every key present and no real value.",
  "Secrets in development may come from environment variables. In production they must come from a secret manager — Part 1.10 enforces this, and the CI check in §5.3 fails a build that contains a credential-shaped literal.",
  "DATABASE_STATEMENT_TIMEOUT_MS is deliberately set. A runaway report query that holds a connection for ten minutes is how the whole system appears to go down.",
];
