import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Eye,
  FlaskConical,
  Home,
  Lightbulb,
  PlayCircle,
  Sigma,
  Target,
} from 'lucide-react';
import { catalogApi, progressApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { Quiz } from '@/components/Quiz';
import { SimulationRenderer } from '@/simulations';
import { useAuthStore } from '@/store/auth';
import { useAchievementStore } from '@/store/achievements';
import { toast } from '@/store/toast';
import type { Lesson } from '@/types';

export function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuthStore();

  const query = useQuery({
    queryKey: ['lesson', slug],
    queryFn: () => catalogApi.topic(slug!),
    enabled: !!slug,
  });

  if (query.isLoading) return <LoadingState label="Сабақ жүктелуде..." />;
  if (query.isError) return <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />;
  if (!query.data) return null;

  return <LessonContent lesson={query.data} authed={isAuthenticated} onRefetch={() => query.refetch()} />;
}

function LessonContent({ lesson, authed, onRefetch }: { lesson: Lesson; authed: boolean; onRefetch: () => void }) {
  const celebrate = useAchievementStore((s) => s.celebrate);
  const openedRef = useRef(false);
  const [videoDone, setVideoDone] = useState(lesson.progress?.videoCompleted ?? false);
  const [simDone, setSimDone] = useState(lesson.progress?.simulationCompleted ?? false);

  // Mark topic opened once (grants +5 XP first time)
  useEffect(() => {
    if (authed && !openedRef.current && !lesson.progress?.topicOpened) {
      openedRef.current = true;
      progressApi
        .open(lesson.id)
        .then((r) => r.newAchievements.length && celebrate(r.newAchievements))
        .catch(() => undefined);
    }
  }, [authed, lesson.id, lesson.progress?.topicOpened, celebrate]);

  const markVideo = async () => {
    if (!authed) return toast.info('XP жинау үшін жүйеге кіріңіз');
    try {
      const res = await progressApi.videoComplete(lesson.id);
      setVideoDone(true);
      if (res.grantedXP > 0) toast.success(`Видео көрілді! +${res.grantedXP} XP`);
      if (res.newAchievements.length) celebrate(res.newAchievements);
      onRefetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const markSim = async () => {
    if (!authed) return toast.info('XP жинау үшін жүйеге кіріңіз');
    try {
      const res = await progressApi.simulationComplete(lesson.id, {});
      setSimDone(true);
      if (res.grantedXP > 0) toast.success(`Тәжірибе аяқталды! +${res.grantedXP} XP`);
      if (res.newAchievements.length) celebrate(res.newAchievements);
      onRefetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/" className="flex items-center gap-1 hover:text-primary">
          <Home className="h-3.5 w-3.5" /> Басты бет
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/topics" className="hover:text-primary">
          Тақырыптар
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-400">{lesson.section.title}</span>
      </nav>

      {/* Header */}
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">{lesson.quarter.number}-тоқсан</Badge>
          {lesson.simulationType !== 'NONE' && (
            <Badge tone="accent">
              <FlaskConical className="h-3 w-3" /> Зертхана
            </Badge>
          )}
          {lesson.progress?.completed && (
            <Badge tone="success">
              <CheckCircle2 className="h-3 w-3" /> Аяқталды
            </Badge>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{lesson.title}</h1>
        <p className="mt-2 text-lg text-muted">{lesson.shortDescription}</p>
      </header>

      {/* Objectives */}
      {lesson.objectives.length > 0 && (
        <Section icon={<Target className="h-5 w-5 text-primary" />} title="Не үйренесің?">
          <ul className="grid gap-2 sm:grid-cols-2">
            {lesson.objectives.map((o) => (
              <li key={o} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {o}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Theory */}
      {lesson.content && (
        <Section icon={<Lightbulb className="h-5 w-5 text-accent" />} title="Теориялық материал">
          <div className="prose-physics" dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </Section>
      )}

      {/* Formula */}
      {lesson.formula && (
        <div className="my-6 flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-6">
          <Sigma className="h-8 w-8 shrink-0 text-primary" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Негізгі формула</p>
            <p className="mt-1 font-mono text-2xl font-bold text-white">{lesson.formula}</p>
          </div>
        </div>
      )}

      {/* Key concepts */}
      {lesson.keyConcepts.length > 0 && (
        <div className="my-6 flex flex-wrap gap-2">
          {lesson.keyConcepts.map((c) => (
            <Badge key={c} tone="muted">
              {c}
            </Badge>
          ))}
        </div>
      )}

      {/* Video */}
      {lesson.video && (
        <Section icon={<PlayCircle className="h-5 w-5 text-danger" />} title="Видео сабақ">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="relative aspect-video w-full">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={lesson.video.embedUrl}
                title={lesson.video.title ?? lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              {lesson.video.title && <h4 className="font-semibold text-white">{lesson.video.title}</h4>}
              {lesson.video.description && <p className="mt-1 text-sm text-muted">{lesson.video.description}</p>}
              <p className="mt-1 text-xs text-muted">Ұзақтығы: ~{lesson.durationMinutes} мин</p>
            </div>
            <Button variant={videoDone ? 'secondary' : 'primary'} onClick={markVideo} disabled={videoDone} className="shrink-0">
              {videoDone ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Көрілді
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Видеоны көрдім
                </>
              )}
            </Button>
          </div>
        </Section>
      )}

      {/* Simulation */}
      {lesson.simulationType !== 'NONE' && (
        <Section icon={<FlaskConical className="h-5 w-5 text-accent" />} title="Интерактивті тәжірибе">
          <SimulationRenderer type={lesson.simulationType} onComplete={markSim} completed={simDone} />
        </Section>
      )}

      {/* Quiz */}
      {lesson.questionCount > 0 && (
        <Section icon={<Target className="h-5 w-5 text-primary" />} title="Тест">
          {authed ? (
            <Quiz topicId={lesson.id} onPassed={onRefetch} />
          ) : (
            <Card className="text-center">
              <p className="text-muted">Тест тапсыру үшін жүйеге кіріңіз.</p>
              <Link to="/login" className="mt-3 inline-block">
                <Button>Кіру</Button>
              </Link>
            </Card>
          )}
        </Section>
      )}

      {/* Next */}
      <div className="mt-10 flex justify-end border-t border-white/10 pt-6">
        <Link to="/topics">
          <Button variant="outline">
            Келесі тақырыпқа <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      className="mt-8"
    >
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}
