import { Router } from 'express';
import {
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacher,
  getAllTeachers
} from '../controllers/teacherController.js';
import { uploadMiddleware } from '../utils/upload.js';
import { authenticateToken } from '../utils/auth.js';

const router = Router();

// Public route
router.get('/', getAllTeachers);
router.get('/:id', getTeacher);

// Protected routes
router.post('/', authenticateToken, uploadMiddleware, createTeacher);
router.put('/:id', authenticateToken, uploadMiddleware, updateTeacher);
router.delete('/:id', authenticateToken, deleteTeacher);

export default router;
