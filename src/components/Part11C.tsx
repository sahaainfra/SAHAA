import {
  dependencies,
  prerequisites,
  deliverables,
  inspectionQueries,
  reportQuestions,
  lockReasons,
  documentLockSQL,
  lockVerificationSQL,
  apiEndpoints,
  permissionKeys,
  businessRules,
  events,
  notifications,
  auditActions,
  testCases,
  integrationTests,
  completionChecklist,
} from "../data/part11c";

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

export default function Part11C() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-700 to-red-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 1 — Platform Engines</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 3 of 10</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~0.5 day</span>
          <span className="text-xs bg-red-500/40 text-red-100 px-2 py-1 rounded font-bold">★ Makes posted, certified and filed documents genuinely unchangeable</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 1.1C — Document Locking & Immutability</h2>
        <p className="text-orange-100 text-sm leading-relaxed">
          Deliver a lock mechanism that refuses every write to a locked document, records the document's content hash at the moment of locking so that later tampering is detectable, chains locks per project so that deleting the evidence breaks the chain, honours the existing system's own freeze flags, and provides no route back.
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
        <strong>Why this is a part and not three methods inside the base service:</strong> Immutability is the claim the rest of the system rests on. A certified measurement book, a posted voucher and a filed statutory return are evidence; if any of them can be quietly edited, every report built on them is an assertion rather than a record. It is separated from the base service for two reasons. It is used by things that are not documents — the stock ledger and the posted voucher registers in 1.4 lock rows by the same mechanism. And keeping it small makes the one rule that matters visible: <strong>there is no unlock.</strong>
      </Callout>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Deliver a lock mechanism that refuses every write to a locked document, records the document's content hash at the moment of locking so that later tampering is detectable, chains locks per project so that deleting the evidence breaks the chain, honours the existing system's own freeze flags, and provides no route back.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            the lock table, the service, chain construction and verification, legacy flag integration, the locked-document user experience, the nightly job.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">
            which actions lock (each module's definition decides, via 1.1D's action.locks); ledger and stock immutability (1.4, which reuses this service); audit log immutability (0.6, already built).
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <div className="text-xs text-gray-700 space-y-2">
            <p><strong>No unlock, unfreeze, or reopen</strong> — by any route, for any role, including Super Admin. A locked document is corrected by a reversing or amending document. Test L7 is a permanent CI check, not a one-time test.</p>
            <p>No administrative "force edit". If a client asks for one, the answer is a correction document, and the reason is that the alternative destroys the evidential value of every locked record in the system.</p>
          </div>
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
      <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
        {reportQuestions.map((q, i) => (
          <li key={i}>{q.question}</li>
        ))}
      </ol>

      {/* Step 2: Reuse Check */}
      <StepTitle number="2" title="Reuse Check" />
      <Callout type="info">
        Search for existing lock or freeze service. Read it. Ours does not replace it; <code className="bg-blue-100 px-1 rounded">storage.legacyLockFlag</code> makes ours honour its flags. Do not modify it.
      </Callout>
      <Callout type="warning">
        If there are database triggers preventing updates on document tables, note them. They will fire on our writes too, which is correct, but you need to know before you spend an afternoon debugging a silent no-op.
      </Callout>

      {/* Step 3: Database */}
      <StepTitle number="3" title="Database" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">3.1 dx_document_lock</h5>
      <CodeBlock title="dx_document_lock table" language="sql">
        {documentLockSQL}
      </CodeBlock>

      <Callout type="info">
        <code className="bg-blue-100 px-1 rounded">DO INSTEAD NOTHING</code> is the same mechanism as <code className="bg-blue-100 px-1 rounded">dx_audit_log</code> (0.6): the statement succeeds and affects zero rows. A developer who writes an <code className="bg-blue-100 px-1 rounded">UPDATE</code> here gets no error and no effect, which is why tests L4 and L5 assert the row count rather than expecting an exception.
      </Callout>

      <Callout type="info">
        <code className="bg-blue-100 px-1 rounded">correction_path</code> is stored per row rather than looked up from the definition because the correct remedy can change over the years while the document stays locked. The sentence the user sees in 2031 should be the one that was true when the document was locked, or it sends them to a screen that no longer exists.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">3.2 Reason codes</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Code</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Label</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lockReasons.map((reason, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-orange-700 font-bold">{reason.code}</td>
                <td className="px-4 py-2 text-gray-700">{reason.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        Five, and no <code className="bg-amber-100 px-1 rounded">OTHER</code>. A reason that does not fit one of these is a sign the action should not be locking the document.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">3.3 Backfill — deliberately not done</h5>
      <p className="text-sm text-gray-700 mb-4">
        Existing rows that our rules would consider locked are <strong>not</strong> backfilled into <code className="bg-gray-100 px-1 rounded">dx_document_lock</code>. Three reasons:
      </p>
      <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
        <li>We cannot compute an honest <code className="bg-gray-100 px-1 rounded">content_hash</code> for a historical row, because we do not know what it contained when it was posted. A hash computed today certifies today's content, which is exactly the thing in question.</li>
        <li>A backfilled chain would be indistinguishable from a real one, and would make the chain assert something it cannot support.</li>
        <li><code className="bg-gray-100 px-1 rounded">storage.legacyLockFlag</code> already makes those rows refuse edits through our write paths, which is the protection that was actually wanted.</li>
      </ol>

      <Callout type="warning">
        Record this decision in <code className="bg-amber-100 px-1 rounded">PHASE_1_FINDINGS.md</code> with the row counts from Step 1.3, so nobody "discovers" the gap in eight months and backfills it.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">3.4 dx_lock_verification</h5>
      <p className="text-sm text-gray-700 mb-4">
        The evidence that verification actually runs — the question an auditor asks first.
      </p>
      <CodeBlock title="dx_lock_verification table" language="sql">
        {lockVerificationSQL}
      </CodeBlock>

      <Callout type="info">
        <strong>Migration down:</strong> drop both tables and the two rules. Nothing else.
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
        A single document's lock status is not a separate endpoint: it is the <code className="bg-blue-100 px-1 rounded">lock</code> field of the document read (1.1E), under the document's own <code className="bg-blue-100 px-1 rounded">.view</code> — so it inherits the 404-not-403 rule for free.
      </Callout>

      <Callout type="danger">
        <strong>There is no POST, no PATCH and no DELETE.</strong> Locks are created by document actions (1.1D) and never by a direct call, which is enforced by there being no endpoint to call.
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

      <Callout type="info">
        Both keys already exist — 0.6 registered <code className="bg-blue-100 px-1 rounded">admin.audit.view</code> and <code className="bg-blue-100 px-1 rounded">admin.audit.verify</code>. Do not seed them again; <code className="bg-blue-100 px-1 rounded">permission_key</code> is unique and the migration would fail.
      </Callout>

      <Callout type="warning">
        Lock <strong>status</strong> on a single document needs only that document's view permission — a user who can see a bill must be able to see that it is locked and why, or the refusal message they eventually hit will be their first and only explanation.
      </Callout>

      <Callout type="danger">
        There is no <code className="bg-red-100 px-1 rounded">admin.lock.remove</code> key, because there is nothing for it to authorise.
      </Callout>

      {/* Step 7: Business Rules */}
      <StepTitle number="7" title="Business Rules" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Code</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">Severity</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Condition</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {businessRules.map((rule, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-red-700 bg-red-50">{rule.code}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                    rule.severity === 'Critical' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'
                  }`}>
                    {rule.severity}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-700 text-xs">{rule.condition}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{rule.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Step 8: Workflow */}
      <StepTitle number="8" title="Workflow" />
      <p className="text-sm text-gray-600 italic mb-4">
        None. Locking is a consequence of an action, never a request that gets routed. There is deliberately no "request unlock" workflow — adding one would be the same decision as adding unlock, taken slowly.
      </p>

      {/* Step 9: Frontend */}
      <StepTitle number="9" title="Frontend" />
      <p className="text-sm text-gray-700 mb-4">
        Three small pieces.
      </p>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h6 className="text-sm font-bold text-gray-900 mb-2">1. The locked banner</h6>
        <p className="text-xs text-gray-700 mb-2">
          Any document with a lock shows a full-width bar above the form, using the <code className="bg-gray-100 px-1 rounded">info</code> tone from 0.7 rather than <code className="bg-gray-100 px-1 rounded">error</code> — being locked is a correct state, not a fault:
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900">
          <p className="font-bold mb-1">Locked</p>
          <p>Posted to the ledger on 14 August 2026 by R. Iyer.</p>
          <p>Raise a reversing journal entry against this voucher. → <span className="underline cursor-pointer">[Start reversing entry]</span></p>
        </div>
        <p className="text-xs text-gray-700 mt-2">
          The correction path is a button when the target module exists and plain text when it does not. A sentence telling the user what to do, with no way to do it, is only half an answer.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h6 className="text-sm font-bold text-gray-900 mb-2">2. Form behaviour</h6>
        <p className="text-xs text-gray-700">
          A locked document renders read-only — inputs become text, not disabled inputs. A page full of greyed boxes reads as broken; a page of plain values reads as a record.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h6 className="text-sm font-bold text-gray-900 mb-2">3. Locked Documents register</h6>
        <p className="text-xs text-gray-700">
          <code className="bg-gray-100 px-1 rounded">admin.audit.view</code> only. Columns: type, number, project, locked at, locked by, reason, verification status. Filters: project, type, reason, date range. The verification column shows a green tick, or a red flag with "content changed since lock" — and if that flag is ever visible, the person looking at it needs to know immediately, so it also surfaces as a persistent banner on the register.
        </p>
      </div>

      <Callout type="info">
        <strong>Responsive</strong> (0.8): the banner stacks on phone with the action as a full-width button beneath; the register becomes cards showing type, number and verification status.
      </Callout>

      {/* Step 10: Realtime */}
      <StepTitle number="10" title="Realtime" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Event</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Payload</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((event, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-orange-700">{event.event}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{event.payload}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{event.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        Register it in <code className="bg-blue-100 px-1 rounded">EVENT_REGISTRY</code> (0.6): <code className="bg-blue-100 px-1 rounded">aggregateType: 'document'</code>, <code className="bg-blue-100 px-1 rounded">aggregateIdField: 'documentId'</code>, <code className="bg-blue-100 px-1 rounded">requiredFields: [documentType, documentId, projectId, reason]</code>, <code className="bg-blue-100 px-1 rounded">uiOnly: true</code>. Emitted inside <code className="bg-blue-100 px-1 rounded">lock()</code>, broadcast by 1.5. An open form receiving this switches itself to read-only with the banner, rather than letting the user keep typing into a document that can no longer accept it.
      </Callout>

      {/* Step 11: Notifications */}
      <StepTitle number="11" title="Notifications" />
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
                <td className="px-4 py-2 text-gray-700 text-xs">{notif.trigger}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{notif.recipients}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{notif.channel}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{notif.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        Super Admins and holders of <code className="bg-blue-100 px-1 rounded">admin.audit.view</code> see the same failures on the Lock integrity tile and the register the next morning; e-mailing them from here as well is added in 1.6, which owns notification channels.
      </Callout>

      <Callout type="warning">
        Routine locking notifies nobody. It happens hundreds of times a day and means everything is working.
      </Callout>

      {/* Step 12: Reports */}
      <StepTitle number="12" title="Reports" />
      <p className="text-sm text-gray-700 mb-4">
        <strong>Locked Documents Register</strong> — as described in Step 9. Export CSV and XLSX via 1.9.
      </p>
      <p className="text-sm text-gray-700 mb-4">
        <strong>Verification History</strong> — one row per nightly run per project: run time, documents verified, chain result, content problems found. Retained indefinitely; it is the evidence that verification has been running, which is the question an auditor actually asks.
      </p>

      {/* Step 13: Dashboard */}
      <StepTitle number="13" title="Dashboard" />
      <p className="text-sm text-gray-700 mb-4">
        One tile, on the dashboards of users holding <code className="bg-gray-100 px-1 rounded">admin.audit.view</code> only:
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Tile</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">SQL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700 font-medium">Lock integrity</td>
              <td className="px-4 py-2 font-mono text-xs text-gray-600">SELECT COUNT(*) FROM dx_lock_verification WHERE run_date = CURRENT_DATE AND (chain_ok = false OR content_problems &gt; 0)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        Green when zero, red otherwise. There is no amber. Integrity is not a gradient.
      </Callout>

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
              <td className="px-4 py-2 font-mono text-xs text-red-700">DOCUMENT_LOCKED</td>
              <td className="px-4 py-2 text-center font-mono">409</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Modal naming the correction path, with a link that starts it when the target exists</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">ALREADY_LOCKED</td>
              <td className="px-4 py-2 text-center font-mono">500</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Generic message to the user; full detail to the log. This is a defect in the calling action, not a user error.</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">Permission denied on the register</td>
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
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Recorded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {auditActions.map((action, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-orange-700">{action.action}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{action.recorded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        Verification runs are recorded in <code className="bg-blue-100 px-1 rounded">dx_lock_verification</code>, not the audit log — they are system activity, not user activity.
      </Callout>

      <Callout type="warning">
        The content hash and chain hash appear in both the audit row and the lock row deliberately. Tampering must then alter two chains, in two append-only tables, consistently — which is a much larger undertaking than editing one row.
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
        <h4 className="text-sm font-bold text-orange-900 mb-2">Next: Part 1.1D — document storage, versions and action execution</h4>
        <p className="text-sm text-orange-800">
          The fourteen steps every state change in the system runs through.
        </p>
      </div>
    </div>
  );
}
