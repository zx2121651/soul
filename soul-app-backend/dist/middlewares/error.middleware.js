"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const response_1 = require("../utils/response");
const errorMiddleware = (err, req, res, next) => {
    console.error('🔥 [Global Error Handler]:', err.message || err);
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || '服务器内部错误';
    (0, response_1.sendError)(res, statusCode, message, statusCode);
};
exports.errorMiddleware = errorMiddleware;
