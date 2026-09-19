import {
  dependencies,
  prerequisites,
  deliverables,
  workingContexts,
  inspectionCommands,
  reportQuestions,
  reuseChecks,
  breakpoints,
  breakpointsSourceTS,
  breakpointsGeneratedCSS,
  navigationPatterns,
  bottomTabSlots,
  bottomNavExample,
  columnLayouts,
  densityModes,
  pwaManifest,
  cacheStrategies,
  syncLogSQL,
  offlineAllowedTS,
  syncServiceTS,
  deviceCapabilities,
  performanceMetrics,
  documentedExceptions,
  automatedTests,
  manualTests,
  completionChecklist,
  phase0Acceptance,
} from "../data/part08";

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

export default function Part08() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-700 to-emerald-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 0 — Foundation</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 8 of 9</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~2 days</span>
          <span className="text-xs bg-emerald-400/30 text-emerald-100 px-2 py-1 rounded font-bold">FINAL PART OF PHASE 0</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 0.8 — Responsive Framework, Device Adaptation & PWA Base</h2>
        <p className="text-teal-100 text-sm leading-relaxed">
          Make one codebase serve desktop, tablet and phone without forking the UI, and establish the offline capture mechanism that site modules will register against.
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
            <span>{item.text} {item.starred && <span className="text-amber-500 font-bold">★</span>}</span>
          </li>
        ))}
      </ul>

      <h5 className="text-sm font-semibold text-gray-700 mb-2">0.3 What this part creates</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        {deliverables.map((d, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-teal-500 mt-1">✓</span>
            <span>{d.text}</span>
          </li>
        ))}
      </ul>

      <Callout type="warning">
        <strong>Why this is in Phase 0 and not later:</strong> The previous series placed the responsive framework at Part 11, after ten parts of screens had been built. Every one of those screens then needed retrofitting. <strong>A screen built before the breakpoint system exists will be rebuilt.</strong> This part comes before the first business screen, which is Part 1.7's generator — and that generator consumes what is built here.
      </Callout>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Make one codebase serve desktop, tablet and phone without forking the UI, and establish the offline capture mechanism that site modules will register against.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            breakpoints; container queries; adaptive navigation; flexible column layout; density; touch targets; accessibility baseline; PWA manifest and service worker; the offline outbox and sync engine skeleton; device capability wrappers.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">
            the three-mode smart table (Part 1.8 — it needs a table first); per-module offline entities (each site module registers its own); the native app shell (optional, later).
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">
            a separate mobile application or a "mobile view". One codebase, one set of components, different layouts. A parallel mobile build diverges within two releases and then every fix is done twice.
          </p>
        </div>
      </div>

      {/* Section 3: The Governing Rule */}
      <SectionTitle number="3" title="The Governing Rule" />
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-300 rounded-lg p-6 mb-6">
        <p className="text-base text-teal-900 font-medium italic">
          "The same user with the same permissions must be able to complete the same <strong>business task</strong> on any device. What changes is layout, density, input method and progressive disclosure — never capability, never data, never validation, never the permission set."
        </p>
      </div>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Three working contexts:</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Context</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Who</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Conditions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {workingContexts.map((ctx, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-bold text-gray-900">{ctx.context}</td>
                <td className="px-4 py-2 text-gray-700">{ctx.who}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{ctx.conditions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="danger">
        <strong>Explicitly forbidden:</strong> a separate mobile site; a "mobile view" that silently drops columns, totals or validation; any screen saying "please use a desktop" except the three documented exceptions in §9.
      </Callout>

      {/* Step 1: Inspect */}
      <StepTitle number="1" title="Inspect" />
      {inspectionCommands.map((cmd, i) => (
        <div key={i} className="mb-4">
          <h5 className="text-sm font-semibold text-gray-800 mb-2">{cmd.title}</h5>
          <CodeBlock title={cmd.title} language={cmd.language}>
            {cmd.code}
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reportQuestions.map((q, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700 font-medium">{q.question}</td>
                <td className="px-4 py-2 text-gray-400 italic">[fill in]</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        <strong>The last question drives everything.</strong> Get real answers from the business, not assumptions. "Site engineers use phones" and "site engineers use tablets provided by the company" lead to different designs, and the wrong guess wastes a fortnight.
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

      {/* Step 4: Breakpoints */}
      <StepTitle number="4" title="Breakpoints" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.1 One source, two outputs</h5>
      <CodeBlock title="breakpoints.source.ts" language="typescript">
        {breakpointsSourceTS}
      </CodeBlock>

      <CodeBlock title="GENERATED CSS" language="css">
        {breakpointsGeneratedCSS}
      </CodeBlock>

      <Callout type="warning">
        <strong>Generating both from one source is not ceremony.</strong> In the previous attempt CSS and JS breakpoints drifted by 8px, and components disagreed with their own stylesheets about which mode they were in — a class of bug that is miserable to diagnose.
      </Callout>

      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Name</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">Value</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {breakpoints.map((bp, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-sm text-teal-700 font-bold">{bp.name}</td>
                <td className="px-4 py-2 text-center font-mono text-gray-700">{bp.value}px</td>
                <td className="px-4 py-2 text-gray-600">{bp.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.2 Container queries, not viewport queries</h5>
      <p className="text-sm text-gray-700 mb-4">
        Components query their container, not the viewport. A KPI card inside a narrow dashboard panel on a 27-inch monitor must behave like a KPI card on a phone. Viewport-based components get this wrong every time, and dashboards are full of resizable panels.
      </p>

      <Callout type="info">
        <strong>Viewport queries are correct for:</strong> shell layout, navigation mode, page templates, route-level decisions. <strong>Container queries for everything inside.</strong>
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.3 Absolute rules</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc list-inside">
        <li><strong>No horizontal page scroll at any width ≥ 320px.</strong> Automated test, every route.</li>
        <li>Content capped at <code className="bg-gray-100 px-1 rounded">--dx-content-max-width</code> (1600px), centred, so text lines stay under ~90 characters.</li>
        <li>User-agent sniffing is permitted <strong>only</strong> for: the install prompt, camera-versus-file-picker, and analytics. Never for layout.</li>
        <li>Minimum supported viewport 320 × 568. Everything works there.</li>
      </ul>

      {/* Step 5: Adaptive Navigation */}
      <StepTitle number="5" title="Adaptive Navigation" />

      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Device</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Pattern</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {navigationPatterns.map((pattern, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{pattern.device}</td>
                <td className="px-4 py-2 text-gray-700">{pattern.pattern}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">The phone bottom tab bar</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Slot</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Destination</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bottomTabSlots.map((slot, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-bold text-teal-700">{slot.slot}</td>
                <td className="px-4 py-2 text-gray-700">{slot.destination}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CodeBlock title="Bottom navigation example" language="tsx">
        {bottomNavExample}
      </CodeBlock>

      <Callout type="danger">
        <strong>It never covers a primary action.</strong> Every form reserves bottom padding equal to the bar height plus the safe-area inset. This is the single most common mobile ERP defect — a save button permanently hidden behind the navigation.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">5.2 The Create sheet</h5>
      <p className="text-sm text-gray-700 mb-4">
        The centre action opens a bottom sheet listing <strong>only the documents this user may create in the current project context</strong>, resolved server-side from the permission set, grouped by module, and ordered by that user's own frequency of use over the last 30 days.
      </p>
      <p className="text-sm text-gray-700 mb-4">
        It includes a "Scan" entry wherever a QR or barcode entry point exists — GRN against a PO, material issue, equipment lookup, gate pass.
      </p>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">5.3 Flexible column layout</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Width</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Behaviour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {columnLayouts.map((layout, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-sm text-teal-700 font-bold">{layout.width}</td>
                <td className="px-4 py-2 text-gray-700">{layout.behaviour}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        <strong>The URL always reflects the visible object.</strong> A link shared from a phone opens the same record on a desktop, in the desktop layout. Deep links are device-independent — this matters constantly in practice, because site staff send links to office staff.
      </Callout>

      {/* Step 6: Density, Touch and Accessibility */}
      <StepTitle number="6" title="Density, Touch and Accessibility" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.1 Density modes</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Mode</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">Row height</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">Base font</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Default on</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {densityModes.map((mode, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-bold text-gray-900">{mode.mode}</td>
                <td className="px-4 py-2 text-center font-mono text-gray-700">{mode.rowHeight}</td>
                <td className="px-4 py-2 text-center font-mono text-gray-700">{mode.baseFont}</td>
                <td className="px-4 py-2 text-gray-600">{mode.defaultOn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        Density is a token switch. <strong>It never changes which data is shown</strong> — only its spacing. Persisted in <code className="bg-amber-100 px-1 rounded">ui.density</code>.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.2 Touch</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc list-inside">
        <li>Minimum target 44 × 44px; 48 recommended; minimum 8px between adjacent targets</li>
        <li>All primary site actions reachable with one thumb in the lower half of the screen</li>
        <li>Long-press is never the only route to an action</li>
        <li>Destructive actions need a deliberate two-step — no accidental swipe-delete on a site form</li>
        <li>Numeric inputs use <code className="bg-gray-100 px-1 rounded">inputmode="decimal"</code>, <strong>never <code className="bg-gray-100 px-1 rounded">type="number"</code></strong> (scroll-wheel and locale problems make it unsafe for quantity and money)</li>
        <li>Lookup fields open a full-screen search sheet on phone, never an unbounded <code className="bg-gray-100 px-1 rounded">&lt;select&gt;</code></li>
      </ul>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.3 Accessibility baseline — tested in every later part</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc list-inside">
        <li>WCAG 2.1 AA: text ≥ 4.5:1, UI components ≥ 3:1</li>
        <li><strong>Status never by colour alone</strong> — icon and text always present</li>
        <li>Full keyboard operability on desktop, including tables (arrows, Enter, Space, Ctrl+A in page)</li>
        <li>Visible focus ring on every interactive element</li>
        <li>Labels programmatically associated; icon-only buttons carry <code className="bg-gray-100 px-1 rounded">aria-label</code></li>
        <li>Live regions announce real-time updates politely, never assertively</li>
        <li><code className="bg-gray-100 px-1 rounded">prefers-reduced-motion</code> disables count-ups, slides and skeleton shimmer</li>
        <li>Browser text zoom to 200% without loss of content or function</li>
        <li>High-contrast themes are first-class, not fallbacks</li>
      </ul>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.4 Site-condition hardening</h5>
      <p className="text-sm text-gray-700 mb-4">
        A <strong>high-visibility toggle</strong> raising contrast and increasing font size by one step, stored in <code className="bg-gray-100 px-1 rounded">ui.highVisibility</code>, intended for outdoor use. It is separate from the high-contrast theme and composes with it.
      </p>

      {/* Step 7: PWA and Offline */}
      <StepTitle number="7" title="PWA and Offline" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">7.1 Installation</h5>
      <CodeBlock title="manifest.json" language="json">
        {pwaManifest}
      </CodeBlock>
      <p className="text-sm text-gray-700 mb-4">
        Install prompt shown once, after the third session, permanently dismissible.
      </p>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">7.2 Caching strategy — explicit per resource class</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Resource</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Strategy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cacheStrategies.map((strategy, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700 font-medium">{strategy.resource}</td>
                <td className="px-4 py-2 text-gray-600">{strategy.strategy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        Deploying a new build shows a non-blocking "Update available" bar; a forced reload happens only when the API contract version changes.
      </p>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">7.3 The offline outbox — skeleton and allow-list</h5>
      <Callout type="info">
        <strong>This part builds the mechanism. Each site module registers its own entities.</strong>
      </Callout>

      <CodeBlock title="dx_sync_log table" language="sql">
        {syncLogSQL}
      </CodeBlock>

      <CodeBlock title="OFFLINE_ALLOWED registry" language="typescript">
        {offlineAllowedTS}
      </CodeBlock>

      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-300 rounded-lg p-6 mb-6">
        <h6 className="text-sm font-bold text-teal-900 mb-3">The allow-list principle, stated now and enforced by every later part:</h6>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-bold text-teal-800 mb-1">Permitted offline — capture operations whose effect the server validates on arrival:</p>
            <p className="text-xs text-teal-700">attendance punches, measurement drafts, photos, inspection requests, safety observations, equipment logsheets, material issue drafts, checklists.</p>
          </div>
          <div>
            <p className="text-xs font-bold text-red-800 mb-1">Never permitted offline:</p>
            <p className="text-xs text-red-700">any approval, certification, posting, bill, PO release, payment, permission change, backup or restore, stock-affecting confirmation, or anything consuming a number from a numbering series.</p>
          </div>
        </div>
      </div>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Three mechanics that make this safe:</h5>
      <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
        <li><strong>Client-generated UUID as the idempotency key.</strong> The unique constraint on <code className="bg-gray-100 px-1 rounded">local_id</code> makes a replayed submission impossible to duplicate.</li>
        <li><strong>Document numbers are always server-allocated.</strong> Offline records show "Pending number".</li>
        <li><strong>The device clock is never trusted.</strong> Both clocks are stored, skew beyond five minutes is flagged, and the server clock is the transaction time. The device time is a <em>claimed</em> time, surfaced to the approver alongside the skew.</li>
      </ol>

      <CodeBlock title="SyncService" language="typescript">
        {syncServiceTS}
      </CodeBlock>

      <Callout type="warning">
        <strong>Nothing is ever silently discarded.</strong> A rejected record stays in the device's Sync Issues screen with the server's message and Edit / Retry / Discard actions.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">7.4 Cache scoping and wipe</h5>
      <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc list-inside">
        <li>Only the active project's reference data is cached. The cache is cleared on logout, on project change, and after 7 days of inactivity.</li>
        <li><strong>If the permission set changes on sync, reference data is re-fetched before any further capture</strong> — a user removed from a project must not keep capturing against it.</li>
        <li>Device media capped at 200MB; beyond that, new capture is blocked with a clear message and a prompt to sync.</li>
      </ul>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">7.5 Device capabilities</h5>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Capability</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Rules</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deviceCapabilities.map((cap, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{cap.capability}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{cap.rules}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        Each wrapper has a permission-denied fallback that explains what is unavailable and why.
      </p>

      {/* Step 8: Performance Budgets */}
      <StepTitle number="8" title="Performance Budgets by Device" />
      <p className="text-sm text-gray-700 mb-4">
        Tested on a mid-range Android (Moto G class) over throttled 3G, in CI.
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Metric</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">Desktop</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">Tablet</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {performanceMetrics.map((metric, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{metric.metric}</td>
                <td className="px-4 py-2 text-center font-mono text-gray-700">{metric.desktop}</td>
                <td className="px-4 py-2 text-center font-mono text-gray-700">{metric.tablet}</td>
                <td className="px-4 py-2 text-center font-mono text-gray-700">{metric.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="danger">
        <strong>Route-level code splitting is mandatory.</strong> A site engineer's phone must never download the finance or payroll bundles. A CI check asserts the phone-critical routes stay under budget.
      </Callout>

      {/* Step 9: The Three Documented Exceptions */}
      <StepTitle number="9" title="The Three Documented Exceptions" />
      <p className="text-sm text-gray-700 mb-4">
        Only these three functions may be device-restricted anywhere in the system. Each shows an explanatory message, never a broken screen.
      </p>
      <div className="space-y-3 mb-4">
        {documentedExceptions.map((exception, i) => (
          <div key={i} className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex-shrink-0">
                {exception.number}
              </span>
              <div className="flex-1">
                <h6 className="text-sm font-bold text-gray-900 mb-1">{exception.function} — desktop only</h6>
                <p className="text-xs text-gray-700">{exception.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Callout type="danger">
        <strong>No fourth exception may be added without approval.</strong> If a developer believes one is needed, it is raised, not implemented.
      </Callout>

      {/* Step 10: Testing */}
      <StepTitle number="10" title="Testing" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Automated</h5>
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
            {automatedTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Manual, on real hardware <span className="text-amber-500">★</span></h5>
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
            {manualTests.map((test) => (
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
        <strong>M2, M3, M9 and M10 are the four that matter most and the four most often skipped.</strong> They are the difference between an offline system that works and one that quietly produces duplicate attendance for a year.
      </Callout>

      {/* Step 11: Deliverables */}
      <StepTitle number="11" title="Deliverables" />
      <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
        <li><code className="bg-gray-100 px-1 rounded">breakpoints.source.ts</code> plus the generator and both generated outputs</li>
        <li><code className="bg-gray-100 px-1 rounded">useBreakpoint()</code>, <code className="bg-gray-100 px-1 rounded">useContainerSize()</code>, <code className="bg-gray-100 px-1 rounded">&lt;Responsive&gt;</code></li>
        <li>Adaptive shell: expanded nav, icon rail, bottom tab bar, create sheet</li>
        <li>Flexible column layout with URL-reflected state</li>
        <li>Density and high-visibility toggles wired to <code className="bg-gray-100 px-1 rounded">dx_user_preference</code></li>
        <li>PWA manifest, service worker with the §7.2 strategy, install prompt, update bar</li>
        <li>IndexedDB outbox, sync engine, Sync Issues screen, <code className="bg-gray-100 px-1 rounded">dx_sync_log</code>, <code className="bg-gray-100 px-1 rounded">OFFLINE_ALLOWED</code> registry</li>
        <li>Device capability wrappers with permission-denied fallbacks</li>
        <li><code className="bg-gray-100 px-1 rounded">RESPONSIVE_MAP.md</code> — every route's behaviour at each breakpoint, maintained by later parts</li>
      </ol>

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

      {/* Phase 0 Complete Banner */}
      <div className="mt-8 bg-gradient-to-r from-teal-600 to-emerald-700 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🎉</span>
          <h3 className="text-2xl font-bold">PHASE 0 IS COMPLETE</h3>
        </div>
        <p className="text-teal-100 mb-6">
          Nine parts. You now have:
        </p>
        <ul className="space-y-2 text-sm text-teal-50 mb-6">
          <li className="flex items-start gap-2">
            <span className="text-teal-300">✓</span>
            <span>A frozen, documented existing database with an adapter layer nothing bypasses</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-300">✓</span>
            <span>Transactions, money arithmetic, an API contract and an error vocabulary</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-300">✓</span>
            <span>Authentication with MFA and transparent hash upgrading</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-300">✓</span>
            <span>A four-layer project-wise permission model enforced at four points</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-300">✓</span>
            <span>A tamper-evident audit chain and an atomic event outbox</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-300">✓</span>
            <span>One visual language, four themes, a permission-driven shell</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-300">✓</span>
            <span>A responsive framework and an offline mechanism, both built before the first screen</span>
          </li>
        </ul>

        <h4 className="text-lg font-bold mb-3">Before starting Phase 1, run the Phase 0 acceptance:</h4>
        <ol className="space-y-2 text-sm text-teal-50 mb-6 list-decimal list-inside">
          {phase0Acceptance.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>

        <Callout type="danger">
          <strong>Item 7 is the one to check most carefully.</strong> Nine parts in, with roughly twenty new tables created, the existing database must be byte-identical in structure to where it started — excepting only the single password column opened under ADR-005. If the fingerprint has drifted, find out why before building anything else on top of it.
        </Callout>

        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-sm font-bold text-white mb-2">Next: Phase 1 — the ten platform engines.</p>
          <p className="text-xs text-teal-100">
            They are 25–30% of the remaining effort and everything from Phase 2 onward depends on them. <strong>Do not compress them.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
