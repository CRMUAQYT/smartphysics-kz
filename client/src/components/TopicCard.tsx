import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, FlaskConical, HelpCircle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { resolveAsset } from '@/services/api';
import type { TopicListItem } from '@/types';

export function TopicCard({ topic }: { topic: TopicListItem }) {
  const cover = resolveAsset(topic.coverImage);
  const done = topic.progress.completed;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Link
        to={`/topics/${topic.slug}`}
        className="group block h-full overflow-hidden rounded-2xl border border-white/10 bg-card backdrop-blur-xl transition-shadow hover:border-primary/30 hover:shadow-glow"
      >
        {/* Cover */}
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-secondary/30 to-primary/10">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="grid-bg flex h-full items-center justify-center opacity-80">
              <span className="font-mono text-2xl text-primary/40">{topic.quarter.number}-тоқсан</span>
            </div>
          )}
          <div className="absolute right-2 top-2 flex gap-1.5">
            {topic.simulationType !== 'NONE' && (
              <Badge tone="accent">
                <FlaskConical className="h-3 w-3" /> Зертхана
              </Badge>
            )}
            {done && (
              <Badge tone="success">
                <CheckCircle2 className="h-3 w-3" /> Аяқталды
              </Badge>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-xs text-primary">{topic.section.title}</p>
          <h3 className="mt-1 line-clamp-2 font-semibold text-white group-hover:text-primary">{topic.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted">{topic.shortDescription}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {topic.durationMinutes} мин
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" /> {topic.questionCount} сұрақ
            </span>
            <span className="flex items-center gap-1 text-accent">
              <Zap className="h-3.5 w-3.5" /> {topic.xpReward} XP
            </span>
          </div>

          {topic.progress.percent > 0 && (
            <div className="mt-3">
              <ProgressBar value={topic.progress.percent} showLabel />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
