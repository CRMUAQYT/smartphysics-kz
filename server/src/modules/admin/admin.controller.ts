import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error';
import { created, ok } from '../../utils/response';
import * as service from './admin.service';

export const dashboard = asyncHandler(async (_req: Request, res: Response) => ok(res, await service.dashboard()));

export const listTopics = asyncHandler(async (_req: Request, res: Response) => ok(res, await service.listTopicsAdmin()));
export const getTopic = asyncHandler(async (req: Request, res: Response) => ok(res, await service.getTopicAdmin(req.params.id)));
export const createTopic = asyncHandler(async (req: Request, res: Response) => created(res, await service.createTopic(req.body)));
export const updateTopic = asyncHandler(async (req: Request, res: Response) => ok(res, await service.updateTopic(req.params.id, req.body)));
export const deleteTopic = asyncHandler(async (req: Request, res: Response) => ok(res, await service.deleteTopic(req.params.id)));

export const createQuestion = asyncHandler(async (req: Request, res: Response) => created(res, await service.createQuestion(req.body)));
export const updateQuestion = asyncHandler(async (req: Request, res: Response) => ok(res, await service.updateQuestion(req.params.id, req.body)));
export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => ok(res, await service.deleteQuestion(req.params.id)));

export const listStudents = asyncHandler(async (_req: Request, res: Response) => ok(res, await service.listStudents()));
export const getStudent = asyncHandler(async (req: Request, res: Response) => ok(res, await service.getStudent(req.params.id)));
