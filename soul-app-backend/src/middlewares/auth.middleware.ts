import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sendError } from '../utils/response';
import { ErrorCode } from '../utils/ErrorCodes';
import redis from '../redis';


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

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, undefined, ErrorCode.AUTH_UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return sendError(res, 500, undefined, ErrorCode.SYSTEM_MISCONFIGURED);
  }

  try {
    const decoded = jwt.verify(token, secret) as SoulJwtPayload;

    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`auth:blacklist:${token}`);
    if (isBlacklisted) {
      return sendError(res, 401, 'Token 已失效', ErrorCode.AUTH_INVALID_TOKEN);
    }

    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 401, undefined, ErrorCode.AUTH_INVALID_TOKEN);
  }
};
