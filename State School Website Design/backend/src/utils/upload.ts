import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_BASE = path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE_BYTES = parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || String(10 * 1024 * 1024));
const ALLOWED_UPLOAD_MIME_TYPES = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/webm')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm']);

function ensureUploadDir(): string {
  const now = new Date();
  const folder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dir = path.join(UPLOAD_BASE, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ensureUploadDir());
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error('Unsupported file extension'), '');
    }
    const prefix = file.mimetype.startsWith('video/') ? 'video' : 'image';
    const name = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const mimeType = file.mimetype.toLowerCase();
    const extension = path.extname(file.originalname).toLowerCase();
    const ok = ALLOWED_UPLOAD_MIME_TYPES.includes(mimeType) && ALLOWED_EXTENSIONS.has(extension);
    cb(null, ok);
  }
});

export function uploadMiddleware(req: Request, res: Response, next: NextFunction) {
  upload.single('image')(req, res, (err: any) => {
    if (err) return res.status(400).json({ error: err.message });
    if ((req as any).file) {
      const folder = path.basename(path.dirname((req as any).file.path));
      (req as any).uploadFolder = folder;
    }
    next();
  });
}

export function getFileUrl(folder: string, filename: string): string {
  return `/uploads/${folder}/${filename}`;
}

export function deleteFile(folder: string, filename: string): void {
  try {
    const resolvedBase = path.resolve(UPLOAD_BASE);
    const filePath = path.resolve(path.join(UPLOAD_BASE, folder, filename));
    if (!filePath.startsWith(resolvedBase)) return;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      const dir = path.dirname(filePath);
      if (dir.startsWith(resolvedBase) && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
      }
    }
  } catch (error) {
    console.error('Delete err:', error);
  }
}
