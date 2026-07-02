import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/error';
import { ok } from '../../utils/response';
import * as service from './profile.service';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => ok(res, await service.getProfile(req.user!.sub))));
router.get('/progress', asyncHandler(async (req, res) => ok(res, await service.getProgress(req.user!.sub))));
router.get('/achievements', asyncHandler(async (req, res) => ok(res, await service.getAchievements(req.user!.sub))));
router.get('/activity', asyncHandler(async (req, res) => ok(res, await service.getActivity(req.user!.sub))));

export default router;
