import { Radar, Files, Sparkles, TrendingUp, FileText, ChevronRight, Upload as UploadIcon, ArrowUpRight } from "lucide-react";
import { MiniRing } from "../components/ui/Progress.jsx";

function StatCard({ icon: Icon, label, value, sub, trend, delay }) {
  return (
    <div className="ra-card ra-card-hover ra-fade-up p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--violet-soft)" }}>
          <Icon size={16} color="var(--violet)" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#0A8F71" }}>
            <TrendingUp size={13} /> {trend}
          </span>
        )}
      </div>
      <div className="ra-display text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-0.5">{label}</div>
      {sub && <div className="text-xs text-[var(--ink-soft)] mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard({ setPage, history }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const avg = Math.round(history.reduce((a, r) => a + r.score, 0) / (history.length || 1));

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8 lg:py-10">
      <div className="ra-fade-up mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <h1 className="ra-display text-3xl font-bold mb-1.5">{greeting} 👋</h1>
          <p className="text-[var(--ink-soft)]">Let's make your resume stand out.</p>
        </div>
        <button onClick={() => setPage("upload")} className="ra-btn-primary flex items-center gap-2 px-5 py-3 rounded-xl w-fit">
          <UploadIcon size={16} /> Analyze New Resume
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Radar} label="ATS Score" value={`${history[0]?.score ?? 82}/100`} sub="↑ 12% from previous analysis" trend="+12%" delay={0} />
        <StatCard icon={Files} label="Resumes Analyzed" value={history.length} sub="Across all versions" delay={80} />
        <StatCard icon={Sparkles} label="Improvements Found" value="8" sub="3 marked high priority" delay={160} />
        <StatCard icon={TrendingUp} label="Resume Strength" value={avg >= 75 ? "Good" : "Fair"} sub={`Average score ${avg}/100`} delay={240} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 ra-card p-6 ra-fade-up" style={{ animationDelay: "320ms" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Recent resumes</h2>
            <button onClick={() => setPage("history")} className="text-sm font-medium flex items-center gap-1 text-[var(--violet)]">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {history.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--paper)" }}>
                    <FileText size={15} color="var(--ink-soft)" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{r.name}</div>
                    <div className="text-xs text-[var(--ink-soft)]">{r.date}</div>
                  </div>
                </div>
                <MiniRing score={r.score} size={40} stroke={4} />
              </div>
            ))}
          </div>
        </div>

        <div
          className="ra-card p-6 ra-fade-up"
          style={{ animationDelay: "400ms", background: "var(--ink)", color: "#fff", border: "none" }}
        >
          <Sparkles size={18} color="var(--scan)" className="mb-3" />
          <h3 className="ra-display font-semibold mb-2">Your resume can score higher</h3>
          <p className="text-sm text-white/70 mb-5">
            We found 8 opportunities to improve your latest resume — 3 of them high priority.
          </p>
          <button
            onClick={() => setPage("suggestions")}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg w-fit"
            style={{ background: "var(--scan)", color: "#053B30" }}
          >
            See suggestions <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
