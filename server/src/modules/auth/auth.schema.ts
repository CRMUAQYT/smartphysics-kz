import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Аты-жөні кемінде 2 таңба').max(120),
  email: z.string().email('Жарамды email енгізіңіз').toLowerCase(),
  password: z
    .string()
    .min(8, 'Құпиясөз кемінде 8 таңба')
    .regex(/[A-Z]/, 'Кемінде бір бас әріп болуы керек')
    .regex(/[a-z]/, 'Кемінде бір кіші әріп болуы керек')
    .regex(/[0-9]/, 'Кемінде бір сан болуы керек'),
  grade: z.coerce.number().int().min(5).max(11).default(7),
  avatar: z.string().max(40).default('atom'),
});

export const loginSchema = z.object({
  email: z.string().email('Жарамды email енгізіңіз').toLowerCase(),
  password: z.string().min(1, 'Құпиясөзді енгізіңіз'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
