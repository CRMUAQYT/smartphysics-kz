import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import topicsRoutes from '../modules/topics/topics.routes';
import profileRoutes from '../modules/profile/profile.routes';
import adminRoutes from '../modules/admin/admin.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

router.use('/auth', authRoutes);
router.use('/', topicsRoutes); // /quarters, /sections, /topics...
router.use('/profile', profileRoutes);
router.use('/admin', adminRoutes);
router.use('/uploads', uploadRoutes);

export default router;
