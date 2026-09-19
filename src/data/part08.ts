export interface Dependency {
  part: string;
  provides: string;
  blocking: string;
}

export interface Prerequisite {
  text: string;
  starred?: boolean;
}

export interface Deliverable {
  text: string;
}

export interface WorkingContext {
  context: string;
  who: string;
  conditions: string;
}

export interface InspectionCommand {
  title: string;
  code: string;
  language: string;
}

export interface ReportQuestion {
  question: string;
  answer: string;
}

export interface ReuseCheckItem {
  searchFor: string;
  ifFound: string;
  ifNot: string;
}

export interface Breakpoint {
  name: string;
  value: number;
  description: string;
}

export interface NavigationPattern {
  device: string;
  pattern: string;
}

export interface BottomTabSlot {
  slot: string;
  destination: string;
}

export interface ColumnLayout {
  width: string;
  behaviour: string;
}

export interface DensityMode {
  mode: string;
  rowHeight: string;
  baseFont: string;
  defaultOn: string;
}

export interface CacheStrategy {
  resource: string;
  strategy: string;
}

export interface DeviceCapability {
  capability: string;
  rules: string;
}

export interface PerformanceMetric {
  metric: string;
  desktop: string;
  tablet: string;
  phone: string;
}

export interface DocumentedException {
  number: number;
  function: string;
  reason: string;
}

export interface AutomatedTest {
  id: string;
  case: string;
  expected: string;
  starred?: boolean;
}

export interface ManualTest {
  id: string;
  case: string;
  expected: string;
  starred?: boolean;
}

export interface ChecklistCategory {
  category: string;
  items: string[];
}

export const dependencies: Dependency[] = [
  { part: "0.7", provides: "Tokens, themes, shell, page templates, states", blocking: "Yes" },
  { part: "0.5B", provides: "/shell/menu for adaptive navigation", blocking: "Yes" },
];

export const prerequisites: Prerequisite[] = [
  { text: "Part 0.7 checklist passed; all four themes render, axe clean" },
  { text: "The shell works on a desktop browser" },
  { text: "At least one real Android phone, one iPhone and one tablet available for testing — emulators are not sufficient for this part", starred: true },
];

export const deliverables: Deliverable[] = [
  { text: "The breakpoint system" },
  { text: "Adaptive navigation including the phone bottom bar" },
  { text: "The flexible column layout" },
  { text: "Density modes" },
  { text: "The accessibility baseline" },
  { text: "The offline outbox skeleton" },
  { text: "The PWA installation" },
];

export const workingContexts: WorkingContext[] = [
  { context: "Desktop", who: "Management, finance, commercial, QS, procurement, admin", conditions: "Large screen, mouse, stable network, long sessions" },
  { context: "Tablet", who: "Site engineer, QA/QC, HSE, store keeper, client rep", conditions: "9–12\", touch, patchy 4G, gloves, glare" },
  { context: "Phone", who: "Site staff, supervisors, drivers, approvers", conditions: "5–7\", one thumb, poor network, sunlight, dust" },
];

export const inspectionCommands: InspectionCommand[] = [
  {
    title: "1.1 Existing breakpoints",
    language: "bash",
    code: `grep -rn "@media\\|screens:" --include=*.{css,scss,js,ts} ../existing-erp/src dx/web/ | head -30`,
  },
  {
    title: "1.2 Fixed widths",
    language: "bash",
    code: `grep -rn "width:\\s*[0-9]\\{3,\\}px\\|min-width:\\s*[0-9]\\{3,\\}px" \\
  --include=*.{css,scss} ../existing-erp/src | head -30`,
  },
  {
    title: "1.3 Viewport meta",
    language: "bash",
    code: `grep -rn "viewport" ../existing-erp/**/index.html dx/web/index.html`,
  },
  {
    title: "1.4 Any existing PWA artefacts",
    language: "bash",
    code: `find . -name "manifest.json" -o -name "sw.js" -o -name "service-worker.js" | grep -v node_modules`,
  },
];

export const reportQuestions: ReportQuestion[] = [
  { question: "Existing breakpoint values", answer: "" },
  { question: "Count of fixed-width rules", answer: "" },
  { question: "Viewport meta present and correct?", answer: "" },
  { question: "Existing PWA or service worker?", answer: "" },
  { question: "Which roles will genuinely work on phones?", answer: "" },
];

export const reuseChecks: ReuseCheckItem[] = [
  { searchFor: "Tailwind screens config", ifFound: "Generate it from the breakpoint source (§4.1)", ifNot: "Configure from source" },
  { searchFor: "Existing useMediaQuery hook", ifFound: "Reuse if it reads from the same source", ifNot: "Build per §4.2" },
  { searchFor: "Workbox", ifFound: "Reuse for the service worker", ifNot: "Add Workbox" },
  { searchFor: "IndexedDB wrapper (idb, Dexie)", ifFound: "Reuse", ifNot: "Add idb" },
];

export const breakpoints: Breakpoint[] = [
  { name: "xs", value: 0, description: "phone portrait" },
  { name: "s", value: 600, description: "phone landscape / small tablet" },
  { name: "m", value: 900, description: "tablet" },
  { name: "l", value: 1280, description: "desktop" },
  { name: "xl", value: 1680, description: "large desktop" },
];

export const breakpointsSourceTS = `// dx/web/src/design/breakpoints.source.ts — THE single source of truth
export const BREAKPOINTS = {
  xs: 0,      // phone portrait
  s:  600,    // phone landscape / small tablet
  m:  900,    // tablet
  l:  1280,   // desktop
  xl: 1680,   // large desktop
} as const;

export const MIN_VIEWPORT = { width: 320, height: 568 };`;

export const breakpointsGeneratedCSS = `/* GENERATED */
@custom-media --dx-s  (min-width: 600px);
@custom-media --dx-m  (min-width: 900px);
@custom-media --dx-l  (min-width: 1280px);
@custom-media --dx-xl (min-width: 1680px);
@custom-media --dx-touch (hover: none) and (pointer: coarse);`;

export const navigationPatterns: NavigationPattern[] = [
  { device: "Desktop (l, xl)", pattern: "Shell bar + expanded side navigation, pinnable" },
  { device: "Tablet (m)", pattern: "Shell bar + icon rail; tap expands as overlay; auto-collapses on selection" },
  { device: "Phone (xs, s)", pattern: "Reduced shell bar + bottom tab bar, 5 fixed slots" },
];

export const bottomTabSlots: BottomTabSlot[] = [
  { slot: "Home", destination: "Role dashboard" },
  { slot: "Work", destination: "Approvals + tasks + exceptions combined; badge shows total actionable" },
  { slot: "Create", destination: "Centre action; opens the permitted-create sheet (§5.2)" },
  { slot: "Search", destination: "Permission-aware global search" },
  { slot: "More", destination: "Full module tree, notifications, profile, settings, offline queue" },
];

export const bottomNavExample = `<nav className="dx-bottom-nav" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
  {/* five slots; hides on scroll down, reappears on scroll up */}
</nav>`;

export const columnLayouts: ColumnLayout[] = [
  { width: "xl", behaviour: "Three columns available: list / detail / sub-detail, resizable, state persisted" },
  { width: "l", behaviour: "Two columns: list 33% / detail 67%; detail expandable to full width" },
  { width: "m", behaviour: "List or detail with a back affordance; detail may open as an overlay" },
  { width: "xs, s", behaviour: "Full-screen navigation stack; detail is a pushed route" },
];

export const densityModes: DensityMode[] = [
  { mode: "Cozy", rowHeight: "48px", baseFont: "16px", defaultOn: "Touch devices" },
  { mode: "Compact", rowHeight: "32px", baseFont: "14px", defaultOn: "Desktop, data-heavy pages" },
  { mode: "Condensed", rowHeight: "28px", baseFont: "13px", defaultOn: "Opt-in; desktop only; QS and finance power users" },
];

export const pwaManifest = `{
  "name": "<Your ERP Name>",
  "short_name": "<Short>",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#f5f6f7",
  "theme_color": "#354a5f",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}`;

export const cacheStrategies: CacheStrategy[] = [
  { resource: "App shell, fonts, icons, token CSS", strategy: "Cache-first, versioned; invalidated on deploy" },
  { resource: "Reference data for the active project", strategy: "Stale-while-revalidate, 24h freshness ceiling" },
  { resource: "All transactional reads", strategy: "Network-first; never served stale without a visible 'showing data from HH:MM' banner" },
  { resource: "All writes", strategy: "Never cached as success. They go through the outbox in §7.3" },
];

export const syncLogSQL = `CREATE TABLE dx_sync_log (
  id               BIGSERIAL PRIMARY KEY,
  local_id         UUID         NOT NULL,
  device_id        VARCHAR(100) NOT NULL,
  user_id          BIGINT       NOT NULL,
  project_id       BIGINT,
  entity_type      VARCHAR(80)  NOT NULL,
  server_record_id BIGINT,
  status           VARCHAR(20)  NOT NULL,   -- ACCEPTED | REJECTED | DUPLICATE | CONFLICT
  captured_at      TIMESTAMPTZ  NOT NULL,   -- device clock, as claimed
  received_at      TIMESTAMPTZ  NOT NULL,   -- server clock, authoritative
  clock_skew_sec   INTEGER,
  error_code       VARCHAR(80),
  error_message    TEXT,
  payload_hash     CHAR(64)     NOT NULL,
  CONSTRAINT uq_dx_sync_local UNIQUE (local_id)
);
CREATE INDEX ix_dx_sync_user ON dx_sync_log (user_id, received_at DESC);
CREATE INDEX ix_dx_sync_status ON dx_sync_log (status, received_at DESC);`;

export const offlineAllowedTS = `// The registry each site module adds to. Phase 0 registers nothing.
export interface OfflineEntitySpec {
  entityType: string;
  permission: PermissionKey;
  /** draft only, or a real record on sync */
  mode: 'DRAFT' | 'RECORD';
  maxAgeHours: number;
  resolver: SyncResolver;
}
export const OFFLINE_ALLOWED: Record<string, OfflineEntitySpec> = {};`;

export const syncServiceTS = `@Injectable()
export class SyncService {
  async submit(ctx: UowContext, batch: OfflineBatch): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const rec of batch.records.sort(byCapturedAt)) {
      // 1. Idempotency — may already have synced from another device
      const prior = await this.repo.byLocalId(ctx, rec.localId);
      if (prior) { results.push({ localId: rec.localId, status: 'DUPLICATE',
                                  serverId: prior.serverRecordId }); continue; }

      // 2. Allow-list
      const spec = OFFLINE_ALLOWED[rec.entityType];
      if (!spec) { results.push({ localId: rec.localId, status: 'REJECTED',
                                  error: 'ENTITY_NOT_OFFLINE_CAPABLE' }); continue; }

      // 3. Permission re-checked at SYNC time, not capture time
      if (!ctx.actor.can(spec.permission, rec.projectId)) {
        results.push({ localId: rec.localId, status: 'REJECTED',
                       error: 'PERMISSION_REVOKED_SINCE_CAPTURE' });
        continue;
      }

      // 4. Clock skew recorded, never trusted
      const skew = differenceInSeconds(ctx.now, rec.capturedAt);

      // 5. Entity-specific conflict resolution
      const resolution = await spec.resolver.resolve(ctx, rec);
      results.push(await this.apply(ctx, rec, resolution, skew));
    }
    return results;
  }
}`;

export const deviceCapabilities: DeviceCapability[] = [
  { capability: "Camera", rules: "Compress to ≤1600px long edge, ≤500KB; preserve EXIF GPS until the server reads it; retain the original server-side" },
  { capability: "GPS", rules: "Require accuracy ≤50m; store the accuracy with the reading; never silently accept a mocked location" },
  { capability: "QR / barcode", rules: "Barcode Detection API with a JS fallback" },
  { capability: "Biometric unlock", rules: "App re-entry only — never a substitute for authentication or approval authorisation" },
  { capability: "Push", rules: "Respects the Part 1.6 preference matrix; deep-links to the record" },
  { capability: "File picker", rules: "Same server-side type and size validation as desktop; no mobile bypass" },
];

export const performanceMetrics: PerformanceMetric[] = [
  { metric: "First Contentful Paint", desktop: "≤1.0s", tablet: "≤1.5s", phone: "≤2.0s" },
  { metric: "Largest Contentful Paint", desktop: "≤2.0s", tablet: "≤2.5s", phone: "≤3.0s" },
  { metric: "Time to Interactive", desktop: "≤2.5s", tablet: "≤3.5s", phone: "≤4.5s" },
  { metric: "Cumulative Layout Shift", desktop: "≤0.1", tablet: "≤0.1", phone: "≤0.1" },
  { metric: "Interaction to Next Paint", desktop: "≤200ms", tablet: "≤200ms", phone: "≤250ms" },
  { metric: "Initial JS (gzipped)", desktop: "≤350KB", tablet: "≤350KB", phone: "≤250KB" },
];

export const documentedExceptions: DocumentedException[] = [
  { number: 1, function: "Backup download and restore execution", reason: "These need a controlled environment, two-person approval and large file handling." },
  { number: 2, function: "Bulk approval of more than 5 items", reason: "Bulk financial approval on a small screen is a documented source of error. Single approvals work everywhere." },
  { number: 3, function: "Permission assignment editing and the matrix view", reason: "The matrix is inherently wide and the impact preview must be readable. Viewing effective permissions works on all devices." },
];

export const automatedTests: AutomatedTest[] = [
  { id: "R1", case: "Every route at 320px", expected: "scrollWidth <= clientWidth", starred: true },
  { id: "R2", case: "Visual regression at 375 / 768 / 1440, light and dark", expected: "No unintended change" },
  { id: "R3", case: "Axe on every route, all four themes", expected: "Zero critical or serious", starred: true },
  { id: "R4", case: "Touch target audit at touch breakpoints", expected: "None below 44×44", starred: true },
  { id: "R5", case: "Lighthouse against §8 budgets", expected: "Pass; build fails on regression", starred: true },
  { id: "R6", case: "CSS and JS breakpoints", expected: "Provably generated from one source", starred: true },
  { id: "R7", case: "Phone-critical route bundle", expected: "≤250KB gzipped", starred: true },
];

export const manualTests: ManualTest[] = [
  { id: "M1", case: "One low-end Android, one iPhone, one Android tablet, one iPad", expected: "Shell usable on all four" },
  { id: "M2", case: "Airplane mode: capture 10 records, restore connectivity", expected: "All 10 sync exactly once", starred: true },
  { id: "M3", case: "Force a duplicate submission of the same local_id", expected: "Rejected by the constraint", starred: true },
  { id: "M4", case: "Outdoor legibility with high-visibility toggle", expected: "Readable in direct sunlight", starred: true },
  { id: "M5", case: "One-thumb operability, five most common site tasks", expected: "All reachable" },
  { id: "M6", case: "Rotate mid-form", expected: "No data loss", starred: true },
  { id: "M7", case: "Receive a call mid-form, return", expected: "Draft restored" },
  { id: "M8", case: "Attempt a forbidden offline action", expected: "Blocked with a clear message", starred: true },
  { id: "M9", case: "Revoke a permission while the device is offline, then sync", expected: "Record rejected with the reason", starred: true },
  { id: "M10", case: "Set the device clock 20 minutes fast, capture, sync", expected: "Skew recorded; server time used", starred: true },
];

export const completionChecklist: ChecklistCategory[] = [
  {
    category: "Breakpoints",
    items: [
      "Defined once; CSS and JS provably generated from that source ★",
      "No route produces horizontal scroll at 320px — automated test green ★",
      "Components use container queries where they can be placed in resizable regions ★",
      "No user-agent sniffing for layout — code search confirms ★",
    ],
  },
  {
    category: "Navigation",
    items: [
      "Three modes work: expanded, icon rail, bottom tab bar",
      "Bottom bar respects safe-area insets ★",
      "Bottom bar never obscures a primary action — verified on a real phone ★",
      "Create sheet lists only permitted documents, server-resolved ★",
      "Flexible column layout at all four widths; URL reflects the visible object ★",
    ],
  },
  {
    category: "Density and accessibility",
    items: [
      "Three density modes; density never changes which data is shown",
      "All targets ≥44×44 on touch ★",
      "Axe clean on every route in all four themes ★",
      "Full keyboard traversal with visible focus ★",
      "prefers-reduced-motion respected; 200% zoom usable",
      "High-visibility toggle works and composes with high-contrast themes ★",
    ],
  },
  {
    category: "PWA and offline",
    items: [
      "Installs on Android and iOS; app shell loads offline ★",
      "Caching strategy matches §7.2 exactly; stale transactional data always banner-labelled ★",
      "Update bar appears on deploy",
      "dx_sync_log created; migration down verified ★",
      "OFFLINE_ALLOWED registry exists and is empty — no entity registered in Phase 0 ★",
      "Idempotency proven: same local_id twice creates one record ★",
      "Permission re-checked at sync, not capture ★",
      "Clock skew recorded; server time authoritative ★",
      "Rejected records visible in Sync Issues with server message and actions ★",
      "Cache wiped on logout, project change and 7-day inactivity ★",
      "Permission change forces reference re-fetch before further capture ★",
    ],
  },
  {
    category: "Performance",
    items: [
      "All §8 budgets met on real mid-range Android over throttled 3G ★",
      "Phone-critical bundle ≤250KB; finance bundle not loaded on site routes ★",
    ],
  },
  {
    category: "Discipline",
    items: [
      "Only the three §9 exceptions restrict any function by device ★",
      "Each shows an explanatory message, not a broken screen",
      "RESPONSIVE_MAP.md created",
      "All ten manual tests completed on real hardware and signed off ★",
    ],
  },
  {
    category: "Final confirmation",
    items: [
      "No existing table, column, relationship or row was altered. ★",
    ],
  },
];

export const phase0Acceptance = [
  "Two users with different project permissions log in on two browsers. Each sees a different menu. Neither can reach the other's project data by direct API call.",
  "A Super Admin cannot approve their own transaction.",
  "A change, its audit row and its event either all commit or all roll back.",
  "Every route at 320px, no horizontal scroll, axe clean.",
  "Ten records captured offline sync exactly once.",
  "DX_FEATURES_ENABLED=false returns the original application to its previous behaviour.",
  "The schema fingerprint is unchanged from the Part 0.2 baseline.",
];
