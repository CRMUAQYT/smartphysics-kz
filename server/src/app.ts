import path from 'path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import routes from './routes';
import { openapiDocument } from './config/openapi';
import { errorHandler, notFound } from './middleware/error';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images from another origin
      contentSecurityPolicy: false,
    }),
  );

  app.use(
    cors({
      origin: env.clientUrl.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Global rate limiter
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Static uploads
  app.use('/uploads', express.static(path.resolve(process.cwd(), env.uploadDir)));

  // API docs
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

  // API routes
  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
