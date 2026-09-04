import { useState } from "react";
import {
  Files,
  Upload as UploadIcon,
  Eye,
  Sparkles,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MiniRing } from "../components/ui/Progress.jsx";

function EmptyState({ onUpload }) {
  return (
    <div className="ra-fade-up ra-card flex flex-col items-center text-center py-20 px-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "var(--violet-soft)" }}
      >
        <Files size={26} color="var(--violet)" />
      </div>
      <h3 className="font-semibold text-lg mb-1">No resumes analyzed yet</h3>
      <p className="text-sm text-[var(--ink-soft)] max-w-sm mb-6">
        Upload your first resume and discover how ATS-friendly it really is.
      </p>
      <button
        onClick={onUpload}
        className="ra-btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
      >
        <UploadIcon size={15} /> Analyze Resume
      </button>
    </div>
  );
}

export default function Resumes({
  history,
  pagination,
  loading,
  error,
  setPage,
  onPageChange,
  onOpenResume,
  onOpenSuggestions,
  onDelete,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const handleDelete = async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      alert(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpen = async (id, mode) => {
    setBusyId(id);
    try {
      if (mode === "suggestions") await onOpenSuggestions(id);
      else await onOpenResume(id);
    } catch (err) {
      alert(err.message || "Could not open resume");
    } finally {
      setBusyId(null);
    }
  };

  const page = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 0;
  const total = pagination?.total ?? history.length;

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8 lg:py-10">
      <div className="ra-fade-up flex items-center justify-between mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="ra-display text-2xl font-bold">My Resumes</h1>
          {!loading && total > 0 && (
            <p className="text-xs text-[var(--ink-soft)] mt-1">
              {total} resume{total !== 1 ? "s" : ""} in this session
            </p>
          )}
        </div>
        <button
          onClick={() => setPage("upload")}
          className="ra-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <UploadIcon size={15} /> Analyze New
        </button>
      </div>

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: "var(--red-soft)", color: "#C43D3D" }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="ra-card flex items-center justify-center py-20 gap-2 text-sm text-[var(--ink-soft)]">
          <Loader2 size={16} className="ra-spin" /> Loading…
        </div>
      ) : history.length === 0 ? (
        <EmptyState onUpload={() => setPage("upload")} />
      ) : (
        <>
          <div className="space-y-3">
            {history.map((r, i) => (
              <div
                key={r.id}
                className="ra-card ra-card-hover ra-fade-up p-5 flex items-center justify-between gap-4 flex-wrap"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <MiniRing score={typeof r.score === "number" ? r.score : 0} />
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{r.name}</div>
                    <div className="text-xs text-[var(--ink-soft)]">
                      Analyzed: {r.date}
                      {typeof r.score === "number"
                        ? ` · ATS Score: ${r.score}`
                        : r.status
                        ? ` · ${r.status}`
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    disabled={busyId === r.id || r.status === "processing"}
                    onClick={() => handleOpen(r.id, "view")}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
                    style={{ background: "var(--paper)" }}
                  >
                    {busyId === r.id ? (
                      <Loader2 size={13} className="ra-spin" />
                    ) : (
                      <Eye size={13} />
                    )}{" "}
                    View
                  </button>
                  <button
                    disabled={busyId === r.id || r.status !== "completed"}
                    onClick={() => handleOpen(r.id, "suggestions")}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
                    style={{ background: "var(--violet-soft)", color: "var(--violet)" }}
                  >
                    <Sparkles size={13} /> Suggestions
                  </button>
                  <button
                    disabled={deletingId === r.id}
                    onClick={() => handleDelete(r.id)}
                    className="p-2 rounded-lg disabled:opacity-50"
                    style={{ background: "var(--red-soft)" }}
                    aria-label="Delete resume"
                  >
                    {deletingId === r.id ? (
                      <Loader2 size={14} className="ra-spin" color="var(--red)" />
                    ) : (
                      <Trash2 size={14} color="var(--red)" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                disabled={page <= 1 || loading}
                onClick={() => onPageChange(page - 1)}
                className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg disabled:opacity-40"
                style={{ background: "var(--paper)" }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-xs text-[var(--ink-soft)] ra-mono">
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => onPageChange(page + 1)}
                className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg disabled:opacity-40"
                style={{ background: "var(--paper)" }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
