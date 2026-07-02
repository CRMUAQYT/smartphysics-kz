import { Router } from 'express';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { quizSubmitSchema, simulationCompleteSchema, topicsQuerySchema } from './topics.schema';
import * as controller from './topics.controller';

const router = Router();

// Catalog (personalized if a token is provided)
router.get('/quarters', controller.listQuarters);
router.get('/sections', controller.listSections);
router.get('/topics', optionalAuth, validate(topicsQuerySchema, 'query'), controller.listTopics);
router.get('/topics/:slug', optionalAuth, controller.getTopic);

// Progress actions (auth required)
router.post('/topics/:id/open', authenticate, controller.openTopic);
router.post('/topics/:id/video-complete', authenticate, controller.completeVideo);
router.post(
  '/topics/:id/simulation-complete',
  authenticate,
  validate(simulationCompleteSchema),
  controller.completeSimulation,
);

// Quiz
router.get('/topics/:id/questions', authenticate, controller.getQuestions);
router.post(
  '/topics/:id/quiz-attempts',
  authenticate,
  validate(quizSubmitSchema),
  controller.submitQuiz,
);

export default router;
