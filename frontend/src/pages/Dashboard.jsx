import {
  FileText,
  Upload as UploadIcon,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Clock,
  BarChart2,
  Loader2,
} from "lucide-react";
import { MiniRing } from "../components/ui/Progress.jsx";
import { ratingForScore, colorForScore } from "../data/mockData.js";
import Badge from "../components/ui/Badge.jsx";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function scoreDelta(history) {
  const scored = history.filter((r) => typeof r.score === "number");
  if (scored.length < 2) return null;
  return scored[0].score - scored[1].score;
}

function toneForScore(score) {
  if (score == null) return "amber";
  if (score >= 90) return "scan";
  if (score >= 75) return "violet";
  if (score >= 60) return "amber";
  return "red";
}

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

function ResumeRow({ r, isLast, onOpen }) {
  const scoreLabel = typeof r.score === "number" ? r.score : "…";
  return (
    <button
      type="button"
      onClick={() => onOpen?.(r.id)}
      className={`w-full text-left flex items-center justify-between py-3.5 ${
        isLast ? "" : "border-b"
      } hover:opacity-90 transition-opacity`}
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
            {r.status && r.status !== "completed" ? ` · ${r.status}` : ""}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        {typeof r.score === "number" ? (
          <>
            <Badge tone={toneForScore(r.score)}>{r.score}</Badge>
            <MiniRing score={r.score} size={38} stroke={4} />
          </>
        ) : (
          <Badge tone="amber">{scoreLabel}</Badge>
        )}
      </div>
    </button>
  );
}

export default function Dashboard({ setPage, history, stats, loading, onOpenResume }) {
  const latest = history.find((r) => typeof r.score === "number") ?? history[0] ?? null;
  const total = stats?.total ?? history.length;
  const avg = stats?.averageScore;
  const delta = scoreDelta(history);
  const hasHistory = total > 0;
  const latestScore = typeof latest?.score === "number" ? latest.score : stats?.latestScore;

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8 lg:py-10">
      <div className="ra-fade-up mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="ra-display text-3xl font-bold mb-1">{greeting()}</h1>
          <p className="text-[var(--ink-soft)] text-sm">
            {hasHistory
              ? `You've analyzed ${total} resume${total !== 1 ? "s" : ""}. Keep improving.`
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

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BarChart2}
          label="Latest score"
          value={typeof latestScore === "number" ? `${latestScore}/100` : "—"}
          sub={
            typeof latestScore === "number"
              ? ratingForScore(latestScore)
              : "No analysis yet"
          }
          badge={
            typeof latestScore === "number" ? (
              <Badge tone={toneForScore(latestScore)}>
                {ratingForScore(latestScore)}
              </Badge>
            ) : null
          }
          delay={0}
        />
        <StatCard
          icon={FileText}
          label="Resumes analyzed"
          value={loading ? "…" : total}
          sub={total === 1 ? "1 version uploaded" : `${total} versions`}
          delay={60}
        />
        <StatCard
          icon={TrendingUp}
          iconBg={avg >= 75 ? "var(--scan-soft)" : "var(--amber-soft)"}
          iconColor={avg >= 75 ? "var(--scan)" : "var(--amber)"}
          label="Average score"
          value={typeof avg === "number" ? `${avg}/100` : "—"}
          sub={
            typeof avg === "number"
              ? `Across ${stats?.completed ?? 0} completed`
              : "No data yet"
          }
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
              : "vs. previous upload"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className="lg:col-span-2 ra-card p-6 ra-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-base">Recent resumes</h2>
            {total > 0 && (
              <button
                onClick={() => setPage("history")}
                className="text-sm font-medium flex items-center gap-1"
                style={{ color: "var(--violet)" }}
              >
                View all <ChevronRight size={14} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-[var(--ink-soft)] gap-2 text-sm">
              <Loader2 size={16} className="ra-spin" /> Loading your resumes…
            </div>
          ) : hasHistory ? (
            <div>
              {history.slice(0, 4).map((r, i, arr) => (
                <ResumeRow
                  key={r.id}
                  r={r}
                  isLast={i === arr.length - 1}
                  onOpen={onOpenResume}
                />
              ))}
            </div>
          ) : (
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
            {typeof latestScore === "number"
              ? `Your score can go higher than ${latestScore}`
              : "Get your first ATS score"}
          </h3>
          <p className="text-sm text-white/60 leading-relaxed flex-1">
            {typeof latestScore === "number"
              ? "Our AI found targeted line-by-line improvements. Each suggestion includes your original text and a rewritten version."
              : "Upload a resume and we'll check ATS compatibility, keywords, formatting, and more — in seconds."}
          </p>

          {typeof latestScore === "number" && (
            <div className="mt-5 mb-5">
              <div className="flex justify-between text-xs text-white/50 mb-1.5">
                <span>Current</span>
                <span>{latestScore} / 100</span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${latestScore}%`,
                    background: colorForScore(latestScore),
                    transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() =>
              setPage(typeof latestScore === "number" ? "suggestions" : "upload")
            }
            className="mt-auto flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl w-fit"
            style={{ background: "var(--scan)", color: "#053B30" }}
          >
            {typeof latestScore === "number" ? "See suggestions" : "Upload resume"}
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
