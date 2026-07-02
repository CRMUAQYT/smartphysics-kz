import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, fail } from '../utils/response';
import { env } from '../config/env';

export function notFound(_req: Request, res: Response) {
  return fail(res, 404, 'Ресурс табылмады');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return fail(res, err.status, err.message, err.errors);
  }

  if (err instanceof ZodError) {
    return fail(
      res,
      422,
      'Деректерді тексеру сәтсіз аяқталды',
      err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return fail(res, 409, 'Бұл жазба қазірдің өзінде бар');
    }
    if (err.code === 'P2025') {
      return fail(res, 404, 'Ресурс табылмады');
    }
  }

  // Log full error server-side, hide stack from client in production
  console.error('[error]', err);
  const message = err instanceof Error ? err.message : 'Ішкі сервер қатесі';
  return fail(res, 500, env.isProd ? 'Ішкі сервер қатесі' : message);
}

/** Wraps async controllers so thrown errors reach the error handler. */
export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(
  fn: T,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
