import { Router } from 'express';
import { getStudents, addStudent, updateStudent, deleteStudent, markAttendance } from '../controllers/studentController.js';
import { authenticateToken } from '../utils/auth.js';
import { uploadMiddleware } from '../utils/upload.js';

const router = Router();

router.get('/', getStudents);
router.post('/', authenticateToken, uploadMiddleware, addStudent);
router.put('/:id', authenticateToken, uploadMiddleware, updateStudent);
router.patch('/:id/attendance', authenticateToken, markAttendance);
router.delete('/:id', authenticateToken, deleteStudent);

export default router;
