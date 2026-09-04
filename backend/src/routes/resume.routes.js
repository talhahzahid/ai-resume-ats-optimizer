import express from 'express';
import {
  createResumeController,
  getAllResumesController,
  getResumeById,
  getResumeStatus,
  deleteResumeController,
} from '../controllers/resume.controller.js';
import upload from '../middleware/multer.js';
const router = express.Router ();

router.get ('/resumes', getAllResumesController);
router.post ('/upload', upload.single ('pdf'), createResumeController);
router.get ('/resume/:id', getResumeById);
router.get ('/resume/:id/status', getResumeStatus);
router.delete ('/resume/:id', deleteResumeController);

export default router;
