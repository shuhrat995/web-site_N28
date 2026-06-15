import { Request, Response } from 'express';
import { db, getNextId, saveDatabase } from '../config/database.js';
import { deleteFile, getFileUrl } from '../utils/upload.js';
import type { AuthRequest } from '../utils/auth.js';
import { recordAdminAction } from '../utils/activity.js';

export function seedDefaultStaff() {
  if (!db.staff) db.staff = [];
  if (db.staff.length > 0) return;

  const now = new Date().toISOString();
  db.staff.push(
    {
      id: getNextId('staff'),
      name: 'Dr. Karimov A.B.',
      position: 'Direktor',
      description: 'Pedagogika fanlari doktori, 25 yillik tajriba',
      image_url: null,
      image_path: null,
      image_folder: null,
      image_name: null,
      order_num: 1,
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: getNextId('staff'),
      name: 'Rahimov S.N.',
      position: 'Direktor o\'rinbosari',
      description: 'Magistr, 18 yillik tajriba',
      image_url: null,
      image_path: null,
      image_folder: null,
      image_name: null,
      order_num: 2,
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: getNextId('staff'),
      name: 'Tursunova D.K.',
      position: 'O\'quv ishlari mudiri',
      description: 'Magistr, 15 yillik tajriba',
      image_url: null,
      image_path: null,
      image_folder: null,
      image_name: null,
      order_num: 3,
      is_active: true,
      created_at: now,
      updated_at: now
    }
  );
  saveDatabase();
}

export async function getStaff(req: Request, res: Response) {
  try {
    if (!db.staff || db.staff.length === 0) seedDefaultStaff();
    let staff = [...(db.staff || [])];
    if (req.query.active !== undefined) {
      const active = req.query.active === 'true';
      staff = staff.filter(item => (item.is_active ?? true) === active);
    }
    if (req.query.search) {
      const term = String(req.query.search).toLowerCase();
      staff = staff.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.position.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }
    staff.sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
    res.json({ staff, total: staff.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function createStaff(req: AuthRequest, res: Response) {
  try {
    const { name, position, description, order_num, is_active } = req.body;
    if (!name || !position) {
      return res.status(400).json({ error: 'Name and position are required' });
    }

    const file = (req as any).file;
    const imageFolder = file ? (req as any).uploadFolder : null;
    const imageName = file ? file.filename : null;
    const imageUrl = imageFolder && imageName ? getFileUrl(String(imageFolder), String(imageName)) : null;
    const now = new Date().toISOString();

    const staffItem = {
      id: getNextId('staff'),
      name,
      position,
      description: description || '',
      image_url: imageUrl,
      image_path: imageUrl,
      image_folder: imageFolder,
      image_name: imageName,
      order_num: parseInt(order_num) || (db.staff?.length || 0) + 1,
      is_active: is_active !== 'false' && is_active !== false,
      created_at: now,
      updated_at: now
    };

    db.staff.push(staffItem);
    recordAdminAction(req.admin?.id || null, 'create', 'staff', staffItem.id, `Created staff member: ${name}`);
    saveDatabase();
    res.status(201).json({ message: 'Staff member created', staff: staffItem });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateStaff(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const idx = db.staff.findIndex(item => item.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Staff member not found' });

    const existing = db.staff[idx];
    const { name, position, description, order_num, is_active } = req.body;
    const file = (req as any).file;

    let imageUrl = existing.image_url || null;
    let imageFolder = existing.image_folder || null;
    let imageName = existing.image_name || null;

    if (file) {
      if (imageFolder && imageName) deleteFile(String(imageFolder), String(imageName));
      imageFolder = (req as any).uploadFolder;
      imageName = file.filename;
      imageUrl = getFileUrl(String(imageFolder), String(imageName));
    }

    db.staff[idx] = {
      ...existing,
      name: name || existing.name,
      position: position || existing.position,
      description: description !== undefined ? description : existing.description,
      image_url: imageUrl,
      image_path: imageUrl,
      image_folder: imageFolder,
      image_name: imageName,
      order_num: order_num !== undefined ? parseInt(order_num) || existing.order_num : existing.order_num,
      is_active: is_active !== undefined ? is_active !== 'false' && is_active !== false : existing.is_active,
      updated_at: new Date().toISOString()
    };

    recordAdminAction(req.admin?.id || null, 'update', 'staff', id, `Updated staff member: ${db.staff[idx].name}`);
    saveDatabase();
    res.json({ message: 'Staff member updated', staff: db.staff[idx] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function deleteStaff(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const staffItem = db.staff.find(item => item.id === id);
    if (!staffItem) return res.status(404).json({ error: 'Staff member not found' });

    if (staffItem.image_folder && staffItem.image_name) {
      deleteFile(String(staffItem.image_folder), String(staffItem.image_name));
    }
    db.staff = db.staff.filter(item => item.id !== id);
    recordAdminAction(req.admin?.id || null, 'delete', 'staff', id, `Deleted staff member: ${staffItem.name}`);
    saveDatabase();
    res.json({ message: 'Staff member deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}
