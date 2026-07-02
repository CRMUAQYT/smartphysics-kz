import { Prisma, XPReason } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import { extractYouTubeId, youtubeEmbedUrl } from '../../utils/youtube';
import { XP_RULES } from '../../utils/gamification';
import {
  grantXP,
  touchStreak,
  unlockAchievement,
  evaluateProgressAchievements,
} from '../../services/gamification.service';
import { QuizSubmitInput } from './topics.schema';

type TopicFilter = {
  quarter?: number;
  sectionId?: string;
  search?: string;
  status?: 'all' | 'completed' | 'in-progress' | 'not-started';
};

export async function listQuarters() {
  return prisma.quarter.findMany({
    orderBy: { number: 'asc' },
    include: { sections: { orderBy: { orderNumber: 'asc' } } },
  });
}

export async function listSections() {
  return prisma.section.findMany({
    orderBy: [{ quarter: { number: 'asc' } }, { orderNumber: 'asc' }],
    include: { quarter: true },
  });
}

/** Lists published topics with the current user's progress merged in. */
export async function listTopics(userId: string | null, filter: TopicFilter) {
  const where: Prisma.TopicWhereInput = { isPublished: true };

  if (filter.sectionId) where.sectionId = filter.sectionId;
  if (filter.quarter) where.section = { quarter: { number: filter.quarter } };
  if (filter.search) {
    where.OR = [
      { title: { contains: filter.search, mode: 'insensitive' } },
      { shortDescription: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  const topics = await prisma.topic.findMany({
    where,
    orderBy: [{ section: { quarter: { number: 'asc' } } }, { orderNumber: 'asc' }],
    include: {
      section: { include: { quarter: true } },
      _count: { select: { questions: true } },
      progress: userId ? { where: { userId } } : false,
    },
  });

  const mapped = topics.map((topic) => {
    const progress = 'progress' in topic && Array.isArray(topic.progress) ? topic.progress[0] : undefined;
    return {
      id: topic.id,
      title: topic.title,
      slug: topic.slug,
      shortDescription: topic.shortDescription,
      coverImage: topic.coverImage,
      durationMinutes: topic.durationMinutes,
      xpReward: topic.xpReward,
      simulationType: topic.simulationType,
      orderNumber: topic.orderNumber,
      questionCount: topic._count.questions,
      section: { id: topic.section.id, title: topic.section.title, slug: topic.section.slug },
      quarter: { number: topic.section.quarter.number, title: topic.section.quarter.title },
      progress: progress
        ? {
            completed: progress.completed,
            percent: computePercent(progress),
            earnedXP: progress.earnedXP,
          }
        : { completed: false, percent: 0, earnedXP: 0 },
    };
  });

  if (filter.status && filter.status !== 'all') {
    return mapped.filter((t) => {
      if (filter.status === 'completed') return t.progress.completed;
      if (filter.status === 'in-progress') return !t.progress.completed && t.progress.percent > 0;
      return t.progress.percent === 0; // not-started
    });
  }

  return mapped;
}

function computePercent(p: {
  topicOpened: boolean;
  videoCompleted: boolean;
  simulationCompleted: boolean;
  quizCompleted: boolean;
}): number {
  const steps = [p.topicOpened, p.videoCompleted, p.simulationCompleted, p.quizCompleted];
  const done = steps.filter(Boolean).length;
  return Math.round((done / steps.length) * 100);
}

/** Full lesson payload for the student lesson page. */
export async function getTopicBySlug(slug: string, userId: string | null) {
  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      section: { include: { quarter: true } },
      objectives: { orderBy: { order: 'asc' } },
      _count: { select: { questions: true } },
    },
  });

  if (!topic || !topic.isPublished) throw new AppError(404, 'Тақырып табылмады');

  const youtubeId = extractYouTubeId(topic.youtubeUrl);
  const progress = userId
    ? await prisma.userTopicProgress.findUnique({
        where: { userId_topicId: { userId, topicId: topic.id } },
      })
    : null;

  return {
    id: topic.id,
    title: topic.title,
    slug: topic.slug,
    shortDescription: topic.shortDescription,
    content: topic.content,
    formula: topic.formula,
    coverImage: topic.coverImage,
    keyConcepts: topic.keyConcepts,
    durationMinutes: topic.durationMinutes,
    xpReward: topic.xpReward,
    simulationType: topic.simulationType,
    video: youtubeId
      ? {
          youtubeId,
          embedUrl: youtubeEmbedUrl(youtubeId),
          title: topic.videoTitle,
          description: topic.videoDescription,
        }
      : null,
    objectives: topic.objectives.map((o) => o.text),
    questionCount: topic._count.questions,
    section: { id: topic.section.id, title: topic.section.title, slug: topic.section.slug },
    quarter: { number: topic.section.quarter.number, title: topic.section.quarter.title },
    progress: progress
      ? {
          topicOpened: progress.topicOpened,
          videoCompleted: progress.videoCompleted,
          simulationCompleted: progress.simulationCompleted,
          quizCompleted: progress.quizCompleted,
          bestQuizScore: progress.bestQuizScore,
          completed: progress.completed,
          percent: computePercent(progress),
          earnedXP: progress.earnedXP,
        }
      : null,
  };
}

async function ensureProgress(userId: string, topicId: string) {
  return prisma.userTopicProgress.upsert({
    where: { userId_topicId: { userId, topicId } },
    create: { userId, topicId },
    update: {},
  });
}

async function recomputeCompletion(userId: string, topicId: string) {
  const p = await prisma.userTopicProgress.findUnique({
    where: { userId_topicId: { userId, topicId } },
  });
  if (!p) return;
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { _count: { select: { questions: true } } },
  });
  const hasSim = topic && topic.simulationType !== 'NONE';
  const hasQuiz = topic && topic._count.questions > 0;

  const completed =
    p.topicOpened &&
    p.videoCompleted &&
    (!hasSim || p.simulationCompleted) &&
    (!hasQuiz || p.quizCompleted);

  if (completed && !p.completed) {
    await prisma.userTopicProgress.update({
      where: { userId_topicId: { userId, topicId } },
      data: { completed: true, completedAt: new Date() },
    });
  }
}

export async function openTopic(userId: string, topicId: string) {
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) throw new AppError(404, 'Тақырып табылмады');

  await ensureProgress(userId, topicId);
  let granted = 0;

  await prisma.$transaction(async (tx) => {
    await tx.userTopicProgress.update({
      where: { userId_topicId: { userId, topicId } },
      data: { topicOpened: true },
    });
    granted = await grantXP(tx, userId, XP_RULES.TOPIC_OPEN, XPReason.TOPIC_OPEN, topicId);
    if (granted > 0) {
      await tx.userTopicProgress.update({
        where: { userId_topicId: { userId, topicId } },
        data: { earnedXP: { increment: granted } },
      });
    }
    await touchStreak(tx, userId);
  });

  await prisma.topic.update({ where: { id: topicId }, data: { viewCount: { increment: 1 } } });
  const newAchievements = [
    ...(await maybeUnlock(userId, 'FIRST_LESSON')),
    ...(await evaluateProgressAchievements(userId)),
  ];
  return { grantedXP: granted, newAchievements };
}

export async function completeVideo(userId: string, topicId: string) {
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) throw new AppError(404, 'Тақырып табылмады');

  await ensureProgress(userId, topicId);
  let granted = 0;

  await prisma.$transaction(async (tx) => {
    await tx.userTopicProgress.update({
      where: { userId_topicId: { userId, topicId } },
      data: { videoCompleted: true, topicOpened: true },
    });
    granted = await grantXP(tx, userId, XP_RULES.VIDEO_COMPLETE, XPReason.VIDEO_COMPLETE, topicId);
    if (granted > 0) {
      await tx.userTopicProgress.update({
        where: { userId_topicId: { userId, topicId } },
        data: { earnedXP: { increment: granted } },
      });
    }
    await touchStreak(tx, userId);
  });

  await recomputeCompletion(userId, topicId);
  const newAchievements = [
    ...(await maybeUnlock(userId, 'FIRST_VIDEO')),
    ...(await evaluateProgressAchievements(userId)),
  ];
  return { grantedXP: granted, newAchievements };
}

export async function completeSimulation(
  userId: string,
  topicId: string,
  params: Record<string, unknown> | undefined,
) {
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) throw new AppError(404, 'Тақырып табылмады');
  if (topic.simulationType === 'NONE') {
    throw new AppError(400, 'Бұл тақырыпта симуляция жоқ');
  }

  await ensureProgress(userId, topicId);
  let granted = 0;

  await prisma.$transaction(async (tx) => {
    await tx.simulationAttempt.create({
      data: { userId, topicId, type: topic.simulationType, params: (params ?? {}) as Prisma.InputJsonValue },
    });
    await tx.userTopicProgress.update({
      where: { userId_topicId: { userId, topicId } },
      data: { simulationCompleted: true, topicOpened: true },
    });
    granted = await grantXP(tx, userId, XP_RULES.SIMULATION_COMPLETE, XPReason.SIMULATION_COMPLETE, topicId);
    if (granted > 0) {
      await tx.userTopicProgress.update({
        where: { userId_topicId: { userId, topicId } },
        data: { earnedXP: { increment: granted } },
      });
    }
    await touchStreak(tx, userId);
  });

  await recomputeCompletion(userId, topicId);
  const simAchievements: Record<string, string> = {
    ARCHIMEDES: 'ARCHIMEDES_FOLLOWER',
    HOOKE: 'HOOKE_RESEARCHER',
    MOTION: 'SPEED_MASTER',
  };
  const newAchievements = [
    ...(await maybeUnlock(userId, 'FIRST_SIMULATION')),
    ...(await maybeUnlock(userId, simAchievements[topic.simulationType] ?? '')),
    ...(await evaluateProgressAchievements(userId)),
  ];
  return { grantedXP: granted, newAchievements };
}

export async function getQuestions(topicId: string) {
  const questions = await prisma.question.findMany({
    where: { topicId },
    orderBy: { order: 'asc' },
    include: { options: { orderBy: { order: 'asc' } } },
  });
  // Never leak isCorrect to the student while taking the quiz
  return questions.map((q) => ({
    id: q.id,
    type: q.type,
    text: q.text,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
  }));
}

export async function submitQuiz(userId: string, topicId: string, input: QuizSubmitInput) {
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) throw new AppError(404, 'Тақырып табылмады');

  const questions = await prisma.question.findMany({
    where: { topicId },
    include: { options: true },
  });
  if (questions.length === 0) throw new AppError(400, 'Бұл тақырыпта тест жоқ');

  const answerMap = new Map(input.answers.map((a) => [a.questionId, a.selectedIds]));

  let score = 0;
  const results = questions.map((q) => {
    const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id).sort();
    const selected = (answerMap.get(q.id) ?? []).slice().sort();
    const isCorrect =
      correctIds.length === selected.length && correctIds.every((id, i) => id === selected[i]);
    if (isCorrect) score += 1;
    return {
      questionId: q.id,
      text: q.text,
      isCorrect,
      correctIds,
      explanation: q.explanation,
    };
  });

  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 60;

  await ensureProgress(userId, topicId);
  const prevProgress = await prisma.userTopicProgress.findUnique({
    where: { userId_topicId: { userId, topicId } },
  });
  const prevBest = prevProgress?.bestQuizScore ?? 0;

  let grantedXP = 0;
  const attempt = await prisma.$transaction(async (tx) => {
    const created = await tx.quizAttempt.create({
      data: {
        userId,
        topicId,
        score,
        total,
        percentage,
        answers: {
          create: results.map((r) => ({
            questionId: r.questionId,
            selectedIds: answerMap.get(r.questionId) ?? [],
            isCorrect: r.isCorrect,
          })),
        },
      },
    });

    if (passed) {
      const passXP = await grantXP(tx, userId, XP_RULES.QUIZ_PASS, XPReason.QUIZ_PASS, topicId);
      grantedXP += passXP;
      if (percentage === 100) {
        const bonus = await grantXP(
          tx,
          userId,
          XP_RULES.QUIZ_PERFECT_BONUS,
          XPReason.QUIZ_PERFECT_BONUS,
          topicId,
        );
        grantedXP += bonus;
      }
      await tx.userTopicProgress.update({
        where: { userId_topicId: { userId, topicId } },
        data: {
          quizCompleted: true,
          topicOpened: true,
          bestQuizScore: Math.max(prevBest, percentage),
          earnedXP: { increment: grantedXP },
        },
      });
    } else if (percentage > prevBest) {
      await tx.userTopicProgress.update({
        where: { userId_topicId: { userId, topicId } },
        data: { bestQuizScore: percentage },
      });
    }

    if (grantedXP > 0) await touchStreak(tx, userId);
    return created;
  });

  if (passed) await recomputeCompletion(userId, topicId);

  const newAchievements = [
    ...(await maybeUnlock(userId, 'FIRST_QUIZ')),
    ...(await evaluateProgressAchievements(userId)),
  ];

  return {
    attemptId: attempt.id,
    score,
    total,
    percentage,
    passed,
    grantedXP,
    results,
    newAchievements,
  };
}

/** Helper that unlocks and returns the achievement code if it was newly granted. */
async function maybeUnlock(userId: string, code: string): Promise<string[]> {
  if (!code) return [];
  const unlocked = await unlockAchievement(prisma, userId, code);
  return unlocked ? [code] : [];
}
