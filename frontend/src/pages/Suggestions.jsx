import { useEffect, useState } from "react";
import { Copy, Check, CheckCircle2, ChevronDown, ChevronUp, Inbox } from "lucide-react";
import Badge from "../components/ui/Badge.jsx";

/* ── helpers ────────────────────────────────────────────────────── */

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

function normaliseSuggestions(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((s, i) => {
    const rawPriority = s.priority ?? "medium";
    const priority =
      rawPriority.charAt(0).toUpperCase() +
      rawPriority.slice(1).toLowerCase();

    // API fields:
    //   issue        → the problem headline
    //   suggestion   → what to do (shown as sub-text if needed)
    //   original_text → before (may be null)
    //   improved_text → after
    return {
      id:       s.id ?? `sg-${i}`,
      priority: ["High", "Medium", "Low"].includes(priority) ? priority : "Medium",
      category: s.category ?? "General",
      issue:    s.issue ?? "Improvement suggestion",
      hint:     s.suggestion ?? "",           // "what to do" line
      original: s.original_text ?? s.originalText ?? s.current ?? null,
      improved: s.improved_text ?? s.improvedText ?? s.recommended ?? null,
      status:   "pending",
    };
  });
}

const PRIORITY_TONE = { High: "red", Medium: "amber", Low: "violet" };

const ALL_FILTERS = ["All", "High", "Medium", "Low"];

/* ── SuggestionCard ─────────────────────────────────────────────── */

function SuggestionCard({ sg, onApply, onDismiss, onCopy, copiedId }) {
  const [expanded, setExpanded] = useState(false);

  if (sg.status === "dismissed") return null;

  const hasContent = sg.improved; // original can be null; improved is enough to show the panel

  return (
    <div
      className={`ra-card overflow-hidden transition-all duration-200 ${
        sg.status === "applied" ? "opacity-70" : ""
      }`}
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone={PRIORITY_TONE[sg.priority]}>{sg.priority}</Badge>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: "var(--paper)", color: "var(--ink-soft)", border: "1px solid var(--line)" }}
            >
              {sg.category}
            </span>
          </div>
          {sg.status === "applied" && (
            <span
              className="flex items-center gap-1 text-xs font-semibold shrink-0"
              style={{ color: "#0A8F71" }}
            >
              <CheckCircle2 size={13} /> Applied
            </span>
          )}
        </div>

        {/* Issue headline */}
        <p className="text-sm font-medium mt-3 leading-snug">{sg.issue}</p>

        {/* What-to-do hint (suggestion field) */}
        {sg.hint && (
          <p className="text-xs text-[var(--ink-soft)] mt-1 leading-relaxed">{sg.hint}</p>
        )}

        {/* Expand toggle */}
        {hasContent && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-xs font-semibold mt-3"
            style={{ color: "var(--violet)" }}
          >
            {expanded ? (
              <><ChevronUp size={13} /> Hide comparison</>
            ) : (
              <><ChevronDown size={13} /> View before / after</>
            )}
          </button>
        )}
      </div>

      {/* Before / After panel */}
      {expanded && hasContent && (
        <div className="border-t grid grid-cols-1 sm:grid-cols-2" style={{ borderColor: "var(--line)" }}>
          {/* Before */}
          <div
            className="p-4 sm:border-r"
            style={{ borderColor: "var(--line)", background: "var(--red-soft)" }}
          >
            <div
              className="ra-mono text-[10px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: "#C43D3D" }}
            >
              Before
            </div>
            <p className="text-xs leading-relaxed text-[var(--ink)] whitespace-pre-wrap">
              {sg.original ?? <span className="italic text-[var(--ink-soft)]">Not provided</span>}
            </p>
          </div>

          {/* After */}
          <div className="p-4" style={{ background: "var(--scan-soft)" }}>
            <div
              className="ra-mono text-[10px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: "#0A8F71" }}
            >
              After (AI suggestion)
            </div>
            <p className="text-xs leading-relaxed text-[var(--ink)] whitespace-pre-wrap">
              {sg.improved ?? <span className="italic text-[var(--ink-soft)]">Not provided</span>}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div
        className="px-5 py-3 flex items-center gap-2 flex-wrap border-t"
        style={{ borderColor: "var(--line)", background: "var(--paper)" }}
      >
        <button
          disabled={sg.status === "applied"}
          onClick={() => onApply(sg.id)}
          className="ra-btn-primary text-xs px-3.5 py-1.5 rounded-lg disabled:opacity-40"
        >
          {sg.status === "applied" ? "Applied" : "Mark applied"}
        </button>

        {sg.improved && (
          <button
            onClick={() => onCopy(sg.id, sg.improved)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg"
            style={{ background: "var(--violet-soft)", color: "var(--violet)" }}
          >            {copiedId === sg.id ? <Check size={12} /> : <Copy size={12} />}
            {copiedId === sg.id ? "Copied" : "Copy text"}
          </button>
        )}

        <button
          onClick={() => onDismiss(sg.id)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

/* ── main page ──────────────────────────────────────────────────── */

export default function Suggestions({ apiSuggestions = [] }) {
  const [suggestions, setSuggestions] = useState(() =>
    normaliseSuggestions(apiSuggestions)
  );

  useEffect(() => {
    setSuggestions(normaliseSuggestions(apiSuggestions));
  }, [apiSuggestions]);

  const [filter, setFilter] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  const apply = (id) =>
    setSuggestions((s) => s.map((x) => (x.id === id ? { ...x, status: "applied" } : x)));
  const dismiss = (id) =>
    setSuggestions((s) => s.map((x) => (x.id === id ? { ...x, status: "dismissed" } : x)));
  const copy = (id, text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  // Build category filter chips dynamically from data
  const categories = [
    ...new Set(suggestions.map((s) => s.category).filter(Boolean)),
  ];
  const filterChips = [...ALL_FILTERS, ...categories.filter((c) => !ALL_FILTERS.includes(c))];

  const visible = suggestions
    .filter((s) => {
      if (s.status === "dismissed") return false;
      if (filter === "All") return true;
      if (filter === "High" || filter === "Medium" || filter === "Low")
        return s.priority === filter;
      return s.category === filter;
    })
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99));

  const pendingCount = suggestions.filter((s) => s.status === "pending").length;
  const appliedCount = suggestions.filter((s) => s.status === "applied").length;
  const totalCount = suggestions.filter((s) => s.status !== "dismissed").length;

  /* ── empty state (no suggestions from API) ── */
  if (suggestions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-16 flex flex-col items-center text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: "var(--violet-soft)" }}
        >
          <Inbox size={26} color="var(--violet)" />
        </div>
        <h2 className="ra-display text-xl font-bold mb-2">No suggestions yet</h2>
        <p className="text-sm text-[var(--ink-soft)] max-w-xs leading-relaxed">
          Analyze a resume first — AI-generated suggestions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8 lg:py-10">
      {/* Header */}
      <div className="ra-fade-up mb-6">
        <h1 className="ra-display text-2xl font-bold mb-1">AI Suggestions</h1>
        <div className="flex items-center gap-3 flex-wrap text-sm text-[var(--ink-soft)]">
          <span>{totalCount} suggestion{totalCount !== 1 ? "s" : ""}</span>
          {appliedCount > 0 && (
            <>
              <span>·</span>
              <span style={{ color: "#0A8F71" }}>{appliedCount} applied</span>
            </>
          )}
          {pendingCount > 0 && (
            <>
              <span>·</span>
              <span>{pendingCount} remaining</span>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div
          className="ra-fade-up h-1.5 rounded-full overflow-hidden mb-6"
          style={{ background: "var(--line)", animationDelay: "60ms" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(appliedCount / totalCount) * 100}%`,
              background: "var(--scan)",
            }}
          />
        </div>
      )}

      {/* Filter chips */}
      <div
        className="ra-fade-up flex gap-2 overflow-x-auto ra-scrollbar pb-1 mb-6 -mx-1 px-1"
        style={{ animationDelay: "80ms" }}
      >
        {filterChips.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full whitespace-nowrap transition-colors duration-150"
            style={{
              background: filter === f ? "var(--ink)" : "var(--panel)",
              color: filter === f ? "#fff" : "var(--ink-soft)",
              border: "1px solid var(--line)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="ra-card p-10 text-center">
            <p className="text-sm text-[var(--ink-soft)]">
              No suggestions match this filter.
            </p>
          </div>
        ) : (
          visible.map((sg) => (
            <SuggestionCard
              key={sg.id}
              sg={sg}
              onApply={apply}
              onDismiss={dismiss}
              onCopy={copy}
              copiedId={copiedId}
            />
          ))
        )}
      </div>
    </div>
  );
}
