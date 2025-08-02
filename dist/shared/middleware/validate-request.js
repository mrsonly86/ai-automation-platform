"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const apiError = {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array()
        };
        const response = {
            success: false,
            error: apiError,
            timestamp: new Date().toISOString(),
            requestId: (0, uuid_1.v4)()
        };
        res.status(400).json(response);
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validate-request.js.map