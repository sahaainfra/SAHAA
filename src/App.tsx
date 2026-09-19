import { useState } from "react";
import {
  defects,
  capabilityOwners,
  rules,
  preservedCapabilities,
  duplicateCoverage,
  dualSpecifiedCapabilities,
  verificationChecks,
} from "./data/content";
import PartIndex from "./components/PartIndex";
import BuildConventions from "./components/BuildConventions";
import Part01 from "./components/Part01";
import Part02 from "./components/Part02";
import Part03 from "./components/Part03";
import Part04 from "./components/Part04";
import Part05A from "./components/Part05A";
import Part05B from "./components/Part05B";
import Part06 from "./components/Part06";
import Part07 from "./components/Part07";

function SectionHeader({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6 scroll-mt-20 border-b-2 border-blue-600 pb-3"
    >
      {children}
    </h2>
  );
}

function SubHeader({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3
      id={id}
      className="text-xl font-semibold text-gray-800 mt-8 mb-4 scroll-mt-20"
    >
      {children}
    </h3>
  );
}

function Badge({ children, variant = "blue" }: { children: React.ReactNode; variant?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-800",
    purple: "bg-purple-100 text-purple-800",
    gray: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant] || colors.blue}`}>
      {children}
    </span>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "part-index", label: "Part Index (174)", icon: "📑" },
    { id: "conventions", label: "Build Conventions", icon: "📐" },
    { id: "part-01", label: "Part 0.1", icon: "🏗️" },
    { id: "part-02", label: "Part 0.2", icon: "🗄️" },
    { id: "part-03", label: "Part 0.3", icon: "⚙️" },
    { id: "part-04", label: "Part 0.4", icon: "🔐" },
    { id: "part-05a", label: "Part 0.5A", icon: "🛡️" },
    { id: "part-05b", label: "Part 0.5B", icon: "🔒" },
    { id: "part-06", label: "Part 0.6", icon: "📝" },
    { id: "part-07", label: "Part 0.7", icon: "🎨" },
    { id: "defects", label: "Structural Defects", icon: "⚠️" },
    { id: "preserved", label: "What's Preserved", icon: "✅" },
    { id: "capability", label: "Capability Register", icon: "📦" },
    { id: "verification", label: "Verification", icon: "🔍" },
    { id: "phases", label: "Phase Map", icon: "🗺️" },
    { id: "delivery", label: "Delivery Plan", icon: "📦" },
    { id: "rules", label: "Non-Negotiable Rules", icon: "🔒" },
    { id: "feeding", label: "How to Feed a Part", icon: "🤖" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold text-gray-900">Construction ERP</span>
        <div className="w-10" />
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 ease-in-out overflow-y-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">Construction ERP</h1>
              <p className="text-xs text-gray-500">Master Plan v2.0</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${activeSection === item.id
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="p-4 mx-4 mb-4 mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <p className="text-xs font-semibold text-blue-900 mb-1">Total Parts</p>
          <p className="text-3xl font-bold text-blue-700">174</p>
          <p className="text-xs text-blue-600 mt-1">across 23 phases</p>
        </div>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Date: 19 September 2026
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supersedes all previous volumes
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-72 pt-16 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Hero */}
          <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-8 md:p-12 text-white mb-12 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="amber">READ FIRST</Badge>
              <Badge variant="purple">MASTER PLAN</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Complete Rebuild of the Construction ERP Prompt Series
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              From Part 0 — a dependency-ordered, mechanically verifiable, single-owner specification for 174 build parts.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold">174</p>
                <p className="text-xs text-blue-200">Total Parts</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-blue-200">Phases</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold">9</p>
                <p className="text-xs text-blue-200">Defects Fixed</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold">48</p>
                <p className="text-xs text-blue-200">Capabilities Owned</p>
              </div>
            </div>
          </div>

          {/* Section: Overview */}
          <section id="overview">
            <SectionHeader id="overview">1. Why a Full Rebuild Was Necessary</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-6">
              The previous series was written as four volumes over several sessions. Each was internally
              coherent. Together they were not. Nine specific defects made the later parts unbuildable, and
              all nine are structural — no amount of rewriting individual parts would have fixed them.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
              <p className="text-amber-900 font-medium text-sm">
                ⚡ The previous series compressed the same scope into 46 parts. That compression is precisely
                why the later parts could not be built. The new series expands to 174 parts at implementable granularity.
              </p>
            </div>
          </section>

          {/* Section: Part Index */}
          <section id="part-index">
            <SectionHeader id="part-index">2. Part Index — All 174 Parts</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-2">
              Dependency-ordered. Part N never depends on Part N+1. Every part is a day or two of work with a verifiable checklist.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              <strong>Legend:</strong> ‖ = may run in parallel with the previous part (different developer) · ★ = highest defect risk, assign deliberately · Days = one developer, including testing.
            </p>
            <PartIndex />
          </section>

          {/* Section: Build Conventions */}
          <section id="conventions">
            <SectionHeader id="conventions">3. Build Conventions</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-4">
              Applies to every one of the 174 parts. Read once; referenced by all. This document holds everything shared, so individual parts do not repeat it.
            </p>
            <BuildConventions />
          </section>

          {/* Section: Part 0.1 */}
          <section id="part-01">
            <SectionHeader id="part-01">4. Part 0.1 — Environment, Repository & Project Skeleton</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-4">
              Phase 0 — Foundation · Part 1 of 8 · Estimated 1 day. Establish a working development environment where a developer can clone, install, run the existing application, run the new code alongside it, and have CI reject any migration that touches an existing table.
            </p>
            <Part01 />
          </section>

          {/* Section: Part 0.2 */}
          <section id="part-02">
            <SectionHeader id="part-02">5. Part 0.2 — Database Baseline & Legacy Adapter Layer</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-4">
              Phase 0 — Foundation · Part 2 of 8 · Estimated 3 days · ★ Highest-consequence part in Phase 0. Produce a complete, verified, written record of the existing database, and a code layer through which all access to it flows.
            </p>
            <Part02 />
          </section>

          {/* Section: Part 0.3 */}
          <section id="part-03">
            <SectionHeader id="part-03">6. Part 0.3 — Platform Core: Transactions, Money, API Envelope, Errors</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-4">
              Phase 0 — Foundation · Part 3 of 8 · Estimated 2 days. Establish the transaction boundary, monetary arithmetic and API contract that all 171 remaining parts use, so that no part invents its own.
            </p>
            <Part03 />
          </section>

          {/* Section: Part 0.4 */}
          <section id="part-04">
            <SectionHeader id="part-04">7. Part 0.4 — Authentication, Session & MFA</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-4">
              Phase 0 — Foundation · Part 4 of 9 · Estimated 1.5 days. Let a user prove who they are, hold that proof safely for the length of a working session, and require a second factor from anyone whose account can cause irreversible damage.
            </p>
            <Part04 />
          </section>

          {/* Section: Part 0.5A */}
          <section id="part-05a">
            <SectionHeader id="part-05a">8. Part 0.5A — Permission Model & Resolver</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-4">
              Phase 0 — Foundation · Part 5A of 9 · Estimated 2 days · ★ Most security-critical part in the series. Resolve, for any user, the complete set of things they may do — globally and per project — including their approval authority, their row-level scope, their field restrictions and any delegation they hold.
            </p>
            <Part05A />
          </section>

          {/* Section: Part 0.5B */}
          <section id="part-05b">
            <SectionHeader id="part-05b">9. Part 0.5B — Permission Enforcement & Administration Console</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-4">
              Phase 0 — Foundation · Part 5B of 9 · Estimated 2 days · ★ Security-critical. Make every route, every query, every field and every action obey the permission set — so that removing a control from the UI is never what protects anything.
            </p>
            <Part05B />
          </section>

          {/* Section: Part 0.6 */}
          <section id="part-06">
            <SectionHeader id="part-06">10. Part 0.6 — Audit Trail & Transactional Outbox</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-4">
              Phase 0 — Foundation · Part 6 of 9 · Estimated 1.5 days. Record every consequential change in a tamper-evident chain, and publish every domain event exactly once, both atomically with the change itself.
            </p>
            <Part06 />
          </section>

          {/* Section: Part 0.7 */}
          <section id="part-07">
            <SectionHeader id="part-07">11. Part 0.7 — Design Tokens, Theme Engine & Application Shell</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-4">
              Phase 0 — Foundation · Part 7 of 9 · Estimated 2 days. Establish one visual language — tokens, themes, shell, navigation, states — so that the hundred-plus screens built in later phases look and behave as one application rather than twelve.
            </p>
            <Part07 />
          </section>

          {/* Section: Defects */}
          <section id="defects">
            <SectionHeader id="defects">12. The Nine Structural Defects (from Master Plan)</SectionHeader>
            <p className="text-gray-600 mb-8">
              Each defect is identified, explained, and resolved. No defect is cosmetic — all are structural.
            </p>

            <div className="space-y-6">
              {defects.map((defect) => (
                <div
                  key={defect.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-700 font-bold text-sm">
                      {defect.id}
                    </span>
                    <h4 className="font-semibold text-gray-900">{defect.title}</h4>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">{defect.description}</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm">
                        <span className="font-semibold text-green-800">Resolution: </span>
                        <span className="text-green-700">{defect.resolution}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dual-specified capabilities table */}
            <SubHeader id="dual-spec">Capabilities Specified Twice</SubHeader>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Capability</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Concept In</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Implementation In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dualSpecifiedCapabilities.map((item) => (
                    <tr key={item.capability} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.capability}</td>
                      <td className="px-4 py-3 text-gray-600">{item.concept}</td>
                      <td className="px-4 py-3 text-gray-600">{item.implementation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Duplicate coverage table */}
            <SubHeader id="duplicates">Genuine Duplicate Coverage</SubHeader>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Subject</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Appeared In</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Overlap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {duplicateCoverage.map((item) => (
                    <tr key={item.subject} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.subject}</td>
                      <td className="px-4 py-3 text-gray-600">{item.appeared}</td>
                      <td className="px-4 py-3 text-gray-600">{item.overlap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section: Preserved */}
          <section id="preserved">
            <SectionHeader id="preserved">13. What Is Preserved</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>Everything functional.</strong> No capability has been dropped. The following are all retained from the previous series:
            </p>
            <div className="grid gap-3">
              {preservedCapabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="text-sm text-gray-700">{cap}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-sm text-blue-800">
                <strong>Part 20 rebuild</strong> (17 files, HR/Attendance/Payroll) is carried forward largely intact as Phase 3 — its format is the one this whole series now follows.
              </p>
            </div>
          </section>

          {/* Section: Capability Register */}
          <section id="capability">
            <SectionHeader id="capability">14. Capability Ownership Register</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-4">
              One owner per capability. Every other part calls the owner's published interface.
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-indigo-800">
                <strong>The rule:</strong> if you are about to write code for a capability you do not own, stop. Call the owner instead. If the owner's interface does not do what you need, extend the owner — do not fork it into your module.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Capability</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Owner</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Interface</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {capabilityOwners.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.capability}</td>
                      <td className="px-4 py-3">
                        <Badge variant="purple">{item.owner}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.interface}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section: Verification */}
          <section id="verification">
            <SectionHeader id="verification">15. How the Sequence Was Verified</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-6">
              Before writing any part, the full dependency graph was built and checked through six mechanical verifications:
            </p>
            <div className="space-y-4">
              {verificationChecks.map((check) => (
                <div key={check.step} className="flex gap-4 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    {check.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{check.name}</h4>
                    <p className="text-sm text-gray-600">{check.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-gray-100 border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-700">
                <strong>Output:</strong> <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">03_DEPENDENCY_MAP.md</code> — If you change the order, re-run the check. The graph is the contract.
              </p>
            </div>
          </section>

          {/* Section: Phase Map */}
          <section id="phases">
            <SectionHeader id="phases">16. The Phase Map</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-4">
              174 parts organized into 23 phases, strictly dependency-ordered. Phases 0 and 1 are 18 parts and roughly 25–30% of total effort. The full interactive Part Index with all details is in <a href="#part-index" className="text-blue-600 hover:text-blue-800 underline font-medium">Section 2</a>.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-sm text-blue-800">
                <strong>Do not compress Phases 0 and 1.</strong> Every module built before the engines exist will be rewritten. The previous 46-part series implied roughly half the effort of this 174-part plan — the gap between the two numbers is exactly the detail that was missing when the build stalled.
              </p>
            </div>
          </section>

          {/* Section: Delivery */}
          <section id="delivery">
            <SectionHeader id="delivery">17. What Is Delivered Now</SectionHeader>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-green-500">📦</span> Now
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    This plan
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    The part index
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    The build conventions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    The dependency map
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Phase 0 complete (8 parts)
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-blue-500">→</span> Next, in order
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">1.</span>
                    Phase 1 (10 parts)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">2.</span>
                    Phase 2 (9 parts)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">3.</span>
                    Phase 3 onward
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5">
              <h4 className="font-semibold text-red-900 mb-2">Why not everything at once</h4>
              <p className="text-sm text-red-800">
                174 parts is roughly 5 million characters. Delivered in one block it would be unreviewable, and any structural error would propagate through all of it before you found it. Phase 0 is the foundation everything else stands on; if its conventions are wrong for your codebase, correcting now costs one day and correcting later costs months.
              </p>
            </div>

            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">After building Phase 0, report four things:</h4>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">1</span>
                  <p className="text-sm text-gray-700">Did Part 0.2's inspection run against your real database, and does <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">SCHEMA_BASELINE.md</code> accurately describe it?</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">2</span>
                  <p className="text-sm text-gray-700">Did the stack in Part 0.1 match what you already have, or did you have to translate?</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">3</span>
                  <p className="text-sm text-gray-700">Were the conventions in <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">02_BUILD_CONVENTIONS.md</code> compatible with your existing code style?</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">4</span>
                  <p className="text-sm text-gray-700">Did anything in Phase 0 conflict with code you have already written?</p>
                </li>
              </ol>
              <p className="mt-4 text-sm text-gray-600 italic">
                Those answers determine whether Phase 1 ships as written or adjusted.
              </p>
            </div>
          </section>

          {/* Section: Rules */}
          <section id="rules">
            <SectionHeader id="rules">18. The Four Non-Negotiable Rules</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-6">
              Unchanged, and they govern every part.
            </p>
            <div className="space-y-6">
              {rules.map((rule) => (
                <div key={rule.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-bold text-lg">
                      {rule.id}
                    </span>
                    <h4 className="font-bold text-gray-900 text-lg">{rule.title}</h4>
                  </div>
                  <div className="px-6 py-5">
                    <p className="text-gray-700 leading-relaxed mb-3">{rule.description}</p>
                    {rule.exception && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-3">
                        <p className="text-sm text-amber-800">
                          <span className="font-semibold">Exception process: </span>
                          {rule.exception}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Feeding */}
          <section id="feeding">
            <SectionHeader id="feeding">19. How to Feed a Part to the Coding AI</SectionHeader>
            <p className="text-gray-700 leading-relaxed mb-6">
              Paste this before the part's content:
            </p>
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg overflow-x-auto">
              <pre className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap font-mono">
{`> This is Part {N} of a 174-part build of a construction ERP.
>
> Parts already completed are recorded in SYSTEM_MAP.md,
> API_REGISTRY.md and DB_CHANGELOG.md. Read those first,
> plus SCHEMA_BASELINE.md for the existing database.
>
> The four non-negotiable rules in
> 00_READ_FIRST_MASTER_PLAN.md §7 apply without exception.
> Conventions in 02_BUILD_CONVENTIONS.md apply to all code
> you write.
>
> Work through the part in the order given. Complete Step 1
> (INSPECT) and show me its output before writing any code.
> Do not skip to implementation.
>
> If anything in this part conflicts with code that already
> exists, stop and tell me the conflict rather than choosing
> for yourself.`}
              </pre>
            </div>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-sm text-blue-800">
                <strong>The last two instructions matter most.</strong> Both failure modes in the previous attempt — code written against an assumed schema, and silent resolution of conflicts — are prevented by them.
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Construction ERP Master Plan — 19 September 2026
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supersedes Volume I (Parts 1–10), Volume II (Parts 11–24), Volume II-B (Parts 25–29),
              Volume III (Parts 30–44), supplements 45–46, and the Part 20 rebuild.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
