export interface Dependency {
  part: string;
  provides: string;
  blocking: string;
}

export interface Prerequisite {
  text: string;
}

export interface Deliverable {
  number: number;
  description: string;
}

export interface SQLQuery {
  title: string;
  code: string;
  note?: string;
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

export interface ChecklistCategory {
  category: string;
  items: string[];
}

export const dependencies: Dependency[] = [
  { part: "0.1", provides: "Repository, environment, additive-migration guard", blocking: "Yes" },
];

export const prerequisites: Prerequisite[] = [
  { text: "Part 0.1 checklist passed, including all three guards observed firing" },
  { text: "A restored copy of the production database in development" },
  { text: "Read access to the existing application source code" },
];

export const deliverables: Deliverable[] = [
  { number: 1, description: "docs/SCHEMA_BASELINE.md — the authoritative record of the existing database" },
  { number: 2, description: "dx/shared/db/schema-map.ts — the logical-to-physical mapping every later part reads" },
  { number: 3, description: "dx/shared/db/legacy-repository.ts — the base class no domain code bypasses" },
  { number: 4, description: "dx/shared/db/legacy-write-bridge.ts — the whitelist controlling writes to existing tables" },
  { number: 5, description: "A frozen baseline snapshot used by Phase 22 to prove nothing changed" },
];

export const inspectionQueries: SQLQuery[] = [
  {
    title: "1.1 Complete table inventory",
    code: `SELECT t.table_name,
       obj_description(c.oid)                       AS table_comment,
       (SELECT COUNT(*) FROM information_schema.columns cc
         WHERE cc.table_name = t.table_name)        AS column_count,
       s.n_live_tup                                 AS approx_rows,
       pg_size_pretty(pg_total_relation_size(c.oid)) AS size
  FROM information_schema.tables t
  JOIN pg_class c ON c.relname = t.table_name
  LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
 WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
 ORDER BY s.n_live_tup DESC NULLS LAST;`,
  },
  {
    title: "1.2 Full column detail",
    code: `SELECT c.table_name, c.ordinal_position, c.column_name, c.data_type,
       c.character_maximum_length, c.numeric_precision, c.numeric_scale,
       c.is_nullable, c.column_default,
       col_description(pc.oid, c.ordinal_position) AS column_comment
  FROM information_schema.columns c
  JOIN pg_class pc ON pc.relname = c.table_name
 WHERE c.table_schema = 'public'
 ORDER BY c.table_name, c.ordinal_position;`,
  },
  {
    title: "1.3 Keys, constraints and indexes",
    code: `-- Primary keys
SELECT tc.table_name, kcu.column_name, tc.constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON kcu.constraint_name = tc.constraint_name
 WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
 ORDER BY tc.table_name, kcu.ordinal_position;

-- Foreign keys — the real relationship map
SELECT tc.table_name AS from_table, kcu.column_name AS from_column,
       ccu.table_name AS to_table, ccu.column_name AS to_column,
       rc.delete_rule, rc.update_rule, tc.constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON kcu.constraint_name = tc.constraint_name
  JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
  JOIN information_schema.referential_constraints rc ON rc.constraint_name = tc.constraint_name
 WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
 ORDER BY tc.table_name;

-- Unique constraints — these tell you what the business considers identity
SELECT tc.table_name, tc.constraint_name,
       string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON kcu.constraint_name = tc.constraint_name
 WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
 GROUP BY tc.table_name, tc.constraint_name
 ORDER BY tc.table_name;

-- Check constraints — business rules already enforced at the database
SELECT tc.table_name, tc.constraint_name, cc.check_clause
  FROM information_schema.table_constraints tc
  JOIN information_schema.check_constraints cc ON cc.constraint_name = tc.constraint_name
 WHERE tc.constraint_type = 'CHECK' AND tc.table_schema = 'public'
   AND cc.check_clause NOT LIKE '%IS NOT NULL%'
 ORDER BY tc.table_name;

-- Indexes
SELECT tablename, indexname, indexdef
  FROM pg_indexes WHERE schemaname = 'public'
 ORDER BY tablename, indexname;`,
  },
  {
    title: "1.4 Triggers, functions and views",
    code: `SELECT event_object_table AS table_name, trigger_name,
       action_timing, event_manipulation, action_statement
  FROM information_schema.triggers
 WHERE trigger_schema = 'public'
 ORDER BY event_object_table;

SELECT routine_name, routine_type, data_type AS returns
  FROM information_schema.routines WHERE routine_schema = 'public'
 ORDER BY routine_name;

SELECT table_name AS view_name, view_definition
  FROM information_schema.views WHERE table_schema = 'public';`,
    note: "Triggers matter enormously. If an existing trigger maintains a stock balance or a running total, any new code that writes through a different path will either duplicate its effect or bypass it. Read every trigger body. Record what each one does in plain language.",
  },
  {
    title: "1.5 Status values — the single most error-prone area",
    code: `-- Find status-like columns
SELECT table_name, column_name, data_type
  FROM information_schema.columns
 WHERE table_schema = 'public'
   AND (column_name ILIKE '%status%' OR column_name ILIKE '%state%'
        OR column_name ILIKE '%stage%' OR column_name ILIKE '%flag%'
        OR column_name ILIKE 'is_%' OR column_name ILIKE '%_type')
 ORDER BY table_name, column_name;

-- Then for EACH one found, run:
SELECT <status_column>, COUNT(*) AS rows,
       MIN(<date_column>) AS first_seen, MAX(<date_column>) AS last_seen
  FROM <table> GROUP BY 1 ORDER BY 2 DESC;`,
    note: "Record every distinct value, its meaning, and whether it is still in use. Ask a business user what each value means — the code may not say, and guessing here corrupts every state machine built later.",
  },
  {
    title: "1.6 Data quality assessment",
    code: `-- Orphan foreign keys (run per FK found in 1.3)
SELECT COUNT(*) AS orphan_count
  FROM <child_table> c
  LEFT JOIN <parent_table> p ON p.<pk> = c.<fk>
 WHERE c.<fk> IS NOT NULL AND p.<pk> IS NULL;

-- Duplicate candidates on business-identity columns
SELECT <identity_columns>, COUNT(*) AS dupes
  FROM <table> GROUP BY <identity_columns> HAVING COUNT(*) > 1;

-- Null coverage on columns your new code will depend on
SELECT COUNT(*) AS total,
       COUNT(<column>) AS populated,
       ROUND(100.0 * COUNT(<column>) / NULLIF(COUNT(*),0), 2) AS pct_populated
  FROM <table>;

-- Numeric sanity on money and quantity columns
SELECT MIN(<col>), MAX(<col>),
       COUNT(*) FILTER (WHERE <col> < 0)  AS negatives,
       COUNT(*) FILTER (WHERE <col> = 0)  AS zeros,
       COUNT(*) FILTER (WHERE <col> IS NULL) AS nulls
  FROM <table>;`,
    note: "Report every finding. Fix nothing. Data quality problems discovered here are business decisions, not developer decisions. A project with 400 orphaned purchase order lines needs someone to decide what they mean before any new code touches them.",
  },
  {
    title: "1.7 How the existing application writes",
    code: `grep -rn "tbl_purchase_order" --include=*.{php,js,ts,java,cs} ../existing-erp/src | head -50`,
    note: "For each core entity record: which files write to it, whether writes go through a service or scattered SQL, whether there are stored procedures, and whether any writes bypass the application entirely (scheduled scripts, reporting tools, direct database access). The last one matters. If a nightly script updates stock balances directly, your new ledger will disagree with it and nobody will know why for three months.",
  },
];

export const schemaBaselineTemplate = `# SCHEMA BASELINE
**Captured:** <date>  **Database:** <name>  **PostgreSQL:** <version>
**Source:** restored copy of production as at <date>
**Captured by:** <name>

## 1. Summary
- Tables: <n>   Columns: <n>   Foreign keys: <n>   Triggers: <n>   Views: <n>
- Database size: <size>
- Largest tables: <top 10 with row counts>

## 2. Business entity map
| Business object | Table | PK | Status column | Numbering column | Soft delete | Rows |
|---|---|---|---|---|---|---|
| Purchase Order | tbl_purchase_order | po_id | po_status | po_no | is_deleted | 84,201 |
| ... | | | | | | |

## 3. Status value dictionary
### tbl_purchase_order.po_status
| Value | Meaning (confirmed by <name>) | Rows | Still used |
|---|---|---|---|
| D | Draft | 1,204 | Yes |
| A | Approved | 71,882 | Yes |
| X | Cancelled (pre-2021 only) | 118 | No |

## 4. Relationship map
<the foreign key list from 1.3, plus any relationships enforced only in application code>

## 5. Triggers and their behaviour
| Table | Trigger | Fires | What it does, in plain language |
|---|---|---|---|

## 6. Write paths
| Table | Written by | Through a service? | Bypasses application? |
|---|---|---|---|

## 7. Data quality findings
| Finding | Table | Count | Severity | Decision needed from |
|---|---|---|---|---|

## 8. Tables NOT used by this project
<explicit list, so a later developer does not wonder whether they were missed>

## 9. Open questions
<anything a business user must answer before the dependent part is built>`;

export const baselineSnapshotCommands = `# Structure-only dump, committed to the repository
pg_dump --schema-only --no-owner --no-privileges \\
        --schema=public "$DATABASE_URL" > docs/baseline/schema_baseline_$(date +%Y%m%d).sql

# Normalised fingerprint for automated comparison
psql "$DATABASE_URL" -At -F'|' -c "
SELECT c.table_name, c.column_name, c.data_type,
       COALESCE(c.character_maximum_length::text,''),
       COALESCE(c.numeric_precision::text,''), COALESCE(c.numeric_scale::text,''),
       c.is_nullable
  FROM information_schema.columns c
 WHERE c.table_schema='public' AND c.table_name NOT LIKE 'dx\\\\_%'
 ORDER BY c.table_name, c.ordinal_position
" | sha256sum > docs/baseline/schema_fingerprint.txt`;

export const schemaFingerprintCheck = `// tools/ci/assert-schema-unchanged.ts
// Runs in CI on every commit from here to Phase 22.
const current = await computeFingerprint(pool);
const baseline = readFileSync('docs/baseline/schema_fingerprint.txt', 'utf8').trim();

if (current !== baseline) {
  console.error('✗ EXISTING SCHEMA HAS CHANGED');
  console.error('  baseline:', baseline);
  console.error('  current: ', current);
  console.error('\\nRule 1 has been violated, or a DCR was applied without updating the baseline.');
  console.error('Run tools/ci/diff-schema.ts to see what differs.');
  process.exit(1);
}`;

export const schemaMapCode = `// dx/shared/db/schema-map.ts

export interface EntityMap {
  /** logical name used throughout the dx codebase */
  key: string;
  table: string;
  pk: string;
  /** logical field name -> physical column name */
  columns: Record<string, string>;
  statusColumn?: string;
  /** logical state -> physical stored value */
  statusValues?: Record<string, string | number>;
  softDelete?: { column: string; activeValue: unknown };
  numberColumn?: string;
  /** columns dx code is permitted to write; everything else throws */
  writable?: string[];
  /** true when an existing trigger maintains derived values on this table */
  hasTriggers?: boolean;
  notes?: string;
}

export const SCHEMA_MAP: Record<string, EntityMap> = {
  purchaseOrder: {
    key: 'purchaseOrder',
    table: 'tbl_purchase_order',
    pk: 'po_id',
    columns: {
      id: 'po_id',
      number: 'po_no',
      date: 'po_dt',
      vendorId: 'supplier_id',
      projectId: 'proj_id',
      totalValue: 'po_amt',
      status: 'po_status',
      createdBy: 'created_by',
      createdAt: 'created_dt',
    },
    statusColumn: 'po_status',
    statusValues: {
      DRAFT: 'D',
      PENDING_APPROVAL: 'P',
      APPROVED: 'A',
      CANCELLED: 'X',
    },
    softDelete: { column: 'is_deleted', activeValue: 0 },
    numberColumn: 'po_no',
    writable: [],                       // dx code writes nothing here by default
    hasTriggers: false,
    notes: 'Status X unused since 2021. po_amt excludes tax; tax is in tbl_po_tax.',
  },

  // ... one entry per entity identified in Step 2 §2
};

/** Fail fast at boot rather than at the first query. */
export function assertSchemaMapValid(pool: Pool): Promise<void> { /* see §4.4 */ }`;

export const legacyRepositoryCode = `// dx/shared/db/legacy-repository.ts

export abstract class LegacyRepository<TLogical extends Record<string, unknown>> {
  protected abstract readonly entityKey: keyof typeof SCHEMA_MAP;

  protected get map(): EntityMap {
    const m = SCHEMA_MAP[this.entityKey as string];
    if (!m) throw new ConfigError('ENTITY_NOT_MAPPED', { entity: this.entityKey });
    return m;
  }

  /** SELECT clause that renames physical columns to logical names. */
  protected selectClause(alias = 't'): string {
    return Object.entries(this.map.columns)
      .map(([logical, physical]) => \`\${alias}.\${physical} AS "\${logical}"\`)
      .join(', ');
  }

  /** Active-row predicate honouring soft delete. */
  protected activeClause(alias = 't'): string {
    const sd = this.map.softDelete;
    return sd ? \`\${alias}.\${sd.column} = \${literal(sd.activeValue)}\` : 'TRUE';
  }

  /** Map a logical state to the physical stored value. Throws on unmapped. */
  protected toPhysicalStatus(state: string): string | number {
    const v = this.map.statusValues?.[state];
    if (v === undefined)
      throw new DataError('UNMAPPED_STATUS', {
        entity: this.entityKey, state,
        known: Object.keys(this.map.statusValues ?? {}),
      });
    return v;
  }

  /** Map a stored value to a logical state. Throws on unmapped — never defaults. */
  protected toLogicalStatus(raw: unknown): string {
    const hit = Object.entries(this.map.statusValues ?? {}).find(([, v]) => v === raw);
    if (!hit)
      throw new DataError('UNMAPPED_STATUS_VALUE', {
        entity: this.entityKey, raw,
        remedy: \`Add "\${raw}" to SCHEMA_MAP.\${String(this.entityKey)}.statusValues after confirming its meaning.\`,
      });
    return hit[0];
  }

  protected toPhysical(patch: Partial<TLogical>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      const col = this.map.columns[k];
      if (!col) throw new ConfigError('NO_COLUMN_MAPPING', { entity: this.entityKey, field: k });
      out[col] = v;
    }
    return out;
  }
}`;

export const writeBridgeCode = `// dx/shared/db/legacy-write-bridge.ts

@Injectable()
export class LegacyWriteBridge {
  /**
   * dx code may write to an existing table ONLY through here, ONLY to whitelisted
   * columns, and ONLY where no existing application service covers the operation.
   */
  assertWritable(entityKey: string, columns: string[]): void {
    const map = SCHEMA_MAP[entityKey];
    if (!map) throw new ConfigError('ENTITY_NOT_MAPPED', { entityKey });

    const allowed = new Set(map.writable ?? []);
    const denied = columns.filter(c => !allowed.has(c));

    if (denied.length)
      throw new ForbiddenWriteError('LEGACY_WRITE_NOT_PERMITTED', {
        entity: entityKey, columns: denied,
        remedy: allowed.size === 0
          ? \`No dx code may write to \${map.table}. Use a dx_ side table, or call the existing application service.\`
          : \`Permitted columns: \${[...allowed].join(', ')}. Adding another requires an ADR.\`,
      });
  }

  /** Prefer this: call the existing application's own service where one exists. */
  async throughExistingService(entityKey: string, operation: string, payload: unknown) {
    const handler = EXISTING_SERVICE_BRIDGE[\`\${entityKey}.\${operation}\`];
    if (!handler)
      throw new ConfigError('NO_EXISTING_SERVICE_BRIDGE', { entityKey, operation });
    return handler(payload);
  }
}`;

export const bootValidationCode = `export async function assertSchemaMapValid(pool: Pool): Promise<void> {
  const problems: string[] = [];

  for (const [key, map] of Object.entries(SCHEMA_MAP)) {
    const { rows } = await pool.query(
      \`SELECT column_name FROM information_schema.columns
        WHERE table_schema='public' AND table_name=$1\`, [map.table]);

    if (rows.length === 0) { problems.push(\`\${key}: table "\${map.table}" does not exist\`); continue; }

    const actual = new Set(rows.map(r => r.column_name));
    for (const [logical, physical] of Object.entries(map.columns))
      if (!actual.has(physical))
        problems.push(\`\${key}.\${logical}: column "\${physical}" not found in \${map.table}\`);

    if (!actual.has(map.pk)) problems.push(\`\${key}: pk "\${map.pk}" not found\`);
    if (map.softDelete && !actual.has(map.softDelete.column))
      problems.push(\`\${key}: soft-delete column "\${map.softDelete.column}" not found\`);
    for (const w of map.writable ?? [])
      if (!actual.has(w)) problems.push(\`\${key}: writable column "\${w}" not found\`);
  }

  if (problems.length) {
    console.error('✗ SCHEMA MAP DOES NOT MATCH THE DATABASE\\n');
    problems.forEach(p => console.error('  ' + p));
    throw new Error('Schema map validation failed. Fix schema-map.ts or SCHEMA_BASELINE.md.');
  }
}`;

export const businessRules: BusinessRule[] = [
  {
    code: "ENTITY_NOT_MAPPED",
    condition: "Repository references an unmapped entity",
    severity: "BLOCK",
    message: "Entity {key} is not in SCHEMA_MAP. Add it and update SCHEMA_BASELINE.md.",
  },
  {
    code: "NO_COLUMN_MAPPING",
    condition: "Code references an unmapped logical field",
    severity: "BLOCK",
    message: "No column mapping for {entity}.{field}.",
  },
  {
    code: "UNMAPPED_STATUS_VALUE",
    condition: "Database holds a status value not in the map",
    severity: "BLOCK",
    message: "Status value '{raw}' on {entity} is unknown. Confirm its meaning and add it to the map.",
  },
  {
    code: "LEGACY_WRITE_NOT_PERMITTED",
    condition: "Write attempted to a non-whitelisted column",
    severity: "BLOCK",
    message: "No dx code may write to {table}. Use a dx_ side table or the existing service.",
  },
  {
    code: "SCHEMA_FINGERPRINT_MISMATCH",
    condition: "CI detects existing-schema change",
    severity: "BLOCK",
    message: "The existing schema has changed since baseline.",
  },
];

export const testCases: TestCase[] = [
  { id: "T1", case: "assertSchemaMapValid() against the dev database", expected: "Passes with zero problems", starred: true },
  { id: "T2", case: "Map an entity to a non-existent table", expected: "Boot fails naming the table", starred: true },
  { id: "T3", case: "Map a field to a non-existent column", expected: "Boot fails naming the column", starred: true },
  { id: "T4", case: "toLogicalStatus('Z') for an unmapped value", expected: "Throws UNMAPPED_STATUS_VALUE", starred: true },
  { id: "T5", case: "toPhysicalStatus('NONSENSE')", expected: "Throws UNMAPPED_STATUS, lists known states" },
  { id: "T6", case: "Write attempt to a non-whitelisted column", expected: "Throws LEGACY_WRITE_NOT_PERMITTED", starred: true },
  { id: "T7", case: "selectClause() output", expected: "Returns logical field names; verified against a real row" },
  { id: "T8", case: "activeClause() on a soft-delete entity", expected: "Excludes deleted rows; count matches manual query" },
  { id: "T9", case: "Schema fingerprint check, unchanged database", expected: "Passes" },
  { id: "T10", case: "Add a column to an existing table, re-run fingerprint", expected: "Fails naming the difference", starred: true },
  { id: "T11", case: "Create dx_test_table, re-run fingerprint", expected: "Passes — dx tables excluded", starred: true },
  { id: "T12", case: "Round-trip: read a real PO through the repository", expected: "Every mapped field populated correctly", starred: true },
];

export const completionChecklist: ChecklistCategory[] = [
  {
    category: "Inspection",
    items: [
      "Every query in Step 1 run and its output recorded",
      "Every trigger body read and described in plain language ★",
      "Every status column's actual values extracted and their meanings confirmed by a business user, not inferred ★",
      "Write paths identified, including any that bypass the application ★",
      "Data quality findings recorded with the decision-owner named",
    ],
  },
  {
    category: "SCHEMA_BASELINE.md",
    items: [
      "All nine sections complete",
      "Business entity map covers every table the project will touch",
      "Status dictionary covers every status column with confirmed meanings ★",
      "Tables not used by the project are explicitly listed",
      "Open questions listed with the part number each will block ★",
    ],
  },
  {
    category: "Baseline snapshot",
    items: [
      "schema_baseline_<date>.sql committed",
      "schema_fingerprint.txt committed",
      "Fingerprint check wired into CI and observed failing on a deliberate change ★",
      "Fingerprint observed passing when a dx_ table is added ★",
    ],
  },
  {
    category: "Adapter layer",
    items: [
      "schema-map.ts covers every entity in the baseline's entity map",
      "assertSchemaMapValid() runs at boot and passes ★",
      "Unmapped status values throw rather than default ★",
      "Every entity has writable: [] unless an ADR records otherwise ★",
      "LegacyRepository round-trips a real record correctly ★",
    ],
  },
  {
    category: "Discipline",
    items: [
      "A code search confirms no file outside dx/shared/db/ references a physical table or column name ★",
      "ADR-003 records the schema map approach",
      "SYSTEM_MAP.md notes that this part creates no tables",
      "DB_CHANGELOG.md records the baseline capture",
    ],
  },
  {
    category: "Final confirmation",
    items: [
      "No existing table, column, relationship, constraint or row was altered. ★",
    ],
  },
];
