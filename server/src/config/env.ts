import dotenv from 'dotenv';
import path from 'path';

// Resolve .env paths from this file's location (independent of process.cwd()).
// server/.env wins over the monorepo root .env; override ensures a stale
// value in the environment can't shadow the file during dev reloads.
const serverEnv = path.resolve(__dirname, '../../.env'); // server/.env
const rootEnv = path.resolve(__dirname, '../../../.env'); // repo root .env
dotenv.config({ path: rootEnv, override: true });
dotenv.config({ path: serverEnv, override: true });

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const databaseUrl = required(
  'DATABASE_URL',
  'postgresql://smartphysics:smartphysics@localhost:5432/smartphysics?schema=public',
);
// Prisma reads DATABASE_URL from process.env directly (not this object),
// so make sure the resolved value is always present for the client.
process.env.DATABASE_URL = databaseUrl;

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 4000),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
  databaseUrl,
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev_access_secret_change_me_32_characters_minimum'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me_32_characters_minimum'),
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  },
} as const;
