import {
  LayoutDashboard,
  FileSearch,
  Files,
  Sparkles,
  Settings as SettingsIcon,
} from "lucide-react";

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "upload", label: "Analyze Resume", icon: FileSearch },
  { key: "history", label: "My Resumes", icon: Files },
  { key: "suggestions", label: "Suggestions", icon: Sparkles },
  { key: "settings", label: "Settings", icon: SettingsIcon },
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

export const mockAnalysis = {
  fileName: "Frontend_Developer_Resume.pdf",
  atsScore: 82,
  potentialScore: 91,
  breakdown: [
    { key: "ats", label: "ATS Compatibility", score: 85, note: "Parses cleanly across major tracking systems." },
    { key: "keywords", label: "Keywords", score: 78, note: "Covers most core terms for your target role." },
    { key: "formatting", label: "Formatting", score: 92, note: "Consistent structure, headers, and spacing." },
    { key: "experience", label: "Experience", score: 88, note: "Clear ownership across your work history." },
    { key: "skills", label: "Skills", score: 81, note: "Relevant stack — could be more specific." },
    { key: "education", label: "Education", score: 95, note: "Complete and properly formatted." },
  ],
  strengths: [
    "Strong professional summary",
    "Good use of relevant keywords",
    "Clear work experience structure",
    "Easy-to-read formatting",
    "Strong technical skills section",
  ],
  improvements: [
    {
      id: "imp-1",
      severity: "high",
      category: "Experience",
      problem: "Missing measurable achievements",
      detail: "Your experience section contains responsibilities but very few measurable results.",
    },
    {
      id: "imp-2",
      severity: "medium",
      category: "Keywords",
      problem: "Weak keyword coverage",
      detail: "Your resume is missing several keywords commonly found in your target role.",
    },
    {
      id: "imp-3",
      severity: "low",
      category: "Formatting",
      problem: "Inconsistent date formatting",
      detail: "Some entries use 'Jan 2023' while others use '01/2023'. Pick one format.",
    },
  ],
};

export const initialSuggestions = [
  {
    id: "sg-1",
    priority: "High",
    category: "Experience",
    issue: "Your bullet point is too generic.",
    current: "Developed web applications using React.",
    recommended:
      "Developed and optimized 5+ React applications, improving page performance by 30% and reducing load time by 25%.",
    status: "pending",
  },
  {
    id: "sg-2",
    priority: "High",
    category: "Experience",
    issue: "No team scope or scale mentioned.",
    current: "Managed development team.",
    recommended: "Led a team of 6 developers and delivered 12+ production features across two quarters.",
    status: "pending",
  },
  {
    id: "sg-3",
    priority: "Medium",
    category: "Keywords",
    issue: "Missing keywords common to this role.",
    current: "Worked with databases and backend systems.",
    recommended: "Worked with PostgreSQL and Node.js/Express to design and maintain backend systems.",
    status: "pending",
  },
  {
    id: "sg-4",
    priority: "Medium",
    category: "Summary",
    issue: "Summary reads as a list of adjectives.",
    current: "Hardworking and passionate developer looking for opportunities.",
    recommended:
      "Frontend-focused engineer with 3+ years shipping React products, specializing in performance and accessibility.",
    status: "pending",
  },
  {
    id: "sg-5",
    priority: "Medium",
    category: "Formatting",
    issue: "Section headers vary in casing.",
    current: "work Experience / SKILLS / Education",
    recommended: "Work Experience / Skills / Education",
    status: "pending",
  },
  {
    id: "sg-6",
    priority: "Low",
    category: "Keywords",
    issue: "Tools listed without context.",
    current: "Git, Docker, Figma",
    recommended: "Git (branching workflows), Docker (containerized deploys), Figma (design handoff)",
    status: "pending",
  },
  {
    id: "sg-7",
    priority: "Low",
    category: "Experience",
    issue: "Bullet starts with a weak verb.",
    current: "Was responsible for API integrations.",
    recommended: "Built and maintained 8+ REST API integrations powering the checkout flow.",
    status: "pending",
  },
  {
    id: "sg-8",
    priority: "High",
    category: "Formatting",
    issue: "Contact block missing a portfolio link.",
    current: "Name — Email — Phone",
    recommended: "Name — Email — Phone — Portfolio/GitHub link",
    status: "pending",
  },
];

export const initialHistory = [
  { id: "r1", name: "Frontend_Developer_Resume.pdf", date: "Aug 28, 2026", score: 82 },
  { id: "r2", name: "Fullstack_Engineer_v2.pdf", date: "Aug 12, 2026", score: 74 },
  { id: "r3", name: "Old_Resume_2024.docx", date: "Jun 03, 2026", score: 58 },
];

export const FILTERS = ["All", "High Priority", "Medium", "Low", "Keywords", "Experience", "Formatting", "Summary"];
