import { Response } from 'express';
import { ErrorCode, ErrorMessage } from './ErrorCodes';

export const sendSuccess = (res: Response, data: any = {}, message: string = ErrorMessage[ErrorCode.SUCCESS]) => {
  return res.status(200).json({
    code: ErrorCode.SUCCESS,
    message,
    data
  });
};

export const sendError = (res: Response, statusCode: number, customMessage?: string, code: ErrorCode = ErrorCode.SYSTEM_ERROR) => {
  const message = customMessage || ErrorMessage[code] || ErrorMessage[ErrorCode.SYSTEM_ERROR];
  return res.status(statusCode).json({
    code,
    message,
    data: null
  });
};
