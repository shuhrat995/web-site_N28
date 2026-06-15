import { Router } from 'express';
import {
  createContent,
  updateContent,
  deleteContent,
  getContent,
  getAllContent,
  publishContent,
  uploadImage
} from '../controllers/contentController.js';
import { uploadMiddleware } from '../utils/upload.js';
import { authenticateToken } from '../utils/auth.js';

const router = Router();

// Public routes
router.get('/', getAllContent);
router.get('/:id', getContent);

// Protected routes
router.post('/', authenticateToken, uploadMiddleware, createContent);
router.put('/:id', authenticateToken, uploadMiddleware, updateContent);
router.patch('/:id/publish', authenticateToken, publishContent);
router.delete('/:id', authenticateToken, deleteContent);
router.post('/upload-image', authenticateToken, uploadMiddleware, uploadImage);

export default router;
