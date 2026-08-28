import { useEffect, useState } from "react";
import { colorForScore } from "../../data/mockData.js";

export function CircularScore({ score, size = 168, stroke = 12, label, big = true }) {
  const [animated, setAnimated] = useState(0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = colorForScore(score);

  useEffect(() => {
    setAnimated(0);
    const t = setTimeout(() => setAnimated(score), 60);
    return () => clearTimeout(t);
  }, [score]);

  const offset = c - (animated / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" className="ra-track" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" stroke={color} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="ra-progress" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`ra-display font-bold ${big ? "text-4xl" : "text-2xl"}`}>{Math.round(animated)}</span>
        <span className="text-[11px] text-[var(--ink-soft)] font-medium">/100</span>
        {label && <span className="ra-mono text-[11px] font-semibold mt-1" style={{ color }}>{label}</span>}
      </div>
    </div>
  );
}

export function MiniRing({ score, size = 56, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 80);
    return () => clearTimeout(t);
  }, [score]);

  const offset = c - (animated / 100) * c;
  const color = colorForScore(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" className="ra-track" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" stroke={color} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="ra-progress" />
      </svg>
      <span className="absolute ra-mono text-xs font-bold">{score}</span>
    </div>
  );
}