import { useState } from 'react';
import { Check, Edit, Plus, Trash2, X } from 'lucide-react';
import { adminApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { ConfirmModal } from '@/components/ui/Modal';
import { toast } from '@/store/toast';
import { cn } from '@/utils/cn';
import type { AdminQuestion } from '@/types';

interface Props {
  topicId: string;
  questions: AdminQuestion[];
  onChange: () => void;
}

interface DraftOption {
  text: string;
  isCorrect: boolean;
}

interface Draft {
  id?: string;
  text: string;
  explanation: string;
  options: DraftOption[];
}

const emptyDraft = (): Draft => ({
  text: '',
  explanation: '',
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
});

export function QuestionManager({ topicId, questions, onChange }: Props) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (q: AdminQuestion) => {
    setDraft({
      id: q.id,
      text: q.text,
      explanation: q.explanation ?? '',
      options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    });
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.text.trim()) return toast.error('Сұрақ мәтінін енгізіңіз');
    const filled = draft.options.filter((o) => o.text.trim());
    if (filled.length < 2) return toast.error('Кемінде 2 жауап нұсқасы қажет');
    if (!filled.some((o) => o.isCorrect)) return toast.error('Дұрыс жауапты белгілеңіз');

    setSaving(true);
    try {
      const body = {
        type: 'SINGLE' as const,
        text: draft.text,
        explanation: draft.explanation || null,
        options: filled.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
      };
      if (draft.id) {
        await adminApi.updateQuestion(draft.id, body);
        toast.success('Сұрақ жаңартылды');
      } else {
        await adminApi.createQuestion({ topicId, ...body });
        toast.success('Сұрақ қосылды');
      }
      setDraft(null);
      onChange();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteQuestion(deleteId);
      toast.success('Сұрақ өшірілді');
      setDeleteId(null);
      onChange();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const setCorrect = (idx: number) => {
    if (!draft) return;
    // single-answer: only one correct
    setDraft({ ...draft, options: draft.options.map((o, i) => ({ ...o, isCorrect: i === idx })) });
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Тест сұрақтары ({questions.length})</h3>
        {!draft && (
          <Button size="sm" onClick={() => setDraft(emptyDraft())}>
            <Plus className="h-4 w-4" /> Сұрақ қосу
          </Button>
        )}
      </div>

      {/* Editor */}
      {draft && (
        <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <Textarea
            placeholder="Сұрақ мәтіні"
            value={draft.text}
            onChange={(e) => setDraft({ ...draft, text: e.target.value })}
            rows={2}
          />
          <div className="space-y-2">
            <p className="text-xs text-muted">Жауап нұсқалары (дұрысын белгілеңіз):</p>
            {draft.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrect(i)}
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                    opt.isCorrect ? 'border-success bg-success/20 text-success' : 'border-white/15 text-muted',
                  )}
                  aria-label="Дұрыс жауап"
                >
                  <Check className="h-4 w-4" />
                </button>
                <Input
                  placeholder={`Нұсқа ${i + 1}`}
                  value={opt.text}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      options: draft.options.map((o, idx) => (idx === i ? { ...o, text: e.target.value } : o)),
                    })
                  }
                />
              </div>
            ))}
          </div>
          <Input
            placeholder="Түсіндірме (міндетті емес)"
            value={draft.explanation}
            onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
              <X className="h-4 w-4" /> Болдырмау
            </Button>
            <Button size="sm" onClick={save} loading={saving}>
              Сақтау
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {questions.length === 0 && !draft && <p className="text-sm text-muted">Әзірше сұрақ жоқ</p>}
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-xl bg-white/5 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-white">
                {i + 1}. {q.text}
              </p>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(q)} aria-label="Өңдеу">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(q.id)} aria-label="Өшіру">
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </div>
            <ul className="mt-2 space-y-1">
              {q.options.map((o) => (
                <li key={o.id} className={cn('text-xs', o.isCorrect ? 'text-success' : 'text-muted')}>
                  {o.isCorrect ? '✓' : '•'} {o.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Сұрақты өшіру"
        message="Бұл сұрақ біржола өшіріледі. Растайсыз ба?"
        onConfirm={remove}
        onClose={() => setDeleteId(null)}
      />
    </Card>
  );
}
