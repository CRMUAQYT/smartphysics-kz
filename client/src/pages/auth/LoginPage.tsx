import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { AuthShell } from './AuthShell';
import { authApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/store/toast';

const schema = z.object({
  email: z.string().email('Жарамды email енгізіңіз'),
  password: z.string().min(1, 'Құпиясөзді енгізіңіз'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitError('');
    try {
      const res = await authApi.login(data);
      setAuth(res);
      toast.success('Қош келдіңіз!');
      const from = (location.state as { from?: string })?.from;
      navigate(from ?? (res.user.role === 'ADMIN' ? '/admin' : '/dashboard'), { replace: true });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  return (
    <AuthShell title="Жүйеге кіру" subtitle="Оқуды жалғастыру үшін аккаунтқа кіріңіз">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {submitError && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
            {submitError}
          </div>
        )}
        <Field label="Email" error={errors.email?.message} required htmlFor="email">
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
        </Field>
        <Field label="Құпиясөз" error={errors.password?.message} required htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
        </Field>
        <Button type="submit" fullWidth loading={isSubmitting}>
          Кіру
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Аккаунтыңыз жоқ па?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Тіркелу
        </Link>
      </p>
    </AuthShell>
  );
}
