"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        const apiError = {
            code: 'UNAUTHORIZED',
            message: 'Access token is required'
        };
        const response = {
            success: false,
            error: apiError,
            timestamp: new Date().toISOString(),
            requestId: (0, uuid_1.v4)()
        };
        res.status(401).json(response);
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        const apiError = {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired access token'
        };
        const response = {
            success: false,
            error: apiError,
            timestamp: new Date().toISOString(),
            requestId: (0, uuid_1.v4)()
        };
        res.status(403).json(response);
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map