import { Request, Response } from 'express';
import { db, saveDatabase } from '../config/database.js';
import type { AuthRequest } from '../utils/auth.js';

export function getDashboardStats(_req: Request, res: Response) {
  const content = db.content || [];
  const teachers = db.teachers || [];
  const students = db.students || [];
  const staff = db.staff || [];
  const gallery = content.filter(item => item.category === 'gallery');
  const news = content.filter(item => item.category === 'news');

  res.json({
    stats: {
      teachers: teachers.length,
      students: students.length,
      staff: staff.length,
      news: news.length,
      gallery: gallery.length,
      drafts: content.filter(item => !item.is_published).length,
      published: content.filter(item => item.is_published).length,
      views: content.reduce((sum, item) => sum + (item.views || 0), 0)
    }
  });
}

export function getActivityLogs(_req: AuthRequest, res: Response) {
  res.json({ logs: (db.activity_logs || []).slice(0, 100) });
}

export function getNotifications(_req: AuthRequest, res: Response) {
  res.json({ notifications: db.notifications || [] });
}

export function markNotificationRead(req: AuthRequest, res: Response) {
  const notification = (db.notifications || []).find(item => item.id === parseInt(req.params.id));
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  notification.read = true;
  saveDatabase();
  res.json({ notification });
}
