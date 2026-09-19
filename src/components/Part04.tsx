import {
  dependencies,
  existingEntities,
  prerequisites,
  deliverables,
  inspectionQueries,
  reportQuestions,
  reuseChecks,
  concurrencyOptions,
  sessionTable,
  loginAttemptTable,
  userSecurityTable,
  passwordHistoryTable,
  authServiceCode,
  passwordServiceCode,
  sessionServiceCode,
  mfaServiceCode,
  apiEndpoints,
  businessRules,
  screenRoutes,
  reports,
  authHealthView,
  auditActions,
  testCases,
  completionChecklist,
} from "../data/part04";

function CodeBlock({ children, title, language }: { children: string; title?: string; language?: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 my-4">
      {(title || language) && (
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
          {title && <span className="text-xs font-mono text-gray-300">{title}</span>}
          {language && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{language}</span>}
        </div>
      )}
      <pre className="bg-gray-900 p-4 overflow-x-auto">
        <code className="text-sm text-gray-100 font-mono whitespace-pre">{children}</code>
      </pre>
    </div>
  );
}

function Callout({ type, children }: { type: "warning" | "info" | "danger" | "success"; children: React.ReactNode }) {
  const styles = {
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
    danger: "bg-red-50 border-red-200 text-red-900",
    success: "bg-green-50 border-green-200 text-green-900",
  };
  const icons = {
    warning: "⚠️",
    info: "ℹ️",
    danger: "🚫",
    success: "✅",
  };
  return (
    <div className={`rounded-lg border p-4 my-4 ${styles[type]}`}>
      <p className="text-sm">
        <span className="mr-2">{icons[type]}</span>
        {children}
      </p>
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4 flex items-center gap-3">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-700 text-sm font-bold">
        {number}
      </span>
      {title}
    </h3>
  );
}

function StepTitle({ number, title }: { number: string; title: string }) {
  return (
    <h4 className="text-base font-bold text-gray-800 mt-6 mb-3 flex items-center gap-2">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
        {number}
      </span>
      {title}
    </h4>
  );
}

export default function Part04() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 0 — Foundation</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 4 of 9</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~1.5 days</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 0.4 — Authentication, Session & MFA</h2>
        <p className="text-emerald-100 text-sm leading-relaxed">
          Let a user prove who they are, hold that proof safely for the length of a working session, and require a second factor from anyone whose account can cause irreversible damage.
        </p>
      </div>

      {/* Section 0: Before You Start */}
      <SectionTitle number="0" title="Before You Start" />
      
      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.1 Depends on</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Part</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Provides</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Blocking</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dependencies.map((dep) => (
              <tr key={dep.part} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{dep.part}</td>
                <td className="px-4 py-2 text-gray-700">{dep.provides}</td>
                <td className="px-4 py-2 text-gray-700">{dep.blocking}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.2 Existing entities used</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Entity</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Access</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {existingEntities.map((entity, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700 font-medium">{entity.entity}</td>
                <td className="px-4 py-2 text-gray-600">{entity.access}</td>
                <td className="px-4 py-2 text-gray-600">{entity.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        <strong>The existing user table is not altered.</strong> New authentication state lives in <code className="bg-blue-100 px-1 rounded">dx_</code> tables keyed to the existing user primary key.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.3 What must already be functional</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        {prerequisites.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600" readOnly />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.4 What this part creates</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        {deliverables.map((d, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">✓</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>

      <Callout type="warning">
        <strong>Authentication answers "who are you". Authorisation — "what may you do" — is Part 0.5.</strong> Do not implement any permission logic here.
      </Callout>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Let a user prove who they are, hold that proof safely for the length of a working session, and require a second factor from anyone whose account can cause irreversible damage.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            login, logout, session lifecycle, password policy and rehashing, account lockout, MFA enrolment and verification, password reset, session listing and revocation, impersonation session marking.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">
            permission resolution (0.5); user creation and role assignment (Part 2 uses the existing user management, extended in 0.5); SSO.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">
            a new user table. The existing one holds identity. Building a parallel user store creates two sources of truth for "who works here", and they diverge within a month.
          </p>
        </div>
      </div>

      <Callout type="danger">
        <strong>Deliberately not built:</strong> "remember me" tokens that survive indefinitely. Construction ERP sessions carry financial authority; a token on a lost site tablet is a real exposure. Sessions expire and are re-authenticated.
      </Callout>

      {/* Step 1: Inspect */}
      <StepTitle number="1" title="Inspect" />
      {inspectionQueries.map((query, i) => (
        <div key={i} className="mb-6">
          <h5 className="text-sm font-semibold text-gray-800 mb-2">{query.title}</h5>
          <CodeBlock title={query.title} language={query.language}>
            {query.code}
          </CodeBlock>
        </div>
      ))}

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Report explicitly</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Question</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Answer</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Consequence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reportQuestions.map((q, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700 font-medium">{q.question}</td>
                <td className="px-4 py-2 text-gray-400 italic">[fill in]</td>
                <td className="px-4 py-2 text-gray-600">{q.consequence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="danger">
        <strong>If query 1.4 returns rows, stop and escalate.</strong> Two users with the same login is an authentication ambiguity that no amount of code resolves. It is a business data-cleanup task, and it blocks this part.
      </Callout>

      {/* Step 2: Reuse Check */}
      <StepTitle number="2" title="Reuse Check & The Concurrency Decision" />
      
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Search for</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">If found</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">If not</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reuseChecks.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700 font-medium">{item.searchFor}</td>
                <td className="px-4 py-2 text-gray-600">{item.ifFound}</td>
                <td className="px-4 py-2 text-gray-600">{item.ifNot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h5 className="text-sm font-semibold text-gray-800 mb-3">The concurrency decision — record as ADR-004</h5>
      <p className="text-sm text-gray-700 mb-4">
        <strong>If the existing application and the new one run side by side</strong> (the usual case during a phased rollout), a user must not log in twice.
      </p>

      <div className="space-y-3 mb-6">
        {concurrencyOptions.map((option, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <h6 className="text-sm font-bold text-gray-900 mb-2">{option.option}</h6>
            <p className="text-xs text-gray-700">{option.description}</p>
          </div>
        ))}
      </div>

      <Callout type="info">
        Pick one now. The rest of this part assumes the new code issues its own session (Options 2 and 3); where Option 1 differs, §4.4 says so.
      </Callout>

      {/* Step 3: Database */}
      <StepTitle number="3" title="Database" />
      
      <CodeBlock title="3.1 Sessions" language="sql">
        {sessionTable}
      </CodeBlock>

      <CodeBlock title="3.2 Login attempts — every attempt, successful or not" language="sql">
        {loginAttemptTable}
      </CodeBlock>

      <CodeBlock title="3.3 Account security state — extends the existing user without altering it" language="sql">
        {userSecurityTable}
      </CodeBlock>

      <CodeBlock title="3.4 Password history — prevents reuse" language="sql">
        {passwordHistoryTable}
      </CodeBlock>

      <Callout type="info">
        <strong><code className="bg-blue-100 px-1 rounded">dx_user_security</code> is a side table, not columns on the existing user table.</strong> That is Rule 1 in practice: the existing application keeps reading and writing its own columns and never sees these.
      </Callout>

      <p className="text-sm text-gray-700 mb-4">
        Migration <code className="bg-gray-100 px-1 rounded">00_4_001_auth.{'{up,down}'}.sql</code>. Run down, verify, run up.
      </p>

      <Callout type="warning">
        <strong>Seed:</strong> create a <code className="bg-amber-100 px-1 rounded">dx_user_security</code> row for every active existing user, with <code className="bg-amber-100 px-1 rounded">password_algo</code> set from the Step 1 finding and <code className="bg-amber-100 px-1 rounded">mfa_required = false</code>. The backfill is a one-time script, idempotent, committed to the repository.
      </Callout>

      {/* Step 4: Backend */}
      <StepTitle number="4" title="Backend" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.1 Files</h5>
      <CodeBlock title="dx/platform/auth/" language="text">
{`auth.service.ts
session.service.ts
password.service.ts
mfa.service.ts
lockout.service.ts
auth.middleware.ts
auth.controller.ts`}
      </CodeBlock>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.2 AuthService — the login flow</h5>
      <CodeBlock title="AuthService" language="typescript">
        {authServiceCode}
      </CodeBlock>

      <Callout type="danger">
        <strong>Two details that matter more than they look:</strong>
        <br /><br />
        <code className="bg-red-100 px-1 rounded">dummyVerify</code> runs a hash comparison against a fixed dummy hash when the user does not exist, so a failed login takes the same time whether or not the account is real. Without it, response timing enumerates your entire user list.
        <br /><br />
        The failure message never distinguishes "no such user" from "wrong password". The convenience of a clearer message is not worth handing an attacker a user directory.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.3 Transparent password rehashing</h5>
      <p className="text-sm text-gray-700 mb-4">
        Almost certainly the existing application stores MD5, SHA-1 or unsalted hashes. You cannot force every user to reset, and you must not leave weak hashes in place.
      </p>
      <CodeBlock title="PasswordService" language="typescript">
        {passwordServiceCode}
      </CodeBlock>

      <Callout type="warning">
        <strong>This requires opening exactly one column in the write bridge.</strong> Record it as ADR-005 with this justification: the existing application must continue to authenticate the same users, so the hash must live in the column it already reads. A side table would mean two password stores and a guaranteed divergence.
      </Callout>

      <Callout type="danger">
        <strong>Compatibility check before enabling.</strong> If the existing application verifies with <code className="bg-red-100 px-1 rounded">password_verify()</code> (PHP) it will accept argon2 hashes transparently. If it verifies with <code className="bg-red-100 px-1 rounded">md5($p) === $stored</code>, rehashing <strong>breaks the existing login</strong>. Test this explicitly, and if it breaks, either patch the existing verification (code, not database) or defer rehashing until the existing app is retired. Record the decision.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.4 Sessions</h5>
      <CodeBlock title="SessionService" language="typescript">
        {sessionServiceCode}
      </CodeBlock>

      <Callout type="info">
        <strong>The token is never stored.</strong> Only its SHA-256. A database breach then yields no usable sessions. Cookie flags: <code className="bg-blue-100 px-1 rounded">HttpOnly</code>, <code className="bg-blue-100 px-1 rounded">Secure</code>, <code className="bg-blue-100 px-1 rounded">SameSite=Lax</code>, and <code className="bg-blue-100 px-1 rounded">Path=/</code>.
      </Callout>

      <Callout type="warning">
        <strong>Changing a password revokes every session for that user</strong> except the one performing the change. This is the control that makes "my account was compromised" recoverable.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.5 MFA</h5>
      <p className="text-sm text-gray-700 mb-4">
        TOTP (RFC 6238), 30-second step, 6 digits, ±1 window tolerance for clock drift.
      </p>
      <CodeBlock title="MfaService" language="typescript">
        {mfaServiceCode}
      </CodeBlock>

      <Callout type="info">
        <strong>Who must have MFA.</strong> Part 0.5 sets <code className="bg-blue-100 px-1 rounded">mfa_required</code> from the global role. At minimum: Super Admin, anyone with backup or restore permission, anyone with payment release authority, and anyone who can change permissions. Configurable upward, never downward for those four.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.6 Lockout</h5>
      <p className="text-sm text-gray-700 mb-4">
        Progressive, not fixed: 5 failures → 15 minutes, 8 → 1 hour, 12 → locked until an administrator clears it. Counted per user <strong>and</strong> per IP, so a distributed attempt against many accounts still trips. Successful login clears the user counter.
      </p>

      {/* Step 5: API */}
      <StepTitle number="5" title="API" />
      
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Method</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Path</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Auth</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {apiEndpoints.map((endpoint) => (
              <tr key={endpoint.number} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{endpoint.number}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                    endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                    endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {endpoint.method}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-gray-700">{endpoint.path}</td>
                <td className="px-4 py-2 text-gray-600">{endpoint.auth}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{endpoint.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">5.1 Login responses</h5>
      <CodeBlock title="Response examples" language="json">
{`// success
{ "ok": true, "data": { "outcome": "SUCCESS",
  "user": { "id": 412, "name": "R. Sharma", "login": "rsharma" },
  "expiresAt": "2026-09-19T18:30:00+05:30" } }

// MFA needed
{ "ok": true, "data": { "outcome": "MFA_REQUIRED",
  "challengeToken": "eyJ...", "method": "TOTP" } }

// locked — states when, not why it locked
{ "ok": false, "error": { "code": "ACCOUNT_LOCKED",
  "message": "This account is locked until 14:35. Contact your administrator to unlock it sooner.",
  "context": { "lockedUntil": "2026-09-19T14:35:00+05:30" } } }

// bad credentials — identical whether or not the user exists
{ "ok": false, "error": { "code": "INVALID_CREDENTIALS",
  "message": "The login or password is incorrect." } }`}
      </CodeBlock>

      <Callout type="warning">
        <strong>Password reset request always returns 200</strong>, whether or not the address is known. Anything else is an account enumeration oracle.
      </Callout>

      {/* Step 6: Permissions */}
      <StepTitle number="6" title="Permissions" />
      <p className="text-sm text-gray-600 italic mb-4">
        <strong>Not applicable — Part 0.5.</strong> These endpoints are authenticated, not authorised. <code className="bg-gray-100 px-1 rounded">/auth/me</code> returns identity only; it gains a permission payload in 0.5.
      </p>

      {/* Step 7: Business Rules */}
      <StepTitle number="7" title="Business Rules" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Code</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Condition</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">Severity</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {businessRules.map((rule) => (
              <tr key={rule.code} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-red-700 bg-red-50">{rule.code}</td>
                <td className="px-4 py-2 text-gray-700">{rule.condition}</td>
                <td className="px-4 py-2 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {rule.severity}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600 text-xs">{rule.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        <strong>Password policy:</strong> minimum 12 characters; checked against a common-password list (the top 10,000 is enough); no reuse of the last 5; no composition rules beyond length. Forced complexity rules produce <code className="bg-blue-100 px-1 rounded">Password1!</code> and nothing safer.
      </Callout>

      {/* Step 8: Workflow */}
      <StepTitle number="8" title="Workflow" />
      <CodeBlock title="Login flow" language="text">
{`login ──> [locked?] ──yes──> ACCOUNT_LOCKED
            │no
            ▼
       [credentials] ──bad──> record failure ──> [threshold?] ──> lock
            │ok
            ▼
       [active?] ──no──> ACCOUNT_INACTIVE
            │yes
            ▼
       rehash if weak (silent)
            ▼
       [password expired?] ──yes──> PASSWORD_CHANGE_REQUIRED
            │no
            ▼
       [MFA required?] ──yes──> [enrolled?] ──no──> MFA_ENROLMENT_REQUIRED
            │no                      │yes
            │                        ▼
            │                   MFA_REQUIRED ──verify──> session (mfa_satisfied = true)
            ▼
       session created`}
      </CodeBlock>

      {/* Step 9: Frontend */}
      <StepTitle number="9" title="Frontend" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Route</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Screen</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {screenRoutes.map((route, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-blue-700">{route.route}</td>
                <td className="px-4 py-2 text-gray-700 font-medium">{route.screen}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{route.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        <strong>Login screen requirements:</strong> no "username not found" hint anywhere; caps-lock warning; the lockout message states the unlock time; loading state on submit that cannot be double-clicked; <code className="bg-blue-100 px-1 rounded">autocomplete="current-password"</code> so password managers work.
      </Callout>

      <Callout type="warning">
        <strong>MFA enrolment:</strong> show the QR <strong>and</strong> the secret as text, because site users frequently scan on the same device they are enrolling from. Recovery codes displayed once with an explicit "these will not be shown again" and a download action.
      </Callout>

      {/* Step 10: Realtime */}
      <StepTitle number="10" title="Realtime" />
      <p className="text-sm text-gray-700 mb-4">
        <strong>Deferred to Part 1.5.</strong> One event is emitted now for later subscribers: <code className="bg-gray-100 px-1 rounded">auth.session.revoked</code> — so that when 1.5 exists, a revoked session's socket closes immediately.
      </p>

      {/* Step 11: Notifications */}
      <StepTitle number="11" title="Notifications" />
      <p className="text-sm text-gray-700 mb-4">
        <strong>Deferred to Part 1.6</strong>, but record the triggers now: new device login, password changed, MFA enrolled or disabled, account locked, sessions revoked by an administrator.
      </p>

      {/* Step 12: Reports */}
      <StepTitle number="12" title="Reports" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Report</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Content</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((report, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700 font-medium">{report.name}</td>
                <td className="px-4 py-2 text-gray-600">{report.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Step 13: Dashboard */}
      <StepTitle number="13" title="Dashboard" />
      <CodeBlock title="vw_dx_q_auth_health" language="sql">
        {authHealthView}
      </CodeBlock>

      <Callout type="warning">
        <code className="bg-amber-100 px-1 rounded">mfa_pending</code> above zero means someone with privileged access has not enrolled. Surface it on the Super Admin dashboard in Part 13.
      </Callout>

      {/* Step 14: Error Handling */}
      <StepTitle number="14" title="Error Handling" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Code</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">HTTP</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">UI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">INVALID_CREDENTIALS</td>
              <td className="px-4 py-2 text-center font-mono">401</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Inline, no field-specific hint</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">ACCOUNT_LOCKED</td>
              <td className="px-4 py-2 text-center font-mono">423</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Message with unlock time and who to contact</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">MFA_REQUIRED</td>
              <td className="px-4 py-2 text-center font-mono">401</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Redirect to code entry, preserving intent</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">SESSION_EXPIRED</td>
              <td className="px-4 py-2 text-center font-mono">401</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Redirect to login preserving the return URL</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">PASSWORD_TOO_WEAK</td>
              <td className="px-4 py-2 text-center font-mono">400</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Inline with the policy stated</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">Rate limited</td>
              <td className="px-4 py-2 text-center font-mono">429</td>
              <td className="px-4 py-2 text-gray-600 text-xs">"Too many attempts. Try again in {'{n}'} seconds."</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="danger">
        <strong>Never log a password, a session token, an MFA secret or a recovery code</strong> — not at any level, not in an error path. Add a redaction filter to the logger and test it.
      </Callout>

      {/* Step 15: Audit */}
      <StepTitle number="15" title="Audit" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Action</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Recorded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {auditActions.map((action, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700 font-medium">{action.action}</td>
                <td className="px-4 py-2 text-gray-600">{action.recorded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        Audit rows are written through <code className="bg-blue-100 px-1 rounded">ctx.audit</code> (Part 0.6). Until 0.6 exists they buffer and log a boot warning — which is why 0.6 follows immediately.
      </Callout>

      {/* Step 16: Testing */}
      <StepTitle number="16" title="Testing" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700 w-12">#</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Case</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Expected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {testCases.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{test.id}</td>
                <td className="px-4 py-2 text-gray-700">
                  {test.case}
                  {test.starred && <span className="ml-2 text-amber-500 font-bold">★</span>}
                </td>
                <td className="px-4 py-2 text-gray-600">{test.expected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        <strong>A3 and A9 are the two that get skipped and matter most.</strong> A3 is the timing oracle; A9 is whether you have just broken the existing application's login for every user.
      </Callout>

      {/* Completion Checklist */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Developer Completion Checklist</h3>
        <div className="space-y-4">
          {completionChecklist.map((category) => (
            <div key={category.category} className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3">{category.category}</h4>
              <div className="space-y-2">
                {category.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600" readOnly />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Part */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-sm font-bold text-blue-900 mb-2">Next: Part 0.5A — the permission model and resolver</h4>
        <p className="text-sm text-blue-800">
          It replaces <code className="bg-blue-100 px-1 rounded">Actor.can()</code> and is the most security-critical part in the series. <strong>Do not begin it until every box above is ticked; authorisation built on shaky authentication protects nothing.</strong>
        </p>
      </div>
    </div>
  );
}
