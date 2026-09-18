import {
  dependencies,
  prerequisites,
  deliverables,
  inspectionCommands,
  reuseChecks,
  idempotencyTable,
  unitOfWorkCode,
  actorCode,
  moneyCode,
  quantityCode,
  roundingPolicyCode,
  errorCatalogueCode,
  exceptionFilterCode,
  lintRules,
  businessRules,
  moneyTests,
  quantityTests,
  uowTests,
  apiTests,
  completionChecklist,
} from "../data/part03";

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

export default function Part03() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-700 to-pink-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 0 — Foundation</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 3 of 8</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~2 days</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 0.3 — Platform Core: Transactions, Money, API Envelope, Errors</h2>
        <p className="text-purple-100 text-sm leading-relaxed">
          Establish the transaction boundary, monetary arithmetic and API contract that all 171 remaining parts use, so that no part invents its own.
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
      <p className="text-sm text-gray-600 mb-3">
        <strong>The vocabulary every later part is written in:</strong>
      </p>
      <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
        {deliverables.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ol>

      <Callout type="info">
        <strong>No business logic. No tables.</strong> This part is pure platform.
      </Callout>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Establish the transaction boundary, monetary arithmetic and API contract that all 171 remaining parts use, so that no part invents its own.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            UnitOfWork, Actor placeholder, Money, Quantity, rounding, API envelope, filter compiler, pagination, ETag concurrency, idempotency, error catalogue, base controller, registry generator.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">
            permission resolution (0.5 — Actor here is a stub with the shape but not the logic); audit and outbox (0.6 — the collectors exist here but flush to nothing yet).
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">
            an ORM abstraction over the adapter layer. Part 0.2 established how existing tables are read. dx_ tables use the ORM directly. Two abstractions over one database is one too many.
          </p>
        </div>
      </div>

      {/* Step 1: Inspect */}
      <StepTitle number="1" title="Inspect" />
      {inspectionCommands.map((cmd, i) => (
        <div key={i} className="mb-4">
          <h5 className="text-sm font-semibold text-gray-800 mb-2">{cmd.title}</h5>
          <CodeBlock title={cmd.title} language="bash">
            {cmd.code}
          </CodeBlock>
        </div>
      ))}

      <Callout type="warning">
        <strong>Report:</strong> whether the existing application uses floating-point arithmetic for money (it almost certainly does), and what response shape its front end expects. If the existing front end will call new endpoints, the envelope must either match or be adapted at the boundary — decide which now.
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
      <p className="text-sm text-gray-700 mb-4">
        One table, for idempotency.
      </p>
      <CodeBlock title="migrations/dx/00_3_001_idempotency.up.sql" language="sql">
        {idempotencyTable}
      </CodeBlock>
      <p className="text-sm text-gray-600 mb-4">
        Migration <code className="bg-gray-100 px-1 rounded">migrations/dx/00_3_001_idempotency.{'{up,down}'}.sql</code>. Run down once, verify, run up.
      </p>
      <Callout type="info">
        A nightly job deletes rows past <code className="bg-blue-100 px-1 rounded">expires_at</code>. Default retention 24 hours; 7 days for payment and integration endpoints (those parts override it).
      </Callout>

      {/* Step 4: Backend */}
      <StepTitle number="4" title="Backend" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.1 UnitOfWork</h5>
      <CodeBlock title="dx/platform/uow/unit-of-work.ts" language="typescript">
        {unitOfWorkCode}
      </CodeBlock>

      <Callout type="danger">
        <strong><code className="bg-red-100 px-1 rounded">ctx.now</code> captured once is not a detail.</strong> A service that calls <code className="bg-red-100 px-1 rounded">new Date()</code> three times during one transaction can write three different timestamps to rows that should agree, and the resulting one-second discrepancies are almost impossible to diagnose later.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Enforce the rules from 02_BUILD_CONVENTIONS.md §8 with lint rules:</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-6">
        {lintRules.map((rule, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{rule}</code>
          </li>
        ))}
      </ul>

      <Callout type="warning">
        <strong>Write all three now.</strong> Discovering at Part 90 that forty services call <code className="bg-amber-100 px-1 rounded">new Date()</code> directly is a week of tedious correction.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.2 Actor (stub — completed in Part 0.5)</h5>
      <CodeBlock title="dx/platform/permission/actor.ts" language="typescript">
        {actorCode}
      </CodeBlock>

      <Callout type="danger">
        <strong><code className="bg-red-100 px-1 rounded">can()</code> throwing rather than returning <code className="bg-red-100 px-1 rounded">true</code> is deliberate.</strong> A stub that returns <code className="bg-red-100 px-1 rounded">true</code> would let Part 0.4 be built with no permission checking, and nobody would notice until a security review. Throwing forces Part 0.5 to be completed before anything depends on it.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.3 Money and Quantity</h5>
      <CodeBlock title="dx/platform/money/money.ts" language="typescript">
        {moneyCode}
      </CodeBlock>

      <CodeBlock title="dx/platform/money/quantity.ts" language="typescript">
        {quantityCode}
      </CodeBlock>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Rounding policy is configuration, not a constant:</h5>
      <CodeBlock title="RoundingPolicy interface" language="typescript">
        {roundingPolicyCode}
      </CodeBlock>

      <Callout type="info">
        Seeded in Part 2.2 per company. Quantity precision is per item (Part 2.4) and per BOQ item (Part 2.6) — steel to 3 decimals, earthwork to 2, count to 0.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.4 Error catalogue</h5>
      <CodeBlock title="dx/shared/errors/catalogue.ts" language="typescript">
        {errorCatalogueCode}
      </CodeBlock>

      <Callout type="warning">
        <strong>Later parts add codes by extending this object.</strong> A CI test asserts every code thrown in the codebase exists in the catalogue — a thrown-but-unregistered code is a build failure.
      </Callout>

      {/* Step 5: API */}
      <StepTitle number="5" title="API" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">5.1 Envelope and base controller</h5>
      <p className="text-sm text-gray-700 mb-4">
        Per <code className="bg-gray-100 px-1 rounded">02_BUILD_CONVENTIONS.md</code> §6. Implement <code className="bg-gray-100 px-1 rounded">ApiSuccess</code>, <code className="bg-gray-100 px-1 rounded">ApiFailure</code>, <code className="bg-gray-100 px-1 rounded">ok()</code>, and a global exception filter that maps any thrown error to the envelope, logs the internals with the correlation id, and returns nothing sensitive.
      </p>
      <CodeBlock title="GlobalExceptionFilter" language="typescript">
        {exceptionFilterCode}
      </CodeBlock>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">5.2 Filter grammar</h5>
      <p className="text-sm text-gray-700 mb-4">
        Implement the parser and compiler per <code className="bg-gray-100 px-1 rounded">02_BUILD_CONVENTIONS.md</code> §6, with <code className="bg-gray-100 px-1 rounded">FieldSpec</code> whitelisting per entity. <strong>The compiler must be parameterised</strong> — a test asserts that a filter value containing <code className="bg-gray-100 px-1 rounded">'; DROP TABLE</code> is bound as a parameter, never concatenated.
      </p>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">5.3 Concurrency and idempotency</h5>
      <p className="text-sm text-gray-700 mb-4">
        <code className="bg-gray-100 px-1 rounded">ConcurrencyGuard</code> reading <code className="bg-gray-100 px-1 rounded">row_version</code> for <code className="bg-gray-100 px-1 rounded">dx_</code> tables and a computed hash for existing tables (Part 0.2 established there is no version column to add). <code className="bg-gray-100 px-1 rounded">IdempotencyInterceptor</code> backed by <code className="bg-gray-100 px-1 rounded">dx_idempotency</code>.
      </p>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">5.4 API registry generator</h5>
      <CodeBlock title="tools/generate-api-registry.ts" language="typescript">
{`// Walks route metadata, emits docs/API_REGISTRY.md.
// Runs in CI; a drift between code and registry fails the build.`}
      </CodeBlock>

      {/* Step 6: Permissions */}
      <StepTitle number="6" title="Permissions" />
      <p className="text-sm text-gray-600 italic mb-4">
        <strong>Not applicable — Part 0.5.</strong> The <code className="bg-gray-100 px-1 rounded">@RequiresPermission</code> decorator is defined here as metadata only; the guard that reads it is built in 0.5. A CI check added in 0.5 will fail any route without the decorator, so add it to routes as you create them.
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
        No workflow, screens, real-time, notifications, reports or dashboard. Platform only.
      </p>

      {/* Step 14: Error Handling */}
      <StepTitle number="14" title="Error Handling" />
      <p className="text-sm text-gray-700 mb-4">
        Per §5.1. Three absolute rules:
      </p>
      <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
        <li><strong>Never leak internals.</strong> No stack trace, SQL or table name in any response.</li>
        <li><strong>Always return a correlation id</strong>, including on 500.</li>
        <li><strong>All issues at once</strong> for validation — never one field at a time.</li>
      </ol>

      {/* Step 15: Audit */}
      <StepTitle number="15" title="Audit" />
      <p className="text-sm text-gray-700 mb-4">
        The <code className="bg-gray-100 px-1 rounded">AuditCollector</code> is defined here with its interface; the writer that flushes it is Part 0.6. Until then <code className="bg-gray-100 px-1 rounded">flush()</code> is a no-op that logs a warning at boot so it cannot be forgotten.
      </p>

      {/* Step 16: Testing */}
      <StepTitle number="16" title="Testing" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Money — the suite that prevents the reconciliation failures</h5>
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
            {moneyTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Quantity</h5>
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
            {quantityTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">UnitOfWork</h5>
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
            {uowTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">API</h5>
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
            {apiTests.map((test) => (
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
        <h4 className="text-sm font-bold text-blue-900 mb-2">Next: Part 0.4 — Authentication, session and MFA</h4>
        <p className="text-sm text-blue-800">
          Then 0.5, the permission engine, which replaces <code className="bg-blue-100 px-1 rounded">Actor.can()</code> and is the single most security-critical part in the series.
        </p>
        <Callout type="warning">
          <strong>A note on M2 and M3.</strong> They look trivial and they are not. The allocation bug they catch — apportioning by <code className="bg-amber-100 px-1 rounded">amount × percentage</code> per row instead of largest-remainder — is the defect that made the previous attempt's payroll cost allocation fail reconciliation by a few rupees a month. It is invisible in testing with round numbers and appears only at scale. <strong>Write these two tests before writing <code className="bg-amber-100 px-1 rounded">allocate()</code>.</strong>
        </Callout>
      </div>
    </div>
  );
}
