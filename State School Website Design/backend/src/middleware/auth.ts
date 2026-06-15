import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../utils/auth.js';
import { authenticateToken as baseAuthenticateToken } from '../utils/auth.js';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  return baseAuthenticateToken(req, res, next);
};
