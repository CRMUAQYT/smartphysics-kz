import { Prisma, PrismaClient, XPReason } from '@prisma/client';
import prisma from '../config/prisma';

type Tx = Prisma.TransactionClient | PrismaClient;

function startOfUTCDay(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Grants XP idempotently. The unique (userId, reason, refId) constraint on
 * UserXPTransaction guarantees the same action is never rewarded twice.
 * Returns the amount actually granted (0 if it was a duplicate).
 */
export async function grantXP(
  db: Tx,
  userId: string,
  amount: number,
  reason: XPReason,
  refId: string | null,
): Promise<number> {
  if (amount <= 0) return 0;
  try {
    await db.userXPTransaction.create({
      data: { userId, amount, reason, refId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return 0; // already granted
    }
    throw error;
  }

  await db.user.update({
    where: { id: userId },
    data: { totalXP: { increment: amount } },
  });

  // Track daily activity for the weekly-activity chart
  const day = startOfUTCDay();
  await db.dailyActivity.upsert({
    where: { userId_date: { userId, date: day } },
    create: { userId, date: day, xp: amount, actions: 1 },
    update: { xp: { increment: amount }, actions: { increment: 1 } },
  });

  return amount;
}

/** Updates the learning streak based on last activity date. */
export async function touchStreak(db: Tx, userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const today = startOfUTCDay();
  const last = user.lastActivityDate ? startOfUTCDay(user.lastActivityDate) : null;

  let streak = user.currentStreak;
  if (!last) {
    streak = 1;
  } else {
    const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000);
    if (diffDays === 0) {
      // same day, keep streak
    } else if (diffDays === 1) {
      streak += 1;
    } else {
      streak = 1;
    }
  }

  await db.user.update({
    where: { id: userId },
    data: { currentStreak: streak, lastActivityDate: today },
  });
}

/** Unlocks an achievement (idempotent) and grants its bonus XP. */
export async function unlockAchievement(db: Tx, userId: string, code: string): Promise<boolean> {
  const achievement = await db.achievement.findUnique({ where: { code } });
  if (!achievement) return false;

  try {
    await db.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return false; // already unlocked
    }
    throw error;
  }

  if (achievement.xpReward > 0) {
    await grantXP(db, userId, achievement.xpReward, XPReason.ACHIEVEMENT, achievement.id);
  }
  return true;
}

/**
 * Re-evaluates count-based achievements (e.g. "5 topics completed").
 * Called after progress changes. Returns newly unlocked achievement codes.
 */
export async function evaluateProgressAchievements(userId: string): Promise<string[]> {
  const unlocked: string[] = [];

  const [completedTopics, perfectQuizzes] = await Promise.all([
    prisma.userTopicProgress.count({ where: { userId, completed: true } }),
    prisma.quizAttempt.groupBy({
      by: ['topicId'],
      where: { userId, percentage: 100 },
      _count: true,
    }),
  ]);

  const checks: Array<[boolean, string]> = [
    [completedTopics >= 5, 'FIVE_TOPICS'],
    [completedTopics >= 10, 'TEN_TOPICS'],
    [perfectQuizzes.length >= 5, 'FIVE_PERFECT'],
  ];

  for (const [condition, code] of checks) {
    if (condition && (await unlockAchievement(prisma, userId, code))) {
      unlocked.push(code);
    }
  }

  // Streak achievements
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    if (user.currentStreak >= 3 && (await unlockAchievement(prisma, userId, 'STREAK_3'))) {
      unlocked.push('STREAK_3');
    }
    if (user.currentStreak >= 7 && (await unlockAchievement(prisma, userId, 'STREAK_7'))) {
      unlocked.push('STREAK_7');
    }
  }

  return unlocked;
}
