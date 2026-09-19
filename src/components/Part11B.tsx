import {
  dependencies,
  prerequisites,
  deliverables,
  inspectionQueries,
  reportQuestions,
  allocationModes,
  seriesSeedList,
  numberSeriesSQL,
  numberAllocationSQL,
  fiscalYearTS,
  testSeriesSeedSQL,
  apiEndpoints,
  permissionKeys,
  businessRules,
  events,
  notifications,
  auditActions,
  testCases,
  permissionTests,
  integrationTests,
  completionChecklist,
} from "../data/part11b";

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

export default function Part11B() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-700 to-red-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 1 — Platform Engines</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 2 of 10</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~1 day</span>
          <span className="text-xs bg-red-500/40 text-red-100 px-2 py-1 rounded font-bold">★ Every document number in the system comes from here</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 1.1B — Document Numbering</h2>
        <p className="text-orange-100 text-sm leading-relaxed">
          Deliver a numbering service that issues document numbers under concurrency without duplicates, distinguishes series where gaps are acceptable from series where they are not, records every number ever issued with what became of it, and reproduces existing client- or auditor-mandated formats exactly.
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

      <Callout type="warning">
        <strong>Why numbering is its own part:</strong> Document numbers are a legal artefact, not a convenience. A tax invoice series with a gap invites a question; a duplicated invoice number invites an assessment. Almost every system that gets this wrong got it wrong the same way: <code className="bg-amber-100 px-1 rounded">MAX(number) + 1</code> inside application code, which produces duplicates under any real concurrency, and nobody notices until two invoices in different months carry the same number. Building it once, here, means no module ever writes an allocator.
      </Callout>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Deliver a numbering service that issues document numbers under concurrency without duplicates, distinguishes series where gaps are acceptable from series where they are not, records every number ever issued with what became of it, and reproduces existing client- or auditor-mandated formats exactly.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            series configuration, allocation (two modes), consumption, voiding, format expansion, fiscal-year reset, the gap report, the admin screen.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">
            how a document uses its number (1.1E), workflow (1.2), print rendering (1.9).
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">
            no number reuse. A voided number is never reissued, by any route, including administrative. The reset endpoint changes the counter for future numbers; it cannot reclaim a past one.
          </p>
        </div>
      </div>

      {/* Step 1: Inspect */}
      <StepTitle number="1" title="Inspect" />
      <p className="text-sm text-gray-700 mb-4">
        Run these against the existing database. Paste output into <code className="bg-gray-100 px-1 rounded">PHASE_1_FINDINGS.md</code> before coding.
      </p>
      {inspectionQueries.map((query, i) => (
        <div key={i} className="mb-6">
          <h5 className="text-sm font-semibold text-gray-800 mb-2">{query.title}</h5>
          <CodeBlock title={query.title} language={query.language}>
            {query.code}
          </CodeBlock>
        </div>
      ))}

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Report explicitly</h5>
      <div className="space-y-3 mb-4">
        {reportQuestions.map((q, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900 mb-1">{q.question}</p>
            <p className="text-xs text-gray-600">{q.consequence}</p>
          </div>
        ))}
      </div>

      {/* Step 2: Reuse Check */}
      <StepTitle number="2" title="Reuse Check" />
      <Callout type="info">
        Search for existing <code className="bg-blue-100 px-1 rounded">NumberingService</code>, <code className="bg-blue-100 px-1 rounded">getNextNumber</code>, <code className="bg-blue-100 px-1 rounded">generateCode</code>. If per-module, leave it in place; new documents use ours. Do not delete it — existing screens may call it.
      </Callout>

      {/* Step 3: Database */}
      <StepTitle number="3" title="Database" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">3.1 dx_number_series</h5>
      <CodeBlock title="dx_number_series table" language="sql">
        {numberSeriesSQL}
      </CodeBlock>

      <Callout type="info">
        The uniqueness rule uses <code className="bg-blue-100 px-1 rounded">COALESCE</code>, so it must be a unique <strong>index</strong>, not a table-level <code className="bg-blue-100 px-1 rounded">UNIQUE</code> constraint. PostgreSQL rejects expressions in the latter.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Allocation modes</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Series</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">Mode</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Why</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allocationModes.map((mode, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700">{mode.series}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                    mode.mode === 'GAPLESS' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {mode.mode}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600 text-xs">{mode.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        <strong>When unsure, choose GAPLESS.</strong> It costs throughput; the other mistake costs an audit finding.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">3.2 dx_number_allocation</h5>
      <p className="text-sm text-gray-700 mb-4">
        Every number ever issued gets a row. This is what answers "what happened to invoice 41".
      </p>
      <CodeBlock title="dx_number_allocation table" language="sql">
        {numberAllocationSQL}
      </CodeBlock>

      <Callout type="info">
        A row sitting at <code className="bg-blue-100 px-1 rounded">ALLOCATED</code> with <code className="bg-blue-100 px-1 rounded">document_id IS NULL</code> for more than an hour is a number that was taken and never used — a gap with a name and an owner. The daily job reports these. It does <strong>not</strong> reuse them.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">3.3 Fiscal year</h5>
      <CodeBlock title="fiscalYearOf function" language="typescript">
        {fiscalYearTS}
      </CodeBlock>

      <Callout type="warning">
        <code className="bg-amber-100 px-1 rounded">{'{YYYY}'}</code>, <code className="bg-amber-100 px-1 rounded">{'{YY}'}</code> and <code className="bg-amber-100 px-1 rounded">{'{MM}'}</code> in formats use the same <code className="bg-amber-100 px-1 rounded">calendarPartsIn</code>, never the server clock's local fields. A project with its own timezone (Phase 2) passes it; until then the company default applies.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">3.4 Seeding</h5>
      <p className="text-sm text-gray-700 mb-4">
        Seed each series from the existing maximum, never from zero.
      </p>
      <p className="text-sm text-gray-700 mb-4">
        <strong>Do not seed a series for a document type whose module has not been built</strong> — an unused active series in the admin screen is a support question waiting to happen. The full list, for reference when you reach those parts:
      </p>
      <CodeBlock title="Series to seed (when modules are built)" language="text">
        {seriesSeedList}
      </CodeBlock>

      <p className="text-sm text-gray-700 mb-4">
        <strong>Test-only seed</strong> (migration <code className="bg-gray-100 px-1 rounded">01_1B_900_test_series</code>, <code className="bg-gray-100 px-1 rounded">NODE_ENV=test</code> only) — TEST_DOC allocates on SUBMIT, so without this every 1.1D and 1.1E test that submits would fail:
      </p>
      <CodeBlock title="Test series seed" language="sql">
        {testSeriesSeedSQL}
      </CodeBlock>

      <Callout type="info">
        <strong>Migration down:</strong> drop <code className="bg-blue-100 px-1 rounded">dx_number_allocation</code>, then <code className="bg-blue-100 px-1 rounded">dx_number_series</code>, then the rule. Nothing else. No existing object is touched by this part.
      </Callout>

      {/* Step 5: API */}
      <StepTitle number="5" title="API" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Method</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Path</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Purpose</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Permission</th>
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
                    endpoint.method === 'PATCH' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {endpoint.method}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-gray-700">{endpoint.path}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{endpoint.purpose}</td>
                <td className="px-4 py-2 text-gray-600 text-xs font-mono">{endpoint.permission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        Endpoint 6 exists so an administrator can check a format before committing to it. It formats <code className="bg-blue-100 px-1 rounded">current_value + increment_by</code> and <strong>never writes</strong>; a preview that allocates would put a gap in every series an admin looked at.
      </Callout>

      {/* Step 6: Permissions */}
      <StepTitle number="6" title="Permissions" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Key</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Grants</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Suggested holders</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {permissionKeys.map((key, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-orange-700 font-bold">{key.key}</td>
                <td className="px-4 py-2 text-gray-700">{key.grants}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{key.holders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        <strong>Reset requires a comment</strong>, recorded as the audit <code className="bg-amber-100 px-1 rounded">reason</code>, and emits <code className="bg-amber-100 px-1 rounded">numbering.series.reset</code> so that 1.6 tells the Super Admins. No exceptions, including Super Admin.
      </Callout>

      {/* Step 7: Business Rules */}
      <StepTitle number="7" title="Business Rules" />
      <p className="text-sm text-gray-700 mb-4">
        Add each to <code className="bg-gray-100 px-1 rounded">ERRORS</code> with the HTTP status shown and to the i18n catalogue.
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Code</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">HTTP</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Condition</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {businessRules.map((rule, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-red-700 bg-red-50">{rule.code}</td>
                <td className="px-4 py-2 text-center font-mono text-gray-700">{rule.http}</td>
                <td className="px-4 py-2 text-gray-700 text-xs">{rule.condition}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{rule.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        <code className="bg-blue-100 px-1 rounded">MODE_CHANGE_ON_ACTIVE_SERIES</code> is a warning the administrator must acknowledge, not a block — there are legitimate reasons — and the acknowledgement text is recorded as the audit <code className="bg-blue-100 px-1 rounded">reason</code>.
      </Callout>

      {/* Step 8: Workflow */}
      <StepTitle number="8" title="Workflow" />
      <p className="text-sm text-gray-600 italic mb-4">
        None. Series changes are immediate and audited, not routed for approval. If a client requires approval for format changes, that is a 1.2 configuration over the NUMBER_SERIES entity, added when 1.2 exists — do not anticipate it here.
      </p>

      {/* Step 9: Frontend */}
      <StepTitle number="9" title="Frontend" />
      <p className="text-sm text-gray-700 mb-4">
        <strong>Settings › Number Series</strong> — one screen, standard list-detail template from 0.7.
      </p>
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h6 className="text-sm font-bold text-gray-900 mb-2">List:</h6>
        <p className="text-xs text-gray-700">
          code, scope (project name or "Company-wide"), fiscal year, format, mode badge (Gapless = teal, Fast = grey), next number, active toggle. Filter by code, project, year, mode, active.
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h6 className="text-sm font-bold text-gray-900 mb-2">Detail:</h6>
        <p className="text-xs text-gray-700">
          the fields above plus a live preview that updates as the format is typed, using endpoint 6's formatter client-side and confirming against the server on save.
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h6 className="text-sm font-bold text-gray-900 mb-2">Mode field:</h6>
        <p className="text-xs text-gray-700 mb-2">
          a radio pair with the explanation visible, not in a tooltip:
        </p>
        <div className="bg-gray-50 rounded p-3 text-xs text-gray-700">
          <p className="mb-2"><strong>Gapless</strong> — numbers are never skipped, even if a document fails to save. Required for invoices, receipts and statutory registers. Slightly slower when many users save at once.</p>
          <p><strong>Fast</strong> — a failed save may leave a gap in the sequence. Suitable for internal documents such as indents, purchase orders and measurement books.</p>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h6 className="text-sm font-bold text-gray-900 mb-2">Reset:</h6>
        <p className="text-xs text-gray-700">
          behind a confirmation dialog that shows the highest issued number, requires a typed comment, and states that past numbers cannot be reclaimed.
        </p>
      </div>

      <Callout type="warning">
        <strong>Responsive</strong> (0.8): the list becomes cards on phone; the reset action is desktop-and-tablet only and is one of the three documented device exceptions — recorded in <code className="bg-amber-100 px-1 rounded">DEVICE_EXCEPTIONS.md</code> with the reason "irreversible administrative action; requires the confirmation detail that does not fit a phone dialog".
      </Callout>

      {/* Step 10: Realtime */}
      <StepTitle number="10" title="Realtime" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Event</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Payload</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Emitted when</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((event, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-orange-700">{event.event}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{event.payload}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{event.emittedWhen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        Consumed by open Number Series screens to refresh. No document screen subscribes — a document's number arrives in its own response. Register both in <code className="bg-blue-100 px-1 rounded">EVENT_REGISTRY</code> (0.6) with <code className="bg-blue-100 px-1 rounded">aggregateType: 'number_series'</code>, <code className="bg-blue-100 px-1 rounded">aggregateIdField: 'seriesId'</code>, and <code className="bg-blue-100 px-1 rounded">uiOnly: true</code> until 1.6 subscribes.
      </Callout>

      {/* Step 11: Notifications */}
      <StepTitle number="11" title="Notifications" />
      <p className="text-sm text-gray-700 mb-4">
        One, defined here and delivered by 1.6:
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Trigger</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Recipients</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Channel</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Content</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {notifications.map((notif, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700">{notif.trigger}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{notif.recipients}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{notif.channel}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{notif.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        Stale-allocation counts go to monitoring, not to people. A daily email nobody acts on trains everyone to ignore the one that matters.
      </Callout>

      {/* Step 12: Reports */}
      <StepTitle number="12" title="Reports" />
      <p className="text-sm text-gray-700 mb-4">
        <strong>Number Gap Report</strong> — <code className="bg-gray-100 px-1 rounded">GET /numbering/gaps</code>
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Column</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700">Series</td>
              <td className="px-4 py-2 text-gray-600 font-mono text-xs">dx_number_series.code</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700">Scope</td>
              <td className="px-4 py-2 text-gray-600 text-xs">project name or "Company-wide"</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700">Number</td>
              <td className="px-4 py-2 text-gray-600 font-mono text-xs">allocated_number</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700">Allocated at</td>
              <td className="px-4 py-2 text-gray-600 font-mono text-xs">allocated_at</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700">Allocated by</td>
              <td className="px-4 py-2 text-gray-600 text-xs">user name</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700">Status</td>
              <td className="px-4 py-2 text-gray-600 text-xs">ALLOCATED (issued, unused) / VOIDED</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700">Reason</td>
              <td className="px-4 py-2 text-gray-600 font-mono text-xs">void_reason</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="danger">
        <strong>Any GAPLESS series appearing in this report is a defect</strong>, not a finding — gapless allocation inside the business transaction cannot leave an unconsumed row. Test N8 asserts zero.
      </Callout>

      {/* Step 13: Dashboard */}
      <StepTitle number="13" title="Dashboard" />
      <p className="text-sm text-gray-600 italic mb-4">
        None.
      </p>

      {/* Step 14: Error Handling */}
      <StepTitle number="14" title="Error Handling" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Code</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">HTTP</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">UI treatment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">SERIES_NOT_CONFIGURED</td>
              <td className="px-4 py-2 text-center font-mono">409</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Modal. Users with admin.numbering.manage get a "Create series" link; others get the plain message and the administrator's name.</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">SERIES_INACTIVE</td>
              <td className="px-4 py-2 text-center font-mono">409</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Same treatment</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">RESET_BELOW_ISSUED</td>
              <td className="px-4 py-2 text-center font-mono">409</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Inline on the reset dialog, with the minimum permitted value pre-filled</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">SERIES_FORMAT_NO_SEQUENCE</td>
              <td className="px-4 py-2 text-center font-mono">422</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Inline on the format field, before save</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">DUPLICATE_NUMBER</td>
              <td className="px-4 py-2 text-center font-mono">500</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Generic message to the user; full detail to the log and to monitoring. This is a configuration bug and must page someone.</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">Permission denied</td>
              <td className="px-4 py-2 text-center font-mono">403</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Standard 0.5B treatment</td>
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
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Audit action</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">reason</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Recorded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {auditActions.map((action, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-orange-700">{action.action}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{action.reason}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{action.recorded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        Reset and mode change also emit events (Step 10) so that a person is told; the audit log itself has no severity level (see 1.1A §0.5).
      </Callout>

      <Callout type="warning">
        Allocation itself is <strong>not separately audited</strong> — <code className="bg-amber-100 px-1 rounded">dx_number_allocation</code> <strong>is</strong> the record, and it is delete-protected. Duplicating it into the audit log doubles the write cost of every document creation for no additional assurance.
      </Callout>

      {/* Step 16: Testing */}
      <StepTitle number="16" title="Testing" />
      <Callout type="info">
        ★ marks a test whose output is pasted into <code className="bg-blue-100 px-1 rounded">PHASE_1_FINDINGS.md</code>.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Core tests</h5>
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Permissions</h5>
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
            {permissionTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Integration</h5>
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
            {integrationTests.map((test) => (
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
        <div className="space-y-4">
          {completionChecklist.map((category, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3">{category.category}</h4>
              <div className="space-y-2">
                {category.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600" readOnly />
                    <span className="text-sm text-gray-700">
                      {item}
                      {item.includes('★') && <span className="ml-1 text-amber-500 font-bold">★</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Part */}
      <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6">
        <h4 className="text-sm font-bold text-orange-900 mb-2">Next: Part 1.1C — document locking and immutability</h4>
        <p className="text-sm text-orange-800">
          What makes a posted voucher, a certified measurement book and a filed return genuinely unchangeable, and detectable when they are not.
        </p>
      </div>
    </div>
  );
}
