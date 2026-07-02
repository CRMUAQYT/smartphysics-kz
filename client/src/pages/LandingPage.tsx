import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  FlaskConical,
  Gauge,
  GraduationCap,
  PlayCircle,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AtomAnimation } from '@/components/decor/AtomAnimation';
import { ParticleField } from '@/components/decor/ParticleField';
import { FloatingFormulas } from '@/components/decor/FloatingFormulas';
import { MiniDemo } from '@/components/landing/MiniDemo';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export function LandingPage() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <Features />
      <Quarters />
      <LabPreview />
      <HowItWorks />
      <Gamification />
      <Results />
      <CTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[90vh]">
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div className="absolute inset-0 bg-radial-glow" />
      <ParticleField className="absolute inset-0 h-full w-full" />
      <FloatingFormulas />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
        <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            7-сынып физикасы · Қазақстан
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Физиканы жаттама.
            <br />
            <span className="text-gradient">Зертте. Дәлелде.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-slate-300">
            7-сынып физикасын интерактивті тәжірибелер, анимациялар және қызықты тапсырмалар арқылы үйрен.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register">
              <Button size="lg">
                Оқуды бастау
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/topics">
              <Button size="lg" variant="outline">
                Тақырыптарды көру
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted">
            <Stat value="34+" label="Тақырып" />
            <Stat value="3" label="Интерактивті зертхана" />
            <Stat value="4" label="Тоқсан" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex flex-col items-center gap-6"
        >
          <AtomAnimation className="h-64 w-64 animate-float sm:h-80 sm:w-80" />
          <MiniDemo />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}

const FEATURES = [
  { icon: FlaskConical, title: 'Интерактивті тәжірибелер', text: 'Архимед заңы, қозғалыс және Гук заңы — параметрлерді өзгертіп, нәтижені бірден көр.' },
  { icon: PlayCircle, title: 'Видео сабақтар', text: 'Әр тақырыпқа таңдалған видео және қысқаша түсіндірме.' },
  { icon: Target, title: 'Шағын тесттер', text: 'Түсіндірмесі бар тесттермен білімді бекіт.' },
  { icon: Trophy, title: 'XP және деңгейлер', text: 'Әр әрекет үшін XP жина, жаңа деңгейлер аш.' },
  { icon: TrendingUp, title: 'Прогресс бақылауы', text: 'Бөлімдер бойынша прогресс пен статистиканы көр.' },
  { icon: Award, title: 'Жетістіктер', text: 'Оқу сериясы мен белестерге жеткенде марапат ал.' },
];

function Features() {
  return (
    <Section title="Платформаның мүмкіндіктері" subtitle="Физиканы түсінуге көмектесетін барлық құрал бір жерде">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div key={f.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <Card hover className="h-full">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.text}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

const QUARTERS = [
  { n: 1, title: 'Физика — табиғат туралы ғылым', text: 'Физикалық шамалар, өлшеу және механикалық қозғалыс' },
  { n: 2, title: 'Тығыздық және өзара әрекеттесу', text: 'Масса, тығыздық, күш, Гук заңы, үйкеліс' },
  { n: 3, title: 'Қысым', text: 'Паскаль және Архимед заңдары, жүзу шарттары' },
  { n: 4, title: 'Жұмыс, энергия, ғарыш', text: 'Энергия, жай механизмдер, Күн жүйесі' },
];

function Quarters() {
  return (
    <Section title="7-сынып бөлімдері" subtitle="Толық оқу бағдарламасы төрт тоқсанға бөлінген">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {QUARTERS.map((q, i) => (
          <motion.div key={q.n} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <Card hover className="h-full">
              <span className="text-4xl font-extrabold text-white/10">0{q.n}</span>
              <h3 className="mt-2 font-semibold text-primary">{q.n}-тоқсан</h3>
              <p className="mt-1 font-medium text-white">{q.title}</p>
              <p className="mt-2 text-sm text-muted">{q.text}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function LabPreview() {
  return (
    <Section title="Интерактивті зертхана" subtitle="Slider-ды жылжытып, дененің қозғалысын нақты уақытта бақыла">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-2xl font-bold text-white">Физиканы қолмен ұста</h3>
          <p className="mt-3 text-muted">
            Әр симуляцияда параметрлерді өзгертіп, күштердің стрелкаларын, графиктерді және нәтижелерді бірден көресің.
            Барлық есептеулер нақты физикалық формулаларға негізделген.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            {['Архимед заңы — бату мен жүзу', 'Механикалық қозғалыс — жол, уақыт, жылдамдық', 'Гук заңы — серіппе және серпімділік күші'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                {t}
              </li>
            ))}
          </ul>
          <Link to="/labs" className="mt-6 inline-block">
            <Button>
              Зертханаларды ашу
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="flex justify-center">
          <MiniDemo />
        </div>
      </div>
    </Section>
  );
}

const STEPS = [
  { icon: BookOpen, title: 'Тақырыпты аш', text: 'Теория, формула және мақсаттармен танысу' },
  { icon: PlayCircle, title: 'Видеоны көр', text: 'Түсіндірме видеомен тереңірек түсін' },
  { icon: FlaskConical, title: 'Тәжірибе жаса', text: 'Симуляцияда өзің зертте' },
  { icon: GraduationCap, title: 'Тест тапсыр', text: 'Білімді бекіт және XP жина' },
];

function HowItWorks() {
  return (
    <Section title="Платформа қалай жұмыс істейді" subtitle="Төрт қарапайым қадам">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <motion.div key={s.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <Card className="relative h-full text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-glow">
                <s.icon className="h-6 w-6" />
              </div>
              <span className="absolute right-4 top-4 text-2xl font-bold text-white/10">{i + 1}</span>
              <h3 className="font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

const LEVELS = [
  { name: 'Бақылаушы', xp: '0+', color: 'from-slate-500 to-slate-400' },
  { name: 'Ізденуші', xp: '200+', color: 'from-primary to-secondary' },
  { name: 'Зерттеуші', xp: '500+', color: 'from-emerald-500 to-teal-400' },
  { name: 'Экспериментатор', xp: '1000+', color: 'from-accent to-amber-500' },
  { name: 'Жас физик', xp: '2000+', color: 'from-fuchsia-500 to-purple-400' },
];

function Gamification() {
  return (
    <Section title="Геймификация" subtitle="Оқы, XP жина және жаңа деңгейлерге көтеріл">
      <div className="flex flex-wrap items-end justify-center gap-4">
        {LEVELS.map((l, i) => (
          <motion.div
            key={l.name}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col items-center"
          >
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${l.color} text-xl font-bold text-white shadow-glow`} style={{ height: `${48 + i * 12}px`, width: `${48 + i * 12}px` }}>
              {i + 1}
            </div>
            <p className="mt-2 text-sm font-semibold text-white">{l.name}</p>
            <p className="text-xs text-muted">{l.xp} XP</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

const RESULTS = [
  { icon: Gauge, value: 'XP жүйесі', text: 'Әр әрекет марапатталады' },
  { icon: Target, value: 'Тесттер', text: 'Түсіндірмесімен' },
  { icon: TrendingUp, value: 'Прогресс', text: 'Бөлімдер бойынша' },
];

function Results() {
  return (
    <Section title="Оқушы нәтижесі" subtitle="Прогресіңді көр, әлсіз тұстарыңды бекіт">
      <div className="grid gap-5 sm:grid-cols-3">
        {RESULTS.map((r) => (
          <Card key={r.value} hover className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <r.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-white">{r.value}</p>
              <p className="text-sm text-muted">{r.text}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function CTA() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-secondary/20 to-primary/10 p-10 text-center sm:p-16">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="relative">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Физиканы бүгіннен зерттей баста</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Тегін тіркел, тақырыптарды аш, тәжірибе жаса және XP жинай баста.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button size="lg">
                Тегін тіркелу
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/topics">
              <Button size="lg" variant="secondary">
                Тақырыптарды көру
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
        {subtitle && <p className="mx-auto mt-3 max-w-2xl text-muted">{subtitle}</p>}
      </motion.div>
      {children}
    </section>
  );
}
