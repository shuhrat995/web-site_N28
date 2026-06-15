import { Router } from 'express';
import { login, logout, changePassword, getProfile, createInitialAdmin, getDevices, revokeDevice, setSecretKey, recoverPassword, revokeAllOtherDevices, getLoginHistory } from '../controllers/authController.js';
import { authenticateToken } from '../utils/auth.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/recover-password', recoverPassword);
router.post('/logout', authenticateToken, logout);

// Protected routes
router.post('/change-password', authenticateToken, changePassword);
router.get('/profile', authenticateToken, getProfile);
router.get('/devices', authenticateToken, getDevices);
router.delete('/devices/:deviceId', authenticateToken, revokeDevice);
router.post('/devices/revoke-all-others', authenticateToken, revokeAllOtherDevices);
router.post('/set-secret-key', authenticateToken, setSecretKey);
router.get('/login-history', authenticateToken, getLoginHistory);

export { createInitialAdmin };
export default router;
