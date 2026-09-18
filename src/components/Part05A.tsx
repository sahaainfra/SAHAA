import {
  dependencies,
  existingEntities,
  prerequisites,
  deliverables,
  permissionLayers,
  qualifiers,
  inspectionQueries,
  reportQuestions,
  reuseChecks,
  databaseTables,
  resolverCode,
  actorCode,
  cacheInvalidations,
  businessRules,
  resolverTests,
  cacheTests,
  performanceTests,
  completionChecklist,
} from "../data/part05a";

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

export default function Part05A() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-red-800 to-rose-900 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 0 — Foundation</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 5A of 9</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~2 days</span>
          <span className="text-xs bg-red-500/40 text-red-100 px-2 py-1 rounded font-bold">★ Most security-critical part in the series</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 0.5A — Permission Model & Resolver</h2>
        <p className="text-red-100 text-sm leading-relaxed">
          Resolve, for any user, the complete set of things they may do — globally and per project — including their approval authority, their row-level scope, their field restrictions and any delegation they hold, fast enough to check on every request.
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

      <Callout type="danger">
        <strong>Nothing is written to existing tables by this part.</strong>
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
            <span className="text-red-500 mt-1">✓</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>

      <Callout type="info">
        <strong>Part 0.5B builds the four enforcement points and the administration console.</strong> This part answers "what may this user do"; 0.5B makes the system obey the answer.
      </Callout>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Resolve, for any user, the complete set of things they may do — globally and per project — including their approval authority, their row-level scope, their field restrictions and any delegation they hold, fast enough to check on every request.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            the permission model; the resolver; caching and invalidation; the Actor; permission key registry; responsibility templates; approval authority; row scopes; field restrictions; delegation; SoD rule storage.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">
            enforcement (0.5B); the admin console (0.5B); SoD evaluation against the audit log (0.5B, because it needs the audit writer from 0.6).
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">
            a permission-inheritance hierarchy where roles extend other roles. It reads elegantly and becomes impossible to reason about within a year — "why can this person approve this?" should be answerable by reading one assignment, not by walking a tree.
          </p>
        </div>
      </div>

      {/* Section 3: The Model */}
      <SectionTitle number="3" title="The Model" />
      <p className="text-sm text-gray-700 mb-4">
        <strong>Four layers, resolved in order.</strong> Understanding this before reading the DDL saves an hour.
      </p>

      <div className="space-y-3 mb-6">
        {permissionLayers.map((layer, i) => (
          <div key={i} className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold text-xs flex-shrink-0">
                {layer.layer}
              </span>
              <div className="flex-1">
                <h5 className="text-sm font-bold text-gray-900 mb-1">{layer.name}</h5>
                <p className="text-xs text-gray-700 mb-2">{layer.description}</p>
                {layer.example && (
                  <p className="text-xs text-gray-500 italic">Example: {layer.example}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Plus three qualifiers attached to an assignment:</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-6">
        {qualifiers.map((q, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            <span>{q}</span>
          </li>
        ))}
      </ul>

      <Callout type="warning">
        <strong>The requirement this model exists to satisfy:</strong> the same user has different permissions, different approval limits and different responsibilities on different projects. Every design decision below follows from that.
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

      <Callout type="info">
        <strong>If the existing application has its own access control, it keeps working unchanged.</strong> The new model governs new surfaces only. Do not attempt to unify them in this part — that is a migration, and it belongs after both systems are proven side by side.
      </Callout>

      {/* Step 2: Reuse Check */}
      <StepTitle number="2" title="Reuse Check" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
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

      <Callout type="danger">
        <strong>Do not create:</strong> a second user table, a second project table, or any notion of "admin" as a boolean. <code className="bg-red-100 px-1 rounded">is_admin</code> anywhere in new code is a defect.
      </Callout>

      {/* Step 3: Database */}
      <StepTitle number="3" title="Database" />
      <p className="text-sm text-gray-700 mb-4">
        <strong>Eleven tables</strong> implementing the four-layer permission model with all qualifiers.
      </p>

      {databaseTables.map((table, i) => (
        <div key={i} className="mb-6">
          <h5 className="text-sm font-semibold text-gray-800 mb-2">
            {table.number} — {table.name}
          </h5>
          <p className="text-xs text-gray-600 mb-2 italic">{table.purpose}</p>
          <CodeBlock title={table.name} language="sql">
            {table.schema}
          </CodeBlock>
        </div>
      ))}

      <Callout type="info">
        <strong><code className="bg-blue-100 px-1 rounded">dx_assignment_audit</code> is separate from the general audit log</strong> built in 0.6, and deliberately so: permission changes are the highest-value forensic record in the system, they must survive any retention policy applied to ordinary audit rows, and they must be queryable without wading through a billion transaction audit entries.
      </Callout>

      <p className="text-sm text-gray-700 mb-4">
        Migration <code className="bg-gray-100 px-1 rounded">00_5_001_permission.{'{up,down}'}.sql</code>. Run down, verify, run up.
      </p>

      {/* Step 4: Backend */}
      <StepTitle number="4" title="Backend: The Resolver" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.2 The resolver — nine steps, order matters</h5>
      <CodeBlock title="PermissionResolver" language="typescript">
        {resolverCode}
      </CodeBlock>

      <Callout type="danger">
        <strong>Four details that are easy to get wrong and expensive to discover later:</strong>
        <br /><br />
        <strong>Step 4's <code className="bg-red-100 px-1 rounded">projectIsActive</code> check.</strong> A closed project must not grant permissions even if the assignment row is still active. Join to the project rather than trusting the assignment.
        <br /><br />
        <strong>Step 6's ordering.</strong> Applying GRANT and DENY in one pass, in row order, means the result depends on insertion order. Two passes — all grants, then all denies — makes DENY deterministic.
        <br /><br />
        <strong>Step 9's key intersection.</strong> <code className="bg-red-100 px-1 rounded">if (theirs.has(k))</code> matters: a delegation cannot grant a key the delegator does not hold. Without that check, a delegation becomes a privilege-escalation route.
        <br /><br />
        <strong>Step 3's comment.</strong> Super Admin is breadth, not immunity. Every later part that writes a two-person rule or an SoD check must apply it to Super Admins too, and 0.5B tests this.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.3 The Actor — replacing the Part 0.3 stub</h5>
      <CodeBlock title="Actor" language="typescript">
        {actorCode}
      </CodeBlock>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.4 Cache and invalidation</h5>
      <p className="text-sm text-gray-700 mb-4">
        <strong>Invalidate explicitly on every one of these</strong>, not just on TTL expiry:
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Change</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Invalidate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cacheInvalidations.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700">{item.change}</td>
                <td className="px-4 py-2 text-gray-600">{item.invalidate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        <strong>A 300-second TTL means a revoked permission can persist for up to five minutes without explicit invalidation.</strong> For most changes that is tolerable; for a deactivated user it is not. Deactivation invalidates immediately and also revokes every session (Part 0.4's <code className="bg-amber-100 px-1 rounded">revokeAllForUser</code>).
      </Callout>

      {/* Step 5: API */}
      <StepTitle number="5" title="API" />
      <p className="text-sm text-gray-700 mb-4">
        Only two endpoints here; enforcement and administration are 0.5B.
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Method</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Path</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Permission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-600">1</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">GET</span>
              </td>
              <td className="px-4 py-2 font-mono text-xs text-gray-700">/api/dx/v1/auth/me</td>
              <td className="px-4 py-2 text-gray-600 text-xs">authenticated — extends Part 0.4's version</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-600">2</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">GET</span>
              </td>
              <td className="px-4 py-2 font-mono text-xs text-gray-700">/api/dx/v1/permissions/my-projects</td>
              <td className="px-4 py-2 text-gray-600 text-xs">authenticated</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        <strong>The response does not contain the permission key list.</strong> It is large, it changes, and the client must not make decisions from it — the server decides. The client receives <code className="bg-amber-100 px-1 rounded">permVersion</code> and re-fetches its menu when it changes. The menu endpoint (0.5B) returns what the user may see.
      </Callout>

      {/* Step 6: Seed Data */}
      <StepTitle number="6" title="Seed Data" />
      
      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.1 Permission keys</h5>
      <p className="text-sm text-gray-700 mb-4">
        Keys are registered by the part that owns them. Phase 0 seeds only the administrative keys:
      </p>
      <CodeBlock title="Seed permission keys" language="sql">
{`INSERT INTO dx_permission (permission_key, module, entity, action, label, scope_type, is_sensitive, registered_by_part) VALUES
 ('admin.user.view',         'admin','user','view',        'View users',                   'GLOBAL',false,'0.5'),
 ('admin.user.manage',       'admin','user','manage',      'Create and edit users',        'GLOBAL',true, '0.5'),
 ('admin.permission.view',   'admin','permission','view',  'View permissions',             'GLOBAL',false,'0.5'),
 ('admin.permission.assign', 'admin','permission','assign','Assign project permissions',   'GLOBAL',true, '0.5'),
 ('project.view',            'project','project','view',   'View a project',               'PROJECT',false,'0.5');`}
      </CodeBlock>

      <Callout type="danger">
        <strong><code className="bg-red-100 px-1 rounded">project.view</code> is the master gate.</strong> Every project-scoped query filter in the system starts by asking whether the actor holds it for that project. A user without it on a project sees nothing from that project anywhere — no documents, no totals, no chart points.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.2 Global roles</h5>
      <CodeBlock title="Seed global roles" language="sql">
{`INSERT INTO dx_global_role (role_code, label, is_super_admin, requires_mfa, is_system) VALUES
 ('SUPER_ADMIN',       'Super Administrator',     true,  true,  true),
 ('MANAGING_DIRECTOR', 'Managing Director',       false, true,  true),
 ('CFO',               'Chief Financial Officer', false, true,  true),
 ('PROJECT_MANAGER',   'Project Manager',         false, false, true),
 ('STAFF',             'Staff',                   false, false, true);`}
      </CodeBlock>

      <Callout type="info">
        <code className="bg-blue-100 px-1 rounded">requires_mfa</code> is true for the three roles that can cause irreversible damage. Part 0.4 reads it.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.3 Responsibility templates</h5>
      <p className="text-sm text-gray-700 mb-4">
        Twelve system templates, seeded empty of keys — <strong>each later part adds its own keys to the templates that need them.</strong> This is what keeps template contents accurate: the part that creates <code className="bg-gray-100 px-1 rounded">procure.po.approve</code> also decides which templates get it.
      </p>
      <CodeBlock title="Seed responsibility templates" language="sql">
{`INSERT INTO dx_responsibility_template (template_code, label, category, is_system) VALUES
 ('PROJECT_MANAGER',   'Project Manager',    'SITE',       true),
 ('SITE_ENGINEER',     'Site Engineer',      'SITE',       true),
 ('QUANTITY_SURVEYOR', 'Quantity Surveyor',  'COMMERCIAL', true),
 ('STORE_KEEPER',      'Store Keeper',       'SITE',       true),
 ('PROJECT_VIEWER',    'Project Viewer (read only)','SITE',true);`}
      </CodeBlock>

      <Callout type="info">
        Phase 0 gives every template <code className="bg-blue-100 px-1 rounded">project.view</code> and nothing else. A user assigned today can see the project exists and nothing within it — correct, because nothing within it has been built yet.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.4 SoD rules</h5>
      <p className="text-sm text-gray-700 mb-4">
        Seeded now, evaluated in 0.5B. Later parts add their own.
      </p>
      <CodeBlock title="Seed SoD rules" language="sql">
{`INSERT INTO dx_sod_rule (rule_code, action_a, action_b, scope, severity, description) VALUES
 ('SOD-ADM-01','admin.permission.assign','admin.impersonate.execute','GLOBAL','BLOCK',
  'A user who can grant permissions must not also be able to impersonate.'),
 ('SOD-ADM-02','admin.user.manage','admin.permission.assign','GLOBAL','WARN',
  'Creating users and granting them permissions is a privilege-escalation path.');`}
      </CodeBlock>

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

      {/* Step 8: Workflow */}
      <StepTitle number="8" title="Workflow" />
      <p className="text-sm text-gray-600 italic mb-4">
        <strong>Not applicable.</strong> Assignment changes are immediate, audited administrative actions — they do not route through approval. If your organisation requires approval for permission changes, that is added in Phase 1 once the workflow engine exists; record it as a deferred requirement now.
      </p>

      {/* Step 9: Frontend */}
      <StepTitle number="9" title="Frontend" />
      <p className="text-sm text-gray-600 italic mb-4">
        <strong>Deferred to 0.5B</strong>, which builds the administration console. This part exposes only <code className="bg-gray-100 px-1 rounded">/auth/me</code>, consumed by the shell built in 0.7.
      </p>

      {/* Step 10: Realtime */}
      <StepTitle number="10" title="Realtime" />
      <p className="text-sm text-gray-700 mb-4">
        Emits <code className="bg-gray-100 px-1 rounded">permission.invalidated</code> with the affected user ids. Part 1.5 subscribes and pushes <code className="bg-gray-100 px-1 rounded">permission.refresh</code> to connected sessions, which re-fetch their menu. Until then the event is published and unconsumed — declared in the event registry as such.
      </p>

      {/* Steps 11-13: Not Applicable */}
      <StepTitle number="11–13" title="Not Applicable" />
      <p className="text-sm text-gray-600 italic mb-4">
        No notifications, reports or dashboards in this part. 0.5B adds the permission matrix report.
      </p>

      {/* Step 14: Error Handling */}
      <StepTitle number="14" title="Error Handling" />
      <p className="text-sm text-gray-700 mb-4">
        A permission denial returns <strong>403 with an explanation</strong>, and writes an audit row. Denied attempts are security signal — a user repeatedly hitting endpoints they cannot use is either a misconfigured menu or someone probing.
      </p>

      <Callout type="warning">
        <strong>Exception:</strong> a request for a record in a project the actor cannot see returns <strong>404, not 403</strong>. Confirming the record exists is itself a disclosure. This distinction is tested in 0.5B.
      </Callout>

      {/* Step 15: Audit */}
      <StepTitle number="15" title="Audit" />
      <p className="text-sm text-gray-700 mb-4">
        Every row in <code className="bg-gray-100 px-1 rounded">dx_assignment_audit</code> carries before and after state as JSON, the actor, the reason and the IP. Written for: assignment created, deactivated, template changed, override added or removed, authority changed, scope changed, delegation created or revoked, global role changed, field restriction changed.
      </p>

      <Callout type="danger">
        <strong>Permission audit is never purged.</strong> Whatever retention applies to transaction audit, this table keeps everything.
      </Callout>

      {/* Step 16: Testing */}
      <StepTitle number="16" title="Testing" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Resolver</h5>
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
            {resolverTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Cache</h5>
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
            {cacheTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Performance</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700 w-12">#</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Case</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Budget</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {performanceTests.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{test.id}</td>
                <td className="px-4 py-2 text-gray-700">
                  {test.case}
                  {test.starred && <span className="ml-2 text-amber-500 font-bold">★</span>}
                </td>
                <td className="px-4 py-2 text-gray-600">{test.budget}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
      <div className="mt-8 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl p-6">
        <h4 className="text-sm font-bold text-red-900 mb-2">Next: Part 0.5B — the four enforcement points and the administration console</h4>
        <p className="text-sm text-red-800 mb-3">
          The model is now correct; 0.5B is what makes the system obey it.
        </p>
        <Callout type="danger">
          <strong>Do not build any module part before 0.5B is complete</strong> — a resolver nobody consults protects nothing.
        </Callout>
      </div>
    </div>
  );
}
