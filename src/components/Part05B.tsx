import {
  dependencies,
  prerequisites,
  deliverables,
  enforcementPoints,
  inspectionCommands,
  reuseChecks,
  effectiveAssignmentView,
  routeGuardCode,
  permissionGuardCode,
  bootAssertionCode,
  queryFilterCode,
  queryFilterApplyCode,
  fieldMaskerCode,
  actionPolicyCode,
  standardPolicyChecksCode,
  sodEvaluatorCode,
  menuEndpointCode,
  impersonationCode,
  apiEndpoints,
  businessRules,
  screenRoutes,
  reports,
  permissionHealthView,
  enforcementTests,
  consoleTests,
  completionChecklist,
} from "../data/part05b";

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

export default function Part05B() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-red-800 to-rose-900 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 0 — Foundation</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 5B of 9</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~2 days</span>
          <span className="text-xs bg-red-500/40 text-red-100 px-2 py-1 rounded font-bold">★ Security-critical</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 0.5B — Permission Enforcement & Administration Console</h2>
        <p className="text-red-100 text-sm leading-relaxed">
          Make every route, every query, every field and every action obey the permission set — so that removing a control from the UI is never what protects anything.
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

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.2 What must already be functional</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        {prerequisites.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600" readOnly />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.3 What this part creates</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        {deliverables.map((d, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-red-500 mt-1">✓</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>

      <Callout type="info">
        <strong>A forward dependency, stated honestly:</strong> Full SoD evaluation asks "did this user perform action X on this document", which is a query against the general audit log — built in Part 0.6, immediately after this one. This part builds the evaluator with its repository interface, implemented against <code className="bg-blue-100 px-1 rounded">dx_assignment_audit</code> for the two administrative SoD rules seeded in 0.5A. Part 0.6 completes the document-scoped lookup.
      </Callout>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Make every route, every query, every field and every action obey the permission set — so that removing a control from the UI is never what protects anything.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            route guard; query filter; field masker; action policy framework; SoD evaluator; menu endpoint; assignment console; impact preview; impersonation.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">
            document-specific action policies (each document part writes its own, using this framework); the resolver (0.5A).
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">
            a UI-side permission check that decides what to render instead of asking the server. The client hides controls the server would refuse, purely to avoid presenting dead buttons — but the server refuses regardless, and a test proves it.
          </p>
        </div>
      </div>

      {/* Section 3: The Four Enforcement Points */}
      <SectionTitle number="3" title="The Four Enforcement Points" />
      <p className="text-sm text-gray-700 mb-4">
        A permission model checked only at the route is not a permission model.
      </p>

      <div className="space-y-3 mb-6">
        {enforcementPoints.map((point, i) => (
          <div key={i} className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold text-xs flex-shrink-0">
                POINT {point.number}
              </span>
              <div className="flex-1">
                <h5 className="text-sm font-bold text-gray-900 mb-1">{point.name}</h5>
                <p className="text-xs text-gray-700 mb-2">{point.description}</p>
                <p className="text-xs text-gray-500">
                  <strong>Catches:</strong> {point.catches.join(", ")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Callout type="danger">
        <strong>Point 4 is the one most systems miss.</strong> "Can approve purchase orders" is not the same as "can approve this ₹47 lakh purchase order on this project, having not raised it themselves".
      </Callout>

      {/* Step 1: Inspect */}
      <StepTitle number="1" title="Inspect" />
      {inspectionCommands.map((cmd, i) => (
        <div key={i} className="mb-4">
          <h5 className="text-sm font-semibold text-gray-800 mb-2">{cmd.title}</h5>
          <CodeBlock title={cmd.title} language={cmd.language}>
            {cmd.code}
          </CodeBlock>
        </div>
      ))}

      <Callout type="info">
        At this stage the counts are small — that is the point of building enforcement in Phase 0. Doing this at Part 90 means auditing four hundred routes.
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
        <strong>Do not create</strong> a second guard chain. Two enforcement paths mean one of them will be forgotten.
      </Callout>

      {/* Step 3: Database */}
      <StepTitle number="3" title="Database" />
      <p className="text-sm text-gray-700 mb-4">
        <strong>No new tables.</strong> This part uses the eleven created in 0.5A. One view, for the console:
      </p>
      <CodeBlock title="vw_dx_effective_assignment" language="sql">
        {effectiveAssignmentView}
      </CodeBlock>

      {/* Step 4: Backend */}
      <StepTitle number="4" title="Backend" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.1 Point 1 — the route guard</h5>
      <CodeBlock title="RequiresPermission decorator" language="typescript">
        {routeGuardCode}
      </CodeBlock>

      <CodeBlock title="PermissionGuard" language="typescript">
        {permissionGuardCode}
      </CodeBlock>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Boot-time assertion — the check that keeps this honest:</h5>
      <CodeBlock title="assertEveryRouteDeclaresPermission" language="typescript">
        {bootAssertionCode}
      </CodeBlock>

      <Callout type="warning">
        Run it at boot in non-production and as a CI test. This single assertion is why, 170 parts from now, there will be no unguarded endpoint.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.2 Point 2 — the query filter</h5>
      <CodeBlock title="EntityScopeSpec" language="typescript">
        {queryFilterCode}
      </CodeBlock>

      <CodeBlock title="QueryFilter.apply" language="typescript">
        {queryFilterApplyCode}
      </CodeBlock>

      <Callout type="danger">
        <strong>Making it impossible to skip.</strong> The base repository's <code className="bg-red-100 px-1 rounded">page</code>, <code className="bg-red-100 px-1 rounded">count</code>, <code className="bg-red-100 px-1 rounded">totals</code>, <code className="bg-red-100 px-1 rounded">stream</code> and <code className="bg-red-100 px-1 rounded">export</code> methods accept only a <code className="bg-red-100 px-1 rounded">CompiledWhere</code> produced by <code className="bg-red-100 px-1 rounded">QueryFilter.apply</code>. A raw string is a type error. A custom ESLint rule flags any query-builder call in a repository that does not receive a scoped where.
      </Callout>

      <Callout type="warning">
        <strong>Aggregates too.</strong> A <code className="bg-amber-100 px-1 rounded">COUNT</code>, <code className="bg-amber-100 px-1 rounded">SUM</code> or chart series uses the same filter. A dashboard tile showing a total that includes rows the user cannot open is a data leak, and it is the most common way permission models fail in practice — because dashboards are usually written against a different code path from lists.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.3 Point 3 — field masking</h5>
      <CodeBlock title="FieldMasker" language="typescript">
        {fieldMaskerCode}
      </CodeBlock>

      <Callout type="danger">
        <strong>Masked means masked everywhere</strong>, and a test proves each surface: JSON responses · CSV and Excel exports · PDF prints · chart series and aggregates · <code className="bg-red-100 px-1 rounded">$filter</code> and <code className="bg-red-100 px-1 rounded">$orderby</code> · the public API · portals. A user who cannot see a rate must not be able to infer it by sorting on it.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.4 Point 4 — action policies</h5>
      <CodeBlock title="ActionPolicy interface" language="typescript">
        {actionPolicyCode}
      </CodeBlock>

      <CodeBlock title="StandardPolicyChecks" language="typescript">
        {standardPolicyChecksCode}
      </CodeBlock>

      <Callout type="danger">
        <strong>Super Admin does not bypass these.</strong> <code className="bg-red-100 px-1 rounded">StandardPolicyChecks</code> never consults <code className="bg-red-100 px-1 rounded">isSuperAdmin</code>. Breadth of access is not immunity from separation of duties, and a test asserts it.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.5 The SoD evaluator</h5>
      <CodeBlock title="SodEvaluator" language="typescript">
        {sodEvaluatorCode}
      </CodeBlock>

      <Callout type="warning">
        <strong>Exemptions expire.</strong> A permanent unreviewed exemption is the same as not having the rule. Part 13 surfaces expiring exemptions on the Super Admin dashboard.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.6 The menu endpoint</h5>
      <CodeBlock title="Menu endpoint" language="typescript">
        {menuEndpointCode}
      </CodeBlock>

      <Callout type="info">
        <code className="bg-blue-100 px-1 rounded">pruneEmptyParents</code> removes a parent whose children are all hidden. An empty "Finance" menu with nothing beneath it is worse than no Finance menu — it advertises what the user cannot reach. The client never filters a menu. It renders what it receives.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.7 Impersonation</h5>
      <CodeBlock title="startImpersonation" language="typescript">
        {impersonationCode}
      </CodeBlock>

      <Callout type="warning">
        An impersonated session shows a persistent banner naming both identities and offering "return to my account". Every audit row written during it carries both user ids. The action-policy check in §4.4 refuses approve, post, pay, certify and restore.
      </Callout>

      {/* Step 5: API */}
      <StepTitle number="5" title="API" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
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
            {apiEndpoints.map((endpoint) => (
              <tr key={endpoint.number} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{endpoint.number}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                    endpoint.method.includes('GET') ? 'bg-blue-100 text-blue-800' :
                    endpoint.method.includes('POST') ? 'bg-green-100 text-green-800' :
                    endpoint.method.includes('PATCH') ? 'bg-amber-100 text-amber-800' :
                    endpoint.method.includes('PUT') ? 'bg-purple-100 text-purple-800' :
                    endpoint.method.includes('DELETE') ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {endpoint.method}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-gray-700">{endpoint.path}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{endpoint.permission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">5.1 Impact preview — the endpoint that prevents outages</h5>
      <CodeBlock title="POST /admin/assignments/preview" language="json">
{`// Request
{ "userId": 412, "projectId": 17, "action": "DEACTIVATE" }

// Response
{
  "ok": true,
  "data": {
    "permissionsLost": ["procure.po.approve", "bill.client.check", "..."],
    "permissionsGained": [],
    "projectsLost": [17],
    "authorityChanges": [{ "documentType": "PO", "from": "₹50,00,000", "to": null }],
    "blockers": [
      { "code": "ORPHANED_APPROVALS",
        "severity": "BLOCK",
        "message": "R. Sharma is the only approver for 23 pending documents on this project.",
        "context": { "count": 23, "documentTypes": { "PO": 11, "CLIENT_BILL": 12 },
                     "totalValue": "₹4,82,00,000" },
        "remedy": "Nominate a substitute in the same request, or assign another user first." }
    ],
    "warnings": [
      { "code": "OPEN_DOCUMENTS_OWNED", "message": "7 draft documents were created by this user." }
    ],
    "sodConflictsIntroduced": []
  }
}`}
      </CodeBlock>

      <Callout type="danger">
        <strong><code className="bg-red-100 px-1 rounded">ORPHANED_APPROVALS</code> blocks the save</strong> unless a substitute is nominated in the same transaction. Removing the only approver for 23 pending bills is a real and frequent outage, and it is entirely preventable at this point.
      </Callout>

      {/* Step 6: Permissions */}
      <StepTitle number="6" title="Permissions" />
      <p className="text-sm text-gray-700 mb-4">
        Uses the keys seeded in 0.5A. Registers the entity scope for its own admin entities.
      </p>
      <Callout type="warning">
        <strong>SoD:</strong> <code className="bg-amber-100 px-1 rounded">SOD-ADM-01</code> (assign + impersonate) is enforced from this part — a user who can grant permissions must not also be able to impersonate, because together they are unlimited undetected access.
      </Callout>

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
      <p className="text-sm text-gray-700 mb-4">
        Assignment changes are immediate and audited. <strong>Bulk operations run as a job</strong> with a dry-run count, a preview, progress, and a single audit batch id so the whole operation can be reviewed or reversed as a unit.
      </p>

      {/* Step 9: Frontend */}
      <StepTitle number="9" title="Frontend" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Route</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Screen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {screenRoutes.map((route, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-blue-700">{route.route}</td>
                <td className="px-4 py-2 text-gray-700 text-xs">{route.screen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        <strong>The assignment editor's Review tab shows the impact preview before saving</strong>, with blockers in red and a disabled save until they are resolved. This is the screen that prevents the outage described in §5.1.
      </Callout>

      <Callout type="warning">
        <strong>Responsive:</strong> viewing works everywhere; <strong>editing assignments is tablet and desktop only.</strong> The matrix is inherently wide and the impact preview must be readable. This is one of only three device restrictions in the entire system, and it shows an explanatory message rather than a broken layout.
      </Callout>

      {/* Step 10: Realtime */}
      <StepTitle number="10" title="Realtime" />
      <p className="text-sm text-gray-700 mb-4">
        Consumes <code className="bg-gray-100 px-1 rounded">permission.invalidated</code> from 0.5A. Once Part 1.5 exists, pushes <code className="bg-gray-100 px-1 rounded">permission.refresh</code> to affected connected sessions, which re-fetch <code className="bg-gray-100 px-1 rounded">/shell/menu</code>.
      </p>
      <Callout type="danger">
        <strong>A user whose access was revoked must not keep a stale navigation tree.</strong>
      </Callout>

      {/* Step 11: Notifications */}
      <StepTitle number="11" title="Notifications" />
      <p className="text-sm text-gray-700 mb-4">
        Deferred to 1.6; triggers recorded now: assignment granted or removed, delegation received or expiring, impersonation performed on your account, SoD exemption expiring.
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
      <CodeBlock title="vw_dx_q_permission_health" language="sql">
        {permissionHealthView}
      </CodeBlock>

      <Callout type="warning">
        <code className="bg-amber-100 px-1 rounded">super_admins</code> above three on a normal installation deserves a look. So does any exemption that has been renewed more than twice.
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
              <td className="px-4 py-2 font-mono text-xs text-red-700">PERMISSION_DENIED</td>
              <td className="px-4 py-2 text-center font-mono">403</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Name the missing permission and who can grant it</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">PROJECT_NOT_ASSIGNED</td>
              <td className="px-4 py-2 text-center font-mono">403</td>
              <td className="px-4 py-2 text-gray-600 text-xs">"You are not assigned to this project."</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">Record outside scope</td>
              <td className="px-4 py-2 text-center font-mono font-bold">404</td>
              <td className="px-4 py-2 text-gray-600 text-xs">"Not found or not accessible" ★</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">SOD_CONFLICT</td>
              <td className="px-4 py-2 text-center font-mono">403</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Name the rule, explain it, say who else can act</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">AUTHORITY_EXCEEDED</td>
              <td className="px-4 py-2 text-center font-mono">403</td>
              <td className="px-4 py-2 text-gray-600 text-xs">State the limit and the document value</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">ORPHANED_APPROVALS</td>
              <td className="px-4 py-2 text-center font-mono">422</td>
              <td className="px-4 py-2 text-gray-600 text-xs">List the documents; offer substitute nomination</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="danger">
        <strong>404 rather than 403 for out-of-scope records.</strong> A 403 confirms the record exists, which is itself a disclosure — an attacker can enumerate document numbers across projects. Tested below.
      </Callout>

      {/* Step 15: Audit */}
      <StepTitle number="15" title="Audit" />
      <p className="text-sm text-gray-700 mb-4">
        Every denial is recorded: actor, key, project, route, method, IP, timestamp. Denied attempts are security signal.
      </p>
      <p className="text-sm text-gray-700 mb-4">
        Every console action writes <code className="bg-gray-100 px-1 rounded">dx_assignment_audit</code> with before and after state. Impersonation start and end record both identities, the reason, and every action taken during it.
      </p>

      {/* Step 16: Testing */}
      <StepTitle number="16" title="Testing" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Enforcement</h5>
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
            {enforcementTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Console</h5>
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
            {consoleTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Generated coverage test</h5>
      <CodeBlock title="Permission coverage test" language="typescript">
{`// Runs on every commit; new routes are covered automatically.
describe('permission coverage', () => {
  it.each(enumerateRoutes())('$method $path denies an actor without its key', async (route) => {
    const key = permissionKeyFor(route);
    if (!key) return;                                   // @PublicEndpoint
    const actor = await actorWithout(key);
    const res = await call(route, actor);
    expect([403, 404]).toContain(res.status);
  });
});`}
      </CodeBlock>

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
        <h4 className="text-sm font-bold text-red-900 mb-2">Phase 0 is now two parts from complete</h4>
        <p className="text-sm text-red-800 mb-3">
          Next: 0.6 (audit and outbox), then 0.7 (design system and shell) and 0.8 (responsive framework).
        </p>
        <Callout type="danger">
          <strong>Before moving on, run E4 and E14 in front of whoever owns security for this project.</strong> E4 proves dashboard totals respect project boundaries; E14 proves a Super Admin cannot approve their own transaction. Those two demonstrations answer most of what an auditor will ask about this system, and it is worth having them witnessed now rather than described later.
        </Callout>
      </div>
    </div>
  );
}
