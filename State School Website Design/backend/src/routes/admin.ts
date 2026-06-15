import { Router } from 'express';
import { getActivityLogs, getDashboardStats, getNotifications, markNotificationRead } from '../controllers/adminController.js';
import { authenticateToken } from '../utils/auth.js';

const router = Router();

router.get('/stats', authenticateToken, getDashboardStats);
router.get('/activity', authenticateToken, getActivityLogs);
router.get('/notifications', authenticateToken, getNotifications);
router.patch('/notifications/:id/read', authenticateToken, markNotificationRead);

export default router;
