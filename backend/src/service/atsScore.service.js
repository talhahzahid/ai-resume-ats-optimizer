// personal information
const checkContactInfo = (resume) => {
  let score = 0;
  const info = resume.personalInfo;

  if (info.name) score += 2;
  if (info.email) score += 2;
  if (info.phone) score += 2;
  if (info.linkedin) score += 2;
  if (info.location) score += 2;

  return score; // max 10
};

// section score
const checkSections = (resume) => {
  let score = 0;

  if (resume.summary) score += 3;
  if (resume?.skills?.length) score += 3;
  if (resume?.experience?.length) score += 4;
  if (resume?.education?.length) score += 3;
  if (resume?.projects?.length) score += 2;

  return score; // max 15
};

// skill score
const checkSkills = (resume) => {
  const count = resume.skills.length || 0;
  if (count >= 15) return 10;
  if (count >= 10) return 8;
  if (count >= 5) return 5;
  if (count > 0) return 3;
  return 0; // max 10
};

// experience score
const checkExperience = (resume) => {
  let score = 0;
  const experience = resume.experience || [];
  if (!experience.length) return 0;
  experience.forEach((exp) => {
    if (exp.company) score += 1;
    if (exp.position) score += 1;
    if (exp.startDate) score += 0.5;
    if (exp.responsibilities.length) score += 2;
  });

  return Math.min(score, 10); // max 10
};

// education score
const checkEducation = (resume) => {
  let score = 0;
  const education = resume.education?.[0];

  if (!education) return 0;

  if (education.degree) score += 3;
  if (education.institution) score += 3;
  if (education.startDate || education.endDate) score += 1;

  return score; // max 7
};

const checkKeywords = (resume) => {
  const keywordBank = [
    "javascript",
    "react",
    "node",
    "api",
    "sql",
    "database",
    "rest",
    "typescript",
    "aws",
    "git",
    "agile",
    "authentication",
    "testing",
    "docker",
    "llm",
  ];

  const resumeText = JSON.stringify(resume).toLowerCase();

  const matchCount = keywordBank.filter((keyword) =>
    resumeText.includes(keyword),
  ).length;

  const score = Math.round((matchCount / keywordBank.length) * 10);

  return score; // max 10
};

const checkAchievements = (resume) => {
  let score = 0;
  const experience = resume.experience || [];
  const projects = resume.projects || [];

  const metricRegex = /\d+(\.\d+)?\s*(%|percent|x|users|ms|seconds|hours)/i;

  const allResponsibilities = [
    ...experience.flatMap((exp) => exp.responsibilities || []),
    ...projects.map((proj) => proj.description || ""),
  ];

  const hasMetrics = allResponsibilities.some((text) => metricRegex.test(text));

  if (hasMetrics) score += 5;
  if (resume.certifications?.length) score += 3;
  if (projects.length >= 2) score += 2;

  return Math.min(score, 10); // max 10
};

const checkFormatting = (resume) => {
  let score = 10;

  if (!resume.personalInfo?.email) score -= 3;
  if (!resume.personalInfo?.phone) score -= 2;
  if (!resume.summary) score -= 2;
  if (!resume.skills?.length) score -= 2;
  if (!resume.experience?.length && !resume.projects?.length) score -= 1;

  return Math.max(score, 0); // max 10
};

// Har category ka max defined — normalization ke liye
const MAX_SCORES = {
  contact: 10,
  sections: 15,
  skills: 10,
  experience: 10,
  keywords: 10,
  education: 7,
  achievements: 10,
  formatting: 10,
};

// Raw score ko 0-100 scale pe convert karta hai
const normalize = (rawScore, max) => Math.round((rawScore / max) * 100);

export const calculateATSScore = (resume) => {
  const rawBreakdown = {
    contact: checkContactInfo(resume),
    sections: checkSections(resume),
    skills: checkSkills(resume),
    experience: checkExperience(resume),
    keywords: checkKeywords(resume),
    education: checkEducation(resume),
    achievements: checkAchievements(resume),
    formatting: checkFormatting(resume),
  };

  // Har category ko 0-100 pe normalize karo (frontend ring ke liye)
  const breakdown = {};
  for (const key in rawBreakdown) {
    breakdown[key] = normalize(rawBreakdown[key], MAX_SCORES[key]);
  }

  // Overall score bhi 0-100 pe — weighted average (max points ke hisab se)
  const totalRaw = Object.values(rawBreakdown).reduce((t, v) => t + v, 0);
  const totalMax = Object.values(MAX_SCORES).reduce((t, v) => t + v, 0);
  const score = Math.round((totalRaw / totalMax) * 100);

  return {
    score,
    breakdown,
  };
};
