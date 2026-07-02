import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error';
import { ok } from '../../utils/response';
import * as service from './topics.service';

export const listQuarters = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await service.listQuarters());
});

export const listSections = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await service.listSections());
});

export const listTopics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.sub ?? null;
  const topics = await service.listTopics(userId, req.query as never);
  return ok(res, topics);
});

export const getTopic = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.sub ?? null;
  const topic = await service.getTopicBySlug(req.params.slug, userId);
  return ok(res, topic);
});

export const openTopic = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.openTopic(req.user!.sub, req.params.id));
});

export const completeVideo = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.completeVideo(req.user!.sub, req.params.id));
});

export const completeSimulation = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.completeSimulation(req.user!.sub, req.params.id, req.body?.params));
});

export const getQuestions = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.getQuestions(req.params.id));
});

export const submitQuiz = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.submitQuiz(req.user!.sub, req.params.id, req.body));
});
