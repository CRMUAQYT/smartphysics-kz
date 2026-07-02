import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  questionCreateSchema,
  questionUpdateSchema,
  topicCreateSchema,
  topicUpdateSchema,
} from './admin.schema';
import * as controller from './admin.controller';

const router = Router();

// Every admin route requires an authenticated ADMIN
router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard', controller.dashboard);

router.get('/topics', controller.listTopics);
router.get('/topics/:id', controller.getTopic);
router.post('/topics', validate(topicCreateSchema), controller.createTopic);
router.patch('/topics/:id', validate(topicUpdateSchema), controller.updateTopic);
router.delete('/topics/:id', controller.deleteTopic);

router.post('/questions', validate(questionCreateSchema), controller.createQuestion);
router.patch('/questions/:id', validate(questionUpdateSchema), controller.updateQuestion);
router.delete('/questions/:id', controller.deleteQuestion);

router.get('/students', controller.listStudents);
router.get('/students/:id', controller.getStudent);

export default router;
