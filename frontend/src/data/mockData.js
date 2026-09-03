import {
  LayoutDashboard,
  FileSearch,
  Files,
  Sparkles,
} from "lucide-react";

export const NAV_ITEMS = [
  { key: "dashboard",   label: "Dashboard",       icon: LayoutDashboard },
  { key: "upload",      label: "Analyze Resume",   icon: FileSearch      },
  { key: "history",     label: "My Resumes",       icon: Files           },
  { key: "suggestions", label: "Suggestions",      icon: Sparkles        },
];

export const ANALYSIS_STEPS = [
  "Reading resume",
  "Extracting experience",
  "Analyzing skills",
  "Checking ATS compatibility",
  "Identifying improvements",
];

export function ratingForScore(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Needs Improvement";
  return "Poor";
}

export function colorForScore(score) {
  if (score >= 90) return "var(--scan)";
  if (score >= 75) return "var(--violet)";
  if (score >= 60) return "var(--amber)";
  return "var(--red)";
}

export const initialHistory = [
  { id: "r1", name: "Frontend_Developer_Resume.pdf", date: "Aug 28, 2026", score: 82 },
  { id: "r2", name: "Fullstack_Engineer_v2.pdf",     date: "Aug 12, 2026", score: 74 },
  { id: "r3", name: "Old_Resume_2024.docx",          date: "Jun 03, 2026", score: 58 },
];
