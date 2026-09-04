import { groq, GROQ_MODEL } from "../config/groq.js";

const CATEGORIES = [
  "Keywords",
  "Experience",
  "Formatting",
  "Summary",
  "Skills",
  "Education",
  "Achievements",
  "Contact",
];

const weakestCategories = (breakdown = {}) =>
  Object.entries(breakdown)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 4)
    .map(([key]) => key);

const compactResume = (resume = {}) => ({
  personalInfo: resume.personalInfo || {},
  summary: resume.summary ? String(resume.summary).slice(0, 400) : null,
  skills: (resume.skills || []).slice(0, 20),
  experience: (resume.experience || []).slice(0, 3).map((e) => ({
    company: e.company,
    position: e.position,
    startDate: e.startDate,
    endDate: e.endDate,
    responsibilities: (e.responsibilities || [])
      .slice(0, 3)
      .map((r) => String(r).slice(0, 160)),
  })),
  education: (resume.education || []).slice(0, 2),
  projects: (resume.projects || []).slice(0, 2).map((p) => ({
    name: p.name,
    description: p.description
      ? String(p.description).slice(0, 180)
      : null,
  })),
});

const SYSTEM_PROMPT = `You are an ATS resume reviewer. Output ONLY a JSON object.

Example:
{"suggestions":[{"category":"Experience","priority":"high","issue":"Bullet is vague","suggestion":"Add scope and outcome","originalText":"Worked on APIs","improvedText":"Built REST APIs for the product"}]}

Rules:
- 5 to 6 suggestions
- category: Keywords, Experience, Formatting, Summary, Skills, Education, Achievements, or Contact
- priority: high, medium, or low
- Do not invent metrics or employers
- originalText and improvedText may be null`;

const normalizeSuggestions = (parsed) => {
  const list = Array.isArray(parsed?.suggestions)
    ? parsed.suggestions
    : Array.isArray(parsed)
      ? parsed
      : [];

  return list
    .filter((s) => s && CATEGORIES.includes(s.category))
    .slice(0, 8)
    .map((s) => ({
      category: s.category,
      priority: ["high", "medium", "low"].includes(s.priority)
        ? s.priority
        : "medium",
      issue: String(s.issue || "").slice(0, 300),
      suggestion: String(s.suggestion || "").slice(0, 500),
      originalText: s.originalText ?? null,
      improvedText: s.improvedText ?? null,
    }))
    .filter((s) => s.issue && s.suggestion);
};

const extractJson = (content) => {
  if (!content || !String(content).trim()) {
    throw new Error("Empty model response");
  }

  let cleaned = String(content)
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  return JSON.parse(cleaned);
};

const supportsStrictJson = !String(GROQ_MODEL).includes("gpt-oss");

const callSuggestionsModel = async (userPayload, { useJsonMode }) => {
  const params = {
    model: GROQ_MODEL,
    temperature: 0.2,
    max_tokens: 2048,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify(userPayload),
      },
    ],
  };

  if (useJsonMode) {
    params.response_format = { type: "json_object" };
  }

  const response = await groq.chat.completions.create(params);
  const message = response.choices[0]?.message || {};
  const content = message.content || message.reasoning || "";
  return extractJson(content);
};

export const generateSuggestions = async (resume, atsScore) => {
  const userPayload = {
    domain: atsScore?.domain || "general",
    weakestAreas: weakestCategories(atsScore?.breakdown),
    atsScore: atsScore?.score ?? null,
    breakdown: atsScore?.breakdown ?? {},
    resume: compactResume(resume),
  };

  try {
    let parsed;
    const preferJson = supportsStrictJson;

    try {
      parsed = await callSuggestionsModel(userPayload, {
        useJsonMode: preferJson,
      });
    } catch (firstErr) {
      console.warn(
        "Suggestions first attempt failed, retrying:",
        firstErr?.message || firstErr
      );
      parsed = await callSuggestionsModel(userPayload, {
        useJsonMode: !preferJson,
      });
    }

    return normalizeSuggestions(parsed);
  } catch (error) {
    console.error("Suggestion generation failed:", error?.message || error);
    return [];
  }
};
