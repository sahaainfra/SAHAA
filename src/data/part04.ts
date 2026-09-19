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

export interface InspectionQuery {
  title: string;
  code: string;
  language: string;
}

export interface ReuseCheckItem {
  searchFor: string;
  ifFound: string;
  ifNot: string;
}

export interface ConcurrencyOption {
  option: string;
  description: string;
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
  auth: string;
  notes: string;
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

export interface AuditAction {
  action: string;
  recorded: string;
}

export interface ScreenRoute {
  route: string;
  screen: string;
  notes: string;
}

export const dependencies: Dependency[] = [
  { part: "0.1", provides: "Repository, environment, Redis connection", blocking: "Yes" },
  { part: "0.2", provides: "SCHEMA_MAP including the existing user entity", blocking: "Yes" },
  { part: "0.3", provides: "UnitOfWork, Actor shape, error catalogue, API envelope", blocking: "Yes" },
];

export const existingEntities: ExistingEntity[] = [
  { entity: "Existing user/employee table", access: "READ; password column WRITE only via §4.3", purpose: "Identity, credential verification" },
  { entity: "Existing role table, if any", access: "READ", purpose: "Seeds the global role in Part 0.5" },
];

export const prerequisites = [
  "Part 0.3 checklist passed; Actor.can() still throws",
  "SCHEMA_MAP.user mapped and validated at boot",
  "Redis reachable",
  "SCHEMA_BASELINE.md records how the existing application hashes passwords",
];

export const deliverables = [
  "Four dx_ tables",
  "The authentication service with transparent password rehashing",
  "Session management",
  "MFA enrolment and verification",
  "Lockout handling",
  "The login screens",
];

export const inspectionQueries: InspectionQuery[] = [
  {
    title: "1.1 The existing user table",
    language: "sql",
    code: `SELECT column_name, data_type, character_maximum_length, is_nullable
  FROM information_schema.columns
 WHERE table_name = '<existing_user_table>' ORDER BY ordinal_position;`,
  },
  {
    title: "1.2 Password storage — this determines your migration strategy",
    language: "sql",
    code: `SELECT LENGTH(<password_column>) AS hash_length, COUNT(*) AS users
  FROM <existing_user_table>
 WHERE <password_column> IS NOT NULL
 GROUP BY 1 ORDER BY 2 DESC;
-- 32 = MD5 · 40 = SHA1 · 60 = bcrypt · 95+ = argon2

SELECT LEFT(<password_column>, 7) AS prefix, COUNT(*)
  FROM <existing_user_table> GROUP BY 1 ORDER BY 2 DESC LIMIT 10;
-- '$2y$'/'$2a$' = bcrypt · '$argon2' = argon2 · no prefix = raw digest`,
  },
  {
    title: "1.3 Active user population",
    language: "sql",
    code: `SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE <active_column> = <active_value>) AS active,
       COUNT(*) FILTER (WHERE <email_column> IS NULL OR <email_column> = '') AS no_email,
       COUNT(DISTINCT LOWER(<email_column>)) AS distinct_emails
  FROM <existing_user_table>;`,
  },
  {
    title: "1.4 Duplicate logins — these break authentication",
    language: "sql",
    code: `SELECT LOWER(<login_column>) AS login, COUNT(*) AS n
  FROM <existing_user_table> GROUP BY 1 HAVING COUNT(*) > 1;`,
  },
  {
    title: "1.5 Any existing session or token table",
    language: "sql",
    code: `SELECT table_name FROM information_schema.tables
 WHERE table_name ILIKE '%session%' OR table_name ILIKE '%token%'
    OR table_name ILIKE '%login%' OR table_name ILIKE '%auth%';`,
  },
  {
    title: "1.6 How does the existing application authenticate?",
    language: "bash",
    code: `grep -rn "password_verify\\|bcrypt\\|md5(\\|sha1(\\|hash(" --include=*.{php,js,ts,java,cs} \\
  ../existing-erp/src | head -30`,
  },
  {
    title: "1.7 How does it hold sessions?",
    language: "bash",
    code: `grep -rn "session_start\\|express-session\\|jwt.sign\\|setcookie" --include=*.{php,js,ts} \\
  ../existing-erp/src | head -20`,
  },
];

export const reportQuestions = [
  { question: "Password hash algorithm", answer: "", consequence: "Determines §4.3 rehashing" },
  { question: "Users with no email", answer: "", consequence: "Cannot receive password reset" },
  { question: "Duplicate logins", answer: "", consequence: "Must be resolved before go-live" },
  { question: "Existing session mechanism", answer: "", consequence: "Determines §2 of Step 2" },
  { question: "Will both apps run concurrently?", answer: "", consequence: "Determines session sharing" },
];

export const reuseChecks: ReuseCheckItem[] = [
  { searchFor: "bcrypt, argon2 in dependencies", ifFound: "Reuse", ifNot: "Add argon2 (preferred) or bcrypt" },
  { searchFor: "Existing session middleware", ifFound: "See decision below", ifNot: "Build per §4.4" },
  { searchFor: "Existing rate limiter", ifFound: "Reuse for login throttling", ifNot: "Add one" },
  { searchFor: "Existing email sender", ifFound: "Reuse for reset and MFA", ifNot: "Defer reset until Part 1.6" },
];

export const concurrencyOptions: ConcurrencyOption[] = [
  { option: "Option 1 — Shared session store", description: "Both applications read the same session backend. The existing app keeps writing its session; the new code reads it and constructs an Actor. Requires the existing session format to be readable." },
  { option: "Option 2 — New session, trusted handoff", description: "The existing app, on successful login, calls a /api/dx/v1/auth/handoff endpoint with a signed assertion; the new code issues its own session. Requires modifying the existing app minimally — which is permitted, since it is code, not database." },
  { option: "Option 3 — Independent login", description: "Two logins. Only acceptable for a pilot with a handful of users, and only briefly." },
];

export const sessionTable = `-- ─────────────────────────────────────────────────────────────────────
-- 3.1 Sessions
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE dx_session (
  id                 BIGSERIAL PRIMARY KEY,
  session_token_hash CHAR(64)     NOT NULL UNIQUE,   -- SHA-256 of the token; never the token
  user_id            BIGINT       NOT NULL,          -- existing user PK
  issued_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at         TIMESTAMPTZ  NOT NULL,
  last_seen_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  absolute_expiry_at TIMESTAMPTZ  NOT NULL,          -- hard ceiling; sliding never passes it
  ip_address         VARCHAR(45),
  user_agent         VARCHAR(300),
  device_class       VARCHAR(20),                    -- DESKTOP | TABLET | PHONE
  device_id          VARCHAR(100),
  mfa_satisfied      BOOLEAN      NOT NULL DEFAULT FALSE,
  mfa_satisfied_at   TIMESTAMPTZ,
  is_impersonation   BOOLEAN      NOT NULL DEFAULT FALSE,
  impersonated_by    BIGINT,
  revoked_at         TIMESTAMPTZ,
  revoked_by         BIGINT,
  revoke_reason      VARCHAR(100)                    -- LOGOUT|ADMIN|PASSWORD_CHANGE|EXPIRED|SUSPICIOUS
);
CREATE INDEX ix_dx_session_user ON dx_session (user_id, revoked_at, expires_at);
CREATE INDEX ix_dx_session_expiry ON dx_session (expires_at) WHERE revoked_at IS NULL;`;

export const loginAttemptTable = `-- ─────────────────────────────────────────────────────────────────────
-- 3.2 Login attempts — every attempt, successful or not
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE dx_login_attempt (
  id             BIGSERIAL PRIMARY KEY,
  login_identity VARCHAR(200) NOT NULL,      -- as typed; may not match a user
  user_id        BIGINT,                     -- NULL when unknown
  attempted_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  succeeded      BOOLEAN      NOT NULL,
  failure_reason VARCHAR(40),                -- UNKNOWN_USER|BAD_PASSWORD|LOCKED|INACTIVE|MFA_FAILED|EXPIRED_PASSWORD
  ip_address     VARCHAR(45),
  user_agent     VARCHAR(300),
  device_class   VARCHAR(20)
);
CREATE INDEX ix_dx_login_identity ON dx_login_attempt (login_identity, attempted_at DESC);
CREATE INDEX ix_dx_login_ip ON dx_login_attempt (ip_address, attempted_at DESC);`;

export const userSecurityTable = `-- ─────────────────────────────────────────────────────────────────────
-- 3.3 Account security state — extends the existing user without altering it
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE dx_user_security (
  user_id              BIGINT       PRIMARY KEY,     -- existing user PK
  password_algo        VARCHAR(20),                  -- argon2id|bcrypt|legacy-md5|legacy-sha1
  password_changed_at  TIMESTAMPTZ,
  password_expires_at  TIMESTAMPTZ,
  must_change_password BOOLEAN      NOT NULL DEFAULT FALSE,
  failed_attempts      SMALLINT     NOT NULL DEFAULT 0,
  locked_until         TIMESTAMPTZ,
  lock_reason          VARCHAR(60),
  mfa_required         BOOLEAN      NOT NULL DEFAULT FALSE,
  mfa_enrolled_at      TIMESTAMPTZ,
  mfa_secret_enc       BYTEA,                        -- encrypted at rest
  mfa_recovery_codes   JSONB,                        -- hashed, single-use
  last_login_at        TIMESTAMPTZ,
  last_login_ip        VARCHAR(45),
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ
);`;

export const passwordHistoryTable = `-- ─────────────────────────────────────────────────────────────────────
-- 3.4 Password history — prevents reuse
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE dx_password_history (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT      NOT NULL,
  hash        VARCHAR(255) NOT NULL,
  algo        VARCHAR(20)  NOT NULL,
  changed_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  changed_by  BIGINT
);
CREATE INDEX ix_dx_pwhist ON dx_password_history (user_id, changed_at DESC);`;

export const authServiceCode = `@Injectable()
export class AuthService {
  async login(ctx: UowContext, input: LoginInput, req: RequestCtx): Promise<LoginResult> {
    const identity = input.login.trim().toLowerCase();

    // 1. Throttle FIRST, before any database work. Cheap defence against enumeration.
    await this.throttle.check(req.ip, identity);

    // 2. Resolve the user. Never reveal whether the identity exists.
    const user = await this.users.findByLogin(ctx, identity);
    const security = user ? await this.repo.security(ctx, user.id) : null;

    // 3. Lockout
    if (security?.lockedUntil && security.lockedUntil > ctx.now) {
      await this.recordAttempt(ctx, identity, user?.id, false, 'LOCKED', req);
      throw new AuthError('ACCOUNT_LOCKED', {
        until: security.lockedUntil,
        message: \`This account is locked until \${fmtTime(security.lockedUntil)}.\`,
      });
    }

    // 4. Verify. Constant-time even when the user does not exist, so timing does not leak.
    const ok = user
      ? await this.password.verify(input.password, user.passwordHash, security!.passwordAlgo)
      : await this.password.dummyVerify(input.password);

    if (!ok || !user) {
      await this.lockout.recordFailure(ctx, user?.id, identity);
      await this.recordAttempt(ctx, identity, user?.id, false,
        user ? 'BAD_PASSWORD' : 'UNKNOWN_USER', req);
      throw new AuthError('INVALID_CREDENTIALS', {
        message: 'The login or password is incorrect.',   // deliberately does not say which
      });
    }

    // 5. Account state
    if (!user.isActive) {
      await this.recordAttempt(ctx, identity, user.id, false, 'INACTIVE', req);
      throw new AuthError('ACCOUNT_INACTIVE',
        { message: 'This account is not active. Contact your administrator.' });
    }

    // 6. Transparent rehash — see §4.3
    await this.password.rehashIfNeeded(ctx, user, input.password, security!);

    // 7. Password expiry
    if (security!.mustChangePassword ||
        (security!.passwordExpiresAt && security!.passwordExpiresAt < ctx.now)) {
      const token = await this.session.issuePasswordChangeToken(ctx, user.id);
      await this.recordAttempt(ctx, identity, user.id, false, 'EXPIRED_PASSWORD', req);
      return { outcome: 'PASSWORD_CHANGE_REQUIRED', changeToken: token };
    }

    // 8. MFA
    if (security!.mfaRequired) {
      if (!security!.mfaEnrolledAt) {
        const token = await this.session.issueEnrolmentToken(ctx, user.id);
        return { outcome: 'MFA_ENROLMENT_REQUIRED', enrolmentToken: token };
      }
      const token = await this.session.issueMfaChallengeToken(ctx, user.id);
      return { outcome: 'MFA_REQUIRED', challengeToken: token };
    }

    // 9. Success
    await this.lockout.clearFailures(ctx, user.id);
    const session = await this.session.create(ctx, user.id, req, { mfaSatisfied: false });
    await this.recordAttempt(ctx, identity, user.id, true, null, req);
    await this.repo.recordLogin(ctx, user.id, ctx.now, req.ip);

    return { outcome: 'SUCCESS', session, user: this.publicUser(user) };
  }
}`;

export const passwordServiceCode = `@Injectable()
export class PasswordService {
  private readonly ARGON = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };

  async verify(plain: string, stored: string, algo: string): Promise<boolean> {
    switch (algo) {
      case 'argon2id': return argon2.verify(stored, plain);
      case 'bcrypt':   return bcrypt.compare(plain, stored);
      case 'legacy-md5':
        return timingSafeEqual(md5(plain + (env.LEGACY_SALT ?? '')), stored);
      case 'legacy-sha1':
        return timingSafeEqual(sha1(plain + (env.LEGACY_SALT ?? '')), stored);
      default:
        throw new ConfigError('UNKNOWN_PASSWORD_ALGO', { algo });
    }
  }

  /**
   * On a successful login with a weak hash, silently upgrade to argon2id.
   * The user notices nothing. Within one login cycle the weak hashes are gone.
   */
  async rehashIfNeeded(ctx: UowContext, user: User, plain: string, sec: UserSecurity): Promise<void> {
    if (sec.passwordAlgo === 'argon2id') return;

    const newHash = await argon2.hash(plain, this.ARGON);

    // Writing to the existing password column requires the write bridge (Part 0.2).
    this.writeBridge.assertWritable('user', [SCHEMA_MAP.user.columns.passwordHash]);
    await this.users.updatePasswordHash(ctx, user.id, newHash);
    await this.repo.updateSecurity(ctx, user.id, {
      passwordAlgo: 'argon2id', passwordChangedAt: ctx.now,
    });

    ctx.audit.record({
      entity: 'user', entityId: user.id, action: 'PASSWORD_REHASHED',
      after: { from: sec.passwordAlgo, to: 'argon2id' },
    });
  }
}`;

export const sessionServiceCode = `@Injectable()
export class SessionService {
  async create(ctx: UowContext, userId: number, req: RequestCtx,
               opts: { mfaSatisfied: boolean; impersonatedBy?: number }): Promise<SessionRef> {
    const token = randomBytes(32).toString('base64url');   // 256 bits
    const hash = sha256(token);

    const ttl = Number(env.SESSION_TTL_MINUTES ?? 480);
    const absolute = Number(env.SESSION_ABSOLUTE_HOURS ?? 24);

    await this.repo.insert(ctx, {
      sessionTokenHash: hash, userId,
      expiresAt: addMinutes(ctx.now, ttl),
      absoluteExpiryAt: addHours(ctx.now, absolute),
      ipAddress: req.ip, userAgent: req.userAgent,
      deviceClass: req.deviceClass, deviceId: req.deviceId,
      mfaSatisfied: opts.mfaSatisfied,
      isImpersonation: !!opts.impersonatedBy, impersonatedBy: opts.impersonatedBy,
    });

    // Cache for fast validation; the row remains authoritative.
    await this.redis.setex(\`sess:\${hash}\`, ttl * 60, JSON.stringify({ userId, mfa: opts.mfaSatisfied }));
    return { token, expiresAt: addMinutes(ctx.now, ttl) };
  }

  async validate(token: string, req: RequestCtx): Promise<SessionState | null> {
    const hash = sha256(token);

    const cached = await this.redis.get(\`sess:\${hash}\`);
    if (cached) { void this.touch(hash); return JSON.parse(cached); }

    const row = await this.repo.findByHash(hash);
    if (!row || row.revokedAt) return null;
    if (row.expiresAt < new Date() || row.absoluteExpiryAt < new Date()) {
      await this.repo.revoke(row.id, 'EXPIRED');
      return null;
    }
    await this.touch(hash);
    return toState(row);
  }

  /** Sliding expiry, bounded by the absolute ceiling. */
  private async touch(hash: string): Promise<void> { /* extend expires_at, never past absolute */ }

  async revokeAllForUser(ctx: UowContext, userId: number, reason: string): Promise<number> {
    const n = await this.repo.revokeAll(ctx, userId, reason, ctx.actor.userId);
    await this.redis.del(...(await this.redis.keys(\`sess:*\`)).filter(/* by user */));
    ctx.audit.record({ entity: 'user', entityId: userId, action: 'SESSIONS_REVOKED',
      after: { count: n, reason } });
    return n;
  }
}`;

export const mfaServiceCode = `@Injectable()
export class MfaService {
  async beginEnrolment(ctx: UowContext, userId: number): Promise<EnrolmentChallenge> {
    const secret = authenticator.generateSecret();
    const encrypted = await this.crypto.encrypt(secret);
    await this.repo.stageSecret(ctx, userId, encrypted);   // staged, not active
    const user = await this.users.get(ctx, userId);
    return {
      secret,                                               // shown once, never again
      otpauthUrl: authenticator.keyuri(user.login, env.MFA_ISSUER ?? 'ERP', secret),
    };
  }

  async completeEnrolment(ctx: UowContext, userId: number, code: string): Promise<string[]> {
    const staged = await this.repo.stagedSecret(ctx, userId);
    if (!staged) throw new AuthError('NO_ENROLMENT_IN_PROGRESS');
    if (!authenticator.verify({ token: code, secret: await this.crypto.decrypt(staged) }))
      throw new AuthError('MFA_CODE_INVALID');

    const recovery = Array.from({ length: 10 }, () => randomBytes(5).toString('hex'));
    await this.repo.activate(ctx, userId, staged,
      recovery.map(c => ({ hash: sha256(c), usedAt: null })));

    ctx.audit.record({ entity: 'user', entityId: userId, action: 'MFA_ENROLLED' });
    return recovery;                                        // displayed once
  }

  async verify(ctx: UowContext, userId: number, code: string): Promise<boolean> {
    const sec = await this.repo.security(ctx, userId);
    if (!sec?.mfaSecretEnc) return false;

    // Replay protection: a code is valid once.
    if (await this.redis.get(\`mfa:used:\${userId}:\${code}\`)) return false;

    if (authenticator.verify({ token: code, secret: await this.crypto.decrypt(sec.mfaSecretEnc) })) {
      await this.redis.setex(\`mfa:used:\${userId}:\${code}\`, 90, '1');
      return true;
    }
    return this.consumeRecoveryCode(ctx, userId, code);
  }
}`;

export const apiEndpoints: ApiEndpoint[] = [
  { number: 1, method: "POST", path: "/api/dx/v1/auth/login", auth: "none", notes: "Rate limited 10/min/IP" },
  { number: 2, method: "POST", path: "/api/dx/v1/auth/mfa/verify", auth: "challenge token", notes: "" },
  { number: 3, method: "POST", path: "/api/dx/v1/auth/mfa/enrol/begin", auth: "enrolment token", notes: "" },
  { number: 4, method: "POST", path: "/api/dx/v1/auth/mfa/enrol/complete", auth: "enrolment token", notes: "Returns recovery codes once" },
  { number: 5, method: "POST", path: "/api/dx/v1/auth/logout", auth: "session", notes: "" },
  { number: 6, method: "GET", path: "/api/dx/v1/auth/me", auth: "session", notes: "Identity only, no permissions until 0.5" },
  { number: 7, method: "POST", path: "/api/dx/v1/auth/password/change", auth: "session or change token", notes: "Revokes other sessions" },
  { number: 8, method: "POST", path: "/api/dx/v1/auth/password/reset/request", auth: "none", notes: "Always returns 200" },
  { number: 9, method: "POST", path: "/api/dx/v1/auth/password/reset/confirm", auth: "reset token", notes: "" },
  { number: 10, method: "GET", path: "/api/dx/v1/auth/sessions", auth: "session", notes: "Own sessions" },
  { number: 11, method: "DELETE", path: "/api/dx/v1/auth/sessions/:id", auth: "session", notes: "Revoke own" },
];

export const businessRules: BusinessRule[] = [
  { code: "INVALID_CREDENTIALS", condition: "Bad login or password", severity: "BLOCK", message: "The login or password is incorrect." },
  { code: "ACCOUNT_LOCKED", condition: "Within lockout window", severity: "BLOCK", message: "This account is locked until {time}." },
  { code: "ACCOUNT_INACTIVE", condition: "User not active", severity: "BLOCK", message: "This account is not active. Contact your administrator." },
  { code: "PASSWORD_CHANGE_REQUIRED", condition: "Expired or flagged", severity: "BLOCK", message: "Your password must be changed before continuing." },
  { code: "MFA_REQUIRED", condition: "Role requires MFA", severity: "BLOCK", message: "Enter the code from your authenticator app." },
  { code: "MFA_CODE_INVALID", condition: "Wrong or reused code", severity: "BLOCK", message: "That code is not valid. Codes expire after 30 seconds." },
  { code: "PASSWORD_TOO_WEAK", condition: "Fails policy", severity: "BLOCK", message: "Password must be at least 12 characters and not a common password." },
  { code: "PASSWORD_RECENTLY_USED", condition: "In last 5", severity: "BLOCK", message: "This password was used recently. Choose a different one." },
  { code: "SESSION_EXPIRED", condition: "Past expiry", severity: "BLOCK", message: "Your session has expired. Sign in again." },
  { code: "UNKNOWN_PASSWORD_ALGO", condition: "Unmapped algorithm", severity: "BLOCK", message: "Config error; fails at boot" },
];

export const screenRoutes: ScreenRoute[] = [
  { route: "/login", screen: "Login", notes: "Single column, works at 320px" },
  { route: "/login/mfa", screen: "Code entry", notes: "6-digit input, auto-advance, paste-friendly" },
  { route: "/login/mfa/enrol", screen: "QR + verification", notes: "Recovery codes shown once, with a download" },
  { route: "/password/change", screen: "Change password", notes: "Strength meter, policy stated up front" },
  { route: "/password/reset", screen: "Request and confirm", notes: "" },
  { route: "/account/sessions", screen: "Active sessions", notes: "Device, location, last seen, revoke" },
];

export const reports: Report[] = [
  { name: "Login activity", content: "User, time, IP, device, outcome" },
  { name: "Failed login analysis", content: "By user, by IP, by reason, with spike detection" },
  { name: "Locked accounts", content: "Current locks with reason and time" },
  { name: "MFA enrolment status", content: "Who must have it, who has it" },
  { name: "Active sessions", content: "All users, filterable by device and age" },
];

export const authHealthView = `CREATE VIEW vw_dx_q_auth_health AS
SELECT
  COUNT(*) FILTER (WHERE succeeded AND attempted_at > NOW() - INTERVAL '24 hours')       AS logins_24h,
  COUNT(*) FILTER (WHERE NOT succeeded AND attempted_at > NOW() - INTERVAL '24 hours')   AS failures_24h,
  COUNT(DISTINCT ip_address) FILTER
        (WHERE NOT succeeded AND attempted_at > NOW() - INTERVAL '1 hour')               AS distinct_failing_ips_1h,
  (SELECT COUNT(*) FROM dx_user_security WHERE locked_until > NOW())                     AS locked_now,
  (SELECT COUNT(*) FROM dx_user_security WHERE mfa_required AND mfa_enrolled_at IS NULL) AS mfa_pending
FROM dx_login_attempt;`;

export const auditActions: AuditAction[] = [
  { action: "LOGIN_SUCCESS / LOGIN_FAILURE", recorded: "identity, ip, device, reason" },
  { action: "LOGOUT", recorded: "session id" },
  { action: "PASSWORD_CHANGED", recorded: "by self or admin; sessions revoked count" },
  { action: "PASSWORD_REHASHED", recorded: "from algo, to algo" },
  { action: "MFA_ENROLLED / MFA_DISABLED", recorded: "who, when — disabling is high-signal" },
  { action: "ACCOUNT_LOCKED / UNLOCKED", recorded: "reason, by whom" },
  { action: "SESSIONS_REVOKED", recorded: "count, reason" },
  { action: "IMPERSONATION_STARTED / ENDED", recorded: "both identities" },
];

export const testCases: TestCase[] = [
  { id: "A1", case: "Valid credentials", expected: "Session issued; cookie has HttpOnly, Secure, SameSite", starred: true },
  { id: "A2", case: "Wrong password", expected: "401, message identical to unknown-user case", starred: true },
  { id: "A3", case: "Unknown user", expected: "401, response time within 10% of A2", starred: true },
  { id: "A4", case: "5 failures", expected: "Locked 15 min; 8 → 1 hour; 12 → admin unlock", starred: true },
  { id: "A5", case: "Successful login after failures", expected: "Counter cleared" },
  { id: "A6", case: "Inactive user", expected: "401 ACCOUNT_INACTIVE" },
  { id: "A7", case: "Legacy MD5 user logs in", expected: "Authenticates; hash silently becomes argon2id", starred: true },
  { id: "A8", case: "Same user logs in again", expected: "Verifies against argon2", starred: true },
  { id: "A9", case: "Existing application login after rehash", expected: "Still works (or the documented decision applies)", starred: true },
  { id: "A10", case: "MFA-required user", expected: "Challenge issued, no session until verified", starred: true },
  { id: "A11", case: "Correct TOTP", expected: "Session created with mfa_satisfied = true" },
  { id: "A12", case: "Reused TOTP within window", expected: "Rejected", starred: true },
  { id: "A13", case: "Recovery code", expected: "Works once; second use rejected", starred: true },
  { id: "A14", case: "Session past absolute expiry", expected: "Rejected even if recently active", starred: true },
  { id: "A15", case: "Password change", expected: "All other sessions revoked; current survives", starred: true },
  { id: "A16", case: "Reuse of a recent password", expected: "400 PASSWORD_RECENTLY_USED" },
  { id: "A17", case: "Reset request for unknown email", expected: "200, no email sent, no enumeration", starred: true },
  { id: "A18", case: "Session token in database", expected: "Only the hash is stored", starred: true },
  { id: "A19", case: "Logs during full login flow", expected: "No password, token, secret or recovery code", starred: true },
  { id: "A20", case: "11 login attempts in a minute from one IP", expected: "429" },
];

export const completionChecklist: ChecklistCategory[] = [
  {
    category: "Database",
    items: [
      "Four tables created; migration down verified ★",
      "dx_user_security backfilled for every active user; script idempotent ★",
      "No column added to the existing user table",
    ],
  },
  {
    category: "Authentication",
    items: [
      "Timing equivalence between unknown-user and wrong-password proven ★",
      "Failure message never distinguishes the two ★",
      "Progressive lockout at all three thresholds ★",
      "Rehashing upgrades weak hashes silently ★",
      "Existing application login verified still working after rehash, or the incompatibility documented with a decision ★",
      "ADR-005 records the one write-bridge column opened, with justification ★",
    ],
  },
  {
    category: "Session",
    items: [
      "Only the token hash is stored ★",
      "Cookie flags correct",
      "Sliding expiry bounded by absolute ceiling ★",
      "Password change revokes other sessions ★",
      "Session list and self-revocation work",
    ],
  },
  {
    category: "MFA",
    items: [
      "Enrolment produces a working TOTP against a real authenticator app ★",
      "Code replay rejected ★",
      "Recovery codes single-use ★",
      "Recovery codes shown once, with download",
      "mfa_required set for the four privileged categories",
    ],
  },
  {
    category: "Security",
    items: [
      "No secret of any kind appears in logs — redaction filter tested ★",
      "Rate limiting on login and reset",
      "Reset request does not enumerate ★",
      "MFA secret encrypted at rest",
    ],
  },
  {
    category: "Interface",
    items: [
      "All six screens work at 320px",
      "Caps-lock warning; password managers work; double-submit prevented",
      "Axe clean on all auth routes",
    ],
  },
  {
    category: "Discipline",
    items: [
      "Actor.can() still throws — no permission logic leaked into this part ★",
      "ADR-004 records the session concurrency decision ★",
      "SYSTEM_MAP.md, API_REGISTRY.md, DB_CHANGELOG.md updated",
    ],
  },
  {
    category: "Final confirmation",
    items: [
      "No existing table, column, relationship or row was altered, except the single password column opened under ADR-005. ★",
    ],
  },
];
