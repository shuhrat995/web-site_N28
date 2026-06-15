// Security utilities for high-level protection
import crypto from 'crypto';

const LOGIN_WINDOW_MS = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000');
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5');

// Generate secure random token
export function generateSecureToken(length: number = 64): string {
  return crypto.randomBytes(length).toString('hex');
}

// Hash with SHA-256
export function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Generate device fingerprint
export function generateDeviceFingerprint(req: any): string {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection.remoteAddress || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  const fingerprint = `${userAgent}|${ip}|${acceptLanguage}|${acceptEncoding}`;
  return sha256(fingerprint);
}

// Rate limit tracker
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function trackLoginAttempt(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  
  if (!attempt) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  if (now - attempt.lastAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    const retryAfter = Math.ceil((LOGIN_WINDOW_MS - (now - attempt.lastAttempt)) / 1000);
    return { allowed: false, retryAfter };
  }
  
  attempt.count++;
  attempt.lastAttempt = now;
  return { allowed: true };
}

export function resetLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// Session timeout (24 hours)
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

// Validate password strength
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
