import {
  FileText,
  Upload as UploadIcon,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Clock,
  BarChart2,
} from "lucide-react";
import { MiniRing } from "../components/ui/Progress.jsx";
import { ratingForScore, colorForScore } from "../data/mockData.js";
import Badge from "../components/ui/Badge.jsx";

/* ── helpers ────────────────────────────────────────────────────── */

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function avgScore(history) {
  if (!history.length) return 0;
  return Math.round(history.reduce((a, r) => a + r.score, 0) / history.length);
}

function scoreDelta(history) {
  if (history.length < 2) return null;
  return history[0].score - history[1].score;
}

function toneForScore(score) {
  if (score >= 90) return "scan";
  if (score >= 75) return "violet";
  if (score >= 60) return "amber";
  return "red";
}

/* ── StatCard ───────────────────────────────────────────────────── */

function StatCard({ icon: Icon, iconColor, iconBg, label, value, sub, badge, delay }) {
  return (
    <div
      className="ra-card ra-card-hover ra-fade-up p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: iconBg ?? "var(--violet-soft)" }}
        >
          <Icon size={16} color={iconColor ?? "var(--violet)"} />
        </div>
        {badge && badge}
      </div>
      <div className="ra-display text-2xl font-bold leading-none mb-1">{value}</div>
      <div className="text-sm font-medium text-[var(--ink)]">{label}</div>
      {sub && <div className="text-xs text-[var(--ink-soft)] mt-1">{sub}</div>}
    </div>
  );
}

/* ── ResumeRow ──────────────────────────────────────────────────── */

function ResumeRow({ r, isLast }) {
  return (
    <div
      className={`flex items-center justify-between py-3.5 ${
        isLast ? "" : "border-b"
      }`}
      style={{ borderColor: "var(--line)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--paper)" }}
        >
          <FileText size={15} color="var(--ink-soft)" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{r.name}</div>
          <div className="text-xs text-[var(--ink-soft)] flex items-center gap-1 mt-0.5">
            <Clock size={11} />
            {r.date}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <Badge tone={toneForScore(r.score)}>{r.score}</Badge>
        <MiniRing score={r.score} size={38} stroke={4} />
      </div>
    </div>
  );
}

/* ── main page ──────────────────────────────────────────────────── */

export default function Dashboard({ setPage, history }) {
  const latest = history[0] ?? null;
  const avg = avgScore(history);
  const delta = scoreDelta(history);
  const hasHistory = history.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8 lg:py-10">

      {/* Top row */}
      <div className="ra-fade-up mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="ra-display text-3xl font-bold mb-1">{greeting()} 👋</h1>
          <p className="text-[var(--ink-soft)] text-sm">
            {hasHistory
              ? `You've analyzed ${history.length} resume${history.length !== 1 ? "s" : ""}. Keep improving.`
              : "Upload your first resume to get started."}
          </p>
        </div>
        <button
          onClick={() => setPage("upload")}
          className="ra-btn-primary flex items-center gap-2 px-5 py-2.5 text-sm w-fit"
        >
          <UploadIcon size={15} />
          Analyze resume
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BarChart2}
          label="Latest score"
          value={latest ? `${latest.score}/100` : "—"}
          sub={latest ? ratingForScore(latest.score) : "No analysis yet"}
          badge={
            latest ? (
              <Badge tone={toneForScore(latest.score)}>{ratingForScore(latest.score)}</Badge>
            ) : null
          }
          delay={0}
        />
        <StatCard
          icon={FileText}
          label="Resumes analyzed"
          value={history.length}
          sub={history.length === 1 ? "1 version uploaded" : `${history.length} versions`}
          delay={60}
        />
        <StatCard
          icon={TrendingUp}
          iconBg={avg >= 75 ? "var(--scan-soft)" : "var(--amber-soft)"}
          iconColor={avg >= 75 ? "var(--scan)" : "var(--amber)"}
          label="Average score"
          value={hasHistory ? `${avg}/100` : "—"}
          sub={hasHistory ? `Across all ${history.length} upload${history.length !== 1 ? "s" : ""}` : "No data yet"}
          delay={120}
        />
        <StatCard
          icon={Sparkles}
          iconBg="var(--violet-soft)"
          iconColor="var(--violet)"
          label="Score change"
          value={
            delta === null
              ? "—"
              : delta > 0
              ? `+${delta}`
              : delta < 0
              ? `${delta}`
              : "±0"
          }
          sub={
            delta === null
              ? "Need 2+ analyses"
              : delta > 0
              ? "vs. previous upload"
              : delta < 0
              ? "vs. previous upload"
              : "No change"
          }
          badge={
            delta !== null && delta !== 0 ? (
              <span
                className="ra-mono text-xs font-bold"
                style={{ color: delta > 0 ? "var(--scan)" : "var(--red)" }}
              >
                {delta > 0 ? "▲" : "▼"}
              </span>
            ) : null
          }
          delay={180}
        />
      </div>

      {/* Bottom two-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent resumes */}
        <div
          className="lg:col-span-2 ra-card p-6 ra-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-base">Recent resumes</h2>
            {history.length > 3 && (
              <button
                onClick={() => setPage("history")}
                className="text-sm font-medium flex items-center gap-1"
                style={{ color: "var(--violet)" }}
              >
                View all <ChevronRight size={14} />
              </button>
            )}
          </div>

          {hasHistory ? (
            <div>
              {history.slice(0, 4).map((r, i, arr) => (
                <ResumeRow key={r.id} r={r} isLast={i === arr.length - 1} />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "var(--paper)" }}
              >
                <FileText size={20} color="var(--ink-soft)" />
              </div>
              <p className="text-sm font-medium mb-1">No resumes yet</p>
              <p className="text-xs text-[var(--ink-soft)] mb-4">
                Upload your first resume to see it here.
              </p>
              <button
                onClick={() => setPage("upload")}
                className="ra-btn-primary text-xs px-4 py-2 rounded-lg"
              >
                Upload now
              </button>
            </div>
          )}
        </div>

        {/* CTA / tips card */}
        <div
          className="ra-card ra-fade-up p-6 flex flex-col"
          style={{
            animationDelay: "300ms",
            background: "var(--ink)",
            border: "none",
            color: "#fff",
          }}
        >
          <Sparkles size={18} color="var(--scan)" className="mb-4" />
          <h3 className="ra-display font-semibold text-lg mb-2 leading-snug">
            {latest
              ? `Your score can go higher than ${latest.score}`
              : "Get your first ATS score"}
          </h3>
          <p className="text-sm text-white/60 leading-relaxed flex-1">
            {latest
              ? "Our AI found targeted line-by-line improvements. Each suggestion includes your original text and a rewritten version."
              : "Upload a resume and we'll check ATS compatibility, keywords, formatting, and more — in seconds."}
          </p>

          {/* Score bar (only when there's a latest score) */}
          {latest && (
            <div className="mt-5 mb-5">
              <div className="flex justify-between text-xs text-white/50 mb-1.5">
                <span>Current</span>
                <span>{latest.score} / 100</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${latest.score}%`,
                    background: colorForScore(latest.score),
                    transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setPage(latest ? "suggestions" : "upload")}
            className="mt-auto flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl w-fit"
            style={{ background: "var(--scan)", color: "#053B30" }}
          >
            {latest ? "See suggestions" : "Upload resume"}
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
