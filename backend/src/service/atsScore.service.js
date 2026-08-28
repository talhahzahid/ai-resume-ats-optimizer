// personal information
const checkContactInfo = (resume) => {
  let score = 0;
  const info = resume.personalInfo;

  if (info?.name) score += 2;
  if (info?.email) score += 2;
  if (info?.phone) score += 2;
  if (info?.linkedin) score += 2;
  if (info?.location) score += 2;

  return score;
};

// section score
const checkSections = (resume) => {
  let score = 0;

  if (resume.summary) score += 3;
  if (resume.skills?.length) score += 3;
  if (resume.experience?.length) score += 4;
  if (resume.education?.length) score += 3;
  if (resume.projects?.length) score += 2;

  return score;
};

// skill score
const checkSkills = (resume) => {
  const count = resume.skills?.length || 0;

  if (count >= 15) return 10;
  if (count >= 10) return 8;
  if (count >= 5) return 5;
  if (count > 0) return 3;
  return 0;
};

// experience score
const checkExperience = (resume) => {
  let score = 0;
  const experience = resume.experience || [];

  if (!experience.length) return 0;

  experience.forEach((exp) => {
    if (exp?.company) score += 1;
    if (exp?.position) score += 1;
    if (exp?.startDate) score += 0.5;
    if (exp?.responsibilities?.length) score += 2;
  });

  return Math.min(score, 10);
};

// education score
const checkEducation = (resume) => {
  let score = 0;
  const education = resume.education?.[0];

  if (!education) return 0;

  if (education.degree) score += 3;
  if (education.institution) score += 3;
  if (education.startDate || education.endDate) score += 1;

  return score;
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
    "aws",
    "llm",
  ];

  const resumeText = JSON.stringify(resume).toLowerCase();

  const matchCount = keywordBank.filter((keyword) =>
    resumeText.includes(keyword),
  ).length;

  // Proportional score out of 10
  const score = Math.round((matchCount / keywordBank.length) * 10);

  return score;
};

const checkAchievements = (resume) => {
  let score = 0;
  const experience = resume.experience || [];
  const projects = resume.projects || [];

  // Numbers/metrics  (e.g. "40%", "10,000 users", "reduced by 2x")
  const metricRegex = /\d+(\.\d+)?\s*(%|percent|x|users|ms|seconds|hours)/i;

  const allResponsibilities = [
    ...experience.flatMap((exp) => exp.responsibilities || []),
    ...projects.map((proj) => proj.description || ""),
  ];

  const hasMetrics = allResponsibilities.some((text) => metricRegex.test(text));

  if (hasMetrics) score += 5;
  if (resume.certifications?.length) score += 3;
  if (projects.length >= 2) score += 2;

  return Math.min(score, 10);
};

const checkFormatting = (resume) => {
  let score = 10;

  // Basic sanity checks
  if (!resume.personalInfo?.email) score -= 3;
  if (!resume.personalInfo?.phone) score -= 2;
  if (!resume.summary) score -= 2;
  if (!resume.skills?.length) score -= 2;
  if (!resume.experience?.length && !resume.projects?.length) score -= 1;

  return Math.max(score, 0);
};

export const calculateATSScore = (resume) => {
  const breakdown = {
    contact: checkContactInfo(resume),
    sections: checkSections(resume),
    skills: checkSkills(resume),
    experience: checkExperience(resume),
    keywords: checkKeywords(resume),
    education: checkEducation(resume),
    achievements: checkAchievements(resume),
    formatting: checkFormatting(resume),
  };

  const score = Object.values(breakdown).reduce(
    (total, value) => total + value,
    0,
  );

  return {
    score,
    breakdown,
  };
};
