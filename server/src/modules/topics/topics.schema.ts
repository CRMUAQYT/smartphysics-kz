import { z } from 'zod';

export const topicsQuerySchema = z.object({
  quarter: z.coerce.number().int().optional(),
  sectionId: z.string().optional(),
  search: z.string().max(120).optional(),
  status: z.enum(['all', 'completed', 'in-progress', 'not-started']).default('all'),
});

export const quizSubmitSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedIds: z.array(z.string()).min(1, 'Кемінде бір жауап таңдаңыз'),
      }),
    )
    .min(1, 'Кемінде бір сұраққа жауап беріңіз'),
});

export const simulationCompleteSchema = z.object({
  params: z.record(z.string(), z.unknown()).optional(),
});

export type QuizSubmitInput = z.infer<typeof quizSubmitSchema>;
