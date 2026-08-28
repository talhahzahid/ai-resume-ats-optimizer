import { useState, useEffect } from "react";
import { FileText, Loader2, CheckCircle2, CircleDot, Circle } from "lucide-react";
import { ANALYSIS_STEPS } from "../data/mockData.js";

export default function Analyzing({ onDone }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= ANALYSIS_STEPS.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStepIndex((i) => i + 1), 750);
    return () => clearTimeout(t);
  }, [stepIndex, onDone]);

  return (
    <div className="max-w-md mx-auto px-5 py-24 flex flex-col items-center text-center">
      <div className="relative mb-8">
        <div className="relative overflow-hidden rounded-2xl w-40 h-40 flex items-center justify-center" style={{ background: "var(--ink)" }}>
          <div className="ra-sweep-line" />
          <FileText size={48} color="rgba(255,255,255,0.35)" />
          <Loader2 size={26} color="var(--scan)" className="ra-spin absolute" />
        </div>
      </div>
      <h2 className="ra-display text-xl font-bold mb-1">AI is analyzing your resume…</h2>
      <p className="text-sm text-[var(--ink-soft)] mb-8">This usually takes a few seconds.</p>

      <div className="w-full space-y-3 text-left">
        {/* {ANALYSIS_STEPS.map((step, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <div key={step} className="flex items-center gap-3">
              {done ? (
                <CheckCircle2 size={18} color="var(--scan)" />
              ) : active ? (
                <CircleDot size={18} color="var(--violet)" className="ra-pulse" />
              ) : (
                <Circle size={18} color="var(--line)" />
              )}
              <span className={`text-sm ${done ? "text-[var(--ink)]" : active ? "text-[var(--ink)] font-medium" : "text-[var(--ink-soft)]"}`}>
                {step}
              </span>
            </div>
          );
        })} */}
      </div>
    </div>
  );
}
