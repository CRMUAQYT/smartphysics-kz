import { z } from 'zod';

const simulationType = z.enum(['NONE', 'ARCHIMEDES', 'MOTION', 'HOOKE']);

export const topicCreateSchema = z.object({
  sectionId: z.string().min(1, 'Бөлімді таңдаңыз'),
  title: z.string().min(2, 'Атауы қажет').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Тек кіші латын әріптері, сандар және сызықша'),
  shortDescription: z.string().min(2).max(400),
  content: z.string().default(''),
  formula: z.string().max(2000).optional().nullable(),
  coverImage: z.string().max(500).optional().nullable(),
  youtubeUrl: z.string().max(500).optional().nullable(),
  videoTitle: z.string().max(200).optional().nullable(),
  videoDescription: z.string().max(2000).optional().nullable(),
  keyConcepts: z.array(z.string().max(120)).default([]),
  objectives: z.array(z.string().max(300)).default([]),
  durationMinutes: z.coerce.number().int().min(1).max(240).default(10),
  xpReward: z.coerce.number().int().min(0).max(1000).default(50),
  simulationType: simulationType.default('NONE'),
  orderNumber: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const topicUpdateSchema = topicCreateSchema.partial();

export const questionCreateSchema = z.object({
  topicId: z.string().min(1),
  type: z.enum(['SINGLE', 'MULTIPLE', 'BOOLEAN']).default('SINGLE'),
  text: z.string().min(2).max(1000),
  explanation: z.string().max(2000).optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
  options: z
    .array(
      z.object({
        text: z.string().min(1).max(500),
        isCorrect: z.boolean().default(false),
      }),
    )
    .min(2, 'Кемінде 2 жауап нұсқасы')
    .refine((opts) => opts.some((o) => o.isCorrect), 'Кемінде бір дұрыс жауап белгіленуі керек'),
});

export const questionUpdateSchema = questionCreateSchema.partial().omit({ topicId: true });

export type TopicCreateInput = z.infer<typeof topicCreateSchema>;
export type TopicUpdateInput = z.infer<typeof topicUpdateSchema>;
export type QuestionCreateInput = z.infer<typeof questionCreateSchema>;
