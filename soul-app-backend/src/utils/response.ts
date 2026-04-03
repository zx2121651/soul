import { Response } from 'express';

// 统一标准响应结构
export const sendSuccess = (res: Response, data: any = {}, message: string = 'Success') => {
  return res.status(200).json({
    code: 0,
    message,
    data
  });
};

export const sendError = (res: Response, statusCode: number, message: string, code: number = -1) => {
  return res.status(statusCode).json({
    code,
    message,
    data: null
  });
};
