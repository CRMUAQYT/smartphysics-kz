import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { adminApi, catalogApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/States';
import { toast } from '@/store/toast';
import { QuestionManager } from './QuestionManager';
import type { SimulationType } from '@/types';

interface TopicForm {
  sectionId: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  formula: string;
  coverImage: string;
  youtubeUrl: string;
  videoTitle: string;
  videoDescription: string;
  keyConcepts: string;
  objectives: string;
  durationMinutes: number;
  xpReward: number;
  simulationType: SimulationType;
  orderNumber: number;
  isPublished: boolean;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export function AdminTopicEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);

  const sectionsQuery = useQuery({ queryKey: ['sections'], queryFn: catalogApi.sections });
  const topicQuery = useQuery({
    queryKey: ['admin-topic', id],
    queryFn: () => adminApi.topic(id!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TopicForm>({
    defaultValues: {
      simulationType: 'NONE',
      durationMinutes: 10,
      xpReward: 50,
      orderNumber: 0,
      isPublished: true,
    },
  });

  // Populate on edit
  useEffect(() => {
    if (topicQuery.data) {
      const t = topicQuery.data;
      reset({
        sectionId: t.sectionId,
        title: t.title,
        slug: t.slug,
        shortDescription: t.shortDescription,
        content: t.content,
        formula: t.formula ?? '',
        coverImage: t.coverImage ?? '',
        youtubeUrl: t.youtubeUrl ?? '',
        videoTitle: t.videoTitle ?? '',
        videoDescription: t.videoDescription ?? '',
        keyConcepts: (t.keyConcepts ?? []).join(', '),
        objectives: (t.objectives ?? []).map((o) => o.text).join('\n'),
        durationMinutes: t.durationMinutes,
        xpReward: t.xpReward,
        simulationType: t.simulationType,
        orderNumber: t.orderNumber,
        isPublished: t.isPublished,
      });
    }
  }, [topicQuery.data, reset]);

  const title = watch('title');
  useEffect(() => {
    if (!isEdit && title) setValue('slug', slugify(title));
  }, [title, isEdit, setValue]);

  const onSubmit = async (data: TopicForm) => {
    setSaving(true);
    try {
      const payload = {
        sectionId: data.sectionId,
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription,
        content: data.content,
        formula: data.formula || null,
        coverImage: data.coverImage || null,
        youtubeUrl: data.youtubeUrl || null,
        videoTitle: data.videoTitle || null,
        videoDescription: data.videoDescription || null,
        keyConcepts: data.keyConcepts.split(',').map((s) => s.trim()).filter(Boolean),
        objectives: data.objectives.split('\n').map((s) => s.trim()).filter(Boolean),
        durationMinutes: Number(data.durationMinutes),
        xpReward: Number(data.xpReward),
        simulationType: data.simulationType,
        orderNumber: Number(data.orderNumber),
        isPublished: Boolean(data.isPublished),
      };

      if (isEdit) {
        await adminApi.updateTopic(id!, payload);
        toast.success('Тақырып жаңартылды');
      } else {
        const created = await adminApi.createTopic(payload);
        toast.success('Тақырып құрылды');
        qc.invalidateQueries({ queryKey: ['admin-topics'] });
        navigate(`/admin/topics/${created.id}`, { replace: true });
        return;
      }
      qc.invalidateQueries({ queryKey: ['admin-topics'] });
      qc.invalidateQueries({ queryKey: ['admin-topic', id] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && topicQuery.isLoading) return <LoadingState />;

  const sections = sectionsQuery.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/topics')}>
          <ArrowLeft className="h-4 w-4" /> Артқа
        </Button>
        <h2 className="text-lg font-semibold text-white">{isEdit ? 'Тақырыпты өңдеу' : 'Жаңа тақырып'}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Атауы" error={errors.title?.message} required>
              <Input {...register('title', { required: 'Атауы қажет' })} />
            </Field>
            <Field label="Slug" error={errors.slug?.message} required>
              <Input {...register('slug', { required: 'Slug қажет' })} />
            </Field>
          </div>

          <Field label="Бөлім" error={errors.sectionId?.message} required>
            <Select {...register('sectionId', { required: 'Бөлімді таңдаңыз' })}>
              <option value="">Бөлімді таңдаңыз</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.quarter?.number}-тоқсан — {s.title}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Қысқаша сипаттама" error={errors.shortDescription?.message} required>
            <Input {...register('shortDescription', { required: 'Сипаттама қажет' })} />
          </Field>

          <Field label="Теориялық материал (HTML қолдау бар)" hint="HTML сервер жағында қауіпсіз тазаланады">
            <Textarea rows={8} {...register('content')} className="font-mono text-xs" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Формула">
              <Input placeholder="F = k · x" {...register('formula')} />
            </Field>
            <Field label="Негізгі түсініктер (үтірмен)">
              <Input placeholder="Күш, Қатаңдық" {...register('keyConcepts')} />
            </Field>
          </div>

          <Field label="Не үйренеді (әр жол — бір мақсат)">
            <Textarea rows={3} placeholder={'Гук заңын түсіну\nСерпімділік күшін есептеу'} {...register('objectives')} />
          </Field>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold text-white">Видео</h3>
          <Field label="YouTube URL" hint="watch, youtu.be, embed, shorts форматтары қолдау табады">
            <Input placeholder="https://youtube.com/watch?v=..." {...register('youtubeUrl')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Видео атауы">
              <Input {...register('videoTitle')} />
            </Field>
            <Field label="Cover сурет URL">
              <Input placeholder="/uploads/... немесе https://..." {...register('coverImage')} />
            </Field>
          </div>
          <Field label="Видео сипаттамасы">
            <Textarea rows={2} {...register('videoDescription')} />
          </Field>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold text-white">Баптаулар</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Ұзақтығы (мин)">
              <Input type="number" {...register('durationMinutes')} />
            </Field>
            <Field label="XP">
              <Input type="number" {...register('xpReward')} />
            </Field>
            <Field label="Рет нөмірі">
              <Input type="number" {...register('orderNumber')} />
            </Field>
            <Field label="Симуляция">
              <Select {...register('simulationType')}>
                <option value="NONE">Жоқ</option>
                <option value="ARCHIMEDES">Архимед заңы</option>
                <option value="MOTION">Қозғалыс</option>
                <option value="HOOKE">Гук заңы</option>
              </Select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" {...register('isPublished')} className="h-4 w-4 accent-primary" />
            Жариялау
          </label>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/topics')}>
            Болдырмау
          </Button>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" /> Сақтау
          </Button>
        </div>
      </form>

      {/* Questions — only after topic exists */}
      {isEdit && topicQuery.data && (
        <QuestionManager topicId={id!} questions={topicQuery.data.questions ?? []} onChange={() => topicQuery.refetch()} />
      )}
    </div>
  );
}
