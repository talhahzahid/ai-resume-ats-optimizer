import { useEffect, useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Inbox } from "lucide-react";
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

    return {
      id:       s.id ?? `sg-${i}`,
      priority: ["High", "Medium", "Low"].includes(priority) ? priority : "Medium",
      category: s.category ?? "General",
      issue:    s.issue ?? "Improvement suggestion",
      hint:     s.suggestion ?? "",
      original: s.original_text ?? s.originalText ?? s.current ?? null,
      improved: s.improved_text ?? s.improvedText ?? s.recommended ?? null,
    };
  });
}

const PRIORITY_TONE = { High: "red", Medium: "amber", Low: "violet" };

const ALL_FILTERS = ["All", "High", "Medium", "Low"];

/* ── SuggestionCard ─────────────────────────────────────────────── */

function SuggestionCard({ sg, onCopy, copiedId }) {
  const [expanded, setExpanded] = useState(false);

  const hasContent = !!sg.improved;

  return (
    <div className="ra-card overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone={PRIORITY_TONE[sg.priority]}>{sg.priority}</Badge>
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{
                background: "var(--paper)",
                color: "var(--ink-soft)",
                border: "1px solid var(--line)",
              }}
            >
              {sg.category}
            </span>
          </div>

          {/* Copy button — top right, visible when improved text exists */}
          {sg.improved && (
            <button
              onClick={() => onCopy(sg.id, sg.improved)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors duration-150"
              style={{ background: "var(--violet-soft)", color: "var(--violet)" }}
            >
              {copiedId === sg.id ? <Check size={12} /> : <Copy size={12} />}
              {copiedId === sg.id ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        {/* Issue headline */}
        <p className="text-sm font-semibold mt-3 leading-snug text-[var(--ink)]">
          {sg.issue}
        </p>

        {/* What-to-do hint */}
        {sg.hint && (
          <p className="text-xs text-[var(--ink-soft)] mt-1.5 leading-relaxed">
            {sg.hint}
          </p>
        )}

        {/* Expand toggle */}
        {hasContent && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-xs font-semibold mt-3 transition-opacity hover:opacity-70"
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
        <div
          className="border-t grid grid-cols-1 sm:grid-cols-2"
          style={{ borderColor: "var(--line)" }}
        >
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
              {sg.original ?? (
                <span className="italic text-[var(--ink-soft)]">Not provided</span>
              )}
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
              {sg.improved ?? (
                <span className="italic text-[var(--ink-soft)]">Not provided</span>
              )}
            </p>
          </div>
        </div>
      )}
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

  const [filter, setFilter]   = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  const copy = (id, text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  /* build filter chips from data */
  const categories = [
    ...new Set(suggestions.map((s) => s.category).filter(Boolean)),
  ];
  const filterChips = [
    ...ALL_FILTERS,
    ...categories.filter((c) => !ALL_FILTERS.includes(c)),
  ];

  const visible = [...suggestions]
    .filter((s) => {
      if (filter === "All") return true;
      if (["High", "Medium", "Low"].includes(filter)) return s.priority === filter;
      return s.category === filter;
    })
    .sort(
      (a, b) =>
        (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
    );

  /* ── empty state ── */
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
        <p className="text-sm text-[var(--ink-soft)]">
          {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""} · review and copy the improvements below
        </p>
      </div>

      {/* Filter chips */}
      <div
        className="ra-fade-up flex gap-2 overflow-x-auto ra-scrollbar pb-1 mb-6 -mx-1 px-1"
        style={{ animationDelay: "60ms" }}
      >
        {filterChips.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full whitespace-nowrap transition-colors duration-150"
            style={{
              background: filter === f ? "var(--ink)" : "var(--panel)",
              color:      filter === f ? "#fff"       : "var(--ink-soft)",
              border:     "1px solid var(--line)",
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
              onCopy={copy}
              copiedId={copiedId}
            />
          ))
        )}
      </div>
    </div>
  );
}
