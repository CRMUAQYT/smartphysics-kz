import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { asyncHandler } from '../middleware/error';
import { created, fail } from '../utils/response';
import prisma from '../config/prisma';

const router = Router();

// Admin-only image upload for topic covers
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return fail(res, 400, 'Файл жүктелмеді');
    const url = `/uploads/${req.file.filename}`;
    const record = await prisma.uploadedFile.create({
      data: {
        userId: req.user!.sub,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url,
      },
    });
    return created(res, { url: record.url, id: record.id });
  }),
);

export default router;
