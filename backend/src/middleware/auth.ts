import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'eglise-secret-key-2024';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    group: string | null;
    bg: number | null;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid token.' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

export const canAccessGroup = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const requestedGroup = req.params.groupId || req.query.group;
  
  // Pasteur can access all
  if (req.user.role === 'PASTEUR') {
    return next();
  }

  // RESPONSABLE can only access their group
  if (req.user.role === 'RESPONSABLE' && req.user.group === requestedGroup) {
    return next();
  }

  // BG_LEADER can only access their own BG
  if (req.user.role === 'BG_LEADER' && req.user.group === requestedGroup) {
    return next();
  }

  return res.status(403).json({ error: 'Access denied to this group' });
};

export { JWT_SECRET };
