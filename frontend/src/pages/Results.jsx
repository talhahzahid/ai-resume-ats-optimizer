import { FileText, Upload as UploadIcon, ArrowRight, Sparkles } from "lucide-react";
import Badge from "../components/ui/Badge.jsx";
import { CircularScore, MiniRing } from "../components/ui/Progress.jsx";
import { ratingForScore, colorForScore } from "../data/mockData.js";

/* ── helpers ────────────────────────────────────────────────────── */

/** Normalise a breakdown object/array from the API into a flat array */
function normaliseBreakdown(raw) {
  if (!raw) return [];

  // Array form: [{ label, score, note? }, …]
  if (Array.isArray(raw)) {
    return raw.map((item, i) => ({
      key: item.key ?? item.label ?? `item-${i}`,
      label: item.label ?? labelFromKey(item.key ?? `item-${i}`),
      score: Number(item.score ?? 0),
      note: item.note ?? null,
    }));
  }

  // Object form: { ats_compatibility: 85, keywords: 78, … }
  return Object.entries(raw).map(([key, value]) => ({
    key,
    label: labelFromKey(key),
    score: typeof value === "object" ? Number(value?.score ?? 0) : Number(value),
    note: typeof value === "object" ? (value?.note ?? null) : null,
  }));
}

function labelFromKey(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toneForScore(score) {
  if (score >= 90) return "scan";
  if (score >= 75) return "violet";
  if (score >= 60) return "amber";
  return "red";
}

/* ── sub-components ─────────────────────────────────────────────── */

function BreakdownCard({ item, delay }) {
  return (
    <div
      className="ra-card ra-card-hover ra-fade-up p-5 flex items-center gap-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <MiniRing score={item.score} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="font-semibold text-sm">{item.label}</span>
          <Badge tone={toneForScore(item.score)}>{item.score}</Badge>
        </div>
        {item.note ? (
          <p className="text-xs text-[var(--ink-soft)] leading-relaxed">{item.note}</p>
        ) : (
          <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
            <div
              className="h-full rounded-full ra-bar-fill"
              style={{
                width: `${item.score}%`,
                background: colorForScore(item.score),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── main page ──────────────────────────────────────────────────── */

export default function Results({ fileName, analysis, setPage }) {
  const score = analysis?.atsScore ?? 0;
  const rating = ratingForScore(score);
  const breakdown = normaliseBreakdown(analysis?.breakdown);
  const suggestionCount = analysis?.suggestions?.length ?? 0;

  // Derive a short insight line from the score
  const insight =
    score >= 90
      ? "Your resume is in excellent shape for ATS systems."
      : score >= 75
      ? "Solid results — a few tweaks can push you into the top tier."
      : score >= 60
      ? "There's meaningful room to improve your ATS compatibility."
      : "Your resume needs significant work to pass ATS filters.";

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8 lg:py-12">

      {/* Header row */}
      <div className="ra-fade-up flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="ra-display text-2xl font-bold mb-1.5">Resume Analysis</h1>
          <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
            <FileText size={14} />
            <span className="truncate max-w-xs">{fileName ?? "Your resume"}</span>
            <span>·</span>
            <span>Just now</span>
          </div>
        </div>
        <button
          onClick={() => setPage("upload")}
          className="ra-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm shrink-0"
        >
          <UploadIcon size={15} />
          Analyze another
        </button>
      </div>

      {/* Score hero card */}
      <div
        className="ra-card ra-fade-up p-8 mb-6 flex flex-col lg:flex-row items-center gap-8"
        style={{ animationDelay: "80ms" }}
      >
        <div className="shrink-0">
          <CircularScore score={score} label={rating} size={180} />
        </div>

        <div className="flex-1 text-center lg:text-left">
          <Badge tone={toneForScore(score)}>{rating}</Badge>
          <h2 className="ra-display text-xl font-bold mt-3 mb-2">
            ATS Score: {score} / 100
          </h2>
          <p className="text-[var(--ink-soft)] text-sm leading-relaxed max-w-md">{insight}</p>

          {suggestionCount > 0 && (
            <button
              onClick={() => setPage("suggestions")}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl"
              style={{ background: "var(--violet-soft)", color: "var(--violet)" }}
            >
              <Sparkles size={15} />
              View {suggestionCount} improvement{suggestionCount !== 1 ? "s" : ""}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Breakdown section */}
      {breakdown.length > 0 ? (
        <>
          <div
            className="ra-fade-up flex items-center justify-between mb-4"
            style={{ animationDelay: "140ms" }}
          >
            <h2 className="font-semibold text-base">Score breakdown</h2>
            <span className="ra-mono text-xs text-[var(--ink-soft)]">
              {breakdown.length} categor{breakdown.length === 1 ? "y" : "ies"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {breakdown.map((item, i) => (
              <BreakdownCard
                key={item.key}
                item={item}
                delay={180 + i * 55}
              />
            ))}
          </div>
        </>
      ) : (
        <div
          className="ra-card ra-fade-up p-8 text-center mb-10"
          style={{ animationDelay: "140ms" }}
        >
          <p className="text-sm text-[var(--ink-soft)]">
            No detailed breakdown was returned for this analysis.
          </p>
        </div>
      )}

      {/* CTA strip */}
      {suggestionCount > 0 && (
        <div
          className="ra-fade-up ra-card p-6 flex flex-col sm:flex-row items-center gap-5"
          style={{
            animationDelay: `${200 + breakdown.length * 55}ms`,
            background: "var(--ink)",
            border: "none",
            color: "#fff",
          }}
        >
          <Sparkles size={20} color="var(--scan)" className="shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-semibold">
              We found {suggestionCount} way{suggestionCount !== 1 ? "s" : ""} to improve your resume
            </p>
            <p className="text-sm text-white/60 mt-0.5">
              Each suggestion includes your original text and an AI-improved version.
            </p>
          </div>
          <button
            onClick={() => setPage("suggestions")}
            className="shrink-0 flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
            style={{ background: "var(--scan)", color: "#053B30" }}
          >
            See suggestions <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
