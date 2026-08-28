import { uploadResumeService } from "../service/resume.service.js";

export const createResumeController = async (req, res, next) => {
  try {
    const result = await uploadResumeService(req.file);
    res.json({ text: result });
  } catch (error) {
    next(error);
  }
};
