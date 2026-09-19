export interface Dependency {
  part: string;
  provides: string;
  blocking: string;
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
  { part: "0.1", provides: "Repository, environment, CI guards", blocking: "Yes" },
  { part: "0.2", provides: "SCHEMA_MAP, LegacyRepository, SCHEMA_BASELINE.md", blocking: "Yes" },
];

export const prerequisites = [
  "Part 0.2 checklist passed, including the fingerprint guard observed failing and passing",
  "assertSchemaMapValid() passes at boot",
  "Both database pools connect",
];

export const deliverables = [
  "UnitOfWork and UowContext — the transaction boundary",
  "Money and Quantity — value objects with correct arithmetic",
  "The API response envelope, filter grammar, pagination and concurrency handling",
  "The error catalogue and the base controller",
  "The API registry generator",
];

export const inspectionCommands = [
  {
    title: "What does the existing app use for money?",
    code: `grep -rn "parseFloat\\|toFixed\\|Number(" --include=*.{ts,js} ../existing-erp/src \\
  | grep -iE "amount|price|rate|total|value" | head -30`,
  },
  {
    title: "Existing error handling shape",
    code: `grep -rn "class.*Error\\|throw new" --include=*.ts dx/ ../existing-erp/src | head -20`,
  },
  {
    title: "Existing API response shape",
    code: `grep -rn "res.json\\|res.send" --include=*.{ts,js} ../existing-erp/src | head -20`,
  },
];

export const reuseChecks: ReuseCheckItem[] = [
  {
    searchFor: "decimal.js, big.js, bignumber.js in dependencies",
    ifFound: "Use it as Money's internal representation",
    ifNot: "Add decimal.js",
  },
  {
    searchFor: "Existing AppError / HttpException hierarchy",
    ifFound: "Extend it rather than creating a parallel one",
    ifNot: "Build per §4.4",
  },
  {
    searchFor: "Existing transaction helper",
    ifFound: "Wrap it in UnitOfWork; do not replace it",
    ifNot: "Build per §4.1",
  },
  {
    searchFor: "Existing pagination convention",
    ifFound: "Match its parameter names if the front end depends on them",
    ifNot: "Use $top/$skip",
  },
];

export const idempotencyTable = `CREATE TABLE dx_idempotency (
  key              VARCHAR(120)  PRIMARY KEY,
  actor_user_id    BIGINT        NOT NULL,
  endpoint         VARCHAR(200)  NOT NULL,
  request_hash     CHAR(64)      NOT NULL,
  status           VARCHAR(20)   NOT NULL,     -- IN_PROGRESS | COMPLETED | FAILED
  response_status  INTEGER,
  response_body    JSONB,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ   NOT NULL
);
CREATE INDEX ix_dx_idem_expiry ON dx_idempotency (expires_at);`;

export const unitOfWorkCode = `// dx/platform/uow/unit-of-work.ts

export interface UowContext {
  tx: QueryRunner;
  actor: Actor;
  correlationId: string;
  /** Server clock, captured ONCE per request. Never call new Date() inside a service. */
  now: Date;
  audit: AuditCollector;      // buffered; flushed inside this transaction (Part 0.6)
  outbox: OutboxCollector;    // buffered; flushed inside this transaction (Part 0.6)
}

@Injectable()
export class UnitOfWork {
  constructor(
    private ds: DataSource,
    private audit: AuditWriter,
    private outbox: OutboxWriter,
    private clock: Clock,
  ) {}

  async run<T>(actor: Actor, fn: (ctx: UowContext) => Promise<T>): Promise<T> {
    const tx = this.ds.createQueryRunner();
    await tx.connect();
    await tx.startTransaction('READ COMMITTED');

    const ctx: UowContext = {
      tx, actor,
      correlationId: actor.ctx.correlationId ?? randomUUID(),
      now: this.clock.now(),
      audit: new AuditCollector(),
      outbox: new OutboxCollector(),
    };

    try {
      const result = await fn(ctx);
      await this.audit.flush(ctx);     // both flush INSIDE the transaction
      await this.outbox.flush(ctx);
      await tx.commitTransaction();
      return result;
    } catch (e) {
      await tx.rollbackTransaction();
      throw e;
    } finally {
      await tx.release();
    }
  }
}`;

export const actorCode = `// dx/platform/permission/actor.ts

export class Actor {
  constructor(
    readonly userId: number,
    readonly displayName: string,
    readonly ctx: {
      ip: string;
      userAgent?: string;
      deviceClass: 'DESKTOP' | 'TABLET' | 'PHONE';
      deviceId?: string;
      sessionId: string;
      correlationId: string;
      isImpersonation: boolean;
      impersonatedBy?: number;
    },
  ) {}

  /** Part 0.5 replaces this body with the real resolver. */
  can(_key: string, _projectId?: number): boolean {
    throw new Error('Permission resolution is not implemented until Part 0.5');
  }

  assertCan(key: string, projectId?: number): void {
    if (!this.can(key, projectId))
      throw new ForbiddenError('PERMISSION_DENIED', { key, projectId, userId: this.userId });
  }
}

export const SYSTEM_ACTOR = new Actor(0, 'System', {
  ip: '127.0.0.1', deviceClass: 'DESKTOP', sessionId: 'system',
  correlationId: 'system', isImpersonation: false,
});`;

export const moneyCode = `// dx/platform/money/money.ts
import Decimal from 'decimal.js';

const MINOR_UNITS: Record<string, number> = { INR: 2, USD: 2, EUR: 2, JPY: 0 };

export class Money {
  private constructor(
    private readonly minor: bigint,
    readonly currency: string,
  ) {}

  static of(v: string | number | Decimal, ccy = 'INR'): Money {
    const scale = MINOR_UNITS[ccy];
    if (scale === undefined) throw new CalcError('UNKNOWN_CURRENCY', { currency: ccy });
    return new Money(BigInt(new Decimal(v).times(10 ** scale).toFixed(0)), ccy);
  }
  static zero(ccy = 'INR'): Money { return new Money(0n, ccy); }

  private same(o: Money): void {
    if (o.currency !== this.currency)
      throw new CalcError('CURRENCY_MISMATCH', { a: this.currency, b: o.currency });
  }

  plus(o: Money)  { this.same(o); return new Money(this.minor + o.minor, this.currency); }
  minus(o: Money) { this.same(o); return new Money(this.minor - o.minor, this.currency); }
  negate()        { return new Money(-this.minor, this.currency); }

  times(q: Decimal | number, mode: RoundMode = 'HALF_UP'): Money {
    const raw = new Decimal(this.minor.toString()).times(q);
    return new Money(roundToBigInt(raw, mode), this.currency);
  }
  percent(p: Decimal | number) { return this.times(new Decimal(p).div(100)); }
  div(d: Decimal | number, mode: RoundMode = 'HALF_UP'): Money {
    const raw = new Decimal(this.minor.toString()).div(new Decimal(d));
    return new Money(roundToBigInt(raw, mode), this.currency);
  }

  eq(o: Money)  { this.same(o); return this.minor === o.minor; }
  gt(o: Money)  { this.same(o); return this.minor >  o.minor; }
  gte(o: Money) { this.same(o); return this.minor >= o.minor; }
  lt(o: Money)  { this.same(o); return this.minor <  o.minor; }
  lte(o: Money) { this.same(o); return this.minor <= o.minor; }
  isZero()      { return this.minor === 0n; }
  isNegative()  { return this.minor < 0n; }

  /**
   * Split this amount by weights so the parts ALWAYS sum exactly to the whole.
   * Largest-remainder method. This is the only permitted way to apportion money.
   */
  allocate(weights: (Decimal | number)[]): Money[] {
    const w = weights.map(x => new Decimal(x));
    if (w.some(x => x.isNegative())) throw new CalcError('ALLOCATION_NEGATIVE_WEIGHT');
    const total = w.reduce((a, b) => a.plus(b), new Decimal(0));
    if (total.isZero()) throw new CalcError('ALLOCATION_ZERO_WEIGHT');

    const raw = w.map(x => new Decimal(this.minor.toString()).times(x).div(total));
    const floors = raw.map(r => BigInt(r.floor().toFixed(0)));
    let remainder = this.minor - floors.reduce((a, b) => a + b, 0n);

    // distribute the remainder to the largest fractional parts first
    const order = raw
      .map((r, i) => ({ i, frac: r.minus(r.floor()) }))
      .sort((a, b) => b.frac.comparedTo(a.frac));

    const step = remainder >= 0n ? 1n : -1n;
    for (const { i } of order) {
      if (remainder === 0n) break;
      floors[i] += step;
      remainder -= step;
    }
    return floors.map(m => new Money(m, this.currency));
  }

  toString(): string {
    const scale = MINOR_UNITS[this.currency];
    return new Decimal(this.minor.toString()).div(10 ** scale).toFixed(scale);
  }

  /** Indian lakh/crore grouping for INR; locale default otherwise. */
  format(opts: { symbol?: boolean; compact?: boolean } = {}): string {
    const n = new Decimal(this.toString());
    if (this.currency !== 'INR')
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: this.currency })
        .format(n.toNumber());
    const s = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n.toNumber());
    return opts.symbol === false ? s : \`₹\${s}\`;
  }

  toJSON() { return this.toString(); }
}`;

export const quantityCode = `// dx/platform/money/quantity.ts

export class Quantity {
  private constructor(readonly value: Decimal, readonly uom: string) {}

  static of(v: string | number | Decimal, uom: string): Quantity {
    if (!uom) throw new CalcError('UOM_REQUIRED');
    return new Quantity(new Decimal(v), uom);
  }

  private same(o: Quantity): void {
    if (o.uom !== this.uom)
      throw new CalcError('UOM_MISMATCH', {
        a: this.uom, b: o.uom,
        remedy: 'Convert through UomService (Part 2.4) before arithmetic.',
      });
  }

  plus(o: Quantity)  { this.same(o); return new Quantity(this.value.plus(o.value), this.uom); }
  minus(o: Quantity) { this.same(o); return new Quantity(this.value.minus(o.value), this.uom); }
  times(f: Decimal | number) { return new Quantity(this.value.times(f), this.uom); }

  /** Round per the item's declared precision — applied ONCE, at the declared point. */
  round(decimals: number, mode: RoundMode = 'HALF_UP'): Quantity {
    return new Quantity(this.value.toDecimalPlaces(decimals, toDecimalMode(mode)), this.uom);
  }

  rate(r: Money): Money { return r.times(this.value); }
  toString() { return \`\${this.value.toString()} \${this.uom}\`; }
}`;

export const roundingPolicyCode = `export interface RoundingPolicy {
  scope: 'LINE' | 'DOCUMENT' | 'TAX' | 'QUANTITY';
  decimals: number;
  mode: RoundMode;
  roundOffTo?: 1 | 0.5 | 0.05;       // document-level rounding line
  roundOffAccountCode?: string;
}`;

export const errorCatalogueCode = `// dx/shared/errors/catalogue.ts

export const ERRORS = {
  // 400 — shape
  VALIDATION_FAILED:            { http: 400 },
  FILTER_UNKNOWN_FIELD:         { http: 400 },
  FILTER_OP_NOT_ALLOWED:        { http: 400 },
  FILTER_BAD_VALUE:             { http: 400 },
  REASON_REQUIRED:              { http: 400 },
  // 401 / 403
  UNAUTHENTICATED:              { http: 401 },
  SESSION_EXPIRED:              { http: 401 },
  MFA_REQUIRED:                 { http: 401 },
  PERMISSION_DENIED:            { http: 403 },
  PROJECT_NOT_ASSIGNED:         { http: 403 },
  FIELD_FORBIDDEN:              { http: 403 },
  SOD_CONFLICT:                 { http: 403 },
  APPROVAL_AUTHORITY_EXCEEDED:  { http: 403 },
  OVERRIDE_NOT_PERMITTED:       { http: 403 },
  DEVICE_NOT_PERMITTED:         { http: 403 },
  LEGACY_WRITE_NOT_PERMITTED:   { http: 403 },
  // 404 / 409 / 428
  NOT_FOUND:                    { http: 404 },
  CONCURRENT_MODIFICATION:      { http: 409 },
  REQUEST_IN_PROGRESS:          { http: 409 },
  STATE_TRANSITION_INVALID:     { http: 409 },
  DOCUMENT_LOCKED:              { http: 409 },
  PERIOD_CLOSED:                { http: 409 },
  PRECONDITION_REQUIRED:        { http: 428 },
  // 422 — business
  BUSINESS_RULE_VIOLATION:      { http: 422 },
  REFERENCE_INACTIVE:           { http: 422 },
  DUPLICATE_RECORD:             { http: 422 },
  IDEMPOTENCY_KEY_REUSED:       { http: 422 },
  UOM_MISMATCH:                 { http: 422 },
  CURRENCY_MISMATCH:            { http: 422 },
  // 429 / 5xx
  RATE_LIMITED:                 { http: 429 },
  INTERNAL_ERROR:               { http: 500 },
  CONFIG_ERROR:                 { http: 500 },
  INTEGRATION_UNAVAILABLE:      { http: 503 },
  CIRCUIT_OPEN:                 { http: 503 },
  DX_DISABLED:                  { http: 503 },
} as const;

export type ErrorCode = keyof typeof ERRORS;`;

export const exceptionFilterCode = `@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(e: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const req = host.switchToHttp().getRequest();
    const correlationId = req.correlationId ?? randomUUID();

    if (e instanceof AppError) {
      const spec = ERRORS[e.code] ?? ERRORS.INTERNAL_ERROR;
      this.logger.warn({ correlationId, code: e.code, context: e.context, path: req.path });
      return res.status(spec.http).json({
        ok: false,
        error: {
          code: e.code,
          message: this.i18n.translate(e.code, e.context, req.locale),
          severity: 'ERROR',
          target: e.target, details: e.details, context: e.context,
          remediation: e.remediation, correlationId,
        },
      });
    }

    // Unknown: log everything, return nothing
    this.logger.error({ correlationId, err: e, stack: (e as Error)?.stack, path: req.path });
    return res.status(500).json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong on our side. Quote the reference below if you report it.',
        severity: 'ERROR', correlationId,
      },
    });
  }
}`;

export const lintRules = [
  "eslint-local-rules/no-ambient-date.js — error on new Date() inside dx/modules/**",
  "eslint-local-rules/no-http-in-transaction.js — error on fetch/axios inside a uow.run callback",
  "eslint-local-rules/require-ctx-tx.js — error on a repository call not passing ctx.tx",
];

export const businessRules: BusinessRule[] = [
  {
    code: "CURRENCY_MISMATCH",
    condition: "Money arithmetic across currencies",
    severity: "BLOCK",
    message: "Cannot combine {a} and {b} amounts.",
  },
  {
    code: "UOM_MISMATCH",
    condition: "Quantity arithmetic across units",
    severity: "BLOCK",
    message: "Cannot combine {a} and {b}. Convert through UomService first.",
  },
  {
    code: "ALLOCATION_ZERO_WEIGHT",
    condition: "allocate() with weights summing to zero",
    severity: "BLOCK",
    message: "Cannot apportion an amount across zero total weight.",
  },
  {
    code: "IDEMPOTENCY_KEY_REUSED",
    condition: "Same key, different request body",
    severity: "BLOCK",
    message: "This idempotency key was used for a different request.",
  },
  {
    code: "PRECONDITION_REQUIRED",
    condition: "Mutating call without If-Match",
    severity: "BLOCK",
    message: "Include the record version (If-Match) with this request.",
  },
  {
    code: "CONCURRENT_MODIFICATION",
    condition: "Version mismatch",
    severity: "BLOCK",
    message: "This record was changed by {user} at {time}.",
  },
];

export const moneyTests: TestCase[] = [
  { id: "M1", case: "Money.of('0.1').plus(Money.of('0.2')).eq(Money.of('0.3'))", expected: "true", starred: true },
  { id: "M2", case: "Money.of(10000).allocate([1,1,1])", expected: "Parts sum exactly to 10000; 3334/3333/3333", starred: true },
  { id: "M3", case: "10,000 random allocations, 2–50 weights", expected: "Parts always sum to the whole", starred: true },
  { id: "M4", case: "allocate with a negative total (a credit)", expected: "Remainder distributed correctly, sum exact" },
  { id: "M5", case: "allocate([0, 5, 5])", expected: "First part is zero; others correct" },
  { id: "M6", case: "allocate with zero total weight", expected: "Throws ALLOCATION_ZERO_WEIGHT" },
  { id: "M7", case: "INR + USD", expected: "Throws CURRENCY_MISMATCH" },
  { id: "M8", case: "format() for 12345678.90", expected: "₹1,23,45,678.90 (Indian grouping)", starred: true },
  { id: "M9", case: "Money.of('123.456')", expected: "Rounds to 123.46 at 2 minor units" },
  { id: "M10", case: "JPY (0 minor units)", expected: "No decimal places" },
];

export const quantityTests: TestCase[] = [
  { id: "Q1", case: "m³ + m³", expected: "Works" },
  { id: "Q2", case: "m³ + kg", expected: "Throws UOM_MISMATCH naming both units", starred: true },
  { id: "Q3", case: "round(3) on 12.34567", expected: "12.346" },
  { id: "Q4", case: "rate() with Money", expected: "Correct product" },
];

export const uowTests: TestCase[] = [
  { id: "U1", case: "Successful callback", expected: "Commits; audit and outbox flushed inside the transaction", starred: true },
  { id: "U2", case: "Throwing callback", expected: "Rolls back; no audit or outbox row persists", starred: true },
  { id: "U3", case: "ctx.now read three times", expected: "Identical value", starred: true },
  { id: "U4", case: "Nested uow.run", expected: "Rejected or joins the outer transaction — decide and test" },
  { id: "U5", case: "Lint rule: new Date() in a module service", expected: "Fails lint", starred: true },
  { id: "U6", case: "Lint rule: fetch() inside a uow.run callback", expected: "Fails lint", starred: true },
];

export const apiTests: TestCase[] = [
  { id: "A1", case: "Filter name eq 'test'; DROP TABLE x' --", expected: "Bound as a parameter; table intact", starred: true },
  { id: "A2", case: "Filter on an unwhitelisted field", expected: "400 FILTER_UNKNOWN_FIELD" },
  { id: "A3", case: "PATCH without If-Match", expected: "428 PRECONDITION_REQUIRED" },
  { id: "A4", case: "PATCH with a stale If-Match", expected: "409 with current state and diff", starred: true },
  { id: "A5", case: "Same idempotency key twice", expected: "One execution; second returns stored response", starred: true },
  { id: "A6", case: "Same key, different body", expected: "422 IDEMPOTENCY_KEY_REUSED" },
  { id: "A7", case: "Unhandled exception", expected: "500 with correlation id, no stack trace in body", starred: true },
  { id: "A8", case: "Registry generator vs routes", expected: "No drift; CI passes" },
];

export const completionChecklist: ChecklistCategory[] = [
  {
    category: "Money and Quantity",
    items: [
      "All ten Money tests pass; M1, M2, M3, M8 with evidence ★",
      "allocate() proven exact across 10,000 randomised cases ★",
      "Money is never a JavaScript number — code search confirms ★",
      "Quantity arithmetic across units throws, naming both ★",
      "Rounding policy is configuration, not a constant",
    ],
  },
  {
    category: "UnitOfWork",
    items: [
      "Commit path flushes audit and outbox inside the transaction ★",
      "Rollback leaves no audit or outbox row ★",
      "ctx.now is stable within a transaction ★",
      "All three lint rules written and observed failing on a deliberate violation ★",
    ],
  },
  {
    category: "API",
    items: [
      "Envelope implemented exactly per conventions §6",
      "Filter compiler parameterised; injection attempt proven safe ★",
      "ETag concurrency working for both dx_ and existing tables ★",
      "Idempotency working; replay does not re-execute ★",
      "Global exception filter returns no internals and always a correlation id ★",
      "Error catalogue complete; CI check for unregistered codes passes",
      "API_REGISTRY.md generated, not hand-written ★",
    ],
  },
  {
    category: "Database",
    items: [
      "dx_idempotency created; migration down verified ★",
      "Expiry cleanup job scheduled",
    ],
  },
  {
    category: "Discipline",
    items: [
      "Actor.can() still throws — Part 0.5 has not been pre-empted ★",
      "SYSTEM_MAP.md records dx_idempotency",
      "DB_CHANGELOG.md records the migration with rollback verified",
    ],
  },
  {
    category: "Final confirmation",
    items: [
      "No existing table, column, relationship, constraint or row was altered. ★",
    ],
  },
];
