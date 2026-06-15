import { Router } from 'express';
import { getPendingQueueItems, updateQueueItem, getQueueStats, processQueueItem } from '../utils/queue.js';
import { authenticateToken } from '../utils/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get queue statistics
router.get('/stats', (req, res) => {
  try {
    const stats = getQueueStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get queue stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending items
router.get('/pending', (req, res) => {
  try {
    const items = getPendingQueueItems();
    res.json({ items });
  } catch (error) {
    console.error('Get pending items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process queue
router.post('/process', async (req, res) => {
  try {
    const items = getPendingQueueItems();
    const results = [];
    
    for (const item of items) {
      const success = processQueueItem(item);
      results.push({ id: item.id, success });
    }
    
    res.json({ 
      message: 'Queue processing completed',
      results 
    });
  } catch (error) {
    console.error('Process queue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
