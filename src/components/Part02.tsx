import {
  dependencies,
  prerequisites,
  deliverables,
  inspectionQueries,
  schemaBaselineTemplate,
  baselineSnapshotCommands,
  schemaFingerprintCheck,
  schemaMapCode,
  legacyRepositoryCode,
  writeBridgeCode,
  bootValidationCode,
  businessRules,
  testCases,
  completionChecklist,
} from "../data/part02";

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

export default function Part02() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-red-700 to-orange-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 0 — Foundation</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 2 of 8</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~3 days</span>
          <span className="text-xs bg-red-400/30 text-red-100 px-2 py-1 rounded font-bold">★ Highest-consequence part in Phase 0</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 0.2 — Database Baseline & Legacy Adapter Layer</h2>
        <p className="text-red-100 text-sm leading-relaxed">
          Produce a complete, verified, written record of the existing database, and a code layer through which all access to it flows — so that no domain code anywhere references a physical table or column name directly.
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
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.3 What this part creates</h5>
      <p className="text-sm text-gray-600 mb-3">
        <strong>One document and one code layer, on which all 172 remaining parts depend:</strong>
      </p>
      <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
        {deliverables.map((d) => (
          <li key={d.number}>{d.description}</li>
        ))}
      </ol>

      <Callout type="warning">
        <strong>Why this part earns three days:</strong> Every previous attempt at this system re-discovered the existing schema inside each module part, inconsistently. One part assumed <code className="bg-amber-100 px-1 rounded">po_status</code> held <code className="bg-amber-100 px-1 rounded">'A'</code>; another assumed <code className="bg-amber-100 px-1 rounded">'APPROVED'</code>. Both were written by someone who looked once and moved on. This part looks once, writes it down, and makes it the only source. After this, <strong>no part inspects the existing schema again</strong> — they read <code className="bg-amber-100 px-1 rounded">SCHEMA_BASELINE.md</code>.
      </Callout>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Produce a complete, verified, written record of the existing database, and a code layer through which all access to it flows — so that no domain code anywhere references a physical table or column name directly.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            full schema inspection; entity identification; status-value mapping; relationship mapping; data-quality assessment; the schema map; the legacy repository base; the write bridge; the baseline snapshot.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">any dx_ table (none are created here); any business logic; any API.</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">a "clean" re-modelled view of the existing schema. The existing schema is what it is. Wrapping it in an idealised abstraction that silently reshapes it is how you lose the mapping and, eventually, the data.</p>
        </div>
      </div>

      {/* Step 1: Inspect */}
      <StepTitle number="1" title="Inspect" />
      <p className="text-sm text-gray-700 mb-4">
        This step <strong>is</strong> the deliverable. Run every query, record every output.
      </p>

      {inspectionQueries.map((query, i) => (
        <div key={i} className="mb-6">
          <h5 className="text-sm font-semibold text-gray-800 mb-2">{query.title}</h5>
          <CodeBlock title={query.title} language="sql">
            {query.code}
          </CodeBlock>
          {query.note && (
            <Callout type="info">
              <strong>Note:</strong> {query.note}
            </Callout>
          )}
        </div>
      ))}

      {/* Step 2: Produce SCHEMA_BASELINE.md */}
      <StepTitle number="2" title="Produce SCHEMA_BASELINE.md" />
      <p className="text-sm text-gray-700 mb-4">
        This is the deliverable other parts read. Structure it exactly as follows.
      </p>
      <CodeBlock title="docs/SCHEMA_BASELINE.md" language="markdown">
        {schemaBaselineTemplate}
      </CodeBlock>

      <Callout type="warning">
        <strong>Section 9 is not optional.</strong> Every question you could not answer from the database or the code goes here, with the part number that will be blocked by it. Chase them during Phase 1 so they do not block Phase 2.
      </Callout>

      {/* Step 3: Database */}
      <StepTitle number="3" title="Database" />
      <p className="text-sm text-gray-700 mb-4">
        <strong>This part creates no tables.</strong> It creates one snapshot for later verification.
      </p>
      <CodeBlock title="Baseline snapshot commands" language="bash">
        {baselineSnapshotCommands}
      </CodeBlock>

      <CodeBlock title="tools/ci/assert-schema-unchanged.ts" language="typescript">
        {schemaFingerprintCheck}
      </CodeBlock>

      <Callout type="info">
        <strong>The fingerprint excludes dx_ tables,</strong> so new tables do not trip it — only changes to existing ones do. When an approved DCR is applied, regenerate the fingerprint in the same commit and reference the DCR in <code className="bg-blue-100 px-1 rounded">DB_CHANGELOG.md</code>.
      </Callout>

      {/* Step 4: Backend */}
      <StepTitle number="4" title="Backend: The Adapter Layer" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.1 The schema map</h5>
      <CodeBlock title="dx/shared/db/schema-map.ts" language="typescript">
        {schemaMapCode}
      </CodeBlock>

      <Callout type="warning">
        <strong>Fill this in completely during this part.</strong> An entity added later, ad hoc, by a developer in a hurry, is how the mapping starts to drift.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.2 The legacy repository base</h5>
      <CodeBlock title="dx/shared/db/legacy-repository.ts" language="typescript">
        {legacyRepositoryCode}
      </CodeBlock>

      <Callout type="danger">
        <strong><code className="bg-red-100 px-1 rounded">toLogicalStatus</code> throwing rather than defaulting is deliberate.</strong> A status value the map does not know about means either the baseline is incomplete or the existing application introduced a new state. Silently rendering it as <code className="bg-red-100 px-1 rounded">DRAFT</code> would make a posted voucher look editable.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.3 The write bridge</h5>
      <CodeBlock title="dx/shared/db/legacy-write-bridge.ts" language="typescript">
        {writeBridgeCode}
      </CodeBlock>

      <Callout type="info">
        <strong>Default <code className="bg-blue-100 px-1 rounded">writable: []</code> for every entity.</strong> Opening a column is a deliberate act requiring an ADR entry. This is what keeps Rule 1 true in practice rather than in principle.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.4 Boot-time validation</h5>
      <CodeBlock title="Boot-time schema validation" language="typescript">
        {bootValidationCode}
      </CodeBlock>

      <Callout type="danger">
        <strong>Call this at boot in every environment.</strong> A mapping error must fail the application immediately, not produce a confusing query error at 2am during month-end.
      </Callout>

      {/* Step 5-6: Not Applicable */}
      <StepTitle number="5–6" title="Not Applicable" />
      <p className="text-sm text-gray-600 italic mb-4">
        <strong>Step 5 — API:</strong> This part exposes no endpoints. The adapter layer is internal.<br />
        <strong>Step 6 — Permissions:</strong> Permission enforcement is built in Part 0.5. This part must not implement any access control of its own — doing so would create a second model to reconcile later.
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

      {/* Steps 8-13: Not Applicable */}
      <StepTitle number="8–13" title="Not Applicable" />
      <p className="text-sm text-gray-600 italic mb-4">
        No workflow, no screens, no real-time events, no notifications, no reports, no dashboard. This part is infrastructure.
      </p>

      {/* Step 14: Error Handling */}
      <StepTitle number="14" title="Error Handling" />
      <p className="text-sm text-gray-700 mb-4">
        All five codes above are <strong>fatal at boot or at first use</strong>, never degraded. A schema mapping problem discovered in production is a deployment that should not have happened; the correct behaviour is to refuse to start.
      </p>

      {/* Step 15: Audit */}
      <StepTitle number="15" title="Audit" />
      <p className="text-sm text-gray-600 italic mb-4">
        <strong>Not applicable</strong> — the audit writer is built in Part 0.6. Any write through the bridge before then is prohibited by <code className="bg-gray-100 px-1 rounded">writable: []</code>.
      </p>

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
        <strong>T10 and T11 together prove the guard discriminates correctly.</strong> Run both, then revert T10.
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
        <h4 className="text-sm font-bold text-blue-900 mb-2">Next: Part 0.3 — Platform core</h4>
        <p className="text-sm text-blue-800">
          It builds <code className="bg-blue-100 px-1 rounded">UnitOfWork</code>, <code className="bg-blue-100 px-1 rounded">Money</code>, the API envelope and the error catalogue: the vocabulary every later part is written in.
        </p>
        <Callout type="warning">
          <strong>Before moving on:</strong> circulate <code className="bg-amber-100 px-1 rounded">SCHEMA_BASELINE.md</code> §9 (open questions) to the business. Those answers have a lead time, and Phase 2 will stall without them.
        </Callout>
      </div>
    </div>
  );
}
