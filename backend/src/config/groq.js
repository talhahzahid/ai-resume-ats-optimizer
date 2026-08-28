import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

export const groq = new Groq({
  apiKey: process.env.LLM_KEY,
  // baseURL: "https://api.x.ai/v1",
});
