import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import { levelForXP } from '../../utils/gamification';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Қолданушы табылмады');

  const [completedTopics, attempts, simCount, achievementsCount] = await Promise.all([
    prisma.userTopicProgress.count({ where: { userId, completed: true } }),
    prisma.quizAttempt.findMany({ where: { userId }, select: { percentage: true } }),
    prisma.simulationAttempt.count({ where: { userId } }),
    prisma.userAchievement.count({ where: { userId } }),
  ]);

  const avgQuiz =
    attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
      : 0;

  const level = levelForXP(user.totalXP);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      grade: user.grade,
      avatar: user.avatar,
      totalXP: user.totalXP,
      currentStreak: user.currentStreak,
    },
    level,
    stats: {
      completedTopics,
      avgQuizScore: avgQuiz,
      quizAttempts: attempts.length,
      simulationsDone: simCount,
      achievementsUnlocked: achievementsCount,
    },
  };
}

/** Section-by-section progress + the last unfinished lesson ("continue learning"). */
export async function getProgress(userId: string) {
  const sections = await prisma.section.findMany({
    orderBy: [{ quarter: { number: 'asc' } }, { orderNumber: 'asc' }],
    include: {
      quarter: true,
      topics: {
        where: { isPublished: true },
        include: { progress: { where: { userId } } },
      },
    },
  });

  const sectionProgress = sections.map((section) => {
    const total = section.topics.length;
    const completed = section.topics.filter((t) => t.progress[0]?.completed).length;
    return {
      id: section.id,
      title: section.title,
      quarter: section.quarter.number,
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  // Continue-learning: first opened-but-not-completed topic
  const continueTopic = await prisma.userTopicProgress.findFirst({
    where: { userId, topicOpened: true, completed: false },
    orderBy: { updatedAt: 'desc' },
    include: { topic: { select: { title: true, slug: true, coverImage: true } } },
  });

  // Quiz score history for the trend chart
  const quizHistory = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: 20,
    include: { topic: { select: { title: true } } },
  });

  return {
    sections: sectionProgress,
    continueLearning: continueTopic
      ? { title: continueTopic.topic.title, slug: continueTopic.topic.slug, cover: continueTopic.topic.coverImage }
      : null,
    quizHistory: quizHistory.map((q) => ({
      topic: q.topic.title,
      percentage: q.percentage,
      date: q.createdAt,
    })),
  };
}

export async function getAchievements(userId: string) {
  const all = await prisma.achievement.findMany({ orderBy: { xpReward: 'asc' } });
  const unlocked = await prisma.userAchievement.findMany({ where: { userId } });
  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

  return all.map((a) => ({
    code: a.code,
    title: a.title,
    description: a.description,
    icon: a.icon,
    xpReward: a.xpReward,
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) ?? null,
  }));
}

/** Last 7 days of activity for the weekly chart. */
export async function getActivity(userId: string) {
  const days: { date: string; xp: number; actions: number }[] = [];
  const today = new Date();
  const activities = await prisma.dailyActivity.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 30,
  });
  const map = new Map(
    activities.map((a) => [a.date.toISOString().slice(0, 10), a]),
  );

  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    const entry = map.get(key);
    days.push({ date: key, xp: entry?.xp ?? 0, actions: entry?.actions ?? 0 });
  }
  return days;
}
