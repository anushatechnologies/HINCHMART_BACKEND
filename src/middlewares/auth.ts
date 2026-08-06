import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'hinchmart_access_secret_2024!';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      code: 'NO_TOKEN',
      message: 'Unauthorized: Missing or invalid token'
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch (error: any) {
    // Distinguish expired from invalid — clients use TOKEN_EXPIRED to trigger silent refresh
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Access token expired. Please refresh.'
      });
    }
    return res.status(401).json({
      success: false,
      code: 'TOKEN_INVALID',
      message: 'Unauthorized: Token is invalid'
    });
  }
};

// Alias for backward compatibility
export const authenticate = requireAuth;

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ success: false, code: 'NO_TOKEN', message: 'Unauthorized' });
      }
      if (user.role === 'ADMIN' || roles.includes(user.role)) {
        return next();
      }
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' });
    });
  };
};

export const requireAdmin = requireRole('ADMIN');

export const requireVendor = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    const user = (req as any).user;
    if (!user || user.role !== 'VENDOR') {
      return res.status(403).json({ success: false, message: 'Forbidden: Vendor access required' });
    }
    next();
  });
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  if (!token) return next();

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
  } catch {
    // silently ignore in optionalAuth
  }
  next();
};
