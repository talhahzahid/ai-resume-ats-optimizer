import { AppError } from "../utils/AppError.js";
import { groq, GROQ_MODEL, MAX_RESUME_CHARS } from "../config/groq.js";

const SYSTEM_PROMPT = `You are a resume parser. Output ONLY a JSON object. No markdown.

Rules:
- Extract only facts from the resume. Never invent data.
- Missing scalars: null. Missing lists: [].

{
  "personalInfo": {
    "name": null,
    "email": null,
    "phone": null,
    "location": null,
    "linkedin": null,
    "github": null
  },
  "summary": null,
  "skills": [],
  "experience": [
    {
      "company": null,
      "position": null,
      "startDate": null,
      "endDate": null,
      "responsibilities": []
    }
  ],
  "education": [
    {
      "degree": null,
      "institution": null,
      "startDate": null,
      "endDate": null
    }
  ],
  "projects": [
    {
      "name": null,
      "description": null,
      "technologies": []
    }
  ],
  "certifications": [
    {
      "name": null,
      "issuer": null,
      "date": null
    }
  ]
}`;

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

const normalizeResume = (parsed = {}) => ({
  personalInfo: parsed.personalInfo ?? {},
  summary: parsed.summary ?? null,
  skills: Array.isArray(parsed.skills) ? parsed.skills : [],
  experience: Array.isArray(parsed.experience) ? parsed.experience : [],
  education: Array.isArray(parsed.education) ? parsed.education : [],
  projects: Array.isArray(parsed.projects) ? parsed.projects : [],
  certifications: Array.isArray(parsed.certifications)
    ? parsed.certifications
    : [],
});

const supportsStrictJson = !String(GROQ_MODEL).includes("gpt-oss");

const callParser = async (text, { useJsonMode }) => {
  const params = {
    model: GROQ_MODEL,
    temperature: 0,
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
  };

  if (useJsonMode) {
    params.response_format = { type: "json_object" };
  }

  const response = await groq.chat.completions.create(params);
  const message = response.choices[0]?.message || {};
  const content = message.content || message.reasoning || "";
  return normalizeResume(extractJson(content));
};

export const structureResume = async (extractedText) => {
  const text = String(extractedText || "")
    .trim()
    .slice(0, MAX_RESUME_CHARS);

  if (!text) {
    throw new AppError("Resume text is empty — cannot parse", 400);
  }

  try {
    const preferJson = supportsStrictJson;
    try {
      return await callParser(text, { useJsonMode: preferJson });
    } catch (firstErr) {
      console.warn(
        "Parser first attempt failed, retrying:",
        firstErr?.message || firstErr
      );
      return await callParser(text, { useJsonMode: !preferJson });
    }
  } catch (error) {
    console.error("structureResume failed:", error?.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Resume parsing failed", 500);
  }
};
