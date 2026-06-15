import { Request, Response, NextFunction } from 'express';

// Validate request body
export function validateRequest(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
}

// Check if admin is active
export function checkAdminActive(req: Request, res: Response, next: NextFunction) {
  // This will be implemented in the auth middleware
  next();
}

// Sanitize input
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
}
