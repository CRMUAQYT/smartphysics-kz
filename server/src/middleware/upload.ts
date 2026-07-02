import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env';

const uploadPath = path.resolve(process.cwd(), env.uploadDir);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, unique);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new Error('Тек сурет файлдары рұқсат етілген'));
  },
});
