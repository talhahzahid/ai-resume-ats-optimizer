import { useEffect, useRef, useState } from "react";
import { FileText, AlertCircle, RefreshCw } from "lucide-react";
import { getResumeStatus } from "../services/api.js";

const STEPS = [
  "Reading your resume",
  "Extracting work experience",
  "Analysing skills & keywords",
  "Checking ATS compatibility",
  "Generating improvement tips",
];

const STEP_INTERVAL_MS = 2200;
const POLL_INTERVAL_MS = 1000;

/* ─────────────────────────────────────────────────────────────────
   StepRow — purely visual, no logic
───────────────────────────────────────────────────────────────── */
function StepRow({ label, state }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-5 h-5 shrink-0 flex items-center justify-center">
        {state === "done" && (
          <svg viewBox="0 0 20 20" className="w-5 h-5">
            <circle cx="10" cy="10" r="9" fill="var(--scan-soft)" stroke="var(--scan)" strokeWidth="1.5" />
            <path d="M6 10l3 3 5-5" stroke="var(--scan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        )}
        {state === "active" && (
          <span className="w-2.5 h-2.5 rounded-full ra-pulse" style={{ background: "var(--violet)" }} />
        )}
        {state === "idle" && (
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--line)" }} />
        )}
      </div>
      <span
        className={`text-sm transition-colors duration-300 ${
          state === "done"
            ? "text-[var(--ink)]"
            : state === "active"
            ? "font-semibold text-[var(--ink)]"
            : "text-[var(--ink-soft)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ElapsedTimer — shows seconds so users know the page is alive
───────────────────────────────────────────────────────────────── */
function ElapsedTimer({ running }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  return (
    <p className="ra-mono text-xs text-[var(--ink-soft)] mt-8">
      {running ? `${seconds}s elapsed` : ""}
    </p>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Analyzing — main component

   Polling design:
   • useEffect depends ONLY on resumeId.  Changing onDone/fileName
     (new function references from parent re-renders) must NEVER
     restart the effect — they are accessed via refs instead.
   • Chained setTimeout (not setInterval) guarantees at most one
     in-flight request at any time.
   • stoppedRef is the single source of truth.  Once true, no code
     inside poll() does anything — not even a state update.
   • stopAll() is the only place stoppedRef becomes true.
───────────────────────────────────────────────────────────────── */
export default function Analyzing({ fileName, resumeId, onDone, onFailed }) {
  const [visualStep, setVisualStep] = useState(0);
  const [pollStatus, setPollStatus] = useState("processing");
  const [errorMsg, setErrorMsg]     = useState("");

  // Stable refs for props that must not appear in the polling effect's dep array.
  // Updated synchronously on every render so poll() always reads the latest value.
  const onDoneRef   = useRef(onDone);
  const onFailedRef = useRef(onFailed);
  const fileNameRef = useRef(fileName);
  onDoneRef.current   = onDone;
  onFailedRef.current = onFailed;
  fileNameRef.current = fileName;

  // Polling control refs
  const stoppedRef  = useRef(false);   // true  → polling is permanently off
  const nextTickRef = useRef(null);    // handle for the pending setTimeout
  const stepTimerRef = useRef(null);   // handle for the cosmetic step ticker

  /* ── Cosmetic step ticker ───────────────────────────────────────── */
  useEffect(() => {
    stepTimerRef.current = setInterval(() => {
      setVisualStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(stepTimerRef.current);
  }, []); // runs once — intentionally no deps

  /* ── Polling effect ─────────────────────────────────────────────────
     Dep array: [resumeId] only.
     onDone / onFailed / fileName come from refs, not deps.
  ─────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!resumeId) return;

    // Reset for this poll session
    stoppedRef.current = false;

    function stopAll() {
      stoppedRef.current = true;
      clearTimeout(nextTickRef.current);
      clearInterval(stepTimerRef.current);
    }

    async function poll() {
      // Pre-request guard
      if (stoppedRef.current) return;

      try {
        const data = await getResumeStatus(resumeId);

        // Post-request guard (unmount or stopAll could have run while awaiting)
        if (stoppedRef.current) return;

        const status = data?.status;

        if (status === "completed") {
          // ── Permanently stop — no more requests after this line ──
          stopAll();
          setPollStatus("completed");

          // api.js already unwraps { success, data } → we receive the inner data object.
          // Shape: { status, ats_score: { score, breakdown }, suggestions: [...] }
          const atsScore =
            typeof data.ats_score?.score === "number"
              ? data.ats_score.score
              : 0;

          const breakdown   = data.ats_score?.breakdown ?? {};
          const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];

          // Small "Analysis complete!" flash before navigating away
          setTimeout(() => {
            onDoneRef.current(fileNameRef.current, { atsScore, breakdown, suggestions });
          }, 800);

        } else if (status === "failed") {
          // ── Permanently stop ─────────────────────────────────────
          stopAll();
          setPollStatus("failed");
          setErrorMsg(data?.error || "Analysis failed. Please try uploading your resume again.");

        } else {
          // "processing" — schedule exactly one next call, then return
          nextTickRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        }

      } catch (err) {
        if (stoppedRef.current) return;
        stopAll();
        setPollStatus("failed");
        setErrorMsg(err.message || "Lost connection to the server. Please try again.");
      }
    }

    // First call fires immediately
    poll();

    // Cleanup runs on unmount or if resumeId ever changes
    return () => stopAll();

  }, [resumeId]); // ← ONLY resumeId here; everything else is via refs

  /* ── Failed UI ──────────────────────────────────────────────────── */
  if (pollStatus === "failed") {
    return (
      <div className="max-w-md mx-auto px-5 py-24 flex flex-col items-center text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "var(--red-soft)" }}
        >
          <AlertCircle size={28} color="var(--red)" />
        </div>
        <h2 className="ra-display text-xl font-bold mb-2">Analysis failed</h2>
        <p className="text-sm text-[var(--ink-soft)] mb-6 max-w-xs leading-relaxed">{errorMsg}</p>
        <button
          onClick={() => onFailedRef.current()}
          className="ra-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </div>
    );
  }

  /* ── Processing / completed UI ──────────────────────────────────── */
  return (
    <div className="max-w-sm mx-auto px-5 py-20 lg:py-28 flex flex-col items-center text-center">

      {/* Scan animation box */}
      <div className="relative mb-10">
        <div
          className="relative overflow-hidden rounded-2xl w-36 h-36 flex items-center justify-center"
          style={{ background: "var(--ink)" }}
        >
          {pollStatus === "processing" && <div className="ra-sweep-line" />}
          <FileText size={44} color="rgba(255,255,255,0.25)" />
          <svg
            className="absolute inset-0 ra-spin"
            style={{ animationDuration: "2.4s" }}
            viewBox="0 0 144 144"
            width="144"
            height="144"
          >
            <circle cx="72" cy="72" r="60" fill="none" stroke="rgba(0,201,160,0.18)" strokeWidth="2" />
            <circle cx="72" cy="72" r="60" fill="none" stroke="var(--scan)" strokeWidth="2" strokeLinecap="round" strokeDasharray="48 330" />
          </svg>
        </div>
        <div
          className="absolute -inset-4 rounded-3xl -z-10 blur-2xl opacity-30"
          style={{ background: "radial-gradient(circle, var(--violet) 0%, transparent 70%)" }}
        />
      </div>

      <h2 className="ra-display text-xl font-bold mb-1.5">
        {pollStatus === "completed" ? "Analysis complete!" : "Analysing your resume\u2026"}
      </h2>
      <p className="text-sm text-[var(--ink-soft)] mb-10 max-w-xs leading-relaxed">
        {pollStatus === "completed"
          ? "Loading your results now."
          : "Our AI is reading every line. This usually takes under 30 seconds."}
      </p>

      <div className="w-full space-y-3.5 text-left">
        {STEPS.map((step, i) => {
          let state = "idle";
          if (pollStatus === "completed")   state = "done";
          else if (i < visualStep)          state = "done";
          else if (i === visualStep)        state = "active";
          return <StepRow key={step} label={step} state={state} />;
        })}
      </div>

      <ElapsedTimer running={pollStatus === "processing"} />
    </div>
  );
}
