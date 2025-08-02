"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const controller_1 = require("./controller");
const validate_request_1 = require("@shared/middleware/validate-request");
const router = (0, express_1.Router)();
exports.authRoutes = router;
const authController = new controller_1.AuthController();
// Login endpoint
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 })
], validate_request_1.validateRequest, authController.login);
// Multi-factor authentication
router.post('/mfa/setup', authController.setupMFA);
router.post('/mfa/verify', [
    (0, express_validator_1.body)('token').isLength({ min: 6, max: 6 })
], validate_request_1.validateRequest, authController.verifyMFA);
// SSO endpoints
router.post('/sso/saml', authController.samlLogin);
router.post('/sso/oauth', authController.oauthLogin);
// Token management
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
// Password management
router.post('/forgot-password', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail()
], validate_request_1.validateRequest, authController.forgotPassword);
router.post('/reset-password', [
    (0, express_validator_1.body)('token').notEmpty(),
    (0, express_validator_1.body)('password').isLength({ min: 8 })
], validate_request_1.validateRequest, authController.resetPassword);
// Session management
router.get('/sessions', authController.getUserSessions);
router.delete('/sessions/:sessionId', authController.terminateSession);
//# sourceMappingURL=routes.js.map