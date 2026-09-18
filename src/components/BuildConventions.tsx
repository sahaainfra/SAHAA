import { useState } from "react";
import {
  stackMappings,
  technologies,
  namingRules,
  viewLayers,
  partSections,
  immutabilityRecords,
  testingLayers,
  performanceBudgets,
  doneItems,
  queryParameters,
  transactionRules,
  moneyRules,
  dateRules,
  responsiveMinimums,
  trackingDocuments,
  neverMocked,
  alwaysMocked,
  requiredTechniques,
} from "../data/conventions";

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 my-4">
      {title && (
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <span className="text-xs font-mono text-gray-300">{title}</span>
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
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 text-sm font-bold">
        {number}
      </span>
      {title}
    </h3>
  );
}

export default function BuildConventions() {
  const [showCode, setShowCode] = useState(true);

  return (
    <div>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white mb-8">
        <h2 className="text-2xl font-bold mb-3">Build Conventions</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Applies to every one of the 174 parts. Read once; referenced by all. This document holds everything shared, so individual parts do not repeat it. When a part says "per conventions", it means this file.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs bg-white/10 px-2 py-1 rounded">TypeScript</span>
          <span className="text-xs bg-white/10 px-2 py-1 rounded">Node/NestJS</span>
          <span className="text-xs bg-white/10 px-2 py-1 rounded">PostgreSQL</span>
          <span className="text-xs bg-white/10 px-2 py-1 rounded">React</span>
        </div>
      </div>

      {/* Section 1: Stack */}
      <SectionTitle number="1" title="Stack" />
      <p className="text-sm text-gray-700 mb-4">
        The reference code is <strong>TypeScript / Node (NestJS-style) with PostgreSQL and React</strong>. If your existing system uses a different stack, translate the concepts — the contracts do not change.
      </p>

      <h4 className="text-sm font-semibold text-gray-800 mb-2">Stack Translation Matrix</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Concept</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Node/NestJS</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">.NET</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">PHP/Laravel</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Java/Spring</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stackMappings.map((row) => (
              <tr key={row.concept} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">{row.concept}</td>
                <td className="px-3 py-2 font-mono text-gray-600">{row.node}</td>
                <td className="px-3 py-2 font-mono text-gray-600">{row.dotnet}</td>
                <td className="px-3 py-2 font-mono text-gray-600">{row.php}</td>
                <td className="px-3 py-2 font-mono text-gray-600">{row.java}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="text-sm font-semibold text-gray-800 mb-2">Technologies & Where Used</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Technology</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Used for</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Introduced in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {technologies.map((tech) => (
              <tr key={tech.name} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">{tech.name}</td>
                <td className="px-3 py-2 text-gray-600">{tech.usedFor}</td>
                <td className="px-3 py-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-mono">{tech.introducedIn}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        <strong>Not used unless a specific part justifies it:</strong> TensorFlow.js, LaTeX, Power BI. The previous series named these; none earned a place. Anomaly detection (Part 14.6) is statistical, not machine learning. Report generation (1.9) is HTML-to-PDF, which is simpler to maintain than LaTeX and produces the same result.
      </Callout>

      {/* Section 2: Naming */}
      <SectionTitle number="2" title="Naming" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Thing</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Convention</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {namingRules.map((rule) => (
              <tr key={rule.thing} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">{rule.thing}</td>
                <td className="px-3 py-2 font-mono text-gray-600">{rule.convention}</td>
                <td className="px-3 py-2 font-mono text-blue-700">{rule.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="text-sm font-semibold text-gray-800 mb-2">View Layers</h4>
      <div className="grid gap-2 mb-4">
        {viewLayers.map((layer) => (
          <div key={layer.prefix} className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <code className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{layer.prefix}</code>
              <span className="text-sm font-medium text-gray-900">{layer.name}</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">{layer.description}</p>
          </div>
        ))}
      </div>

      <Callout type="danger">
        <strong>Every vw_dx_q_* view must expose project_id</strong> so the permission query filter can scope it. A consumption view without it fails the Phase 22 schema test.
      </Callout>

      {/* Section 3: Shape of Every Part */}
      <SectionTitle number="3" title="The Shape of Every Part" />
      <p className="text-sm text-gray-700 mb-4">
        Every part follows this structure. Steps that do not apply are marked "not applicable" with one line of reason, never silently omitted.
      </p>
      <div className="space-y-1">
        {partSections.map((section) => (
          <div key={section.number} className="flex items-start gap-3 bg-white rounded border border-gray-200 px-4 py-2">
            <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded min-w-[70px] text-center">
              {section.number}
            </span>
            <div>
              <span className="text-sm font-semibold text-gray-900">{section.title}</span>
              <span className="text-sm text-gray-500 ml-2">— {section.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Section 4: The Four Rules */}
      <SectionTitle number="4" title="The Four Rules" />
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-1">1. Existing database frozen</p>
          <p className="text-xs text-red-700">Additive dx_ only. Exception process in §5.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-1">2. No fabricated data</p>
          <p className="text-xs text-red-700">Every figure traces to a real row.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-1">3. Permission server-side</p>
          <p className="text-xs text-red-700">At all four enforcement points.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-1">4. One part at a time</p>
          <p className="text-xs text-red-700">Previous checklist passes before the next begins.</p>
        </div>
      </div>

      {/* Section 5: DCR */}
      <SectionTitle number="5" title="Database Change Request" />
      <p className="text-sm text-gray-700 mb-4">
        If a change to an existing table is genuinely unavoidable, raise a DCR. Adding a nullable column with no default to an existing table is the only change likely to be approved.
      </p>
      <button
        onClick={() => setShowCode(!showCode)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-2"
      >
        {showCode ? "Hide" : "Show"} DCR Template
      </button>
      {showCode && (
        <CodeBlock title="DCR Template">
{`## DCR-<nn> — <short title>

**Raised in part:** <part number>
**Existing table affected:** <table>
**Change required:** <new column | new index | new constraint | new table>
**Data type / definition:** <exact DDL>
**Relationship:** <how it relates to existing keys>

**Why an additive dx_ table cannot serve:**
<the real reason; "it would be simpler" is not one>

**Migration:**
<exact up and down SQL>

**Backward compatibility:**
- Existing queries affected: <list, or "none">
- Existing writes affected: <list>
- Rollback plan: <steps>

**Approval:** <name, date>`}
        </CodeBlock>
      )}

      {/* Section 6: API Conventions */}
      <SectionTitle number="6" title="API Conventions" />
      
      <h4 className="text-sm font-semibold text-gray-800 mb-2">Response Envelope</h4>
      <CodeBlock title="TypeScript">
{`interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: {
    page?: { skip: number; top: number; total: number; hasMore: boolean };
    totals?: Record<string, string>;   // server-computed over the FULL filtered set
    masked?: string[];                 // field paths withheld by permission
    warnings?: ApiIssue[];
    correlationId: string;
  };
}

interface ApiFailure {
  ok: false;
  error: {
    code: string;          // stable, catalogued, never localised
    message: string;       // human text, localised
    severity: 'ERROR' | 'WARNING';
    target?: string;       // JSON pointer to the field
    details?: ApiIssue[];
    context?: Record<string, unknown>;
    remediation?: string;
    correlationId: string;
  };
}`}
      </CodeBlock>

      <Callout type="info">
        <strong>meta.totals is mandatory</strong> on any collection the UI shows with a totals row, computed server-side across the whole filtered set — never from the returned page. This is what makes card-mode tables correct on a phone.
      </Callout>

      <h4 className="text-sm font-semibold text-gray-800 mb-2">Query Parameters</h4>
      <div className="flex flex-wrap gap-2 mb-4">
        {queryParameters.map((param) => (
          <code key={param} className="text-xs font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-200">
            {param}
          </code>
        ))}
      </div>

      <Callout type="danger">
        <strong>$filter is a parsed, whitelisted expression grammar.</strong> Never accept raw SQL and never string-concatenate a filter into a query. Keyset pagination ($cursor) is mandatory for any collection that can exceed 10,000 rows.
      </Callout>

      <h4 className="text-sm font-semibold text-gray-800 mb-2 mt-4">Concurrency & Idempotency</h4>
      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        <li className="flex items-start gap-2">
          <span className="text-blue-500 mt-1">•</span>
          Every mutable resource returns <code className="bg-gray-100 px-1 rounded text-xs">ETag</code>. Every PATCH and action requires <code className="bg-gray-100 px-1 rounded text-xs">If-Match</code>. Mismatch returns 409 CONCURRENT_MODIFICATION.
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-500 mt-1">•</span>
          Idempotency mandatory on every POST that creates a document or runs an action with side effects. Header <code className="bg-gray-100 px-1 rounded text-xs">Idempotency-Key</code>.
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-500 mt-1">•</span>
          State changes happen through <code className="bg-gray-100 px-1 rounded text-xs">POST .../:id/actions/&lt;name&gt;</code>. A status field is never directly writable by a client.
        </li>
      </ul>

      {/* Section 7: Error Messages */}
      <SectionTitle number="7" title="Error Message Standard" />
      <p className="text-sm text-gray-700 mb-4">
        Every business error message states three things: what failed, the actual numbers, and what to do about it.
      </p>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-red-800 mb-2">❌ Bad</p>
          <p className="text-sm text-red-700 font-mono">Budget exceeded.</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-green-800 mb-2">✅ Good</p>
          <p className="text-xs text-green-700">
            Indent value ₹12,45,000 exceeds available budget of ₹8,20,000 for cost code CIV-CONC-01 (Budget ₹50,00,000 − Committed ₹31,30,000 − Actual ₹10,50,000). Request a budget revision, reduce the quantity, or ask a Project Manager to override with a reason.
          </p>
        </div>
      </div>
      <Callout type="warning">
        <strong>All issues at once.</strong> Run every validation rule and return every failure. A user who fixes one error, resubmits, and finds another is the defining experience of a bad ERP.
      </Callout>

      {/* Section 8: Transaction Rules */}
      <SectionTitle number="8" title="Transaction and Code Rules" />
      <CodeBlock title="UnitOfWork Pattern">
{`await uow.run(actor, async (ctx) => {
  // everything that must be consistent happens here
  ctx.audit.record({...});      // flushed inside the transaction
  ctx.outbox.emit('...', {...}); // flushed inside the transaction
});`}
      </CodeBlock>

      <h4 className="text-sm font-semibold text-gray-800 mb-2">Transaction Rules</h4>
      <ol className="text-sm text-gray-700 space-y-2 mb-6 list-decimal list-inside">
        {transactionRules.map((rule, i) => (
          <li key={i} className="leading-relaxed">{rule}</li>
        ))}
      </ol>

      <h4 className="text-sm font-semibold text-gray-800 mb-2">Money & Quantity</h4>
      <ul className="text-sm text-gray-700 space-y-2 mb-6">
        {moneyRules.map((rule, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span className="leading-relaxed">{rule}</span>
          </li>
        ))}
      </ul>

      <h4 className="text-sm font-semibold text-gray-800 mb-2">Dates</h4>
      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        {dateRules.map((rule, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span className="leading-relaxed">{rule}</span>
          </li>
        ))}
      </ul>

      <Callout type="info">
        <strong>Nulls:</strong> a nullable column must have a documented meaning. 0 and NULL are never interchangeable for a quantity or an amount. <strong>No boolean flags for multi-state concepts.</strong> is_approved is forbidden; use the state machine.
      </Callout>

      {/* Section 9: Immutability */}
      <SectionTitle number="9" title="Immutability Register" />
      <p className="text-sm text-gray-700 mb-4">
        These records are immutable once locked. Each is enforced by a database trigger or rule, not by application convention.
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Record</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Locked at</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Correction path</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Enforced in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {immutabilityRecords.map((rec) => (
              <tr key={rec.record} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">{rec.record}</td>
                <td className="px-3 py-2 text-gray-600">{rec.lockedAt}</td>
                <td className="px-3 py-2 text-gray-600">{rec.correctionPath}</td>
                <td className="px-3 py-2">
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono">{rec.enforcedIn}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout type="danger">
        <strong>There is no unlock action anywhere in this system.</strong> If you find yourself writing one, the requirement is wrong.
      </Callout>

      {/* Section 10: Testing */}
      <SectionTitle number="10" title="Testing Conventions" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Layer</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Coverage target</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">What it proves</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {testingLayers.map((layer) => (
              <tr key={layer.layer} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">{layer.layer}</td>
                <td className="px-3 py-2 text-gray-600">{layer.coverage}</td>
                <td className="px-3 py-2 text-gray-600">{layer.proves}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">🚫 Never mocked</p>
          <ul className="text-xs text-red-700 space-y-1">
            {neverMocked.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ Always mocked</p>
          <ul className="text-xs text-green-700 space-y-1">
            {alwaysMocked.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <Callout type="info">
        <strong>Seed data:</strong> one deterministic dataset from a fixed random seed, committed to the repository, internally consistent enough that it passes all 20 reconciliations. If the seed cannot pass them, the seed is wrong and every test built on it is meaningless.
      </Callout>

      {/* Section 11: Performance */}
      <SectionTitle number="11" title="Performance Budgets" />
      <p className="text-sm text-gray-700 mb-4">
        Measured at five-year data volume (Part 22.4 defines the dataset).
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Operation</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-700">Desktop</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-700">Phone, 3G, mid-range Android</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {performanceBudgets.map((budget) => (
              <tr key={budget.operation} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">{budget.operation}</td>
                <td className="px-3 py-2 text-center font-mono text-gray-700">{budget.desktop}</td>
                <td className="px-3 py-2 text-center font-mono text-gray-700">{budget.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="text-sm font-semibold text-gray-800 mb-2">Required Techniques</h4>
      <ul className="text-sm text-gray-700 space-y-1">
        {requiredTechniques.map((tech, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>{tech}</span>
          </li>
        ))}
      </ul>

      {/* Section 12: Responsive & Accessibility */}
      <SectionTitle number="12" title="Responsive and Accessibility Minimums" />
      <p className="text-sm text-gray-700 mb-4">
        Every screen, without exception:
      </p>
      <div className="grid gap-2 mb-4">
        {responsiveMinimums.map((item, i) => (
          <div key={i} className="flex items-start gap-2 bg-white rounded border border-gray-200 px-4 py-2">
            <span className="text-green-500 mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-sm text-gray-700">{item}</span>
          </div>
        ))}
      </div>
      <Callout type="warning">
        <strong>Numeric inputs use inputmode="decimal", never type="number"</strong> — scroll-wheel and locale handling make the latter unsafe for quantity and money entry. <strong>Lookup fields open a full-screen search sheet on phone</strong>, never an unbounded &lt;select&gt;.
      </Callout>

      {/* Section 13: Definition of Done */}
      <SectionTitle number="13" title="Definition of Done" />
      <p className="text-sm text-gray-700 mb-4">
        Identical for every part. A part is complete when all of these hold:
      </p>
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        {doneItems.map((item, i) => (
          <div key={i} className={`flex items-start gap-3 p-2 rounded ${item.starred ? "bg-amber-50 border border-amber-200" : ""}`}>
            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" readOnly />
            <span className="text-sm text-gray-700">
              {item.text}
              {item.starred && <span className="ml-2 text-amber-600 font-bold">★</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Section 14: Tracking Documents */}
      <SectionTitle number="14" title="The Three Tracking Documents" />
      <p className="text-sm text-gray-700 mb-4">
        Maintained continuously; every part updates them. If these three drift from reality, the next developer builds against fiction.
      </p>
      <div className="space-y-3">
        {trackingDocuments.map((doc) => (
          <div key={doc.name} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">{doc.name}</code>
            </div>
            <p className="text-sm text-gray-600">{doc.description}</p>
          </div>
        ))}
      </div>
      <Callout type="danger">
        Treat an out-of-date <code className="bg-red-100 px-1 rounded">SYSTEM_MAP.md</code> as a broken build.
      </Callout>
    </div>
  );
}
