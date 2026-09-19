import {
  dependencies,
  prerequisites,
  deliverables,
  draftTableSQL,
  stripUnownedCode,
  createCode,
  updateCode,
  readListCode,
  draftServiceCode,
  controllerCode,
  apiEndpoints,
  businessRules,
  events,
  testCases,
  completionChecklist,
  contractPoints,
} from "../data/part11e";

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

export default function Part11E() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-700 to-red-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 1 — Platform Engines</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 5 of 10</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~1.5 days</span>
          <span className="text-xs bg-red-500/40 text-red-100 px-2 py-1 rounded font-bold">★ Completes the document framework</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 1.1E — Create, Update, Read, List, Drafts & The Controller</h2>
        <p className="text-orange-100 text-sm leading-relaxed">
          Complete the document framework: create and update that run determinations, allocate when the definition says and refuse client values for fields the system owns; read and list scoped in SQL and masked on the way out; drafts that activate atomically; and a controller that gives each module its REST surface with no code.
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

      <Callout type="info">
        <strong>Why drafts live here:</strong> A draft matters because it becomes a record, and becoming a record is create or update. With both here, the one rule that matters — activation is atomic: the record is written and the draft is gone, or neither — lives in one place.
      </Callout>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Complete the document framework: create and update that run determinations, allocate when the definition says and refuse client values for fields the system owns; read and list scoped in SQL and masked on the way out; drafts that activate atomically; and a controller that gives each module its REST surface with no code.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            the operations; ETag on reads, If-Match on updates; drafts; the controller; the contract for 1.7.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">
            actions (1.1D), screens (1.7), $filter and pagination (0.3).
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">
            DELETE on documents. Documents are cancelled; only drafts are deleted.
          </p>
        </div>
      </div>

      {/* Step 1: Inspect */}
      <StepTitle number="1" title="Inspect" />
      <CodeBlock title="Mandatory columns and triggers" language="sql">
{`-- Mandatory columns of each legacy document table — hydrate() must supply every one.
SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns
 WHERE table_schema = 'public' AND table_name = '<legacy_document_table>' ORDER BY ordinal_position;
-- Triggers that populate or veto rows — they fire on our writes too.
SELECT event_object_table, trigger_name, action_timing, event_manipulation
  FROM information_schema.triggers WHERE trigger_schema = 'public';`}
      </CodeBlock>

      <Callout type="warning">
        <strong>Report:</strong> mandatory columns and which the definition supplies; columns filled by a default or trigger (a determination must not also write them — two sources for one value is how the database disagrees with the screen); every column insert/update writes and its ADR in LegacyWriteBridge.writable. Any without one needs a DCR first.
      </Callout>

      {/* Step 2: Reuse Check */}
      <StepTitle number="2" title="Reuse Check" />
      <Callout type="info">
        Search for 0.3's pagination, $filter, envelope. Use them. No second parser.
      </Callout>
      <Callout type="danger">
        Search for any field-hiding helper other than FieldMasker. Do not use it.
      </Callout>
      <Callout type="warning">
        Search for a module controller or mapper already written for a document type. Stop, and reconcile it onto this part first.
      </Callout>

      {/* Step 3: Database */}
      <StepTitle number="3" title="Database" />
      <CodeBlock title="dx_document_draft table" language="sql">
        {draftTableSQL}
      </CodeBlock>

      <Callout type="info">
        <strong>Expiry</strong>, overridable by draftTtlDays: measurement book 7 days (site data goes stale); bill and voucher 14 (period-bound); indent, PO, work order, master data 30. A nightly job deletes expired drafts and logs the count; 1.6 warns owners at T-2 days once built.
      </Callout>

      {/* Step 4: Backend */}
      <StepTitle number="4" title="Backend" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.1 What the client may not set</h5>
      <CodeBlock title="stripUnowned()" language="typescript">
        {stripUnownedCode}
      </CodeBlock>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6 my-6">
        <h6 className="text-sm font-bold text-orange-900 mb-3">Four categories of fields the client cannot set:</h6>
        <ol className="text-sm text-orange-800 space-y-2 list-decimal list-inside">
          <li><strong>Status, number, identity, parent keys</strong> — owned by actions, numbering and the store. Ignored and reported in meta.ignoredFields, not an error, so read-then-post-back keeps working. Line ids are kept, because they say which line to change — and DocumentStore.update refuses any line id not already loaded for this document (LINE_NOT_IN_DOCUMENT), so a patch can never reach another document's line.</li>
          <li><strong>Project on update</strong> — a patch could otherwise move a document into a project where the user holds nothing. Moving a document between projects is not an edit; if a module needs it, it is an action with its own permission on both projects.</li>
          <li><strong>Determined fields</strong> — every path in any determination's writes. A posted total is replaced.</li>
          <li><strong>Restricted fields</strong> — for the header entity and the line entity, * expanded. A user who cannot see the rate cannot set it, and a hidden field arriving as null cannot erase it.</li>
        </ol>
      </div>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.2 Create</h5>
      <CodeBlock title="create()" language="typescript">
        {createCode}
      </CodeBlock>

      <Callout type="info">
        CREATE is an audit action on purpose — SOD-DOC-02 reads it. It has after and no before, so 0.6 writes one row per field and the row exists even for a minimal document.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.3 Update</h5>
      <CodeBlock title="update()" language="typescript">
        {updateCode}
      </CodeBlock>

      <Callout type="info">
        0.6 expands before/after into one row per changed field ("Rate: 412.50 → 438.00"). auditable() flattens lines to lines[&lt;lineId&gt;].&lt;field&gt; keys so line changes are field rows too.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.4 Read, actions and list</h5>
      <CodeBlock title="read(), actionsFor(), list()" language="typescript">
        {readListCode}
      </CodeBlock>

      <Callout type="warning">
        Lists read the consumption view, scoped in SQL through the ENTITY_SCOPES entry 1.1A registered. <strong>Consumption views expose logical column names</strong> ("partyId", "documentNumber") plus project_id for the filter, so the masker, the $filter field names and read all speak the same names — a restriction on partyId must hide it in the list exactly as in the read. <strong>Lists never compute actions</strong> — available() reads SoD history per action; fifty rows would be three hundred queries. A hidden field is <strong>absent</strong>, not null.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.5 Drafts</h5>
      <CodeBlock title="DraftService and activate()" language="typescript">
        {draftServiceCode}
      </CodeBlock>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6 my-6">
        <h6 className="text-sm font-bold text-orange-900 mb-3">Draft rules:</h6>
        <ul className="text-sm text-orange-800 space-y-2 list-disc list-inside">
          <li>A draft never allocates a number and never touches another record</li>
          <li>Drafts are private to their owner — including from Super Admin</li>
          <li>Activation is atomic</li>
          <li>The offline outbox (0.8) saves through save and activates on sync, which is why offline capture can never directly produce a numbered document</li>
        </ul>
      </div>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.6 The controller</h5>
      <CodeBlock title="DocumentController(def)" language="typescript">
        {controllerCode}
      </CodeBlock>

      <Callout type="info">
        The guard's any mode (1.1D §4.8) admits anyone holding the key on some project; the service decides for <strong>this</strong> record and answers 404 when it is out of scope. A module's REST surface is:
      </Callout>
      <CodeBlock title="Module controller example" language="typescript">
{`export class PoController extends DocumentController(PO_DEFINITION) {}`}
      </CodeBlock>

      <Callout type="danger">
        CI fails any module controller that declares its own routes under /documents/ (test U12).
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
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Headers</th>
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
                <td className="px-4 py-2 text-gray-600 text-xs">{endpoint.headers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        GET /drafts lists the owner's drafts across every type, so it is @PublicEndpoint() — the response is only ever the caller's own rows. The other draft routes carry @RequiresPermission with a function that derives the prefix from the body or params, with projectFrom: 'any'. The service then applies the owner check and the create/update check. There is no DELETE on documents.
      </Callout>

      {/* Step 6: Permissions */}
      <StepTitle number="6" title="Permissions" />
      <p className="text-sm text-gray-700 mb-4">
        No new keys. All three 0.5B enforcement points appear here: the route guard (controller), the query filter (list), and field masking — on read/list <strong>and on the way in</strong> in stripUnowned. Masking on the way in is the one that gets forgotten.
      </p>

      {/* Step 7: Business Rules */}
      <StepTitle number="7" title="Business Rules" />
      <p className="text-sm text-gray-700 mb-4">
        New codes for ERRORS and i18n:
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
      <p className="text-sm text-gray-600 italic mb-4">
        None. Create and update never change state; actions do (1.1D).
      </p>

      {/* Step 9: Frontend */}
      <StepTitle number="9" title="Frontend" />
      <p className="text-sm text-gray-700 mb-4">
        No screens — 1.7 generates them. Write this <strong>contract</strong> into API_CONTRACT.md now:
      </p>
      <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
        {contractPoints.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ol>

      {/* Step 10: Realtime */}
      <StepTitle number="10" title="Realtime" />
      <p className="text-sm text-gray-700 mb-4">
        Register in EVENT_REGISTRY, all with aggregateType: 'document', aggregateIdField: 'documentId':
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Event</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">requiredFields</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">uiOnly</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((event, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-orange-700">{event.event}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{event.requiredFields}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{event.uiOnly}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        changedFields carries field <strong>names</strong>, never values.
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
              <td className="px-4 py-2 font-mono text-xs text-red-700">DOCUMENT_NOT_EDITABLE</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Switch the form to read-only and say why</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">PROJECT_CLOSED</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Modal offering the project switcher</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">MANDATORY_FIELD_MISSING</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Inline on the field</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">CONCURRENT_MODIFICATION</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Banner with who/what; input kept; Reload or merge</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">DOCUMENT_NOT_DRAFTABLE, DRAFT_MISMATCH, PRECONDITION_REQUIRED</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Client or configuration defect; logged</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-red-700">A database constraint error</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Generic 500. Reaching the database with a missing value is a validation gap — fix the validation, never translate the database error</td>
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
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Recorded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-orange-700">CREATE</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Every field as after (read by SOD-DOC-02)</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-orange-700">UPDATE</td>
              <td className="px-4 py-2 text-gray-600 text-xs">One row per changed field, lines included</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-orange-700">WRITE_REFUSED</td>
              <td className="px-4 py-2 text-gray-600 text-xs">Via RefusalRecorder</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="info">
        Drafts are not audited — they are not records. Activation is audited as the CREATE or UPDATE it becomes. Restricted fields are stored with real values; 0.6's redactIfSensitive and the audit viewer's masking decide who reads them.
      </Callout>

      {/* Step 16: Testing */}
      <StepTitle number="16" title="Testing" />
      <Callout type="info">
        ★ = paste output into PHASE_1_FINDINGS.md. All on TEST_DOC.
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
        <h4 className="text-sm font-bold text-orange-900 mb-2">Next: Part 1.2A — workflow definitions, conditions and versioning</h4>
        <p className="text-sm text-orange-800">
          The workflow engine that routes documents through approval chains, with conditions, escalation, delegation and SLA tracking.
        </p>
      </div>
    </div>
  );
}
