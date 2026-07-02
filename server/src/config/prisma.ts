import './env'; // ensure env is loaded and DATABASE_URL is set before the client is created
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
