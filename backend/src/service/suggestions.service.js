import { groq } from "../config/groq.js";
import { AppError } from "../utils/AppError.js";

export const generateSuggestions = async (resume, atsScore) => {
  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `
You are an expert ATS (Applicant Tracking System) resume reviewer.

Analyze the given structured resume JSON and its ATS score breakdown, then generate specific, actionable improvement suggestions.

Rules:
- Only suggest improvements based on what's actually present or missing in the resume.
- Each suggestion must be specific and actionable — not generic advice.
- "issue" should describe the problem in one short sentence.
- "suggestion" should describe the specific fix or improved version.
- "originalText" should be the exact text from the resume this suggestion refers to (if applicable), else null.
- "improvedText" should be a rewritten/improved version of that text (if applicable), else null.
- category must be one of: "Keywords", "Experience", "Formatting", "Summary", "Skills", "Education", "Achievements", "Contact"
- priority must be one of: "high", "medium", "low"
  - "high": missing critical info, generic/weak bullet points, no metrics/scope, missing keywords for the role
  - "medium": could be stronger but not critical (e.g. summary could be more targeted)
  - "low": minor polish (e.g. formatting consistency, optional sections)
- Generate between 5 and 10 suggestions total, prioritizing the weakest scoring categories from the ATS breakdown.
- Return ONLY valid JSON, no extra text or markdown.

Return in this exact structure:

{
  "suggestions": [
    {
      "id": "unique-string-id",
      "category": "Experience",
      "priority": "high",
      "issue": "Your bullet point is too generic.",
      "suggestion": "Add specific metrics and scope to quantify impact.",
      "originalText": "Worked on backend APIs for the project.",
      "improvedText": "Designed and implemented 5 REST API endpoints, reducing response time by 30%."
    }
  ]
}
          `,
        },
        {
          role: "user",
          content: JSON.stringify({ resume, atsScore }),
        },
      ],
    });

    const content = response.choices[0].message.content;
    const cleaned = content.trim().replace(/^```json\s*/, "").replace(/```$/, "");

    try {
      const parsed = JSON.parse(cleaned);
      return parsed.suggestions || [];
    } catch (parseErr) {
      throw new AppError(
        "Failed to parse suggestions JSON: " + parseErr.message,
        500,
      );
    }
  } catch (error) {
    throw new AppError(error.message, 500);
  }
};