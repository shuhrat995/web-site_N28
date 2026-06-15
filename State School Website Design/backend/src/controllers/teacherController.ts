import { Request, Response } from 'express';
import { db, saveDatabase, getNextId } from '../config/database.js';
import { uploadMiddleware, getFileUrl, deleteFile } from '../utils/upload.js';
import type { AuthRequest } from '../utils/auth.js';
import { recordAdminAction } from '../utils/activity.js';

function deleteImage(folderName: string, filename: string) {
  try { deleteFile(folderName, filename); } catch (e) { console.error(e); }
}

export async function createTeacher(req: AuthRequest, res: Response) {
  try {
    const { name, subject, bio, experience_years, phone, social_links, is_active } = req.body;

    if (!name || !subject) {
      return res.status(400).json({ error: 'Ism va fan shart' });
    }

    if (!db.teachers) db.teachers = [];

    const file = (req as any).file;
    let imageUrl = null;
    let imageFolder = null;
    let imageName = null;

    if (file) {
      imageFolder = (req as any).uploadFolder;
      imageName = file.filename;
      imageUrl = getFileUrl(String(imageFolder), String(imageName));
      console.log(`✅ Teacher image: ${imageUrl}`);
    }

    const newTeacher = {
      id: getNextId('teachers'),
      name,
      subject,
      bio: bio || null,
      image_url: imageUrl,
      image_path: imageUrl,
      image_folder: imageFolder,
      image_name: imageName,
      experience_years: parseInt(experience_years) || 0,
      phone: phone || null,
      social_links: parseSocialLinks(social_links),
      is_active: is_active === 'true' || is_active === true,
      created_by: req.admin?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.teachers.push(newTeacher);
    recordAdminAction(req.admin?.id || null, 'create', 'teacher', newTeacher.id, `Created teacher: ${name}`);
    saveDatabase();

    console.log(`✅ Teacher created: ${name} with image: ${imageUrl}`);
    res.status(201).json({ message: 'O\'qituvchi yaratildi', teacher: newTeacher });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
}

export async function updateTeacher(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idx = db.teachers.findIndex(t => t.id === parseInt(id));
    if (idx === -1) return res.status(404).json({ error: 'Topilmadi' });

    const existing = db.teachers[idx];
    const { name, subject, bio, experience_years, phone, social_links, is_active } = req.body;

    let imageUrl = existing.image_url;
    let imageFolder = existing.image_folder;
    let imageName = existing.image_name;

    const file = (req as any).file;
    if (file) {
      if (existing.image_folder && existing.image_name) {
        deleteImage(String(existing.image_folder), String(existing.image_name));
      }
      imageFolder = (req as any).uploadFolder;
      imageName = file.filename;
      imageUrl = getFileUrl(String(imageFolder), String(imageName));
    }

    db.teachers[idx] = {
      ...existing,
      name: name || existing.name,
      subject: subject || existing.subject,
      bio: bio !== undefined ? bio : existing.bio,
      experience_years: experience_years !== undefined ? parseInt(experience_years) : existing.experience_years,
      phone: phone !== undefined ? phone : existing.phone,
      social_links: social_links !== undefined ? parseSocialLinks(social_links) : existing.social_links,
      is_active: is_active !== undefined ? (is_active === 'true' || is_active === true) : existing.is_active,
      image_url: imageUrl,
      image_path: imageUrl,
      image_folder: imageFolder,
      image_name: imageName,
      updated_at: new Date().toISOString()
    };

    saveDatabase();
    recordAdminAction(req.admin?.id || null, 'update', 'teacher', db.teachers[idx].id, `Updated teacher: ${db.teachers[idx].name}`);
    res.json({ message: 'O\'qituvchi yangilandi', teacher: db.teachers[idx] });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
}

export async function deleteTeacher(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idx = db.teachers.findIndex(t => t.id === parseInt(id));
    if (idx === -1) return res.status(404).json({ error: 'Topilmadi' });

    const teacher = db.teachers[idx];
    if (teacher.image_folder && teacher.image_name) {
      deleteImage(teacher.image_folder, teacher.image_name);
    }

    db.teachers.splice(idx, 1);
    recordAdminAction(req.admin?.id || null, 'delete', 'teacher', teacher.id, `Deleted teacher: ${teacher.name}`);
    saveDatabase();

    res.json({ message: "O'qituvchi o'chirildi" });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
}

export async function getTeacher(req: Request, res: Response) {
  const teacher = db.teachers.find(t => t.id === parseInt(req.params.id));
  if (!teacher) return res.status(404).json({ error: 'Topilmadi' });
  res.json({ teacher });
}

export async function getAllTeachers(req: Request, res: Response) {
  let filtered = [...(db.teachers || [])];
  
  // Filtrlar
  if (req.query.active !== undefined) {
    const isActive = req.query.active === 'true';
    filtered = filtered.filter(t => t.is_active === isActive);
  }

  // Sahifalash (Pagination)
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = filtered.slice(startIndex, endIndex);

  res.json({ 
    teachers: results, 
    total: filtered.length,
    page,
    limit
  });
}

function parseSocialLinks(value: unknown) {
  if (!value) return {};
  if (typeof value === 'object') return value as Record<string, string>;
  try {
    return JSON.parse(String(value));
  } catch {
    return String(value)
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .reduce<Record<string, string>>((acc, item) => {
        const [key, link] = item.split(':').map(part => part.trim());
        if (key && link) acc[key] = link;
        return acc;
      }, {});
  }
}
