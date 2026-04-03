"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
// 统一标准响应结构
const sendSuccess = (res, data = {}, message = 'Success') => {
    return res.status(200).json({
        code: 0,
        message,
        data
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, statusCode, message, code = -1) => {
    return res.status(statusCode).json({
        code,
        message,
        data: null
    });
};
exports.sendError = sendError;
