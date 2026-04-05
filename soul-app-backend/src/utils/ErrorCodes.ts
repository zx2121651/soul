export enum ErrorCode {
  SUCCESS = 0,

  // Auth & Security (1000 - 1999)
  AUTH_UNAUTHORIZED = 1001,
  AUTH_INVALID_TOKEN = 1002,
  AUTH_INVALID_CREDENTIALS = 1003,
  AUTH_USER_EXISTS = 1004,

  // Validation (2000 - 2999)
  VALIDATION_ERROR = 2001,

  // Resources (3000 - 3999)
  RESOURCE_NOT_FOUND = 3001,

  // System (5000+)
  SYSTEM_ERROR = 5000,
  SYSTEM_MISCONFIGURED = 5001,
}

export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.SUCCESS]: 'Success',
  [ErrorCode.AUTH_UNAUTHORIZED]: '未提供认证 Token',
  [ErrorCode.AUTH_INVALID_TOKEN]: 'Token 无效或已过期',
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: '用户名或密码错误',
  [ErrorCode.AUTH_USER_EXISTS]: '用户名已存在',
  [ErrorCode.VALIDATION_ERROR]: '请求参数校验失败',
  [ErrorCode.RESOURCE_NOT_FOUND]: '请求的资源不存在',
  [ErrorCode.SYSTEM_ERROR]: '服务器内部错误',
  [ErrorCode.SYSTEM_MISCONFIGURED]: '系统配置异常',
};
