import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from './controller';
import { validateRequest } from '@shared/middleware/validate-request';

const router = Router();
const authController = new AuthController();

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], validateRequest, authController.login);

// Multi-factor authentication
router.post('/mfa/setup', authController.setupMFA);
router.post('/mfa/verify', [
  body('token').isLength({ min: 6, max: 6 })
], validateRequest, authController.verifyMFA);

// SSO endpoints
router.post('/sso/saml', authController.samlLogin);
router.post('/sso/oauth', authController.oauthLogin);

// Token management
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);

// Password management
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], validateRequest, authController.forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 })
], validateRequest, authController.resetPassword);

// Session management
router.get('/sessions', authController.getUserSessions);
router.delete('/sessions/:sessionId', authController.terminateSession);

export { router as authRoutes };