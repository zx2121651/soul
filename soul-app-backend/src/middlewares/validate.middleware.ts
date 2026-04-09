import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

/**
 * 生产级：Zod 参数校验中间件
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // 格式化错误信息为中文易读格式
        const errorMessages = error.errors.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
        return sendError(res, 400, `参数校验失败: ${errorMessages}`);
      }
      return sendError(res, 400, '请求参数异常');
    }
  };
};
