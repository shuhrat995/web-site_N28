import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'school-website-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'admin_auth';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function getAuthCookieName(): string {
  return AUTH_COOKIE_NAME;
}

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  return authHeader && authHeader.split(' ')[1] ? authHeader.split(' ')[1] : null;
}

export function extractAuthToken(req: Request): string | null {
  const bearerToken = getBearerToken(req);
  if (bearerToken) return bearerToken;

  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.[AUTH_COOKIE_NAME];
  return cookieToken || null;
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export interface AuthRequest extends Request {
  admin?: {
    id: number;
    username: string;
  };
  adminId?: number;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractAuthToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || typeof decoded !== 'object') {
      return res.status(403).json({ error: 'Invalid token format' });
    }

    const adminId = Number((decoded as any).id);
    const tokenDeviceId = Number((decoded as any).deviceId);
    const headerDeviceId = Number(req.headers['x-device-id'] || 0);

    if (!adminId) {
      return res.status(403).json({ error: 'Invalid token payload' });
    }

    const admin = (db.admins || []).find((item) => item.id === adminId && item.is_active);
    if (!admin) {
      return res.status(403).json({ error: 'Admin account is inactive or not found' });
    }

    if (tokenDeviceId) {
      const device = (db.devices || []).find((item) => item.id === tokenDeviceId && item.admin_id === adminId);
      if (!device || !device.is_active) {
        return res.status(403).json({ error: 'Invalid or revoked device' });
      }
      if (headerDeviceId && headerDeviceId !== tokenDeviceId) {
        return res.status(403).json({ error: 'Device mismatch' });
      }
    }

    req.admin = { id: admin.id, username: admin.username };
    req.adminId = admin.id;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}
