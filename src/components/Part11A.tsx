import {
  dependencies,
  prerequisites,
  deliverables,
  partDivision,
  contractItems,
  phase0Additions,
  inspectionQueries,
  reportQuestions,
  reuseChecks,
  statusMapSQL,
  registrySQL,
  testDocumentSQL,
  documentStates,
  terminalStates,
  forbiddenActionCodes,
  businessRules,
  compilationTests,
  stateMachineTests,
  determinationTests,
  helperTests,
  completionChecklist,
} from "../data/part11a";

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

export default function Part11A() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-700 to-red-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 1 — Platform Engines</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 1 of 10</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~2 days</span>
          <span className="text-xs bg-red-500/40 text-red-100 px-2 py-1 rounded font-bold">★ Every module document depends on this</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 1.1A — Document Model: Definitions, Actions, States & The Test Document</h2>
        <p className="text-orange-100 text-sm leading-relaxed">
          Define one model for what a transactional document is — storage, actions, states, rules, derived values and content fingerprint — so each of the roughly forty module document types is a definition object rather than an implementation, and give every later test one document to run on.
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
      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        {prerequisites.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600" readOnly />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.3 What this part creates</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        {deliverables.map((d, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-orange-500 mt-1">✓</span>
            <span>{d.text}</span>
          </li>
        ))}
      </ul>

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.4 How Part 1.1 is divided</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Part</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Builds</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Uses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {partDivision.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-orange-700 font-bold">{item.part}</td>
                <td className="px-4 py-2 text-gray-700">{item.builds}</td>
                <td className="px-4 py-2 text-gray-600">{item.uses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        No part needs a later part to compile or pass its tests.
      </Callout>

      {/* Section 0.5: The Contract with Phase 0 */}
      <div className="mt-8 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-700 text-sm font-bold">
            0.5
          </span>
          The Contract with Phase 0 — used unchanged by every Phase 1 part
        </h3>
        <Callout type="danger">
          <strong>No Phase 1 part may introduce an alternative to any of these.</strong>
        </Callout>
        <div className="overflow-x-auto rounded-lg border-2 border-red-300 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-red-50 border-b-2 border-red-300">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-red-900">Need</th>
                <th className="text-left px-4 py-2 font-semibold text-red-900">Use</th>
                <th className="text-left px-4 py-2 font-semibold text-red-900">Never</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-200">
              {contractItems.map((item, i) => (
                <tr key={i} className="hover:bg-red-50">
                  <td className="px-4 py-2 text-gray-900 font-medium">{item.need}</td>
                  <td className="px-4 py-2 text-gray-700">{item.use}</td>
                  <td className="px-4 py-2 text-red-700">{item.never}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 0.6: Three Small Additions to Phase 0 Code */}
      <div className="mt-8 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold">
            0.6
          </span>
          Three Small Additions to Phase 0 Code — no database change
        </h3>
        <div className="space-y-4">
          {phase0Additions.map((addition, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-bold text-gray-900 mb-2">{addition.number}. {addition.title}</h5>
              <p className="text-xs text-gray-700">{addition.description}</p>
            </div>
          ))}
        </div>
        <Callout type="info">
          Record all three in <code className="bg-blue-100 px-1 rounded">PHASE_1_FINDINGS.md</code> as Phase 0 code changes.
        </Callout>
      </div>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Define one model for what a transactional document <em>is</em> — storage, actions, states, rules, derived values and content fingerprint — so each of the roughly forty module document types is a definition object rather than an implementation, and give every later test one document to run on.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            the shapes; compilation and boot validation; the registry and its sync; the state machine; rules and determinations; the content hash; SQL helpers; TEST_DOC.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">
            numbering (1.1B), locking (1.1C), storage/version/actions (1.1D), create–update–read–list–drafts (1.1E), routing (1.2), posting (1.4).
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">
            a shared document-state table (every status read would be a join, and legacy rows could never join it); a separate transition list (transitions are derived from actions — declaring them twice is how they drift).
          </p>
        </div>
      </div>

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
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Consequence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reportQuestions.map((q, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700 font-medium">{q.question}</td>
                <td className="px-4 py-2 text-gray-600">{q.consequence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        Record the second answer carefully. 0.2's example <code className="bg-amber-100 px-1 rounded">purchaseOrder</code> stores only <code className="bg-amber-100 px-1 rounded">D/P/A/X</code>: a PO definition using <code className="bg-amber-100 px-1 rounded">RETURNED</code>, <code className="bg-amber-100 px-1 rounded">RELEASED</code> or <code className="bg-amber-100 px-1 rounded">CLOSED</code> needs a DCR for new values before procurement is built. That is exactly why no Phase 1 test uses the PO.
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

      {/* Step 3: Database */}
      <StepTitle number="3" title="Database" />
      
      <CodeBlock title="3.1 Status map for legacy documents" language="sql">
        {statusMapSQL}
      </CodeBlock>

      <CodeBlock title="3.2 Document type registry" language="sql">
        {registrySQL}
      </CodeBlock>

      <CodeBlock title="3.3 TEST ONLY — test document tables" language="sql">
        {testDocumentSQL}
      </CodeBlock>

      <Callout type="info">
        Mirror tables are written only by the boot sync. Migration <code className="bg-blue-100 px-1 rounded">01_1A_001_document_model</code> — down drops the two mirror tables. The test migration's down drops the view, the two test tables, and deletes <code className="bg-blue-100 px-1 rounded">test.doc.*</code>.
      </Callout>

      {/* Step 4: Backend */}
      <StepTitle number="4" title="Backend" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.1 Document States</h5>
      <p className="text-sm text-gray-700 mb-4">
        The 19-state vocabulary that all documents share:
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {documentStates.map((state, i) => (
          <span
            key={i}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              terminalStates.includes(state)
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            {state}
            {terminalStates.includes(state) && ' (terminal)'}
          </span>
        ))}
      </div>

      <Callout type="warning">
        <strong>Two rules fixed for every document:</strong> Reject means no, Return means fix it — <code className="bg-amber-100 px-1 rounded">REJECTED</code> is terminal, <code className="bg-amber-100 px-1 rounded">RETURNED</code> is editable and resubmittable. Nothing goes backwards from <code className="bg-amber-100 px-1 rounded">POSTED</code>, <code className="bg-amber-100 px-1 rounded">CERTIFIED</code>, <code className="bg-amber-100 px-1 rounded">PARTIALLY_PAID</code> or <code className="bg-amber-100 px-1 rounded">PAID</code> into an editable state — correction is a new document.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Forbidden Action Codes</h5>
      <div className="flex flex-wrap gap-2 mb-6">
        {forbiddenActionCodes.map((code, i) => (
          <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
            {code}
          </span>
        ))}
      </div>

      {/* Step 5: API */}
      <StepTitle number="5" title="API" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Method</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Path</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Decorator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-600">1</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">GET</span>
              </td>
              <td className="px-4 py-2 font-mono text-xs text-gray-700">/api/dx/v1/document-types</td>
              <td className="px-4 py-2 text-gray-600 text-xs">@PublicEndpoint() — the response is filtered to types where the actor holds .view on some project, as 0.5B's menu does</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="info">
        Every other document endpoint is 1.1D or 1.1E.
      </Callout>

      {/* Step 6: Permissions */}
      <StepTitle number="6" title="Permissions" />
      <p className="text-sm text-gray-700 mb-4">
        No new keys, except <code className="bg-gray-100 px-1 rounded">test.doc.*</code> in the test-only migration. The boot sync (§4.3 rule 4) makes it impossible to ship an action whose key nobody can be granted.
      </p>

      {/* Step 7: Business Rules */}
      <StepTitle number="7" title="Business Rules" />
      <p className="text-sm text-gray-700 mb-4">
        New codes — add to <code className="bg-gray-100 px-1 rounded">ERRORS</code> and i18n:
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
        The lifecycle every approvable document follows. A module may add states after <code className="bg-gray-100 px-1 rounded">APPROVED</code>; it may not change this core.
      </p>
      <CodeBlock title="Document lifecycle" language="text">
{`(none) --create--> DRAFT --SUBMIT--> PENDING_APPROVAL --APPROVE*--> APPROVED --> (module-specific)
                    ^  |                  |   |   |
                    |  +--CANCEL--> CANCELLED |   +--REJECT*--> REJECTED (terminal)
                    +------RECALL*------------+--RETURN*--> RETURNED --SUBMIT--> PENDING_APPROVAL

* invokedBy: WORKFLOW — only the workflow engine (1.2C) executes these. The submitter requests a
  recall through 1.2C, which allows it only before anyone has decided at the current stage.`}
      </CodeBlock>

      {/* Steps 9-13: Not Applicable */}
      <StepTitle number="9–13" title="Not Applicable" />
      <p className="text-sm text-gray-600 italic mb-4">
        No screens (state badges everywhere use DOCUMENT_STATUS from 0.7 — label, tone and icon, never colour alone), no events, notifications, reports or dashboards.
      </p>

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
              <td className="px-4 py-2 font-mono text-xs text-red-700">STATE_TRANSITION_INVALID</td>
              <td className="px-4 py-2 text-center font-mono">409</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Refresh the action bar — the document moved on</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">UNMAPPED_STATUS_VALUE</td>
              <td className="px-4 py-2 text-center font-mono">500</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Generic message with correlation id; alerts.raiseP1 — a data defect</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">DOCUMENT_DEFINITION_INVALID</td>
              <td className="px-4 py-2 text-center font-mono">—</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Boot failure; never reaches a user</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Step 15: Audit */}
      <StepTitle number="15" title="Audit" />
      <p className="text-sm text-gray-700 mb-4">
        None. This part makes no business writes. Boot sync changes are logged at startup.
      </p>

      {/* Step 16: Testing */}
      <StepTitle number="16" title="Testing" />
      <Callout type="info">
        ★ = paste the output into <code className="bg-blue-100 px-1 rounded">PHASE_1_FINDINGS.md</code>. All tests run on TEST_DOC unless stated.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Compilation</h5>
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
            {compilationTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">State machine, registry, rules</h5>
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
            {stateMachineTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Determinations and hash</h5>
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
            {determinationTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Helpers</h5>
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
            {helperTests.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{test.id}</td>
                <td className="px-4 py-2 text-gray-700">{test.case}</td>
                <td className="px-4 py-2 text-gray-600">{test.expected}</td>
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
        <h4 className="text-sm font-bold text-orange-900 mb-2">Next: Part 1.1B — document numbering</h4>
        <p className="text-sm text-orange-800">
          Part 1.1B will build the numbering system that allocates document numbers from series, with project-scoped and global series support.
        </p>
      </div>
    </div>
  );
}
