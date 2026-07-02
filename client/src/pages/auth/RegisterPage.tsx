import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Atom, Rocket, FlaskConical, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';
import { AuthShell } from './AuthShell';
import { authApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/store/toast';
import { cn } from '@/utils/cn';

const schema = z.object({
  fullName: z.string().min(2, 'Аты-жөні кемінде 2 таңба'),
  email: z.string().email('Жарамды email енгізіңіз'),
  password: z
    .string()
    .min(8, 'Кемінде 8 таңба')
    .regex(/[A-Z]/, 'Кемінде бір бас әріп')
    .regex(/[a-z]/, 'Кемінде бір кіші әріп')
    .regex(/[0-9]/, 'Кемінде бір сан'),
  grade: z.coerce.number().int().min(5).max(11),
});
type FormData = z.infer<typeof schema>;

const AVATARS = [
  { key: 'atom', icon: Atom },
  { key: 'rocket', icon: Rocket },
  { key: 'flask', icon: FlaskConical },
  { key: 'spark', icon: Sparkles },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [avatar, setAvatar] = useState('atom');
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { grade: 7 } });

  const onSubmit = async (data: FormData) => {
    setSubmitError('');
    try {
      const res = await authApi.register({ ...data, avatar });
      setAuth(res);
      toast.success('Аккаунт сәтті құрылды!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  return (
    <AuthShell title="Тіркелу" subtitle="Тегін аккаунт құрып, физиканы зерттей баста">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {submitError && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
            {submitError}
          </div>
        )}
        <Field label="Аты-жөні" error={errors.fullName?.message} required htmlFor="fullName">
          <Input id="fullName" placeholder="Айсұлу Серікқызы" {...register('fullName')} />
        </Field>
        <Field label="Email" error={errors.email?.message} required htmlFor="email">
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
        </Field>
        <Field label="Құпиясөз" error={errors.password?.message} hint="Кемінде 8 таңба, бас әріп және сан" required htmlFor="password">
          <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" {...register('password')} />
        </Field>
        <Field label="Сынып" error={errors.grade?.message} required htmlFor="grade">
          <Select id="grade" {...register('grade')}>
            {[5, 6, 7, 8, 9].map((g) => (
              <option key={g} value={g}>
                {g}-сынып
              </option>
            ))}
          </Select>
        </Field>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Аватар таңдаңыз</label>
          <div className="flex gap-3">
            {AVATARS.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => setAvatar(a.key)}
                aria-label={a.key}
                aria-pressed={avatar === a.key}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl border transition-all',
                  avatar === a.key
                    ? 'border-primary bg-primary/15 text-primary shadow-glow'
                    : 'border-white/10 bg-white/5 text-muted hover:text-white',
                )}
              >
                <a.icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting}>
          Тіркелу
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Аккаунтыңыз бар ма?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Кіру
        </Link>
      </p>
    </AuthShell>
  );
}
