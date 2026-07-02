import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { fail } from '../utils/response';
import { Role } from '@prisma/client';

// Augment Express Request with the authenticated user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 401, 'Авторизация қажет');
  }
  const token = header.slice(7);
  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return fail(res, 401, 'Токен жарамсыз немесе мерзімі бітті');
  }
}

/** Attaches req.user when a valid token is present, but never rejects. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(header.slice(7));
    } catch {
      // ignore — treat as anonymous
    }
  }
  return next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return fail(res, 401, 'Авторизация қажет');
    if (!roles.includes(req.user.role)) {
      return fail(res, 403, 'Бұл әрекетке рұқсат жоқ');
    }
    return next();
  };
}
