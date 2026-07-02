import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore, type ToastType } from '@/store/toast';

const config: Record<ToastType, { icon: React.ReactNode; ring: string }> = {
  success: { icon: <CheckCircle2 className="h-5 w-5 text-success" />, ring: 'border-success/30' },
  error: { icon: <XCircle className="h-5 w-5 text-danger" />, ring: 'border-danger/30' },
  info: { icon: <Info className="h-5 w-5 text-primary" />, ring: 'border-primary/30' },
};

export function Toaster() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            className={`glass-card pointer-events-auto flex items-start gap-3 border p-4 ${config[t.type].ring}`}
            role="status"
          >
            {config[t.type].icon}
            <p className="flex-1 text-sm text-slate-200">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-muted hover:text-white" aria-label="Жабу">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
