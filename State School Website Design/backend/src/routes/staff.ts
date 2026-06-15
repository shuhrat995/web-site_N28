import { Router } from 'express';
import { createStaff, deleteStaff, getStaff, updateStaff } from '../controllers/staffController.js';
import { authenticateToken } from '../utils/auth.js';
import { uploadMiddleware } from '../utils/upload.js';

const router = Router();

router.get('/', getStaff);
router.post('/', authenticateToken, uploadMiddleware, createStaff);
router.put('/:id', authenticateToken, uploadMiddleware, updateStaff);
router.delete('/:id', authenticateToken, deleteStaff);

export default router;
