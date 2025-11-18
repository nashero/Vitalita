import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../controllers/auth.controller.js';
import { listCentersForRegistration } from '../controllers/centers.controller.js';
import { requireAuth } from '../middleware/rbac.middleware.js';
import {
  registrationRateLimiter,
  authRateLimiter,
  passwordResetRateLimiter,
} from '../middleware/rateLimit.middleware.js';

const router = Router();

// Public routes
// Use /public/centers to avoid conflict with /centers in staff.routes.ts
router.get('/public/centers', (req, res, next) => {
  console.log('[authRoutes] /public/centers route matched - calling listCentersForRegistration');
  return listCentersForRegistration(req, res, next);
});
router.post('/register', registrationRateLimiter, registerValidation, register);
router.post('/login', authRateLimiter, loginValidation, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', passwordResetRateLimiter, forgotPasswordValidation, forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, resetPasswordValidation, resetPassword);

// Protected routes
router.get('/me', requireAuth, getCurrentUser);

export default router;

