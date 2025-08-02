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
], validateRequest, authController.login.bind(authController));

// Multi-factor authentication
router.post('/mfa/setup', authController.setupMFA.bind(authController));
router.post('/mfa/verify', [
  body('token').isLength({ min: 6, max: 6 })
], validateRequest, authController.verifyMFA.bind(authController));

// SSO endpoints
router.post('/sso/saml', authController.samlLogin.bind(authController));
router.post('/sso/oauth', authController.oauthLogin.bind(authController));

// Token management
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/logout-all', authController.logoutAll.bind(authController));

// Password management
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], validateRequest, authController.forgotPassword.bind(authController));

router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 })
], validateRequest, authController.resetPassword.bind(authController));

// Session management
router.get('/sessions', authController.getUserSessions.bind(authController));
router.delete('/sessions/:sessionId', authController.terminateSession.bind(authController));

export { router as authRoutes };