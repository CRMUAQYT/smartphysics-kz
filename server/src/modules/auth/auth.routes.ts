import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { loginSchema, registerSchema } from './auth.schema';
import * as controller from './auth.controller';

const router = Router();

// Stricter limiter for credential endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Тым көп әрекет. Кейінірек қайталаңыз', errors: [] },
});

router.post('/register', authLimiter, validate(registerSchema), controller.register);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);

export default router;
