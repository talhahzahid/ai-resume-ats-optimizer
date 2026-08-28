import { AppError } from "../utils/AppError.js";
import { groq } from "../config/groq.js";

export const structureResume = async (extractedText) => {
  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      response_format: { type: "json_object" },
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
You are a professional resume parser.

Convert the raw resume text into structured JSON.

Rules:
- Extract ONLY information present in the resume.
- Never invent information.
- Missing values must be null.
- Missing arrays must be [].
- Return ONLY valid JSON, with no extra text or markdown.

Use this structure:

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
}
          `,
        },
        {
          role: "user",
          content: extractedText,
        },
      ],
    });

    const content = response.choices[0].message.content;

    const cleaned = content
      .trim()
      .replace(/^```json\s*/, "")
      .replace(/```$/, "");

    try {
      return JSON.parse(cleaned);
    } catch (parseErr) {
      throw new AppError(
        "Failed to parse resume JSON: " + parseErr.message,
        500,
      );
    }
  } catch (error) {
    throw new AppError(error.message, 500);
  }
};
