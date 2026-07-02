import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import { sanitizeRichText } from '../../utils/sanitize';
import { levelForXP } from '../../utils/gamification';
import { QuestionCreateInput, TopicCreateInput, TopicUpdateInput } from './admin.schema';

export async function dashboard() {
  const [students, publishedTopics, videoCount, questionCount, attempts, topViewed, recentStudents] =
    await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.topic.count({ where: { isPublished: true } }),
      prisma.topic.count({ where: { NOT: { youtubeUrl: null } } }),
      prisma.question.count(),
      prisma.quizAttempt.findMany({ select: { percentage: true } }),
      prisma.topic.findMany({
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: { id: true, title: true, viewCount: true, slug: true },
      }),
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, fullName: true, email: true, grade: true, totalXP: true, createdAt: true },
      }),
    ]);

  const avgQuiz =
    attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
      : 0;

  return {
    counts: { students, publishedTopics, videoCount, questionCount },
    avgQuizScore: avgQuiz,
    topViewedTopics: topViewed,
    recentStudents,
  };
}

export async function listTopicsAdmin() {
  return prisma.topic.findMany({
    orderBy: [{ section: { quarter: { number: 'asc' } } }, { orderNumber: 'asc' }],
    include: {
      section: { include: { quarter: true } },
      _count: { select: { questions: true } },
    },
  });
}

export async function getTopicAdmin(id: string) {
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      objectives: { orderBy: { order: 'asc' } },
      questions: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } },
    },
  });
  if (!topic) throw new AppError(404, 'Тақырып табылмады');
  return topic;
}

export async function createTopic(input: TopicCreateInput) {
  const { objectives, content, ...rest } = input;
  return prisma.topic.create({
    data: {
      ...rest,
      content: sanitizeRichText(content ?? ''),
      objectives: { create: objectives.map((text, order) => ({ text, order })) },
    },
    include: { objectives: true },
  });
}

export async function updateTopic(id: string, input: TopicUpdateInput) {
  const existing = await prisma.topic.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Тақырып табылмады');

  const { objectives, content, ...rest } = input;
  const data: Prisma.TopicUpdateInput = { ...rest };
  if (content !== undefined) data.content = sanitizeRichText(content);

  return prisma.$transaction(async (tx) => {
    const topic = await tx.topic.update({ where: { id }, data });
    if (objectives) {
      await tx.topicObjective.deleteMany({ where: { topicId: id } });
      await tx.topicObjective.createMany({
        data: objectives.map((text, order) => ({ topicId: id, text, order })),
      });
    }
    return topic;
  });
}

export async function deleteTopic(id: string) {
  const existing = await prisma.topic.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Тақырып табылмады');
  await prisma.topic.delete({ where: { id } });
  return { id };
}

export async function createQuestion(input: QuestionCreateInput) {
  const { options, ...rest } = input;
  return prisma.question.create({
    data: {
      ...rest,
      options: { create: options.map((o, order) => ({ ...o, order })) },
    },
    include: { options: true },
  });
}

export async function updateQuestion(id: string, input: Partial<QuestionCreateInput>) {
  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Сұрақ табылмады');

  const { options, topicId: _topicId, ...rest } = input;
  return prisma.$transaction(async (tx) => {
    const question = await tx.question.update({ where: { id }, data: rest });
    if (options) {
      await tx.questionOption.deleteMany({ where: { questionId: id } });
      await tx.questionOption.createMany({
        data: options.map((o, order) => ({ questionId: id, text: o.text, isCorrect: o.isCorrect, order })),
      });
    }
    return question;
  });
}

export async function deleteQuestion(id: string) {
  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Сұрақ табылмады');
  await prisma.question.delete({ where: { id } });
  return { id };
}

export async function listStudents() {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { totalXP: 'desc' },
    include: {
      _count: { select: { progress: { where: { completed: true } } } },
      quizAttempts: { select: { percentage: true } },
    },
  });

  return students.map((s) => {
    const avg =
      s.quizAttempts.length > 0
        ? Math.round(s.quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / s.quizAttempts.length)
        : 0;
    return {
      id: s.id,
      fullName: s.fullName,
      email: s.email,
      grade: s.grade,
      totalXP: s.totalXP,
      level: levelForXP(s.totalXP).name,
      completedTopics: s._count.progress,
      avgQuizScore: avg,
    };
  });
}

export async function getStudent(id: string) {
  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      progress: {
        include: { topic: { select: { title: true, slug: true } } },
        orderBy: { updatedAt: 'desc' },
      },
      quizAttempts: {
        orderBy: { createdAt: 'desc' },
        include: { topic: { select: { title: true } } },
      },
      achievements: { include: { achievement: true } },
    },
  });
  if (!student || student.role !== 'STUDENT') throw new AppError(404, 'Оқушы табылмады');

  return {
    id: student.id,
    fullName: student.fullName,
    email: student.email,
    grade: student.grade,
    avatar: student.avatar,
    totalXP: student.totalXP,
    currentStreak: student.currentStreak,
    level: levelForXP(student.totalXP),
    progress: student.progress.map((p) => ({
      topic: p.topic.title,
      slug: p.topic.slug,
      completed: p.completed,
      bestQuizScore: p.bestQuizScore,
      earnedXP: p.earnedXP,
    })),
    quizAttempts: student.quizAttempts.map((q) => ({
      topic: q.topic.title,
      percentage: q.percentage,
      date: q.createdAt,
    })),
    achievements: student.achievements.map((a) => ({
      code: a.achievement.code,
      title: a.achievement.title,
      unlockedAt: a.unlockedAt,
    })),
  };
}
