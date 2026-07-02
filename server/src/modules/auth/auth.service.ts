import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  durationToMs,
} from '../../utils/jwt';
import { env } from '../../config/env';
import { LoginInput, RegisterInput } from './auth.schema';

export function publicUser(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    grade: user.grade,
    avatar: user.avatar,
    totalXP: user.totalXP,
    currentStreak: user.currentStreak,
    createdAt: user.createdAt,
  };
}

async function issueTokens(user: User) {
  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + durationToMs(env.jwt.refreshExpiresIn)),
    },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'Бұл email тіркелген', [{ path: 'email', message: 'Email бос емес' }]);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      grade: input.grade,
      avatar: input.avatar,
      role: 'STUDENT',
    },
  });

  const tokens = await issueTokens(user);
  return { user: publicUser(user), ...tokens };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError(401, 'Email немесе құпиясөз қате');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new AppError(401, 'Email немесе құпиясөз қате');

  const tokens = await issueTokens(user);
  return { user: publicUser(user), ...tokens };
}

export async function refresh(token: string) {
  if (!token) throw new AppError(401, 'Refresh токен жоқ');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError(401, 'Refresh токен жарамсыз');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh токен жарамсыз немесе мерзімі бітті');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new AppError(401, 'Қолданушы табылмады');

  // Rotate: revoke the used token, issue a new pair
  await prisma.refreshToken.update({ where: { token }, data: { revoked: true } });
  const tokens = await issueTokens(user);
  return { user: publicUser(user), ...tokens };
}

export async function logout(token: string) {
  if (!token) return;
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revoked: true },
  });
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Қолданушы табылмады');
  return publicUser(user);
}
