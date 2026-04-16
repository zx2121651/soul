import { ErrorCode } from './ErrorCodes';

export class SmsSendFailedException extends Error {
  public statusCode: number;
  public errorCode: ErrorCode;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'SmsSendFailedException';
    this.statusCode = statusCode;
    this.errorCode = ErrorCode.SMS_SEND_FAILED;
  }
}

export class RateLimitException extends Error {
  public statusCode: number;
  public errorCode: ErrorCode;

  constructor(message: string, errorCode: ErrorCode) {
    super(message);
    this.name = 'RateLimitException';
    this.statusCode = 429;
    this.errorCode = errorCode;
  }
}
