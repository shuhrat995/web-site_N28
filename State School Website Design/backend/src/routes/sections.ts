import { Router } from 'express';
import { getPageContent, updateContent, getAllPageContent, updatePageContent } from '../controllers/sectionController.js';
import { authenticateToken } from '../utils/auth.js';

const router = Router();

// Public - get content for a page
router.get('/:page', getPageContent);
router.get('/', getAllPageContent);

// Protected - update content
router.put('/:page/:section/:key', authenticateToken, updateContent);
router.post('/:page/:section/:key', authenticateToken, updateContent);
router.put('/:page', authenticateToken, updatePageContent);
router.post('/:page', authenticateToken, updatePageContent);

export default router;
