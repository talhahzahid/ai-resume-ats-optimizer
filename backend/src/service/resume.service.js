import { PDFParse } from "pdf-parse";
import { AppError } from "../utils/AppError.js";
import { structureResume } from "./resumeParser.service.js";
import { calculateATSScore } from "./atsScore.service.js";
// import { text } from "node:stream/consumers";

export const uploadResumeService = async (file) => {
  if (!file || !file.buffer) {
    throw new AppError(
      "No file buffer received — check multer config (memoryStorage + correct field name)",
      400,
    );
  }

  let parser;
  try {
    parser = new PDFParse({ data: new Uint8Array(file.buffer) });
    const result = await parser.getText();
    // console.log(result);
    const a = await structureResume(result.text);
    const atsResult = calculateATSScore(a);
    console.log(atsResult);
    // console.log(a)
    return {
      extractedTest: a,
      ats_score: atsResult,
    };
    return result.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new AppError("Failed to process resume, please try again", 500);
  } finally {
    if (parser) await parser.destroy();
  }
};
