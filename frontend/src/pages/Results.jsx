import { FileText, Upload as UploadIcon, ArrowRight } from "lucide-react";
import Badge from "../components/ui/Badge.jsx";
import { CircularScore, MiniRing } from "../components/ui/Progress.jsx";
import { ratingForScore } from "../data/mockData.js";

function BreakdownCard({ item, delay }) {
  return (
    <div className="ra-card ra-card-hover ra-fade-up p-5 flex items-center gap-4" style={{ animationDelay: `${delay}ms` }}>
      <MiniRing score={item.score} />
      <div className="min-w-0">
        <div className="font-semibold text-sm mb-0.5">{item.label}</div>
        <div className="text-xs text-[var(--ink-soft)]">Points awarded by the ATS analysis.</div>
      </div>
    </div>
  );
}

export default function Results({ fileName, analysis, setPage }) {
  const score = analysis?.atsScore ?? 0;
  const breakdown = Object.entries(analysis?.breakdown ?? {}).map(([key, value]) => ({
    key,
    label: key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    score: Number(value),
  }));

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8 lg:py-10">
      <div className="ra-fade-up flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="ra-display text-2xl font-bold mb-1">Resume Analysis</h1>
          <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]"><FileText size={14} /> {fileName} <span>·</span> Analyzed just now</div>
        </div>
        <button onClick={() => setPage("upload")} className="ra-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"><UploadIcon size={15} /> Analyze another</button>
      </div>

      <div className="ra-card ra-fade-up p-8 mb-8 flex flex-col lg:flex-row items-center gap-8" style={{ animationDelay: "100ms" }}>
        <CircularScore score={score} label={ratingForScore(score)} size={180} />
        <div className="text-center lg:text-left">
          <Badge tone="scan">{ratingForScore(score)}</Badge>
          <p className="mt-3 text-lg font-medium max-w-md">Your resume has an ATS compatibility score of {score} out of 100.</p>
          <p className="text-sm text-[var(--ink-soft)] mt-2 max-w-md">Review the category scores below to see how your resume performed in each part of the analysis.</p>
          <button onClick={() => setPage("suggestions")} className="mt-4 text-sm font-semibold flex items-center gap-1 text-[var(--violet)] mx-auto lg:mx-0">Improve my resume <ArrowRight size={14} /></button>
        </div>
      </div>

      <h2 className="ra-fade-up font-semibold mb-4" style={{ animationDelay: "160ms" }}>Score breakdown</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {breakdown.map((item, index) => <BreakdownCard key={item.key} item={item} delay={200 + index * 60} />)}
      </div>
    </div>
  );
}