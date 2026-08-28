import express from "express";
import { createResumeController } from "../controllers/resume.controller.js";
import upload from "../middleware/multer.js";
const router = express.Router();

router.post("/upload", upload.single("pdf"), createResumeController);


export default router