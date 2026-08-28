import { Files, Upload as UploadIcon, Eye, Sparkles, Trash2 } from "lucide-react";
import { MiniRing } from "../components/ui/Progress.jsx";

function EmptyState({ onUpload }) {
  return (
    <div className="ra-fade-up ra-card flex flex-col items-center text-center py-20 px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "var(--violet-soft)" }}>
        <Files size={26} color="var(--violet)" />
      </div>
      <h3 className="font-semibold text-lg mb-1">No resumes analyzed yet</h3>
      <p className="text-sm text-[var(--ink-soft)] max-w-sm mb-6">Upload your first resume and discover how ATS-friendly it really is.</p>
      <button onClick={onUpload} className="ra-btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
        <UploadIcon size={15} /> Analyze Resume
      </button>
    </div>
  );
}

export default function Resumes({ history, setHistory, setPage }) {
  const remove = (id) => setHistory((h) => h.filter((r) => r.id !== id));

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8 lg:py-10">
      <div className="ra-fade-up flex items-center justify-between mb-8">
        <h1 className="ra-display text-2xl font-bold">My Resumes</h1>
        <button onClick={() => setPage("upload")} className="ra-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <UploadIcon size={15} /> Analyze New
        </button>
      </div>

      {history.length === 0 ? (
        <EmptyState onUpload={() => setPage("upload")} />
      ) : (
        <div className="space-y-3">
          {history.map((r, i) => (
            <div
              key={r.id}
              className="ra-card ra-card-hover ra-fade-up p-5 flex items-center justify-between gap-4 flex-wrap"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <MiniRing score={r.score} />
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{r.name}</div>
                  <div className="text-xs text-[var(--ink-soft)]">
                    Analyzed: {r.date} · ATS Score: {r.score}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setPage("results")} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: "var(--paper)" }}>
                  <Eye size={13} /> View
                </button>
                <button
                  onClick={() => setPage("suggestions")}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
                  style={{ background: "var(--violet-soft)", color: "var(--violet)" }}
                >
                  <Sparkles size={13} /> Suggestions
                </button>
                <button onClick={() => remove(r.id)} className="p-2 rounded-lg" style={{ background: "var(--red-soft)" }}>
                  <Trash2 size={14} color="var(--red)" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
