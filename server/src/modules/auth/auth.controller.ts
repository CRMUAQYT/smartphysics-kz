import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error';
import { ok, created } from '../../utils/response';
import * as authService from './auth.service';
import { env } from '../../config/env';

const REFRESH_COOKIE = 'refreshToken';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  setRefreshCookie(res, result.refreshToken);
  return created(res, result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  setRefreshCookie(res, result.refreshToken);
  return ok(res, result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken ?? '';
  const result = await authService.refresh(token);
  setRefreshCookie(res, result.refreshToken);
  return ok(res, result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken ?? '';
  await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  return ok(res, { message: 'Жүйеден шықтыңыз' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.me(req.user!.sub);
  return ok(res, user);
});
