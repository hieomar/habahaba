import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginSchema, refreshTokenSchema } from '../validations/auth.validation.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticateJWT, authController.getMe);

export default router;
