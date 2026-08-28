import { useEffect, useState } from "react";
import { Search, Copy, Check, CheckCircle2 } from "lucide-react";
import Badge from "../components/ui/Badge.jsx";
import { initialSuggestions, FILTERS } from "../data/mockData.js";

function SuggestionCard({ sg, onApply, onCopy, onDismiss, copiedId }) {
  const [expanded, setExpanded] = useState(false);
  const toneMap = { High: "red", Medium: "amber", Low: "violet" };

  if (sg.status === "dismissed") return null;

  return (
    <div className="ra-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge tone={toneMap[sg.priority]}>{sg.priority} priority</Badge>
          <span className="text-xs text-[var(--ink-soft)] font-medium">{sg.category}</span>
        </div>
        {sg.status === "applied" && (
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#0A8F71" }}>
            <CheckCircle2 size={13} /> Fixed
          </span>
        )}
      </div>

      <button onClick={() => setExpanded((e) => !e)} className="text-left w-full">
        <div className="font-medium text-sm mb-2">{sg.issue}</div>
      </button>

      {expanded && (
        <div className="space-y-2 mb-3">
          <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "var(--red-soft)" }}>
            <div className="font-semibold mb-0.5" style={{ color: "#C43D3D" }}>
              Current
            </div>
            <div className="text-[var(--ink)]">{sg.current}</div>
          </div>
          <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "var(--scan-soft)" }}>
            <div className="font-semibold mb-0.5" style={{ color: "#0A8F71" }}>
              AI Suggestion
            </div>
            <div className="text-[var(--ink)]">{sg.recommended}</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap mt-3">
        <button onClick={() => setExpanded((e) => !e)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "var(--paper)", color: "var(--ink)" }}>
          {expanded ? "Hide details" : "View details"}
        </button>
        <button disabled={sg.status === "applied"} onClick={() => onApply(sg.id)} className="ra-btn-primary text-xs px-3 py-1.5 rounded-lg disabled:opacity-40">
          {sg.status === "applied" ? "Applied" : "Apply Suggestion"}
        </button>
        <button
          onClick={() => onCopy(sg.id, sg.recommended)}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "var(--violet-soft)", color: "var(--violet)" }}
        >
          {copiedId === sg.id ? <Check size={13} /> : <Copy size={13} />}
          {copiedId === sg.id ? "Copied" : "Copy"}
        </button>
        <button onClick={() => onDismiss(sg.id)} className="text-xs font-medium px-3 py-1.5 rounded-lg text-[var(--ink-soft)]">
          Dismiss
        </button>
      </div>
    </div>
  );
}

function normalizeSuggestions(apiSuggestions) { if (!apiSuggestions?.length) return initialSuggestions; return apiSuggestions.map((suggestion) => ({ id: suggestion.id, category: suggestion.category || "General", priority: `${suggestion.priority || "medium"}`.charAt(0).toUpperCase() + `${suggestion.priority || "medium"}`.slice(1).toLowerCase(), issue: suggestion.issue || suggestion.suggestion || "Resume improvement suggestion", current: suggestion.originalText || "Not provided", recommended: suggestion.improvedText || suggestion.suggestion || "No improved text was provided.", status: "pending" })); }

export default function Suggestions({ apiSuggestions = [] }) {
  const [suggestions, setSuggestions] = useState(() => normalizeSuggestions(apiSuggestions));
  useEffect(() => { setSuggestions(normalizeSuggestions(apiSuggestions)); }, [apiSuggestions]);
  const [filter, setFilter] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  const apply = (id) => setSuggestions((s) => s.map((x) => (x.id === id ? { ...x, status: "applied" } : x)));
  const dismiss = (id) => setSuggestions((s) => s.map((x) => (x.id === id ? { ...x, status: "dismissed" } : x)));
  const copy = (id, text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const visible = suggestions.filter((s) => {
    if (s.status === "dismissed") return false;
    if (filter === "All") return true;
    if (filter === "High Priority") return s.priority === "High";
    if (filter === "Medium") return s.priority === "Medium";
    if (filter === "Low") return s.priority === "Low";
    return s.category === filter;
  });

  const openCount = suggestions.filter((s) => s.status === "pending").length;

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8 lg:py-10">
      <div className="ra-fade-up mb-2">
        <h1 className="ra-display text-2xl font-bold mb-1">AI Resume Suggestions</h1>
        <p className="text-[var(--ink-soft)] text-sm">
          We found {openCount} opportunit{openCount === 1 ? "y" : "ies"} to improve your resume.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto ra-scrollbar py-4 -mx-1 px-1 mb-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full whitespace-nowrap"
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

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="ra-card p-10 text-center">
            <Search size={22} className="mx-auto mb-3" color="var(--ink-soft)" />
            <p className="text-sm text-[var(--ink-soft)]">No suggestions match this filter.</p>
          </div>
        ) : (
          visible.map((sg) => <SuggestionCard key={sg.id} sg={sg} onApply={apply} onCopy={copy} onDismiss={dismiss} copiedId={copiedId} />)
        )}
      </div>
    </div>
  );
}
