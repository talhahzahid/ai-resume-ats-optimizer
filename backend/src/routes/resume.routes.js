import express from 'express';
import {
  createResumeController,
  getResumeById,
  getResumeStatus,
} from '../controllers/resume.controller.js';
import upload from '../middleware/multer.js';
const router = express.Router ();

router.post ('/upload', upload.single ('pdf'), createResumeController);
router.get ('/resume/:id', getResumeById);
router.get ('/resume/:id/status', getResumeStatus);

export default router;
