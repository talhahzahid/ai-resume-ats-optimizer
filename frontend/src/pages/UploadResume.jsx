import { useRef, useState, useCallback } from "react";
import { Upload as UploadIcon, FileText, X, Wand2, Loader2 } from "lucide-react";

export default function UploadResume({ onAnalyze }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;
    const isPdf = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFile(null);
      setError("Please choose a PDF resume.");
      return;
    }
    setError("");
    setFile({ source: selectedFile, name: selectedFile.name, size: (selectedFile.size / 1024 / 1024).toFixed(2) });
  }, []);

  const analyzeResume = async () => {
    if (!file || isAnalyzing) return;
    setIsAnalyzing(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("pdf", file.source);
      const response = await fetch("http://localhost:8000/api/v1/upload", { method: "POST", body: formData });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.detail || payload?.message || "Unable to analyze this resume.");

      const atsScore = payload?.text?.ats_score;
      if (typeof atsScore?.score !== "number" || !atsScore?.breakdown) {
        throw new Error("The API returned an unexpected analysis result.");
      }
      onAnalyze(file.name, { atsScore: atsScore.score, breakdown: atsScore.breakdown, suggestions: payload?.text?.suggestions ?? [] });
    } catch (requestError) {
      setError(requestError.message || "Unable to connect to the resume analysis API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-10 lg:py-14">
      <div className="ra-fade-up text-center mb-10">
        <h1 className="ra-display text-3xl font-bold mb-2">Analyze Your Resume</h1>
        <p className="text-[var(--ink-soft)] max-w-lg mx-auto">Upload your resume and let AI analyze it for ATS compatibility, structure, keywords, and overall quality.</p>
      </div>

      {!file ? (
        <div
          onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => { event.preventDefault(); setDragOver(false); handleFile(event.dataTransfer.files?.[0]); }}
          onClick={() => inputRef.current?.click()}
          className="ra-fade-up ra-card flex flex-col items-center justify-center text-center py-16 px-6 cursor-pointer"
          style={{ animationDelay: "120ms", borderStyle: "dashed", borderWidth: 2, borderColor: dragOver ? "var(--violet)" : "var(--line)", background: dragOver ? "var(--violet-soft)" : "var(--panel)", transition: "all .2s ease" }}
        >
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "var(--violet-soft)" }}><UploadIcon size={26} color="var(--violet)" /></div>
          <div className="font-semibold text-lg mb-1">Drop your resume here</div>
          <div className="text-sm text-[var(--ink-soft)] mb-4">or click to browse files</div>
          <span className="ra-mono text-xs px-3 py-1.5 rounded-full" style={{ background: "var(--paper)", color: "var(--ink-soft)" }}>PDF only</span>
        </div>
      ) : (
        <div className="ra-fade-up ra-card p-6" style={{ animationDelay: "80ms" }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--violet-soft)" }}><FileText size={20} color="var(--violet)" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-medium truncate pr-2">{file.name}</div>
                <button onClick={() => { setFile(null); setError(""); }} className="p-1.5 rounded-lg hover:bg-black/5 shrink-0"><X size={16} /></button>
              </div>
              <div className="text-xs text-[var(--ink-soft)]">{file.size} MB</div>
              <div className="text-xs text-[var(--ink-soft)] mt-3">Ready to analyze</div>
            </div>
          </div>
          <button disabled={isAnalyzing} onClick={analyzeResume} className="ra-btn-primary w-full mt-6 py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40">
            {isAnalyzing ? <Loader2 size={16} className="ra-spin" /> : <Wand2 size={16} />}
            {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>
      )}
      {error && <p className="mt-3 text-center text-sm" style={{ color: "var(--red)" }}>{error}</p>}
    </div>
  );
}