import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sendError } from '../utils/response';

export interface SoulJwtPayload extends JwtPayload {
  id: number;
  uuid: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: SoulJwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, '未提供认证 Token', 401);
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return sendError(res, 500, 'System misconfiguration: missing JWT_SECRET', 500);
  }

  try {
    const decoded = jwt.verify(token, secret) as SoulJwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 403, 'Token 无效或已过期', 403);
  }
};
