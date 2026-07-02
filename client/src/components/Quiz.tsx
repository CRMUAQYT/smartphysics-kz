import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, XCircle, Zap } from 'lucide-react';
import { quizApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { toast } from '@/store/toast';
import { useAchievementStore } from '@/store/achievements';
import { cn } from '@/utils/cn';
import type { QuizResult } from '@/types';

interface QuizProps {
  topicId: string;
  onPassed?: (grantedXP: number) => void;
}

export function Quiz({ topicId, onPassed }: QuizProps) {
  const celebrate = useAchievementStore((s) => s.celebrate);
  const questionsQuery = useQuery({
    queryKey: ['questions', topicId],
    queryFn: () => quizApi.questions(topicId),
  });

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (questionsQuery.isLoading) return <LoadingState label="Тест жүктелуде..." />;
  if (questionsQuery.isError)
    return <ErrorState message={getErrorMessage(questionsQuery.error)} onRetry={() => questionsQuery.refetch()} />;

  const questions = questionsQuery.data ?? [];
  if (questions.length === 0) return <EmptyState title="Бұл тақырыпта тест жоқ" />;

  const question = questions[current];
  const answeredCount = Object.keys(answers).length;

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({ questionId: q.id, selectedIds: answers[q.id] ? [answers[q.id]] : [] }));
      const res = await quizApi.submit(topicId, payload);
      setResult(res);
      if (res.passed) {
        toast.success(`Тест өтті! +${res.grantedXP} XP`);
        onPassed?.(res.grantedXP);
      } else {
        toast.info(`Нәтиже: ${res.percentage}%. Қайта тапсырып көріңіз.`);
      }
      if (res.newAchievements.length) celebrate(res.newAchievements);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setResult(null);
    setAnswers({});
    setCurrent(0);
  };

  if (result) return <QuizResults result={result} questions={questions} onRetry={retry} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Сұрақ {current + 1} / {questions.length}
        </span>
        <span>{answeredCount} жауап берілді</span>
      </div>
      <ProgressBar value={((current + 1) / questions.length) * 100} />

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white">{question.text}</h3>
          <div className="mt-4 space-y-2.5">
            {question.options.map((opt) => {
              const selected = answers[question.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setAnswers((a) => ({ ...a, [question.id]: opt.id }))}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all',
                    selected
                      ? 'border-primary bg-primary/15 text-white shadow-glow'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                      selected ? 'border-primary bg-primary' : 'border-white/30',
                    )}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  {opt.text}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}>
          <ChevronLeft className="h-4 w-4" /> Алдыңғы
        </Button>
        {current < questions.length - 1 ? (
          <Button variant="secondary" onClick={() => setCurrent((c) => c + 1)}>
            Келесі <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="accent" onClick={submit} loading={submitting} disabled={answeredCount < questions.length}>
            Тестті аяқтау
          </Button>
        )}
      </div>
      {answeredCount < questions.length && current === questions.length - 1 && (
        <p className="text-center text-xs text-muted">Аяқтау үшін барлық сұраққа жауап беріңіз</p>
      )}
    </div>
  );
}

function QuizResults({
  result,
  questions,
  onRetry,
}: {
  result: QuizResult;
  questions: { id: string; text: string; options: { id: string; text: string }[] }[];
  onRetry: () => void;
}) {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'rounded-2xl border p-6 text-center',
          result.passed ? 'border-success/30 bg-success/10' : 'border-danger/30 bg-danger/10',
        )}
      >
        <p className="text-5xl font-extrabold text-white">{result.percentage}%</p>
        <p className="mt-2 text-lg font-medium text-white">
          {result.score} / {result.total} дұрыс жауап
        </p>
        {result.grantedXP > 0 && (
          <p className="mt-1 inline-flex items-center gap-1 text-accent">
            <Zap className="h-4 w-4" /> +{result.grantedXP} XP
          </p>
        )}
        <p className="mt-2 text-sm text-muted">
          {result.passed ? 'Жарайсың! Тест сәтті өтті.' : 'Тағы бір рет тапсырып көр (өту үшін 60%).'}
        </p>
      </motion.div>

      <div className="space-y-3">
        {result.results.map((r, i) => {
          const q = questions.find((x) => x.id === r.questionId);
          const correctText = q?.options.filter((o) => r.correctIds.includes(o.id)).map((o) => o.text).join(', ');
          return (
            <div
              key={r.questionId}
              className={cn('rounded-xl border p-4', r.isCorrect ? 'border-success/20 bg-success/5' : 'border-danger/20 bg-danger/5')}
            >
              <div className="flex items-start gap-2">
                {r.isCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {i + 1}. {r.text}
                  </p>
                  {!r.isCorrect && correctText && (
                    <p className="mt-1 text-xs text-success">Дұрыс жауап: {correctText}</p>
                  )}
                  {r.explanation && <p className="mt-1 text-xs text-muted">{r.explanation}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button variant="secondary" onClick={onRetry} fullWidth>
        <RotateCcw className="h-4 w-4" /> Қайта тапсыру
      </Button>
    </div>
  );
}
