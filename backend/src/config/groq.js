import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

// Stick with the model that was already working for this project.
export const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
export const MAX_RESUME_CHARS = 12000;

export const groq = new Groq({
  apiKey: process.env.LLM_KEY,
});
