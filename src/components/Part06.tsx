import {
  dependencies,
  prerequisites,
  deliverables,
  inspectionQueries,
  reportQuestions,
  reuseChecks,
  databaseTables,
  auditCollectorCode,
  auditWriterCode,
  chainVerifierCode,
  outboxCollectorCode,
  outboxWriterCode,
  outboxRelayCode,
  eventRegistryCode,
  auditLogHistoryCode,
  apiEndpoints,
  businessRules,
  screenRoutes,
  reports,
  outboxHealthView,
  auditHealthView,
  auditTests,
  outboxTests,
  sodTests,
  performanceTests,
  completionChecklist,
} from "../data/part06";

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

export default function Part06() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 0 — Foundation</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 6 of 9</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~1.5 days</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 0.6 — Audit Trail & Transactional Outbox</h2>
        <p className="text-purple-100 text-sm leading-relaxed">
          Record every consequential change in a tamper-evident chain, and publish every domain event exactly once, both atomically with the change itself.
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
            <span className="text-purple-500 mt-1">✓</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>

      <Callout type="info">
        <strong>Why audit and outbox are one part:</strong> They share a property that nothing else in the system has: both must be written inside the same transaction as the change they describe, or they are worthless. An audit row written after commit can be lost. An event emitted after commit can fire for a transaction that rolled back. Building them together keeps that guarantee in one place.
      </Callout>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Record every consequential change in a tamper-evident chain, and publish every domain event exactly once, both atomically with the change itself.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            audit log with hash chaining; audit writer and collector; chain verification; event outbox; relay with backoff and dead-lettering; subscriber registry; AuditLogHistory for SoD; audit query API.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">
            real-time fan-out to browsers (1.5 subscribes to the outbox); notifications (1.6); the document-level audit UI (1.1 adds the object-page audit section).
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">
            audit via database triggers on every table. Triggers cannot see the application actor, the correlation id, the reason or the business context — they record that updated_at changed, which answers nothing. Audit is written by the application, deliberately, with meaning.
          </p>
        </div>
      </div>

      <Callout type="info">
        <strong>Also deliberately not built:</strong> a message broker. The outbox pattern with a polling relay is sufficient to five-year volume, has no extra infrastructure to operate, and survives a broker being unavailable. If throughput later demands Kafka, the relay is the only thing that changes.
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

      <Callout type="warning">
        <strong>Estimate dx_audit_log growth before choosing partitioning.</strong> A mid-size contractor generates roughly 50,000–200,000 audit rows a month once all modules are live. Below about 50 million rows a single table with good indexes is fine; above that, partition monthly. Record the estimate and the decision as ADR-006.
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
        <strong>Do not create:</strong> a second audit table per module. One table, one chain, one query surface.
      </Callout>

      {/* Step 3: Database */}
      <StepTitle number="3" title="Database" />
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

      <Callout type="danger">
        <strong>The dx_audit_no_update / no_delete rules are the control.</strong> <code className="bg-red-100 px-1 rounded">DO INSTEAD NOTHING</code> silently discards the statement rather than raising — which means a buggy <code className="bg-red-100 px-1 rounded">UPDATE dx_audit_log</code> succeeds from the caller's point of view and changes nothing. That is the correct behaviour for an append-only log: never fail the surrounding transaction, never allow the change. A test asserts the row is unchanged afterwards.
      </Callout>

      <Callout type="info">
        <strong>Retention.</strong> Audit rows are never deleted by application code. If a retention policy is required by law, it is a documented administrative job with its own approval, and it never touches <code className="bg-blue-100 px-1 rounded">dx_assignment_audit</code> (Part 0.5A) which is kept indefinitely.
      </Callout>

      <p className="text-sm text-gray-700 mb-4">
        Migration <code className="bg-gray-100 px-1 rounded">00_6_001_audit_outbox.{'{up,down}'}.sql</code>. Run down — note that the rules and indexes must drop in order — verify, run up.
      </p>

      {/* Step 4: Backend */}
      <StepTitle number="4" title="Backend" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.1 The audit collector and writer</h5>
      <CodeBlock title="AuditCollector" language="typescript">
        {auditCollectorCode}
      </CodeBlock>

      <CodeBlock title="AuditWriter" language="typescript">
        {auditWriterCode}
      </CodeBlock>

      <Callout type="warning">
        <strong>Three decisions inside that method worth stating:</strong>
        <br /><br />
        <strong>Field-level expansion.</strong> Storing a whole JSON before and after makes "who changed the rate?" require scanning every row. One row per changed field makes it an indexed lookup. The cost is more rows; the benefit is that the audit trail is actually queryable.
        <br /><br />
        <strong><code className="bg-amber-100 px-1 rounded">AUDIT_IGNORE_FIELDS</code>.</strong> Without it, every update logs an updated_at change and the signal drowns in noise.
        <br /><br />
        <strong><code className="bg-amber-100 px-1 rounded">redactIfSensitive</code>.</strong> A password hash, an MFA secret or a bank account must never enter the audit log even as an old value. The redaction list is registered per entity, and a test asserts no value matching a credential pattern ever lands in old_value or new_value.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.2 Chain verification</h5>
      <CodeBlock title="AuditChainVerifier" language="typescript">
        {chainVerifierCode}
      </CodeBlock>

      <Callout type="info">
        <strong>Verification is incremental in production.</strong> Verifying 50 million rows nightly is wasteful; verify from the last known-good id, and store that id after each successful run. A full verification runs monthly and during the Phase 22 acceptance.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.3 The outbox collector, writer and relay</h5>
      <CodeBlock title="OutboxCollector" language="typescript">
        {outboxCollectorCode}
      </CodeBlock>

      <CodeBlock title="OutboxWriter" language="typescript">
        {outboxWriterCode}
      </CodeBlock>

      <CodeBlock title="OutboxRelay" language="typescript">
        {outboxRelayCode}
      </CodeBlock>

      <Callout type="danger">
        <strong>Subscribers must be idempotent.</strong> The relay guarantees at-least-once, never exactly-once — a crash between <code className="bg-red-100 px-1 rounded">sub.handle()</code> succeeding and <code className="bg-red-100 px-1 rounded">recordSuccess</code> committing replays the event. <code className="bg-red-100 px-1 rounded">dx_outbox_delivery</code> catches the common case; the subscriber's own idempotency key catches the rest. Every subscriber declares one.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.4 The event registry</h5>
      <CodeBlock title="Event Registry" language="typescript">
        {eventRegistryCode}
      </CodeBlock>

      <Callout type="warning">
        <strong>A CI test asserts every <code className="bg-amber-100 px-1 rounded">emit()</code> call in the codebase names a registered event type</strong>, and that every registered type has a subscriber or is marked <code className="bg-amber-100 px-1 rounded">uiOnly</code>. This is what prevents the silent-event problem: an event emitted for years that nothing listens to, discovered only when someone asks why a dashboard never updates.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.5 Completing the SoD evaluator</h5>
      <p className="text-sm text-gray-700 mb-4">
        Part 0.5B defined <code className="bg-gray-100 px-1 rounded">ActionHistory</code> with an interface and an assignment-audit implementation. This part supplies the general one:
      </p>
      <CodeBlock title="AuditLogHistory" language="typescript">
        {auditLogHistoryCode}
      </CodeBlock>

      <Callout type="success">
        Bind it in the DI container, replacing the 0.5B placeholder. <strong>The SoD test deferred from 0.5B runs now:</strong> a user performs action A on a document, then attempts conflicting action B, and is refused by rule rather than by role.
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
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                    endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
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

      <Callout type="info">
        <strong>Endpoint 2 uses the entity's own view key</strong>, not an admin key — a project manager should see the change history of their own purchase order without being an administrator. The query filter from 0.5B scopes it to their projects.
      </Callout>

      <Callout type="warning">
        <strong>The correlation endpoint is the one support will use most.</strong> Given a correlation id from an error message, it returns every audit row and every event from that request, in order. That is usually the whole diagnosis.
      </Callout>

      {/* Step 6: Permissions */}
      <StepTitle number="6" title="Permissions" />
      <p className="text-sm text-gray-700 mb-4">
        <code className="bg-gray-100 px-1 rounded">admin.audit.view</code> is sensitive: the audit log contains old and new values across the whole system, so it is a read-everything key in practice. Restrict it to a named compliance role, and <strong>log every audit query</strong> — <code className="bg-gray-100 px-1 rounded">action = 'AUDIT_QUERIED'</code> with the filter used. Watching the watchers is not paranoia; an unlogged ability to read all historical values is a real exposure.
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
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    rule.severity === 'P1' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'
                  }`}>
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
      <CodeBlock title="Event delivery workflow" language="text">
{`PENDING ──relay picks up──> PROCESSING ──all subscribers ok──> DONE
                                 │
                                 └──any failure──> FAILED ──(backoff)──> PENDING
                                                       │
                                                  10 attempts
                                                       ▼
                                                     DEAD ──> P1 alert, manual retry`}
      </CodeBlock>

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

      <Callout type="warning">
        <strong>The audit explorer's default view is the last 24 hours</strong>, not everything — an unbounded first query against 50 million rows is how this screen gets a reputation for being slow.
      </Callout>

      <Callout type="info">
        The <strong>object-page audit section</strong> (a per-document change history) is built in Part 1.1 as part of the document framework, so every document gets it without each module building one.
      </Callout>

      {/* Step 10: Realtime */}
      <StepTitle number="10" title="Realtime" />
      <p className="text-sm text-gray-700 mb-4">
        This part <strong>is</strong> the source of real-time. Part 1.5 registers a subscriber against every event type and fans out to connected browsers. Until then, events accumulate and are consumed by backend subscribers only.
      </p>

      <Callout type="warning">
        <strong>Outbox lag is the health metric for the whole real-time system.</strong> Monitor it from day one:
      </Callout>

      <CodeBlock title="vw_dx_q_outbox_health" language="sql">
        {outboxHealthView}
      </CodeBlock>

      {/* Step 11: Notifications */}
      <StepTitle number="11" title="Notifications" />
      <p className="text-sm text-gray-700 mb-4">
        Deferred to 1.6. Triggers recorded: chain verification failure (P1, to compliance and the technical lead), dead event (P1, to the technical lead), outbox lag beyond five minutes (P1).
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
      <CodeBlock title="vw_dx_q_audit_health" language="sql">
        {auditHealthView}
      </CodeBlock>

      <Callout type="info">
        A growing gap between <code className="bg-blue-100 px-1 rounded">verified_upto</code> and <code className="bg-blue-100 px-1 rounded">latest_id</code> means verification has stopped running. <code className="bg-blue-100 px-1 rounded">denials_24h</code> rising sharply means either a misconfigured menu or someone probing.
      </Callout>

      {/* Step 14: Error Handling */}
      <StepTitle number="14" title="Error Handling" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Condition</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Behaviour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700 font-medium">Audit write fails</td>
              <td className="px-4 py-2 text-red-700 font-semibold">The whole transaction rolls back. A change without its audit row is not permitted.</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700 font-medium">Outbox write fails</td>
              <td className="px-4 py-2 text-red-700 font-semibold">Same — the transaction rolls back.</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700 font-medium">Subscriber throws</td>
              <td className="px-4 py-2 text-gray-600">Event marked FAILED, retried with backoff; the original transaction is unaffected.</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700 font-medium">Chain verification fails</td>
              <td className="px-4 py-2 text-gray-600">P1 alert; no automatic remediation — this is an incident</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700 font-medium">Relay cannot reach the database</td>
              <td className="px-4 py-2 text-gray-600">Alert on missed runs; events accumulate safely</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="danger">
        <strong>The first row of that table is the important one.</strong> It would be tempting to let a business transaction succeed when its audit row fails, on the grounds that the business matters more. That reasoning produces an unauditable system exactly when something has gone wrong. <strong>Roll back.</strong>
      </Callout>

      {/* Step 15: Audit */}
      <StepTitle number="15" title="Audit" />
      <p className="text-sm text-gray-700 mb-4">
        This part audits itself: <code className="bg-gray-100 px-1 rounded">AUDIT_QUERIED</code> on every audit read, <code className="bg-gray-100 px-1 rounded">CHAIN_VERIFIED</code> on every verification run, <code className="bg-gray-100 px-1 rounded">OUTBOX_RETRIED</code> on every manual retry.
      </p>

      {/* Step 16: Testing */}
      <StepTitle number="16" title="Testing" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Audit</h5>
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
            {auditTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Outbox</h5>
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
            {outboxTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">SoD completion</h5>
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
            {sodTests.map((test) => (
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
                <td className="px-4 py-2 text-gray-700">{test.case}</td>
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
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-6">
        <h4 className="text-sm font-bold text-purple-900 mb-2">Next: Part 0.7 — design tokens, theme engine and application shell</h4>
        <p className="text-sm text-purple-800 mb-3">
          Phase 0 has two parts remaining.
        </p>
        <Callout type="danger">
          <strong>Run D4 and O2 together in front of the team.</strong> They demonstrate the single property this part exists to guarantee: a change, its audit row and its event either all happen or none do. Most developers have worked on systems where that was not true, and seeing it proven changes how they write the next 168 parts.
        </Callout>
      </div>
    </div>
  );
}
