import { useState } from "react";
import {
  inspectionQueries,
  inspectionQuestions,
  repositoryOptions,
  folderStructure,
  moduleStructure,
  environmentVariables,
  databaseConnections,
  additiveMigrationCheck,
  ormSynchroniseGuard,
  secretLiteralCheck,
  ciPipeline,
  featureKillSwitch,
  trackingDocuments,
  testCases,
  completionChecklist,
  prerequisites,
  environmentRules,
} from "../data/part01";

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

export default function Part01() {
  const [expandedCode, setExpandedCode] = useState<Record<string, boolean>>({
    additive: true,
    orm: false,
    secret: false,
    ci: false,
    kill: false,
  });

  const toggleCode = (key: string) => {
    setExpandedCode((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 0 — Foundation</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 1 of 8</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~1 day</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 0.1 — Environment, Repository & Project Skeleton</h2>
        <p className="text-indigo-100 text-sm leading-relaxed">
          Establish a working development environment where a developer can clone, install, run the existing application, run the new code alongside it, and have CI reject any migration that touches an existing table.
        </p>
      </div>

      {/* Section 0: Before You Start */}
      <SectionTitle number="0" title="Before You Start" />
      
      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.1 Depends on</h5>
      <p className="text-sm text-gray-600 mb-4">Nothing. This is the first part.</p>

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.2 What must already exist</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        {prerequisites.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600" readOnly />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Callout type="danger">
        <strong>Do not connect to the production database at any point in Phase 0.</strong> Every inspection in Part 0.2 runs against a restored copy.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.3 What this part creates</h5>
      <p className="text-sm text-gray-600 mb-4">
        The repository structure, tooling, environment configuration, CI skeleton and the three tracking documents. No business code.
      </p>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Establish a working development environment where a developer can clone, install, run the existing application, run the new code alongside it, and have CI reject any migration that touches an existing table.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            repository layout, dependency setup, environment variables, database connections, linting, the additive-migration guard, CI pipeline skeleton, tracking documents.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">any table, any API, any screen.</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">a new database. The existing one is the database.</p>
        </div>
      </div>

      {/* Step 1: Inspect */}
      <StepTitle number="1" title="Inspect" />
      <p className="text-sm text-gray-700 mb-4">Report all of this before writing anything.</p>

      {inspectionQueries.map((query, i) => (
        <div key={i} className="mb-6">
          <h5 className="text-sm font-semibold text-gray-800 mb-2">1.{i + 1} {query.title}</h5>
          <CodeBlock title={query.title} language={query.language}>
            {query.code}
          </CodeBlock>
        </div>
      ))}

      <h5 className="text-sm font-semibold text-gray-800 mb-2">1.3 Report these decisions explicitly</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Question</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Your answer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inspectionQuestions.map((q) => (
              <tr key={q} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700">{q}</td>
                <td className="px-4 py-2 text-gray-400 italic">[fill in]</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        <strong>If the dx_ prefix collides,</strong> choose another two-or-three-character prefix now and use it consistently for all 175 parts. Record the choice in <code className="bg-amber-100 px-1 rounded">02_BUILD_CONVENTIONS.md</code>. Everything in this series says dx_; a global find-and-replace is a five-minute job now and a nightmare at Part 90.
      </Callout>

      {/* Step 2: Decide */}
      <StepTitle number="2" title="Decide: One Repository or Two" />
      <p className="text-sm text-gray-700 mb-4">
        Make this decision now and record it. Both are workable; mixing them is not.
      </p>

      {repositoryOptions.map((option, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h5 className="text-sm font-bold text-gray-900 mb-2">{option.option}</h5>
          <CodeBlock title="Structure">{option.structure}</CodeBlock>
          <div className="mt-3 space-y-2">
            <p className="text-xs text-gray-700">
              <span className="font-semibold">Choose this when:</span> {option.when}
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-semibold">Consequences:</span> {option.consequences}
            </p>
          </div>
        </div>
      ))}

      <Callout type="info">
        <strong>Record the decision</strong> in <code className="bg-blue-100 px-1 rounded">ARCHITECTURE_DECISIONS.md</code> with the reason. Later parts assume Option A; where Option B differs, the part says so.
      </Callout>

      {/* Step 3: Repository Structure */}
      <StepTitle number="3" title="Repository Structure" />
      <p className="text-sm text-gray-700 mb-4">Create this exactly. Later parts reference these paths.</p>
      <CodeBlock title="Full Repository Structure" language="text">
        {folderStructure}
      </CodeBlock>

      <Callout type="info">
        <strong>Every module folder follows the same internal shape,</strong> established in Phase 1 and used from Phase 2 onward:
      </Callout>
      <CodeBlock title="Module Internal Structure" language="text">
        {moduleStructure}
      </CodeBlock>

      {/* Step 4: Environment Configuration */}
      <StepTitle number="4" title="Environment Configuration" />
      
      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.1 Variables</h5>
      <CodeBlock title=".env.example" language="bash">
        {environmentVariables}
      </CodeBlock>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Rules</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-6">
        {environmentRules.map((rule, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.2 Two database connections</h5>
      <CodeBlock title="shared/db/connections.ts" language="typescript">
        {databaseConnections}
      </CodeBlock>

      <Callout type="info">
        <strong>application_name matters:</strong> when the database is under load, <code className="bg-blue-100 px-1 rounded">pg_stat_activity</code> tells you immediately whether the pressure is transactional or reporting.
      </Callout>

      {/* Step 5: Guards */}
      <StepTitle number="5" title="The Guards That Protect Rule 1" />
      <p className="text-sm text-gray-700 mb-4">
        These three checks are the mechanical enforcement of "the existing database is frozen". Build them now; they run on every commit for the next 173 parts.
      </p>

      <div className="space-y-4">
        <div>
          <button
            onClick={() => toggleCode("additive")}
            className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2 hover:text-blue-600"
          >
            <svg className={`w-4 h-4 transition-transform ${expandedCode.additive ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            5.1 Additive migration check
          </button>
          {expandedCode.additive && (
            <CodeBlock title="tools/ci/assert-additive-migrations.ts" language="typescript">
              {additiveMigrationCheck}
            </CodeBlock>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleCode("orm")}
            className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2 hover:text-blue-600"
          >
            <svg className={`w-4 h-4 transition-transform ${expandedCode.orm ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            5.2 ORM synchronise guard
          </button>
          {expandedCode.orm && (
            <CodeBlock title="shared/db/data-source.ts" language="typescript">
              {ormSynchroniseGuard}
            </CodeBlock>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleCode("secret")}
            className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2 hover:text-blue-600"
          >
            <svg className={`w-4 h-4 transition-transform ${expandedCode.secret ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            5.3 Secret literal check
          </button>
          {expandedCode.secret && (
            <CodeBlock title="tools/ci/assert-no-secrets.ts" language="typescript">
              {secretLiteralCheck}
            </CodeBlock>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleCode("ci")}
            className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2 hover:text-blue-600"
          >
            <svg className={`w-4 h-4 transition-transform ${expandedCode.ci ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            5.4 CI pipeline skeleton
          </button>
          {expandedCode.ci && (
            <CodeBlock title=".github/workflows/dx.yml" language="yaml">
              {ciPipeline}
            </CodeBlock>
          )}
        </div>
      </div>

      <Callout type="warning">
        <strong>Integration tests run against a real PostgreSQL container,</strong> never a mock. Constraint violations, lock behaviour and trigger effects are exactly where this system's guarantees live, and a mocked database hides all three.
      </Callout>

      {/* Step 6: Feature Kill Switch */}
      <StepTitle number="6" title="The Feature Kill Switch" />
      <p className="text-sm text-gray-700 mb-4">
        Rule 1 promises that disabling the new code returns the original application to its previous behaviour. That promise must be testable from day one.
      </p>

      <button
        onClick={() => toggleCode("kill")}
        className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2 hover:text-blue-600"
      >
        <svg className={`w-4 h-4 transition-transform ${expandedCode.kill ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Show kill switch implementation
      </button>
      {expandedCode.kill && (
        <CodeBlock title="shared/config/features.ts" language="typescript">
          {featureKillSwitch}
        </CodeBlock>
      )}

      <Callout type="info">
        <strong>Phase 22 verifies this:</strong> with <code className="bg-blue-100 px-1 rounded">DX_FEATURES_ENABLED=false</code>, the original application must function exactly as it did before the project started. Because no existing table was altered, this is a deploy-level rollback with no data restoration — but it must be proven, not assumed.
      </Callout>

      {/* Step 7: Tracking Documents */}
      <StepTitle number="7" title="Tracking Documents" />
      <p className="text-sm text-gray-700 mb-4">
        Create all four now, with headers and no rows. Every part adds to them.
      </p>

      <div className="space-y-3">
        {trackingDocuments.map((doc) => (
          <div key={doc.filename} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">{doc.filename}</code>
            </div>
            <CodeBlock title={doc.title}>{doc.content}</CodeBlock>
          </div>
        ))}
      </div>

      <Callout type="warning">
        <strong>API_REGISTRY.md is generated</strong> from route decorators by a script added in Part 0.3. Hand-maintained API documentation drifts within weeks and then actively misleads.
      </Callout>

      {/* Steps 8-15 */}
      <StepTitle number="8–15" title="Not Applicable" />
      <p className="text-sm text-gray-600 italic mb-4">
        This part creates no database objects, no APIs, no permissions, no business rules, no workflow, no screens, no real-time events, no notifications and no reports. Those begin in Part 0.2.
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
        <strong>T3, T5, T6 and T7 must each be observed failing or behaving as designed,</strong> then reverted. Guards that have never fired are decorations.
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
        <h4 className="text-sm font-bold text-blue-900 mb-2">Next: Part 0.2 — Database baseline</h4>
        <p className="text-sm text-blue-800">
          It is the most consequential part in Phase 0: it produces the single authoritative record of the existing schema that all 172 remaining parts read from. <strong>Budget three days and do not rush it.</strong>
        </p>
      </div>
    </div>
  );
}
