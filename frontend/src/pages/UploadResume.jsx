import { useRef, useState, useCallback } from "react";
import { Upload as UploadIcon, FileText, X, Wand2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadResume } from "../services/api.js";

const MAX_SIZE_MB = 10;

export default function UploadResume({ onUploadDone }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;
    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFile(null);
      setError("Only PDF resumes are supported.");
      return;
    }
    const sizeMb = selectedFile.size / 1024 / 1024;
    if (sizeMb > MAX_SIZE_MB) {
      setFile(null);
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError("");
    setFile({
      source: selectedFile,
      name: selectedFile.name,
      size: sizeMb.toFixed(2),
    });
  }, []);

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setError("");
    try {
      const { resumeId } = await uploadResume(file.source);
      onUploadDone({ fileName: file.name, resumeId });
    } catch (err) {
      setError(err.message || "Could not reach the analysis server. Please try again.");
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 py-12 lg:py-16">
      {/* Header */}
      <div className="ra-fade-up text-center mb-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "var(--violet-soft)" }}
        >
          <Wand2 size={24} color="var(--violet)" />
        </div>
        <h1 className="ra-display text-3xl font-bold mb-2">Analyze your resume</h1>
        <p className="text-[var(--ink-soft)] max-w-sm mx-auto text-sm leading-relaxed">
          Upload your PDF and our AI will check ATS compatibility, keywords,
          structure, and suggest targeted improvements.
        </p>
      </div>

      {/* Drop zone */}
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className="ra-fade-up ra-dropzone"
          style={{
            animationDelay: "80ms",
            borderColor: dragOver ? "var(--violet)" : "var(--line)",
            background: dragOver ? "var(--violet-soft)" : "var(--panel)",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-transform duration-200"
            style={{
              background: dragOver ? "var(--violet)" : "var(--paper)",
              transform: dragOver ? "scale(1.08)" : "scale(1)",
            }}
          >
            <UploadIcon
              size={26}
              color={dragOver ? "#fff" : "var(--ink-soft)"}
            />
          </div>
          <p className="font-semibold text-base mb-1">
            {dragOver ? "Drop it here" : "Drop your resume here"}
          </p>
          <p className="text-sm text-[var(--ink-soft)] mb-5">
            or{" "}
            <span className="text-[var(--violet)] font-medium underline underline-offset-2">
              browse files
            </span>
          </p>
          <span
            className="ra-mono text-xs px-3 py-1.5 rounded-full"
            style={{ background: "var(--paper)", color: "var(--ink-soft)", border: "1px solid var(--line)" }}
          >
            PDF · max {MAX_SIZE_MB} MB
          </span>
        </div>
      ) : (
        /* File selected card */
        <div
          className="ra-fade-up ra-card p-5"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--violet-soft)" }}
            >
              <FileText size={20} color="var(--violet)" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm truncate">{file.name}</span>
                {!uploading && (
                  <button
                    onClick={removeFile}
                    className="p-1.5 rounded-lg hover:bg-black/5 shrink-0 text-[var(--ink-soft)]"
                    aria-label="Remove file"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5">{file.size} MB</p>
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 size={13} color="var(--scan)" />
                <span className="text-xs font-medium" style={{ color: "var(--scan)" }}>
                  Ready to analyze
                </span>
              </div>
            </div>
          </div>

          <button
            disabled={uploading}
            onClick={handleUpload}
            className="ra-btn-primary w-full mt-5 py-3 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="ra-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Analyze Resume
              </>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="ra-fade-up mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
          style={{ background: "var(--red-soft)", color: "#C43D3D" }}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tips */}
      <div
        className="ra-fade-up mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center"
        style={{ animationDelay: "200ms" }}
      >
        {[
          { emoji: "⚡", title: "Fast", desc: "Results in seconds" },
          { emoji: "🎯", title: "Accurate", desc: "Real ATS scoring" },
          { emoji: "✍️", title: "Actionable", desc: "Line-by-line fixes" },
        ].map((tip) => (
          <div
            key={tip.title}
            className="ra-card p-4"
            style={{ background: "var(--paper)" }}
          >
            <div className="text-xl mb-1">{tip.emoji}</div>
            <div className="font-semibold text-sm">{tip.title}</div>
            <div className="text-xs text-[var(--ink-soft)] mt-0.5">{tip.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
