import express from 'express';
import {
  registerController,
  loginController,
  meController,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/auth/register', registerController);
router.post('/auth/login', loginController);
router.get('/auth/me', authMiddleware, meController);

export default router;
