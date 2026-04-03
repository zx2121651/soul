import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 [Global Error Handler]:', err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  sendError(res, statusCode, message, statusCode);
};
