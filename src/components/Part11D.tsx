import {
  dependencies,
  prerequisites,
  deliverables,
  sodRules,
  sodRulesSQL,
  documentStoreCode,
  workflowOriginCode,
  versionServiceCode,
  executeCode,
  availableCode,
  apiEndpoints,
  businessRules,
  events,
  testCases,
  completionChecklist,
} from "../data/part11d";

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

export default function Part11D() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-700 to-red-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 1 — Platform Engines</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 4 of 10</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~2 days</span>
          <span className="text-xs bg-red-500/40 text-red-100 px-2 py-1 rounded font-bold">★ Every state change in the system runs through this</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 1.1D — Document Storage, Versions & Action Execution</h2>
        <p className="text-orange-100 text-sm leading-relaxed">
          Store and version documents in one place, and execute every action through one sequence that composes Phase 0's controls rather than reimplementing them — allocating numbers when the definition says, locking when the action locks, allowing only the workflow engine to run approval outcomes, and explaining every refusal with the same sentence before and after the click.
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
              <th className="text-left px-4 py-2 font-semibold text-gray-700">What this part uses from it</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dependencies.map((dep, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{dep.part}</td>
                <td className="px-4 py-2 text-gray-700">{dep.uses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.2 What must already be functional</h5>
      <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
        {prerequisites.map((item, i) => (
          <li key={i}>{item.text}</li>
        ))}
      </ol>

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.3 What this part creates</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        {deliverables.map((d, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-orange-500 mt-1">✓</span>
            <span>{d.text}</span>
          </li>
        ))}
      </ul>

      <Callout type="warning">
        <strong>What a module does not write:</strong> Permission, value-authority, SoD, concurrency and idempotency checks; state validation; lock checks; number allocation; audit; events. They happen here, once, in a fixed order. A module that bypasses the executor fails CI (test A12).
      </Callout>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Store and version documents in one place, and execute every action through one sequence that composes Phase 0's controls rather than reimplementing them — allocating numbers when the definition says, locking when the action locks, allowing only the workflow engine to run approval outcomes, and explaining every refusal with the same sentence before and after the click.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            storage, versions, execute/executeIn/available, refusal auditing, the boot policy check, SoD seeds, the workflow origin, the guard mode, action endpoints, the action bar.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">
            create, update, read, list, drafts, controller (1.1E); the policy logic itself (0.5B); routing and the engine (1.2); posting (1.4).
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">
            a SET_STATUS endpoint; any path by which Super Admin skips a policy.
          </p>
        </div>
      </div>

      {/* Step 1: Inspect */}
      <StepTitle number="1" title="Inspect" />
      <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
        <li>Search the existing code for <code className="bg-gray-100 px-1 rounded">status =</code>, <code className="bg-gray-100 px-1 rounded">setStatus</code>, <code className="bg-gray-100 px-1 rounded">updateStatus</code>, <code className="bg-gray-100 px-1 rounded">-&gt;status</code> on each document table. Those screens keep working, but a status they change has <strong>no audit row from us</strong> — so SoD cannot see actions taken in the old system. Record this per document type.</li>
        <li>For each legacy document type: is the status column bridge-writable, and <code className="bg-gray-100 px-1 rounded">numberColumn</code>? Under which ADR?</li>
      </ol>

      {/* Step 2: Reuse Check */}
      <StepTitle number="2" title="Reuse Check" />
      <Callout type="info">
        Search for <code className="bg-blue-100 px-1 rounded">StandardPolicyChecks</code>, <code className="bg-blue-100 px-1 rounded">SodEvaluator</code>. <strong>Use them.</strong> No local SoD list, no authority comparison.
      </Callout>
      <Callout type="info">
        Search for <code className="bg-blue-100 px-1 rounded">IdempotencyInterceptor</code>. Apply it to the action route. No idempotency code in the executor.
      </Callout>
      <Callout type="info">
        Search for 0.3's <code className="bg-blue-100 px-1 rounded">ConcurrencyGuard</code>. If it exposes a per-row version function, <code className="bg-blue-100 px-1 rounded">DocumentVersionService</code> calls it. If it only guards whole routes, implement §4.3's rule here and have <code className="bg-blue-100 px-1 rounded">ConcurrencyGuard</code> call this for document routes — one implementation either way.
      </Callout>

      {/* Step 3: Database */}
      <StepTitle number="3" title="Database" />
      <p className="text-sm text-gray-700 mb-4">
        <strong>No new tables.</strong> One seed, migration <code className="bg-gray-100 px-1 rounded">01_1D_001_sod_rules</code>:
      </p>
      <CodeBlock title="SoD rules seed" language="sql">
        {sodRulesSQL}
      </CodeBlock>

      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Code</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Action A</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Action B</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">Scope</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sodRules.map((rule, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-red-700 bg-red-50">{rule.code}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-700">{rule.actionA}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-700">{rule.actionB}</td>
                <td className="px-4 py-2 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                    {rule.scope}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600 text-xs">{rule.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        Modules may add rules, never remove these. Exemptions go through <code className="bg-amber-100 px-1 rounded">dx_sod_exemption</code> (0.5B). Down: delete these four rows only.
      </Callout>

      {/* Step 4: Backend */}
      <StepTitle number="4" title="Backend" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.1 DocumentStore</h5>
      <CodeBlock title="DocumentStore" language="typescript">
        {documentStoreCode}
      </CodeBlock>

      <Callout type="info">
        Rebind 1.1C's token in this part's module: <code className="bg-blue-100 px-1 rounded">{'{ provide: DOCUMENT_LOADER, useExisting: DocumentStore }'}</code>. 1.1E adds <code className="bg-blue-100 px-1 rounded">insert</code> and <code className="bg-blue-100 px-1 rounded">update</code>. Nothing else in the system touches a document's tables; reports read the <code className="bg-blue-100 px-1 rounded">vw_dx_q_*</code> views.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.2 The workflow origin</h5>
      <CodeBlock title="WorkflowOrigin" language="typescript">
        {workflowOriginCode}
      </CodeBlock>

      <Callout type="danger">
        A <code className="bg-red-100 px-1 rounded">WORKFLOW</code> action runs only with a <code className="bg-red-100 px-1 rounded">WorkflowOrigin</code>. The controller never makes one, so the API cannot run <code className="bg-red-100 px-1 rounded">APPROVE</code> even for a user who holds the key. The engine (1.2C) calls <code className="bg-red-100 px-1 rounded">executeIn()</code> <strong>as the deciding approver</strong>, so every policy below applies to that person exactly as to anyone.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.3 DocumentVersionService</h5>
      <CodeBlock title="DocumentVersionService" language="typescript">
        {versionServiceCode}
      </CodeBlock>

      <Callout type="info">
        <code className="bg-blue-100 px-1 rounded">dx_</code> tables increment <code className="bg-blue-100 px-1 rounded">row_version</code> on every write — <code className="bg-blue-100 px-1 rounded">DocumentStore</code> does it, never a trigger.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.4 execute() and executeIn()</h5>
      <p className="text-sm text-gray-700 mb-4">
        The 14-step execution flow that every action in the system runs through:
      </p>
      <CodeBlock title="ActionExecutor" language="typescript">
        {executeCode}
      </CodeBlock>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6 my-6">
        <h6 className="text-sm font-bold text-orange-900 mb-3">The order matters at four points:</h6>
        <ol className="text-sm text-orange-800 space-y-2 list-decimal list-inside">
          <li><strong>Visibility (2) first</strong> — an out-of-scope caller learns nothing.</li>
          <li><strong>Locks (6) before policy (7)</strong> — the lock message names a correction path, which is actionable; a permission message about a frozen document is not.</li>
          <li><strong>Policy (7) before rules (9)</strong> — cheap and absolute before expensive.</li>
          <li><strong>Number (11) through <code className="bg-orange-100 px-1 rounded">allocate</code></strong> — if anything after it fails, 1.1B voids a FAST number with the error code as its reason.</li>
        </ol>
      </div>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.6 available() — the same answer, before the click</h5>
      <CodeBlock title="available()" language="typescript">
        {availableCode}
      </CodeBlock>

      <Callout type="info">
        The tooltip and the error are the same sentence because both come from <code className="bg-blue-100 px-1 rounded">i18n.translate(code, context)</code> over the same <code className="bg-blue-100 px-1 rounded">lockState</code> and <code className="bg-blue-100 px-1 rounded">policyError</code>. Workflow-only actions are omitted — approvals are taken in the inbox (1.2D). Actions not offered in this state are omitted, not greyed. Lists never call <code className="bg-blue-100 px-1 rounded">available()</code>: it reads SoD history per action.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.8 The route guard's any mode — a small, declared addition to 0.5B</h5>
      <p className="text-sm text-gray-700 mb-4">
        0.5B's guard checks a key against <em>one</em> project taken from the body, query, a param or the resource. Document routes cannot use any of these safely: <code className="bg-gray-100 px-1 rounded">GET /documents/PO</code> has no project, create carries it at <code className="bg-gray-100 px-1 rounded">header.projectId</code>, and <code className="bg-gray-100 px-1 rounded">'resource'</code> would answer 403 for an out-of-scope record — confirming it exists. Add one mode:
      </p>
      <CodeBlock title="Guard any mode" language="typescript">
{`case 'any': return ANY_PROJECT;          // in PermissionGuard.resolveProjectId
// and in canActivate, before actor.can(key, projectId):
if (projectId === ANY_PROJECT)
  ok = actor.hasGlobal(key) || actor.projectsWith(key).length > 0;`}
      </CodeBlock>

      <Callout type="warning">
        The guard then keeps out anyone holding the key nowhere; the service makes the record-level decision and answers 404. Record this in <code className="bg-amber-100 px-1 rounded">PHASE_1_FINDINGS.md</code> as a Phase 0 code change.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.9 The boot policy check</h5>
      <p className="text-sm text-gray-700 mb-4">
        After 1.1A's boot sync, per definition; failure is <code className="bg-gray-100 px-1 rounded">DOCUMENT_DEFINITION_INVALID</code>:
      </p>
      <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
        <li>Actions coded <code className="bg-gray-100 px-1 rounded">APPROVE</code>, <code className="bg-gray-100 px-1 rounded">CERTIFY</code>, <code className="bg-gray-100 px-1 rounded">VERIFY</code>, <code className="bg-gray-100 px-1 rounded">SANCTION</code>, or named in <code className="bg-gray-100 px-1 rounded">approval.onApproved</code>, set <code className="bg-gray-100 px-1 rounded">preventSelfApproval</code>, <code className="bg-gray-100 px-1 rounded">sodAction</code> and <code className="bg-gray-100 px-1 rounded">forbidUnderImpersonation</code>.</li>
        <li>Every <code className="bg-gray-100 px-1 rounded">sodAction</code> code is named by at least one active <code className="bg-gray-100 px-1 rounded">dx_sod_rule</code>; otherwise the flag does nothing, silently.</li>
        <li><code className="bg-gray-100 px-1 rounded">valueAuthority</code> requires <code className="bg-gray-100 px-1 rounded">amountField</code>.</li>
        <li>The <code className="bg-gray-100 px-1 rounded">allocateOn</code> action is reachable from <code className="bg-gray-100 px-1 rounded">initialState</code>.</li>
      </ol>

      {/* Step 5: API */}
      <StepTitle number="5" title="API" />
      <p className="text-sm text-gray-700 mb-4">
        This part provides the handlers; <strong>1.1E's DocumentController is the one place routes are registered</strong>, so the API registry has one entry per route. Until 1.1E, test through the services.
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Method</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Path (registered in 1.1E)</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Handler</th>
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
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {endpoint.method}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-gray-700">{endpoint.path}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{endpoint.handler}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Step 6: Permissions */}
      <StepTitle number="6" title="Permissions" />
      <p className="text-sm text-gray-700 mb-4">
        No new keys. Every policy check is project-scoped; a project-scoped document with no project fails closed (<code className="bg-gray-100 px-1 rounded">PROJECT_CONTEXT_MISSING</code>). Super Admin is not exempt from any policy (0.5B never consults <code className="bg-gray-100 px-1 rounded">isSuperAdmin</code>; test A9). Impersonation may read, never approve (boot check rule 1).
      </p>

      {/* Step 7: Business Rules */}
      <StepTitle number="7" title="Business Rules" />
      <p className="text-sm text-gray-700 mb-4">
        New codes for <code className="bg-gray-100 px-1 rounded">ERRORS</code> and i18n:
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Code</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">HTTP</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {businessRules.map((rule, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-red-700 bg-red-50">{rule.code}</td>
                <td className="px-4 py-2 text-center font-mono text-gray-700">{rule.http}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{rule.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Step 8: Workflow */}
      <StepTitle number="8" title="Workflow" />
      <p className="text-sm text-gray-700 mb-4">
        This part runs 1.1A's lifecycle. <code className="bg-gray-100 px-1 rounded">startsWorkflow</code> calls <code className="bg-gray-100 px-1 rounded">workflow.start()</code>; the engine later calls <code className="bg-gray-100 px-1 rounded">executeIn()</code> with a <code className="bg-gray-100 px-1 rounded">WorkflowOrigin</code> for the four approval outcomes. <code className="bg-gray-100 px-1 rounded">executeIn</code> needs an <code className="bg-gray-100 px-1 rounded">Allocator</code>, which only <code className="bg-gray-100 px-1 rounded">NumberingService.inUnitOfWork</code> produces — <strong>so 1.2C opens every engine transaction through <code className="bg-gray-100 px-1 rounded">inUnitOfWork</code></strong>, never through <code className="bg-gray-100 px-1 rounded">uow.run</code> directly.
      </p>
      <Callout type="info">
        <code className="bg-blue-100 px-1 rounded">SodEvaluator</code> returns the first blocking rule it finds. Require its repository's <code className="bg-blue-100 px-1 rounded">rulesInvolving()</code> to order by <code className="bg-blue-100 px-1 rounded">rule_code</code>, so the rule cited is deterministic.
      </Callout>

      {/* Step 9: Frontend */}
      <StepTitle number="9" title="Frontend" />
      <p className="text-sm text-gray-700 mb-4">
        <strong>&lt;DocumentActionBar type id version /&gt;</strong>
      </p>
      <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc list-inside">
        <li>Calls endpoint 1 on mount and on every <code className="bg-gray-100 px-1 rounded">document.action</code> for this document (1.5).</li>
        <li>Unavailable actions are <strong>disabled with the server's <code className="bg-gray-100 px-1 rounded">reason</code> as the tooltip</strong>, never hidden.</li>
        <li><code className="bg-gray-100 px-1 rounded">destructive</code> → confirmation; <code className="bg-gray-100 px-1 rounded">requiresReason</code> → options; <code className="bg-gray-100 px-1 rounded">requiresComment</code> → the button enables only once a comment is typed.</li>
        <li>Sends <code className="bg-gray-100 px-1 rounded">If-Match</code> from the version the page holds and an <code className="bg-gray-100 px-1 rounded">Idempotency-Key</code> generated <strong>once per click</strong> and reused on retry.</li>
        <li><code className="bg-gray-100 px-1 rounded">CONCURRENT_MODIFICATION</code> → banner naming who changed what, with Reload; never a silent reload.</li>
        <li>The whole bar is disabled while a request is in flight.</li>
      </ul>

      <Callout type="info">
        <strong>Responsive</strong> (0.8): phone — fixed bottom sheet, primary action full width, others in an overflow; tablet and desktop — right-aligned toolbar in the page header.
      </Callout>

      {/* Step 10: Realtime */}
      <StepTitle number="10" title="Realtime" />
      <p className="text-sm text-gray-700 mb-4">
        Register in <code className="bg-gray-100 px-1 rounded">EVENT_REGISTRY</code>:
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Event</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">aggregateType / idField</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">requiredFields</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">uiOnly</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((event, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-orange-700">{event.event}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{event.aggregateType} / {event.idField}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{event.requiredFields}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{event.uiOnly}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        One generic event, not one per type and action (forty types × six actions = 240 entries). <code className="bg-blue-100 px-1 rounded">uiOnly</code> is set so 0.6's CI check (test O9) passes before any subscriber exists; the first backend subscriber sets it to false. Payloads carry identifiers and states, never amounts.
      </Callout>

      {/* Steps 11-13: Not Applicable */}
      <StepTitle number="11–13" title="Not Applicable" />
      <p className="text-sm text-gray-600 italic mb-4">
        No notifications, reports, or dashboards in this part.
      </p>

      {/* Step 14: Error Handling */}
      <StepTitle number="14" title="Error Handling" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Code</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">UI treatment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">ACTION_WORKFLOW_ONLY</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Link to the approvals inbox</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">CONCURRENT_MODIFICATION</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Banner with who/what; input kept; Reload</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">DOCUMENT_LOCKED / _LEGACY</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Modal with the correction path and a link to start it</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">SOD_CONFLICT, SELF_APPROVAL_NOT_PERMITTED, APPROVAL_AUTHORITY_EXCEEDED</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Inline under the bar; the button stays disabled</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">IMPERSONATION_CANNOT_PERFORM_THIS_ACTION</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Banner offering "End impersonation"</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">STATE_TRANSITION_INVALID</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Refresh the bar</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">NOT_FOUND</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Standard not-found; never reveal existence</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">LOCKED_CONTENT_CHANGED, ENGINE_NOT_BUILT, ACTION_UNKNOWN</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Generic message; logged as defects</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Step 15: Audit */}
      <StepTitle number="15" title="Audit" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">action</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">fieldName / values</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-orange-700">the action code</td>
              <td className="px-4 py-2 text-gray-600 text-xs"><code className="bg-gray-100 px-1 rounded">status</code>: from → to (always one row); <code className="bg-gray-100 px-1 rounded">documentNumber</code> when allocated</td>
              <td className="px-4 py-2 text-gray-600 text-xs">reason code and comment</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-orange-700">WRITE_REFUSED</td>
              <td className="px-4 py-2 text-gray-600 text-xs"><code className="bg-gray-100 px-1 rounded">attempt</code>: the attempted action</td>
              <td className="px-4 py-2 text-gray-600 text-xs">the refusal code</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="info">
        The action code <em>is</em> the audit action, so <code className="bg-blue-100 px-1 rounded">SodEvaluator</code> reads these rows directly: user 12's <code className="bg-blue-100 px-1 rounded">SUBMIT</code> row on TEST_DOC 45 is what makes <code className="bg-blue-100 px-1 rounded">SOD-DOC-01</code> refuse user 12's <code className="bg-blue-100 px-1 rounded">APPROVE</code> on it.
      </Callout>

      {/* Step 16: Testing */}
      <StepTitle number="16" title="Testing" />
      <Callout type="info">
        ★ = paste output into <code className="bg-blue-100 px-1 rounded">PHASE_1_FINDINGS.md</code>. All on TEST_DOC; approval outcomes use a test <code className="bg-blue-100 px-1 rounded">WorkflowOrigin</code> and the workflow stub replaced by a recording double.
      </Callout>

      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700 w-12">#</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Test</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Expected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {testCases.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{test.id}</td>
                <td className="px-4 py-2 text-gray-700">
                  {test.test}
                  {test.starred && <span className="ml-2 text-amber-500 font-bold">★</span>}
                </td>
                <td className="px-4 py-2 text-gray-600 text-xs">{test.expected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Completion Checklist */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Developer Completion Checklist</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-2">
            {completionChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600" readOnly />
                <span className="text-sm text-gray-700">
                  {item.text}
                  {item.starred && <span className="ml-2 text-amber-500 font-bold">★</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Part */}
      <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6">
        <h4 className="text-sm font-bold text-orange-900 mb-2">Next: Part 1.1E — create, update, read, list, drafts and the controller</h4>
        <p className="text-sm text-orange-800">
          The final part of the document framework, providing the CRUD operations and API controller that modules will use.
        </p>
      </div>
    </div>
  );
}
