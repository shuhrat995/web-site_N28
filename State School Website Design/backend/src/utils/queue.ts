import { db, saveDatabase, getNextId } from '../config/database.js';

export interface QueueItem {
  id?: number;
  action: string;
  payload: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count?: number;
  max_retries?: number;
  error_message?: string | null;
}

export function addToQueue(item: QueueItem): number {
  const newQueueItem = {
    id: getNextId('offline_queue'),
    action: item.action,
    payload: item.payload,
    status: item.status || 'pending',
    retry_count: item.retry_count || 0,
    max_retries: item.max_retries || 10,
    error_message: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    processed_at: null
  };
  
  db.offline_queue.push(newQueueItem);
  saveDatabase();
  
  return newQueueItem.id!;
}

export function getPendingQueueItems(): any[] {
  return db.offline_queue.filter(item => 
    item.status === 'pending' || 
    (item.status === 'failed' && item.retry_count < item.max_retries)
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function updateQueueItem(id: number, updates: Partial<QueueItem>): boolean {
  const itemIndex = db.offline_queue.findIndex(item => item.id === id);
  
  if (itemIndex === -1) return false;
  
  const item = db.offline_queue[itemIndex];
  
  if (updates.status) item.status = updates.status;
  if (updates.retry_count !== undefined) item.retry_count = updates.retry_count;
  if (updates.error_message !== undefined) item.error_message = updates.error_message;
  if (updates.status === 'completed') item.processed_at = new Date().toISOString();
  
  item.updated_at = new Date().toISOString();
  saveDatabase();
  
  return true;
}

export function processQueueItem(item: any): boolean {
  try {
    updateQueueItem(item.id, { status: 'processing' });
    
    const payload = JSON.parse(item.payload);
    
    // Process based on action type
    switch (item.action) {
      case 'CREATE_CONTENT':
      case 'UPDATE_CONTENT':
      case 'DELETE_CONTENT':
        // These will be handled by the content controller
        return true;
      default:
        throw new Error(`Unknown action type: ${item.action}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    updateQueueItem(item.id, {
      status: 'failed',
      retry_count: (item.retry_count || 0) + 1,
      error_message: errorMessage
    });
    return false;
  }
}

export function getQueueStats() {
  const pending = db.offline_queue.filter(item => item.status === 'pending').length;
  const processing = db.offline_queue.filter(item => item.status === 'processing').length;
  const completed = db.offline_queue.filter(item => item.status === 'completed').length;
  const failed = db.offline_queue.filter(item => item.status === 'failed').length;
  
  return {
    pending,
    processing,
    completed,
    failed,
    total: pending + processing + completed + failed
  };
}
