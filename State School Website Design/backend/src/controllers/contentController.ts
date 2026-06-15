import { Request, Response } from 'express';
import { db, saveDatabase, getNextId } from '../config/database.js';
import { uploadMiddleware, getFileUrl, deleteFile } from '../utils/upload.js';
import type { AuthRequest } from '../utils/auth.js';
import { recordAdminAction } from '../utils/activity.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAX_TEXT_LENGTH = 2500;

function deleteImage(folderName: string, filename: string) {
  try {
    deleteFile(folderName, filename);
  } catch (e) {
    console.error('Delete image error:', e);
  }
}

export async function createContent(req: AuthRequest, res: Response) {
  try {
    const {
      title,
      description,
      content_text,
      category,
      is_published,
      publish_date,
      slug,
      media_type,
      video_url,
      album
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Sarlavha va kategoriya shart' });
    }

    if (!db.content) db.content = [];

    const file = (req as any).file;
    let imageUrl = null;
    let imageFolder = null;
    let imageName = null;

    if (file) {
      imageFolder = (req as any).uploadFolder;
      imageName = file.filename;
      imageUrl = getFileUrl(String(imageFolder), String(imageName));
      console.log(`✅ Content image: ${imageUrl}`);
    }

    const newContent = {
      id: getNextId('content'),
      title,
      description: description || null,
      content_text: content_text || null,
      image_url: imageUrl,
      image_path: imageUrl,
      image_folder: imageFolder,
      image_name: imageName,
      category,
      media_type: (media_type === 'video' ? 'video' : 'image') as 'image' | 'video',
      video_url: video_url || null,
      slug: slug || createSlug(title),
      views: 0,
      album: album || null,
      is_published: is_published === 'true' || is_published === true,
      publish_date: publish_date || (is_published === 'true' || is_published === true ? new Date().toISOString() : null),
      created_by: req.admin?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.content.push(newContent);
    recordAdminAction(req.admin?.id || null, 'create', 'content', newContent.id, `Created ${category}: ${title}`);
    saveDatabase();

    res.status(201).json({ message: 'Content yaratildi', content: newContent });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
}

export async function updateContent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idx = db.content.findIndex(c => c.id === parseInt(id));
    if (idx === -1) return res.status(404).json({ error: 'Topilmadi' });

    const existing = db.content[idx];
    const { title, description, content_text, category, is_published, publish_date, slug, media_type, video_url, album } = req.body;

    let imageUrl = existing.image_url;
    let imageFolder = existing.image_folder;
    let imageName = existing.image_name;

    const file = (req as any).file;
    if (file) {
      // Eski rasmni o'chirish
      if (existing.image_folder && existing.image_name) {
        deleteImage(String(existing.image_folder), String(existing.image_name));
      }
      imageFolder = (req as any).uploadFolder;
      imageName = file.filename;
      imageUrl = getFileUrl(String(imageFolder), String(imageName));
    }

    db.content[idx] = {
      ...existing,
      title: title || existing.title,
      description: description !== undefined ? description : existing.description,
      content_text: content_text !== undefined ? content_text : existing.content_text,
      category: category || existing.category,
      is_published: is_published !== undefined ? (is_published === 'true' || is_published === true) : existing.is_published,
      publish_date: publish_date !== undefined ? publish_date : existing.publish_date,
      slug: slug !== undefined ? slug : existing.slug,
      media_type: media_type !== undefined ? media_type : existing.media_type,
      video_url: video_url !== undefined ? video_url : existing.video_url,
      album: album !== undefined ? album : existing.album,
      image_url: imageUrl,
      image_path: imageUrl,
      image_folder: imageFolder,
      image_name: imageName,
      updated_at: new Date().toISOString()
    };

    saveDatabase();
    recordAdminAction(req.admin?.id || null, 'update', 'content', db.content[idx].id, `Updated ${db.content[idx].category}: ${db.content[idx].title}`);
    res.json({ message: 'Content yangilandi', content: db.content[idx] });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
}

export async function deleteContent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idx = db.content.findIndex(c => c.id === parseInt(id));
    if (idx === -1) return res.status(404).json({ error: 'Topilmadi' });

    const content = db.content[idx];
    if (content.image_folder && content.image_name) {
      deleteImage(content.image_folder, content.image_name);
    }

    db.content.splice(idx, 1);
    recordAdminAction(req.admin?.id || null, 'delete', 'content', content.id, `Deleted ${content.category}: ${content.title}`);
    saveDatabase();

    res.json({ message: "Content o'chirildi" });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
}

export async function getContent(req: Request, res: Response) {
  const content = db.content.find(c => c.id === parseInt(req.params.id));
  if (!content) return res.status(404).json({ error: 'Topilmadi' });
  content.views = (content.views || 0) + 1;
  saveDatabase();
  res.json({ content });
}

export async function getAllContent(req: Request, res: Response) {
  let filtered = [...(db.content || [])];

  // Filtrlar
  if (req.query.category) filtered = filtered.filter(c => c.category === req.query.category);
  if (req.query.type) filtered = filtered.filter(c => c.category === req.query.type);
  if (req.query.album) filtered = filtered.filter(c => c.album === req.query.album);
  if (req.query.search) {
    const term = String(req.query.search).toLowerCase();
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(term) ||
      (c.description || '').toLowerCase().includes(term) ||
      (c.content_text || '').toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term)
    );
  }
  if (req.query.published !== undefined) {
    const pub = req.query.published === 'true';
    filtered = filtered.filter(c => c.is_published === pub);
  }

  // Saralash (Yangi qo'shilganlar birinchi)
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // Sahifalash
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = filtered.slice(startIndex, endIndex);

  res.json({ 
    content: results, 
    total: filtered.length,
    page,
    limit
  });
}

export async function publishContent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const idx = db.content.findIndex(c => c.id === parseInt(id));
    if (idx === -1) return res.status(404).json({ error: 'Topilmadi' });

    db.content[idx] = {
      ...db.content[idx],
      is_published: true,
      publish_date: db.content[idx].publish_date || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    recordAdminAction(req.admin?.id || null, 'publish', 'content', db.content[idx].id, `Published ${db.content[idx].title}`);
    saveDatabase();
    res.json({ message: 'Published', content: db.content[idx] });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
}

export async function uploadImage(req: AuthRequest, res: Response) {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: 'Rasm yoq' });
  
  const imageUrl = getFileUrl((req as any).uploadFolder, file.filename);
  res.json({ message: 'Rasm yuklandi', image_url: imageUrl, image_folder: (req as any).uploadFolder, image_name: file.filename });
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `post-${Date.now()}`;
}
