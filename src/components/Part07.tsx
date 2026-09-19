import {
  dependencies,
  prerequisites,
  deliverables,
  inspectionCommands,
  reportQuestions,
  reuseChecks,
  themes,
  pageTemplates,
  dataStates,
  businessRules,
  shellZones,
  baseTokensCSS,
  typographyCSS,
  spacingCSS,
  statusTokensTS,
  formatTS,
  darkThemeCSS,
  themeServiceTS,
  userPreferenceTableSQL,
  switchProjectTS,
  iconsTS,
  dataRegionExample,
  tokenTests,
  shellTests,
  completionChecklist,
} from "../data/part07";

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

export default function Part07() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-700 to-blue-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Phase 0 — Foundation</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Part 7 of 9</span>
          <span className="text-xs bg-amber-400/20 text-amber-100 px-2 py-1 rounded">~2 days</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Part 0.7 — Design Tokens, Theme Engine & Application Shell</h2>
        <p className="text-cyan-100 text-sm leading-relaxed">
          Establish one visual language — tokens, themes, shell, navigation, states — so that the hundred-plus screens built in later phases look and behave as one application rather than twelve.
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
      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        {deliverables.map((d, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-cyan-500 mt-1">✓</span>
            <span>{d.text}</span>
          </li>
        ))}
      </ul>

      <Callout type="info">
        <strong>No business screens.</strong> This part builds the frame every later screen sits in.
      </Callout>

      {/* Section 1: Objective */}
      <SectionTitle number="1" title="Objective" />
      <p className="text-sm text-gray-700 mb-4">
        Establish one visual language — tokens, themes, shell, navigation, states — so that the hundred-plus screens built in later phases look and behave as one application rather than twelve.
      </p>

      {/* Section 2: Scope */}
      <SectionTitle number="2" title="Scope" />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✅ In scope</p>
          <p className="text-xs text-green-700">
            design tokens; four themes; theme switching and persistence; typography and spacing scales; Indian number formatting; the shell bar; side navigation; project context switching; global search shell; five page templates; five standard states; icon set.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-bold text-red-900 mb-2">❌ Out of scope</p>
          <p className="text-xs text-red-700">
            data components — smart table, KPI card, filter bar (Part 1.8); responsive breakpoints and adaptive navigation (Part 0.8); metadata-driven screen generation (Part 1.7).
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">🚫 Deliberately not built</p>
          <p className="text-xs text-gray-700">
            a component library of every control. Part 1.8 builds components once there is a table to render and a filter to apply. Building them now, against no real data, produces components that need rewriting when the first real screen appears.
          </p>
        </div>
      </div>

      {/* Section 3: Design Language Decision */}
      <SectionTitle number="3" title="The Design Language Decision" />
      <p className="text-sm text-gray-700 mb-4">
        The requirement is a <strong>SAP S/4HANA-inspired enterprise interface</strong>. Three things follow, and the distinction between them matters legally and practically.
      </p>

      <div className="space-y-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-bold text-gray-900 mb-2">What is borrowed — the interaction patterns</h5>
          <p className="text-xs text-gray-700">
            Role-based workspaces, KPI tiles on a launchpad, object pages with a header and anchored sections, list reports with a filter bar, approval inboxes, drill-down analytics, semantic status colours. These are well-established enterprise UX conventions, documented in public design guidance, and free to adopt. They are adopted here because they are genuinely good solutions to problems this system has, not for resemblance.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-bold text-gray-900 mb-2">What is consumed under licence — the colour values</h5>
          <p className="text-xs text-gray-700">
            SAP publishes its Horizon theme values in <code className="bg-gray-100 px-1 rounded">@sap-theming/theming-base-content</code>, which is <strong>Apache-2.0 licensed</strong>. Consuming those values is permitted. §4.1 gives the Morning Horizon palette; verify the licence text in the package version you install, and record it in <code className="bg-gray-100 px-1 rounded">ARCHITECTURE_DECISIONS.md</code>.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-bold text-gray-900 mb-2">What is not used</h5>
          <p className="text-xs text-gray-700">
            SAP's logo, SAP's icon font, SAP UI5 source code, and <strong>the "72" typeface, which is proprietary to SAP and not covered by the theming package's licence.</strong> Do not ship it. §4.2 specifies an open alternative with near-identical metrics.
          </p>
        </div>
      </div>

      <Callout type="danger">
        <strong>Your application has its own name, its own logo and its own identity.</strong> It resembles S/4HANA the way two well-designed spreadsheets resemble each other — through shared conventions, not through copying. If anyone on the project describes the goal as "make it look like SAP", correct that framing early; it leads to decisions that are both worse design and legally careless.
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
        <strong>If users will move between old and new screens</strong>, the two shells sitting side by side is jarring and generates support calls. Options, in order of preference: (a) apply the new tokens to the existing shell's CSS variables so both look alike, (b) frame existing screens inside the new shell, (c) accept the difference and scope the new shell to new modules only, with a clear visual boundary. Record the choice as ADR-007.
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

      {/* Step 4: The Token Set */}
      <StepTitle number="4" title="The Token Set" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.1 Base colour tokens — Morning Horizon</h5>
      <p className="text-sm text-gray-700 mb-4">
        Values from <code className="bg-gray-100 px-1 rounded">@sap-theming/theming-base-content</code> (Apache-2.0). <strong>Install the package and generate this file from it rather than transcribing by hand</strong> — it is the only way the dark and high-contrast themes stay accurate, and hand-copied hex values drift.
      </p>
      <CodeBlock title="tokens.base.css" language="css">
        {baseTokensCSS}
      </CodeBlock>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.2 Typography</h5>
      <Callout type="danger">
        <strong>The "72" typeface is proprietary to SAP and must not be shipped.</strong> Use an open alternative with similar metrics:
      </Callout>
      <CodeBlock title="Typography tokens" language="css">
        {typographyCSS}
      </CodeBlock>

      <Callout type="info">
        <strong>Inter is chosen for a specific reason:</strong> it has genuine tabular figures (<code className="bg-blue-100 px-1 rounded">font-variant-numeric: tabular-nums</code>), which matter enormously in a system full of money columns. Numbers that do not align vertically make a bill of quantities hard to read and are one of the most common complaints about ERP tables.
      </Callout>

      <Callout type="warning">
        <strong>Devanagari support.</strong> If the interface will display Hindi or Marathi, add <code className="bg-amber-100 px-1 rounded">Noto Sans Devanagari</code> to the stack and test the rendering of mixed Latin-Devanagari strings, which is where most font stacks break.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.3 Spacing, radius, elevation, motion</h5>
      <CodeBlock title="Spacing and layout tokens" language="css">
        {spacingCSS}
      </CodeBlock>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.4 ERP semantic tokens — status</h5>
      <p className="text-sm text-gray-700 mb-4">
        The 19-state document vocabulary maps to semantic colour <strong>and an icon and a label</strong>. Colour is never the only signal — this is an accessibility requirement and a practical one, because site tablets are used in sunlight.
      </p>
      <CodeBlock title="status.ts" language="typescript">
        {statusTokensTS}
      </CodeBlock>

      <Callout type="info">
        <strong>Additional ERP semantics:</strong> KPI health (good / warning / critical / neutral), variance direction (favourable / adverse — note that for cost, under budget is favourable, while for revenue it is adverse, so the component takes a <code className="bg-blue-100 px-1 rounded">direction</code> prop rather than inferring from sign), and module accent colours for navigation.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">4.5 Indian number formatting</h5>
      <CodeBlock title="format.ts" language="typescript">
        {formatTS}
      </CodeBlock>

      <Callout type="warning">
        <strong>Compact formatting appears on KPI tiles only.</strong> Tables, bills and reports always show the full value — a quantity surveyor checking a bill needs every digit, and "₹1.23 Cr" in a bill line is unusable. A lint rule flags <code className="bg-amber-100 px-1 rounded">formatINRCompact</code> used inside a table cell.
      </Callout>

      {/* Step 5: The Four Themes */}
      <StepTitle number="5" title="The Four Themes" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Theme</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Use</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {themes.map((theme, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-sm text-blue-700">{theme.name}</td>
                <td className="px-4 py-2 text-gray-700">{theme.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CodeBlock title="Dark theme example" language="css">
        {darkThemeCSS}
      </CodeBlock>

      <CodeBlock title="ThemeService" language="typescript">
        {themeServiceTS}
      </CodeBlock>

      <CodeBlock title="dx_user_preference table" language="sql">
        {userPreferenceTableSQL}
      </CodeBlock>

      <p className="text-sm text-gray-700 mb-4">
        Seeded keys: <code className="bg-gray-100 px-1 rounded">ui.theme</code>, <code className="bg-gray-100 px-1 rounded">ui.density</code>, <code className="bg-gray-100 px-1 rounded">ui.language</code>, <code className="bg-gray-100 px-1 rounded">ui.highVisibility</code>, <code className="bg-gray-100 px-1 rounded">ui.sideNavPinned</code>, <code className="bg-gray-100 px-1 rounded">ui.lastProjectId</code>. Later parts add table view preferences, dashboard layouts and notification settings against the same table.
      </p>

      <Callout type="danger">
        <strong>Theme is applied before first paint</strong> — read it from <code className="bg-red-100 px-1 rounded">localStorage</code> in a small inline script in <code className="bg-red-100 px-1 rounded">index.html</code>, then reconcile with the server value once <code className="bg-red-100 px-1 rounded">/auth/me</code> returns. Without that, a dark-theme user sees a white flash on every load, which reads as a defect.
      </Callout>

      {/* Step 6: The Application Shell */}
      <StepTitle number="6" title="The Application Shell" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.1 Shell bar</h5>
      <p className="text-sm text-gray-700 mb-4">
        Fixed top bar, <code className="bg-gray-100 px-1 rounded">--dx-shell-bar-height</code>, containing:
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Zone</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Contents</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shellZones.map((zone, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{zone.zone}</td>
                <td className="px-4 py-2 text-gray-700">{zone.contents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="warning">
        <strong>The project context switcher is the most important control in the shell.</strong> A user assigned to eleven projects needs to know which one they are looking at, at all times, without ambiguity. It shows the current project's code and name, opens a searchable list of the user's assigned projects, and — critically — <strong>switching re-validates permissions server-side</strong>, because the user's responsibility on the new project may differ entirely.
      </Callout>

      <CodeBlock title="switchProject" language="typescript">
        {switchProjectTS}
      </CodeBlock>

      <Callout type="danger">
        <strong>Never filter the project list on the client.</strong> It comes from <code className="bg-red-100 px-1 rounded">/auth/me</code>, which returns only assigned projects.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.2 Side navigation</h5>
      <p className="text-sm text-gray-700 mb-4">
        Server-driven from <code className="bg-gray-100 px-1 rounded">/shell/menu</code> (Part 0.5B). The client renders; it never decides.
      </p>
      <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc list-inside">
        <li>Expanded (default on desktop): icon + label, grouped by module, collapsible groups</li>
        <li>Collapsed (icon rail): icon only, label on hover, pinnable — state in <code className="bg-gray-100 px-1 rounded">ui.sideNavPinned</code></li>
        <li>Active route highlighted; parent group auto-expands</li>
        <li>A badge slot per item, populated by Part 1.5 (approval counts and similar)</li>
        <li>Adaptive behaviour per device is Part 0.8</li>
      </ul>

      <Callout type="info">
        <strong>Empty parents are pruned server-side.</strong> A "Finance" group with no visible children does not appear at all.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.3 Five page templates</h5>
      <p className="text-sm text-gray-700 mb-4">
        Every screen in the system uses one of these. A screen that fits none is a signal to reconsider the screen, not to invent a sixth template.
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Template</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Use</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Structure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageTemplates.map((template, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-blue-700">{template.name}</td>
                <td className="px-4 py-2 text-gray-700">{template.use}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{template.structure}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        Part 1.7 generates List Report and Object Page from metadata. This part builds the templates they generate into.
      </Callout>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.4 The five standard states</h5>
      <p className="text-sm text-gray-700 mb-4">
        Every data-bearing region implements all five. Part 1.8's components enforce it; this part defines them.
      </p>
      <div className="space-y-3 mb-4">
        {dataStates.map((state, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <h6 className="text-sm font-bold text-gray-900 mb-2">{state.state}</h6>
            <p className="text-xs text-gray-700">{state.rule}</p>
          </div>
        ))}
      </div>

      <CodeBlock title="DataRegion example" language="tsx">
        {dataRegionExample}
      </CodeBlock>

      <h5 className="text-sm font-semibold text-gray-800 mb-2">6.5 Icons</h5>
      <p className="text-sm text-gray-700 mb-4">
        Use an open set — <strong>Lucide</strong> (ISC licence) or <strong>Material Symbols</strong> (Apache-2.0). Do not use SAP's icon font.
      </p>
      <p className="text-sm text-gray-700 mb-4">
        Map semantic names to icons in one file so a later change is one edit:
      </p>
      <CodeBlock title="ICONS" language="typescript">
        {iconsTS}
      </CodeBlock>

      <Callout type="warning">
        <strong>No component imports an icon directly.</strong> They reference semantic names. This keeps the icon set swappable and keeps meaning consistent — "approved" is the same glyph everywhere.
      </Callout>

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

      {/* Step 8: Workflow */}
      <StepTitle number="8" title="Workflow" />
      <p className="text-sm text-gray-600 italic mb-4">
        <strong>Not applicable.</strong>
      </p>

      {/* Step 9: Frontend */}
      <StepTitle number="9" title="Frontend" />
      <p className="text-sm text-gray-700 mb-4">
        Covered in Step 6. Additional shell requirements:
      </p>
      <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc list-inside">
        <li><strong>Global search</strong> shell only — the input, the results panel and the keyboard shortcut. Results come from Part 1.9; until then it returns an empty state.</li>
        <li><strong>Notification bell</strong> shell only — the badge and the panel. Populated by Part 1.6.</li>
        <li><strong>Avatar menu:</strong> profile, theme, density, language, active sessions (Part 0.4), sign out.</li>
        <li><strong>Impersonation banner:</strong> when <code className="bg-gray-100 px-1 rounded">isImpersonation</code>, a persistent bar naming both identities with a "return to my account" action. It must be impossible to miss.</li>
      </ul>

      {/* Step 10: Realtime */}
      <StepTitle number="10" title="Realtime" />
      <p className="text-sm text-gray-700 mb-4">
        Shell subscribes (once Part 1.5 exists) to <code className="bg-gray-100 px-1 rounded">permission.refresh</code> and re-fetches the menu. Until then it compares <code className="bg-gray-100 px-1 rounded">permVersion</code> from <code className="bg-gray-100 px-1 rounded">/auth/me</code> on each navigation and refetches on change.
      </p>

      {/* Steps 11-13: Not Applicable */}
      <StepTitle number="11–13" title="Not Applicable" />
      <p className="text-sm text-gray-600 italic mb-4">
        No notifications, reports or dashboards in this part.
      </p>

      {/* Step 14: Error Handling */}
      <StepTitle number="14" title="Error Handling" />
      <p className="text-sm text-gray-700 mb-4">
        A failed shell request degrades rather than blanks: if <code className="bg-gray-100 px-1 rounded">/shell/menu</code> fails, show the shell with a retry in the navigation area and keep the current page usable. A user mid-task should not lose their work because a menu request timed out.
      </p>

      {/* Step 15: Audit */}
      <StepTitle number="15" title="Audit" />
      <p className="text-sm text-gray-700 mb-4">
        Preference changes are not audited — they are not consequential. <strong>Project context switches are</strong>, because they establish which permission set applied to everything the user did next.
      </p>

      {/* Step 16: Testing */}
      <StepTitle number="16" title="Testing" />

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Tokens and themes</h5>
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
            {tokenTests.map((test) => (
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

      <h5 className="text-sm font-semibold text-gray-800 mb-2">Shell</h5>
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
            {shellTests.map((test) => (
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
      <div className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-xl p-6">
        <h4 className="text-sm font-bold text-cyan-900 mb-2">Next: Part 0.8 — the responsive framework</h4>
        <p className="text-sm text-cyan-800 mb-3">
          The last part of Phase 0.
        </p>
        <Callout type="warning">
          <strong>Before moving on, put the four themes in front of a real user on a real site tablet, outdoors.</strong> The high-contrast white theme exists for that condition, and whether it actually works is not something a contrast ratio calculation answers.
        </Callout>
      </div>
    </div>
  );
}
