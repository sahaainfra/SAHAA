export interface Dependency {
  part: string;
  provides: string;
  blocking: string;
}

export interface Prerequisite {
  text: string;
}

export interface Deliverable {
  text: string;
}

export interface InspectionCommand {
  title: string;
  code: string;
  language: string;
}

export interface ReportQuestion {
  question: string;
  answer: string;
  consequence: string;
}

export interface ReuseCheckItem {
  searchFor: string;
  ifFound: string;
  ifNot: string;
}

export interface Theme {
  name: string;
  use: string;
}

export interface PageTemplate {
  name: string;
  use: string;
  structure: string;
}

export interface DataState {
  state: string;
  rule: string;
}

export interface BusinessRule {
  code: string;
  condition: string;
  severity: string;
  message: string;
}

export interface TestCase {
  id: string;
  case: string;
  expected: string;
  starred?: boolean;
}

export interface ChecklistCategory {
  category: string;
  items: string[];
}

export interface ShellZone {
  zone: string;
  contents: string;
}

export const dependencies: Dependency[] = [
  { part: "0.3", provides: "API envelope, error catalogue", blocking: "Yes" },
  { part: "0.4", provides: "Session, /auth/me", blocking: "Yes" },
  { part: "0.5B", provides: "/shell/menu — the permission-filtered navigation tree", blocking: "Yes" },
];

export const prerequisites: Prerequisite[] = [
  { text: "Part 0.6 checklist passed" },
  { text: "A user can log in and /auth/me returns their projects and permVersion" },
  { text: "/shell/menu returns a filtered tree for that user" },
  { text: "At least two users with different permission sets exist, for testing the menu" },
];

export const deliverables: Deliverable[] = [
  { text: "One dx_ table (dx_user_preference)" },
  { text: "The complete token set" },
  { text: "Four themes (light, dark, high contrast black, high contrast white)" },
  { text: "The theme engine" },
  { text: "The application shell with navigation and context switching" },
  { text: "The five page templates" },
  { text: "The five standard states" },
];

export const inspectionCommands: InspectionCommand[] = [
  {
    title: "1.1 Existing front-end stack",
    language: "bash",
    code: `cat package.json | grep -E '"(react|vue|angular|tailwind|bootstrap|mui|antd)"'`,
  },
  {
    title: "1.2 Existing styling approach",
    language: "bash",
    code: `find ../existing-erp/src -name "*.css" -o -name "*.scss" | head -20
grep -rn "primary\\|#[0-9a-fA-F]\\{6\\}" --include=*.{css,scss} ../existing-erp/src | head -30`,
  },
  {
    title: "1.3 Existing shell, header, navigation",
    language: "bash",
    code: `find ../existing-erp/src -iname "*layout*" -o -iname "*header*" -o -iname "*nav*" -o -iname "*shell*"`,
  },
  {
    title: "1.4 Any existing design tokens or theme variables",
    language: "bash",
    code: `grep -rn "\\-\\-[a-z-]*color\\|:root" --include=*.{css,scss} ../existing-erp/src | head -20`,
  },
];

export const reportQuestions: ReportQuestion[] = [
  { question: "Existing CSS framework", answer: "", consequence: "Tailwind config vs plain CSS variables" },
  { question: "Existing colour palette", answer: "", consequence: "Whether the new shell clashes visually" },
  { question: "Existing navigation structure", answer: "", consequence: "Whether users see two different shells" },
  { question: "Any existing dark mode", answer: "", consequence: "" },
  { question: "Will users move between old and new screens in one session?", answer: "", consequence: "Determines §2 below" },
];

export const reuseChecks: ReuseCheckItem[] = [
  { searchFor: "Tailwind config", ifFound: "Extend its theme with the tokens", ifNot: "Add Tailwind, configure from tokens" },
  { searchFor: "Existing icon set", ifFound: "Reuse if complete and consistently used", ifNot: "Use an open set per §4.2" },
  { searchFor: "Existing modal / toast primitives", ifFound: "Reuse", ifNot: "Build in Part 1.8" },
  { searchFor: "Existing route guard on the front end", ifFound: "Reuse; it must call /shell/menu", ifNot: "Build per §4.5" },
];

export const themes: Theme[] = [
  { name: "light", use: "Default; office use" },
  { name: "dark", use: "Low-light, personal preference" },
  { name: "hcb", use: "High contrast black — accessibility requirement" },
  { name: "hcw", use: "High contrast white — also serves outdoor site tablets" },
];

export const pageTemplates: PageTemplate[] = [
  { name: "ListReportPage", use: "Any collection", structure: "Title · KPI strip (optional) · filter bar · table · pagination" },
  { name: "ObjectPage", use: "Any single record", structure: "Header with key fields and actions · anchored sections" },
  { name: "DashboardPage", use: "Role workspaces", structure: "Bands of widgets on a responsive grid" },
  { name: "WizardPage", use: "Multi-step creation", structure: "Step indicator · one step visible · back/next/finish" },
  { name: "FullScreenPage", use: "Focused work (MB entry, bill preparation)", structure: "Minimal chrome, maximum canvas" },
];

export const dataStates: DataState[] = [
  { state: "Loading", rule: "Skeleton matching the final layout's dimensions. Never a centred spinner for a page — it causes layout shift and tells the user nothing." },
  { state: "Empty", rule: "Illustration, a sentence explaining why it is empty, and the action that would populate it. Never just 'No data'." },
  { state: "Error", rule: "What failed, the correlation id, a retry action, and who to contact. Never a raw message." },
  { state: "No permission", rule: "What is missing and who can grant it. Never a blank page — the user thinks it is broken." },
  { state: "Partial", rule: "Some data loaded, some failed. Show what succeeded, name what did not." },
];

export const businessRules: BusinessRule[] = [
  { code: "PROJECT_NOT_ASSIGNED", condition: "Context switch to an unassigned project", severity: "BLOCK", message: "You are not assigned to this project." },
  { code: "UNKNOWN_STATUS_TOKEN", condition: "Status value with no entry in DOCUMENT_STATUS", severity: "BLOCK", message: "Build-time failure naming the value" },
  { code: "HARDCODED_COLOUR", condition: "Hex literal outside the token files", severity: "BLOCK", message: "Lint failure" },
];

export const shellZones: ShellZone[] = [
  { zone: "Left", contents: "Menu toggle · product logo and name (your own)" },
  { zone: "Centre", contents: "Project context switcher · global search" },
  { zone: "Right", contents: "Notifications badge · help · theme toggle · avatar menu" },
];

export const baseTokensCSS = `/* dx/web/src/design/tokens.base.css — GENERATED. Do not hand-edit. */
:root {
  /* brand and interaction */
  --dx-brand:              #0070f2;
  --dx-highlight:          #0064d9;
  --dx-active:             #0057d2;
  --dx-link:               #0064d9;
  --dx-link-hover:         #0040b0;

  /* surfaces */
  --dx-bg-app:             #f5f6f7;
  --dx-bg-surface:         #ffffff;
  --dx-bg-surface-2:       #f5f6f7;
  --dx-bg-header:          #ffffff;
  --dx-bg-shell:           #354a5f;
  --dx-bg-hover:           #eaecee;
  --dx-bg-selected:        #ebf8ff;

  /* text */
  --dx-text:               #131e29;
  --dx-text-subtle:        #556b82;
  --dx-text-inverted:      #ffffff;
  --dx-text-disabled:      #758ca4;

  /* borders */
  --dx-border:             #d9d9d9;
  --dx-border-strong:      #758ca4;
  --dx-focus:              #0057d2;

  /* semantic — the ERP's status vocabulary */
  --dx-positive:           #256f3a;
  --dx-positive-bg:        #f5fae5;
  --dx-critical:           #e76500;   /* warning */
  --dx-critical-bg:        #fff8d6;
  --dx-negative:           #aa0808;   /* error */
  --dx-negative-bg:        #ffeaf4;
  --dx-neutral:            #788fa6;
  --dx-neutral-bg:         #eaecee;
  --dx-information:        #0070f2;
  --dx-information-bg:     #ebf8ff;

  /* chart series — accessible in sequence, distinguishable in greyscale */
  --dx-chart-1:  #5899da;  --dx-chart-2:  #e8743b;  --dx-chart-3:  #19a979;
  --dx-chart-4:  #ed4a7b;  --dx-chart-5:  #945ecf;  --dx-chart-6:  #13a4b4;
  --dx-chart-7:  #525df4;  --dx-chart-8:  #bf399e;  --dx-chart-9:  #6c8893;
  --dx-chart-10: #ee6868;
}`;

export const typographyCSS = `:root {
  --dx-font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
                    "Noto Sans", Roboto, Arial, sans-serif;
  --dx-font-family-mono: "JetBrains Mono", "SF Mono", Consolas, monospace;

  --dx-font-size-xs:    0.75rem;   /* 12px — dense table text, captions */
  --dx-font-size-sm:    0.8125rem; /* 13px — compact density */
  --dx-font-size-base:  0.875rem;  /* 14px — default UI text */
  --dx-font-size-md:    1rem;      /* 16px — cozy density, mobile body */
  --dx-font-size-lg:    1.125rem;  /* 18px — section headings */
  --dx-font-size-xl:    1.375rem;  /* 22px — page titles */
  --dx-font-size-2xl:   1.75rem;   /* 28px — KPI values */
  --dx-font-size-3xl:   2.25rem;   /* 36px — hero KPI */

  --dx-font-weight-regular:  400;
  --dx-font-weight-medium:   500;
  --dx-font-weight-semibold: 600;
  --dx-font-weight-bold:     700;

  --dx-line-height-tight:  1.2;
  --dx-line-height-normal: 1.45;
  --dx-line-height-loose:  1.6;
}`;

export const spacingCSS = `:root {
  /* 4px base scale — every margin and padding is a multiple */
  --dx-space-0: 0;      --dx-space-1: 0.25rem;  --dx-space-2: 0.5rem;
  --dx-space-3: 0.75rem;--dx-space-4: 1rem;     --dx-space-5: 1.25rem;
  --dx-space-6: 1.5rem; --dx-space-8: 2rem;     --dx-space-10: 2.5rem;
  --dx-space-12: 3rem;  --dx-space-16: 4rem;

  --dx-radius-none: 0;      --dx-radius-sm: 0.25rem;
  --dx-radius-md: 0.5rem;   --dx-radius-lg: 0.75rem;
  --dx-radius-full: 9999px;

  --dx-shadow-sm: 0 1px 2px rgba(0,0,0,.06);
  --dx-shadow-md: 0 2px 8px rgba(0,0,0,.08);
  --dx-shadow-lg: 0 8px 24px rgba(0,0,0,.12);

  --dx-duration-fast: 120ms; --dx-duration-base: 200ms; --dx-duration-slow: 320ms;
  --dx-ease: cubic-bezier(.2,0,.2,1);

  /* layout */
  --dx-shell-bar-height:    2.75rem;
  --dx-side-nav-width:      15rem;
  --dx-side-nav-collapsed:  3rem;
  --dx-content-max-width:   100rem;
  --dx-bottom-nav-height:   3.5rem;   /* phone; used in Part 0.8 */
}`;

export const statusTokensTS = `// dx/web/src/design/status.ts
export const DOCUMENT_STATUS = {
  DRAFT:               { label: 'Draft',              tone: 'neutral',     icon: 'draft' },
  SUBMITTED:           { label: 'Submitted',          tone: 'information', icon: 'sent' },
  PENDING_APPROVAL:    { label: 'Pending Approval',   tone: 'critical',    icon: 'pending' },
  PARTIALLY_APPROVED:  { label: 'Partly Approved',    tone: 'critical',    icon: 'progress' },
  APPROVED:            { label: 'Approved',           tone: 'positive',    icon: 'accept' },
  REJECTED:            { label: 'Rejected',           tone: 'negative',    icon: 'decline' },
  RETURNED:            { label: 'Returned',           tone: 'critical',    icon: 'undo' },
  RELEASED:            { label: 'Released',           tone: 'positive',    icon: 'sent' },
  IN_PROGRESS:         { label: 'In Progress',        tone: 'information', icon: 'progress' },
  PARTIALLY_EXECUTED:  { label: 'Part Executed',      tone: 'critical',    icon: 'progress' },
  EXECUTED:            { label: 'Executed',           tone: 'positive',    icon: 'complete' },
  CERTIFIED:           { label: 'Certified',          tone: 'positive',    icon: 'certificate' },
  POSTED:              { label: 'Posted',             tone: 'positive',    icon: 'lock' },
  PARTIALLY_PAID:      { label: 'Part Paid',          tone: 'critical',    icon: 'money' },
  PAID:                { label: 'Paid',               tone: 'positive',    icon: 'money' },
  CLOSED:              { label: 'Closed',             tone: 'neutral',     icon: 'complete' },
  CANCELLED:           { label: 'Cancelled',          tone: 'negative',    icon: 'decline' },
  SUPERSEDED:          { label: 'Superseded',         tone: 'neutral',     icon: 'history' },
  ON_HOLD:             { label: 'On Hold',            tone: 'critical',    icon: 'pause' },
} as const;`;

export const formatTS = `// dx/web/src/design/format.ts

/** ₹1,23,45,678.90 — lakh/crore grouping, not thousands. */
export function formatINR(value: string | number, opts: FormatOpts = {}): string {
  const n = Number(value);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: opts.decimals ?? 2,
    maximumFractionDigits: opts.decimals ?? 2,
  }).format(n);
  return opts.symbol === false ? formatted : \`₹\${formatted}\`;
}

/** Compact form for KPI tiles where space is tight: ₹1.23 Cr, ₹45.6 L */
export function formatINRCompact(value: string | number): string {
  const n = Math.abs(Number(value));
  const sign = Number(value) < 0 ? '−' : '';
  if (n >= 1e7) return \`\${sign}₹\${(n / 1e7).toFixed(2)} Cr\`;
  if (n >= 1e5) return \`\${sign}₹\${(n / 1e5).toFixed(2)} L\`;
  if (n >= 1e3) return \`\${sign}₹\${(n / 1e3).toFixed(1)} K\`;
  return \`\${sign}₹\${n.toFixed(0)}\`;
}

export function formatQuantity(v: string | number, uom: string, decimals = 2): string {
  return \`\${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Number(v))} \${uom}\`;
}`;

export const darkThemeCSS = `/* Generated from the theming package for each theme. */
[data-theme="dark"] {
  --dx-bg-app: #12171c;  --dx-bg-surface: #1c2228;  --dx-bg-surface-2: #242a31;
  --dx-text: #eaecee;    --dx-text-subtle: #a9b4be; --dx-border: #3a434b;
  --dx-positive: #36a41d; --dx-critical: #e76500;
  --dx-negative: #ff8888; --dx-neutral: #91a4b7;
  /* ...complete set... */
}`;

export const themeServiceTS = `@Injectable()
export class ThemeService {
  /** Resolution order: explicit user choice → system preference → light. */
  resolve(userPref: string | null): Theme {
    if (userPref && userPref !== 'auto') return userPref as Theme;
    if (window.matchMedia('(prefers-contrast: more)').matches) return 'hcw';
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', getComputedStyle(document.documentElement)
        .getPropertyValue('--dx-bg-shell').trim());
  }
}`;

export const userPreferenceTableSQL = `CREATE TABLE dx_user_preference (
  user_id      BIGINT       NOT NULL,
  pref_key     VARCHAR(80)  NOT NULL,
  pref_value   TEXT         NOT NULL,
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT pk_dx_userpref PRIMARY KEY (user_id, pref_key)
);`;

export const switchProjectTS = `async function switchProject(projectId: number) {
  // The server confirms the assignment and returns the permission version for that context.
  const res = await api.post('/shell/context', { projectId });
  if (!res.ok) return showError(res.error);

  await queryClient.invalidateQueries();     // every cached query was project-scoped
  await refetchMenu();                       // the menu itself may change
  setCurrentProject(res.data.project);
  await savePreference('ui.lastProjectId', projectId);
}`;

export const iconsTS = `export const ICONS = {
  draft: 'file-text', sent: 'send', pending: 'clock', accept: 'check-circle',
  decline: 'x-circle', progress: 'loader', complete: 'check-check',
  certificate: 'award', lock: 'lock', money: 'indian-rupee', history: 'history',
  pause: 'pause-circle', undo: 'rotate-ccw',
  // ... one entry per semantic name used anywhere
} as const;`;

export const dataRegionExample = `<DataRegion
  query={query}
  empty={{ title: 'No purchase orders yet',
           body: 'Approved comparatives become purchase orders here.',
           action: canCreate ? { label: 'Create purchase order', onClick: create } : undefined }}
  noPermission={{ permission: 'procure.po.view',
                  body: 'Ask your project administrator for purchase order access.' }}
>
  {(rows) => <PoTable rows={rows} />}
</DataRegion>`;

export const tokenTests: TestCase[] = [
  { id: "T1", case: "Every token referenced in CSS is defined", expected: "Build-time check passes", starred: true },
  { id: "T2", case: "Hex colour outside the token files", expected: "Lint fails", starred: true },
  { id: "T3", case: "Switch to each of the four themes", expected: "All render; no unstyled flash", starred: true },
  { id: "T4", case: "Reload with dark theme", expected: "No white flash before paint", starred: true },
  { id: "T5", case: "Contrast ratio, all four themes", expected: "Text ≥ 4.5:1, UI ≥ 3:1", starred: true },
  { id: "T6", case: "prefers-color-scheme: dark, no user preference", expected: "Dark applied" },
  { id: "T7", case: "prefers-contrast: more", expected: "High contrast applied" },
  { id: "T8", case: "formatINR(12345678.9)", expected: "₹1,23,45,678.90", starred: true },
  { id: "T9", case: "formatINRCompact(12345678)", expected: "₹1.23 Cr" },
  { id: "T10", case: "Negative compact value", expected: "−₹1.23 Cr, not ₹-1.23 Cr" },
  { id: "T11", case: "Every DOCUMENT_STATUS entry", expected: "Has label, tone and icon", starred: true },
  { id: "T12", case: "Tabular figures in a numeric column", expected: "Digits align vertically", starred: true },
];

export const shellTests: TestCase[] = [
  { id: "S1", case: "Menu for a user without finance permissions", expected: "No finance node, no empty parent", starred: true },
  { id: "S2", case: "Two users, same screen", expected: "Different menus", starred: true },
  { id: "S3", case: "Switch project", expected: "Caches invalidated, menu refetched, permissions re-validated", starred: true },
  { id: "S4", case: "Switch to an unassigned project via direct API call", expected: "403", starred: true },
  { id: "S5", case: "Permission revoked while logged in", expected: "Menu updates on next navigation", starred: true },
  { id: "S6", case: "Impersonated session", expected: "Banner visible on every route", starred: true },
  { id: "S7", case: "/shell/menu fails", expected: "Shell renders with retry; page still usable", starred: true },
  { id: "S8", case: "All five states in a data region", expected: "Each renders correctly", starred: true },
  { id: "S9", case: "Keyboard navigation through shell", expected: "Full traversal, visible focus", starred: true },
  { id: "S10", case: "Axe scan, all four themes", expected: "Zero critical or serious", starred: true },
];

export const completionChecklist: ChecklistCategory[] = [
  {
    category: "Licensing",
    items: [
      "@sap-theming/theming-base-content licence verified and recorded in ADR-008 ★",
      "The '72' typeface is not shipped — code and asset search confirms ★",
      "SAP logo and icon font not used anywhere ★",
      "The application has its own name and logo ★",
    ],
  },
  {
    category: "Tokens",
    items: [
      "Token file generated from the package, not hand-transcribed ★",
      "All four themes complete",
      "Every token used is defined; build check passes ★",
      "Lint rejects hex literals outside token files ★",
      "Contrast verified in all four themes ★",
      "Tabular figures confirmed in numeric contexts ★",
    ],
  },
  {
    category: "Formatting",
    items: [
      "Lakh/crore grouping correct for values up to 999 crore ★",
      "Compact format on tiles only; lint flags it in table cells ★",
      "Negative values render with a proper minus sign",
    ],
  },
  {
    category: "Theme engine",
    items: [
      "Resolution order correct; system preference respected",
      "No flash of unstyled or wrong-theme content ★",
      "dx_user_preference created; migration down verified ★",
    ],
  },
  {
    category: "Shell",
    items: [
      "Menu is server-driven; client performs no filtering ★",
      "Context switch re-validates server-side and invalidates caches ★",
      "Unassigned project refused at the API ★",
      "Impersonation banner persistent and unmissable ★",
      "Shell degrades gracefully when the menu request fails ★",
      "All five page templates built",
      "All five states implemented and demonstrated ★",
    ],
  },
  {
    category: "Accessibility",
    items: [
      "Axe clean on shell routes in all four themes ★",
      "Full keyboard traversal with visible focus ★",
      "Status never conveyed by colour alone ★",
      "200% zoom usable",
    ],
  },
  {
    category: "Final confirmation",
    items: [
      "No existing table, column, relationship or row was altered. ★",
    ],
  },
];
