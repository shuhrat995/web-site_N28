import { Router } from 'express';
import { getSettings, updateSetting } from '../controllers/settingsController.js';
import { authenticateToken } from '../utils/auth.js';

const router = Router();

// Public route for frontend to read settings
router.get('/', getSettings);

// Protected routes
router.put('/', authenticateToken, updateSetting);

export default router;
