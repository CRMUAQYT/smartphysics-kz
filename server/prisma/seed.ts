import { PrismaClient, SimulationType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env so the script works whether run via `prisma db seed` or `tsx` directly
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

function slugify(input: string): string {
  const map: Record<string, string> = {
    а: 'a', ә: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
    з: 'z', и: 'i', й: 'i', к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n', ң: 'ng', о: 'o',
    ө: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ұ: 'u', ү: 'u', ф: 'f', х: 'h',
    һ: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', і: 'i', ь: '', э: 'e',
    ю: 'yu', я: 'ya',
  };
  return input
    .toLowerCase()
    .split('')
    .map((ch) => (map[ch] !== undefined ? map[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface TopicSeed {
  title: string;
  short: string;
  content?: string;
  formula?: string;
  youtube?: string;
  videoTitle?: string;
  videoDescription?: string;
  keyConcepts?: string[];
  objectives?: string[];
  duration?: number;
  xp?: number;
  simulation?: SimulationType;
  questions?: {
    text: string;
    explanation: string;
    options: { text: string; correct?: boolean }[];
  }[];
}

interface SectionSeed {
  title: string;
  topics: TopicSeed[];
}

interface QuarterSeed {
  number: number;
  title: string;
  description: string;
  sections: SectionSeed[];
}

const theoryDensity = `
<h3>Негізгі идея</h3>
<p>Бұл тақырыпта біз құбылысты бақылап қана қоймай, оны <strong>өлшеу</strong> және <strong>дәлелдеу</strong> арқылы түсінеміз. Физика — тәжірибеге негізделген ғылым.</p>
<h3>Түсіндірме</h3>
<p>Физикалық шамалар бір-бірімен формулалар арқылы байланысқан. Формуланы жаттаудың орнына оның қайдан шыққанын түсіну маңызды.</p>
<ul>
  <li>Құбылысты бақыла</li>
  <li>Шамаларды өлше</li>
  <li>Заңдылықты тап</li>
  <li>Формуламен тексер</li>
</ul>
<blockquote>Физиканы жаттама. Зертте. Дәлелде.</blockquote>
`;

const archimedesQuestions: TopicSeed['questions'] = [
  {
    text: 'Архимед күші неге тәуелді?',
    explanation: 'Архимед күші сұйықтың тығыздығына, дене көлеміне және еркін түсу үдеуіне тәуелді: F = ρ·g·V.',
    options: [
      { text: 'Сұйық тығыздығы мен дене көлеміне', correct: true },
      { text: 'Тек дене массасына' },
      { text: 'Дене түсіне' },
      { text: 'Ыдыс пішініне' },
    ],
  },
  {
    text: 'Дене қашан жүзеді?',
    explanation: 'Дене тығыздығы сұйық тығыздығынан кіші болса, дене жүзеді.',
    options: [
      { text: 'Дене тығыздығы сұйық тығыздығынан кіші болса', correct: true },
      { text: 'Дене тығыздығы сұйық тығыздығынан үлкен болса' },
      { text: 'Әрқашан' },
      { text: 'Ешқашан' },
    ],
  },
  {
    text: 'Архимед күшінің формуласы қандай?',
    explanation: 'FА = ρсұйық · g · Vбатқан — Архимед заңы.',
    options: [
      { text: 'F = ρ·g·V', correct: true },
      { text: 'F = m·a' },
      { text: 'F = k·x' },
      { text: 'F = m·g·h' },
    ],
  },
  {
    text: 'Су тығыздығы шамамен неге тең?',
    explanation: 'Таза судың тығыздығы шамамен 1000 кг/м³.',
    options: [
      { text: '1000 кг/м³', correct: true },
      { text: '100 кг/м³' },
      { text: '10 кг/м³' },
      { text: '10000 кг/м³' },
    ],
  },
  {
    text: 'Тұзды суда дене неге жеңіл жүзеді?',
    explanation: 'Тұзды судың тығыздығы жоғары болғандықтан Архимед күші артады.',
    options: [
      { text: 'Тұзды судың тығыздығы жоғары', correct: true },
      { text: 'Тұзды су жеңіл' },
      { text: 'Тұз денені итереді' },
      { text: 'Ешқандай айырмашылық жоқ' },
    ],
  },
];

const motionQuestions: TopicSeed['questions'] = [
  {
    text: 'Бірқалыпты қозғалыста жылдамдық қалай өзгереді?',
    explanation: 'Бірқалыпты қозғалыста жылдамдық тұрақты болады.',
    options: [
      { text: 'Тұрақты болады', correct: true },
      { text: 'Артады' },
      { text: 'Кемиді' },
      { text: 'Нөлге тең' },
    ],
  },
  {
    text: 'Жылдамдықтың формуласы қандай?',
    explanation: 'v = s / t — жүрілген жолды уақытқа бөлеміз.',
    options: [
      { text: 'v = s / t', correct: true },
      { text: 'v = s · t' },
      { text: 'v = t / s' },
      { text: 'v = s + t' },
    ],
  },
  {
    text: 'Жылдамдық бірлігі (SI) қандай?',
    explanation: 'SI жүйесінде жылдамдық м/с (метр секундына) өлшенеді.',
    options: [
      { text: 'м/с', correct: true },
      { text: 'км' },
      { text: 'кг' },
      { text: 'с' },
    ],
  },
  {
    text: 'Дене 10 с ішінде 100 м жүрді. Жылдамдығы қандай?',
    explanation: 'v = s/t = 100/10 = 10 м/с.',
    options: [
      { text: '10 м/с', correct: true },
      { text: '1000 м/с' },
      { text: '0.1 м/с' },
      { text: '110 м/с' },
    ],
  },
  {
    text: 'Траектория дегеніміз не?',
    explanation: 'Траектория — дене қозғалғанда сызатын сызық.',
    options: [
      { text: 'Дене қозғалғанда сызатын сызық', correct: true },
      { text: 'Дененің массасы' },
      { text: 'Дененің жылдамдығы' },
      { text: 'Қозғалыс уақыты' },
    ],
  },
];

const hookeQuestions: TopicSeed['questions'] = [
  {
    text: 'Гук заңы нені сипаттайды?',
    explanation: 'Гук заңы серпімділік күшінің деформацияға тура пропорционал екенін көрсетеді: F = k·x.',
    options: [
      { text: 'Серпімділік күшінің ұзаруға тәуелділігін', correct: true },
      { text: 'Ауырлық күшін' },
      { text: 'Үйкеліс күшін' },
      { text: 'Архимед күшін' },
    ],
  },
  {
    text: 'Гук заңының формуласы қандай?',
    explanation: 'F = k·x, мұндағы k — қатаңдық, x — ұзару.',
    options: [
      { text: 'F = k·x', correct: true },
      { text: 'F = m·g' },
      { text: 'F = ρ·g·V' },
      { text: 'F = m·a' },
    ],
  },
  {
    text: 'Серіппе қатаңдығы k нені білдіреді?',
    explanation: 'Қатаңдық серіппенің деформацияға қаншалықты қарсылық көрсететінін білдіреді.',
    options: [
      { text: 'Серіппенің қаттылығын', correct: true },
      { text: 'Серіппенің массасын' },
      { text: 'Серіппенің түсін' },
      { text: 'Серіппенің ұзындығын' },
    ],
  },
  {
    text: 'Қатаңдық бірлігі қандай?',
    explanation: 'Қатаңдық Н/м (ньютон метрге) өлшенеді.',
    options: [
      { text: 'Н/м', correct: true },
      { text: 'кг' },
      { text: 'м/с' },
      { text: 'Дж' },
    ],
  },
  {
    text: 'Жүк ауырлаған сайын серіппе қалай болады?',
    explanation: 'Жүк ауырлаған сайын серпімділік күші артып, серіппе көбірек созылады.',
    options: [
      { text: 'Көбірек созылады', correct: true },
      { text: 'Қысқарады' },
      { text: 'Өзгермейді' },
      { text: 'Үзіледі' },
    ],
  },
];

const curriculum: QuarterSeed[] = [
  {
    number: 1,
    title: '1-тоқсан',
    description: 'Физика — табиғат туралы ғылым, физикалық шамалар және механикалық қозғалыс',
    sections: [
      {
        title: 'Физика – табиғат туралы ғылым',
        topics: [
          {
            title: 'Физика нені зерттейді?',
            short: 'Физика ғылымының нысаны және маңызы',
            content: theoryDensity,
            objectives: ['Физиканың зерттеу нысанын түсіну', 'Физикалық құбылыстарды тану', 'Ғылыми көзқарасты дамыту'],
            keyConcepts: ['Физика', 'Құбылыс', 'Материя'],
            formula: 'Физика = бақылау + өлшеу + дәлелдеу',
            youtube: 'https://www.youtube.com/watch?v=b240PGCMwV0',
            videoTitle: 'Физика деген не?',
            videoDescription: 'Физика ғылымының не зерттейтіні туралы қысқаша кіріспе',
          },
          { title: 'Физикалық құбылыстар', short: 'Механикалық, жылулық, электрлік және басқа құбылыстар' },
          { title: 'Табиғатты зерттеу әдістері', short: 'Бақылау, тәжірибе, өлшеу және модельдеу' },
        ],
      },
      {
        title: 'Физикалық шамалар мен өлшеулер',
        topics: [
          { title: 'SI бірліктер жүйесі', short: 'Халықаралық бірліктер жүйесі және негізгі бірліктер', content: theoryDensity, objectives: ['SI бірліктерін білу', 'Негізгі шамаларды атау'] },
          { title: 'Өлшеу құралдары', short: 'Сызғыш, таразы, секундомер, термометр' },
          { title: 'Өлшеу дәлдігі', short: 'Өлшеу қателігі және дәлдік' },
          { title: 'Скаляр және векторлық шамалар', short: 'Скаляр мен вектордың айырмашылығы' },
        ],
      },
      {
        title: 'Механикалық қозғалыс',
        topics: [
          {
            title: 'Механикалық қозғалыс',
            short: 'Дене орнының уақыт бойынша өзгеруі',
            content: theoryDensity,
            formula: 'v = s / t',
            objectives: ['Механикалық қозғалысты анықтау', 'Санақ жүйесін түсіну', 'Жол мен орын ауыстыруды ажырату'],
            keyConcepts: ['Қозғалыс', 'Санақ жүйесі', 'Салыстырмалылық'],
            youtube: 'https://youtu.be/Vp4mQZ6Aqus',
            videoTitle: 'Механикалық қозғалыс',
            videoDescription: 'Қозғалыс, санақ жүйесі және траектория ұғымдары',
            simulation: SimulationType.MOTION,
            duration: 15,
            xp: 60,
            questions: motionQuestions,
          },
          { title: 'Санақ жүйесі', short: 'Дене, координаталар және сағат' },
          { title: 'Траектория', short: 'Дене қозғалғанда сызатын сызық' },
          { title: 'Жол және орын ауыстыру', short: 'Жол мен орын ауыстырудың айырмашылығы' },
          { title: 'Бірқалыпты қозғалыс', short: 'Тұрақты жылдамдықпен қозғалыс', content: theoryDensity, formula: 's = v · t', simulation: SimulationType.MOTION },
          { title: 'Бірқалыпсыз қозғалыс', short: 'Жылдамдығы өзгеретін қозғалыс' },
          { title: 'Жылдамдық', short: 'Қозғалыс шапшаңдығының өлшемі', formula: 'v = s / t' },
          { title: 'Орташа жылдамдық', short: 'Толық жолдың толық уақытқа қатынасы', formula: 'vорт = sтолық / tтолық' },
          { title: 'Қозғалыс графиктері', short: 'Жол–уақыт және жылдамдық–уақыт графиктері' },
        ],
      },
    ],
  },
  {
    number: 2,
    title: '2-тоқсан',
    description: 'Тығыздық және денелердің өзара әрекеттесуі',
    sections: [
      {
        title: 'Тығыздық',
        topics: [
          { title: 'Масса', short: 'Дене инерттілігінің өлшемі', content: theoryDensity, formula: 'm = ρ · V' },
          { title: 'Көлем', short: 'Дене алатын кеңістік', formula: 'V = m / ρ' },
          {
            title: 'Заттың тығыздығы',
            short: 'Бірлік көлемдегі зат массасы',
            content: theoryDensity,
            formula: 'ρ = m / V',
            objectives: ['Тығыздық ұғымын түсіну', 'Тығыздықты есептеу', 'Тәжірибеде анықтау'],
            keyConcepts: ['Тығыздық', 'Масса', 'Көлем'],
          },
          { title: 'Тығыздықты есептеу', short: 'ρ = m/V формуласымен есептеу', formula: 'ρ = m / V' },
          { title: 'Тығыздықты тәжірибеде анықтау', short: 'Таразы және өлшеуіш цилиндр арқылы' },
        ],
      },
      {
        title: 'Денелердің өзара әрекеттесуі',
        topics: [
          { title: 'Инерция', short: 'Дененің жылдамдығын сақтау қасиеті', content: theoryDensity },
          { title: 'Күш', short: 'Өзара әрекеттесудің өлшемі', formula: 'F = m · a' },
          { title: 'Ауырлық күші', short: 'Жердің денеге тартылыс күші', formula: 'Fауыр = m · g', content: theoryDensity },
          { title: 'Деформация', short: 'Дене пішінінің өзгеруі' },
          { title: 'Серпімділік күші', short: 'Деформацияға қарсы бағытталған күш', formula: 'Fсерп = k · x' },
          {
            title: 'Гук заңы',
            short: 'Серпімділік күшінің ұзаруға тәуелділігі',
            content: theoryDensity,
            formula: 'F = k · x',
            objectives: ['Гук заңын түсіну', 'Серпімділік күшін есептеу', 'Күш–ұзару графигін салу'],
            keyConcepts: ['Серпімділік', 'Қатаңдық', 'Деформация'],
            youtube: 'https://www.youtube.com/watch?v=NUFFH_pfjto',
            videoTitle: 'Гук заңы',
            videoDescription: 'Серіппе, серпімділік күші және Гук заңы',
            simulation: SimulationType.HOOKE,
            duration: 15,
            xp: 60,
            questions: hookeQuestions,
          },
          { title: 'Үйкеліс күші', short: 'Қозғалысқа қарсы бағытталған күш' },
          { title: 'Күштерді қосу', short: 'Тең әсерлі күшті табу' },
        ],
      },
    ],
  },
  {
    number: 3,
    title: '3-тоқсан',
    description: 'Қысым: қатты денелер, сұйықтар мен газдар',
    sections: [
      {
        title: 'Қысым',
        topics: [
          { title: 'Қатты денелердегі қысым', short: 'Ауданға түсетін күш', content: theoryDensity, formula: 'P = F / S' },
          { title: 'Сұйықтар мен газдардағы қысым', short: 'Тереңдікке байланысты қысым', formula: 'P = ρ · g · h' },
          { title: 'Паскаль заңы', short: 'Қысымның барлық бағытта таралуы', content: theoryDensity },
          { title: 'Қатынас ыдыстар', short: 'Байланысқан ыдыстардағы сұйық деңгейі' },
          { title: 'Гидравликалық машиналар', short: 'Паскаль заңының қолданылуы' },
          { title: 'Атмосфералық қысым', short: 'Ауа қабатының қысымы' },
          { title: 'Манометр', short: 'Қысым өлшейтін құрал' },
          {
            title: 'Архимед заңы',
            short: 'Сұйыққа батырылған денеге әсер ететін кері итеруші күш',
            content: theoryDensity,
            formula: 'FА = ρсұйық · g · Vбатқан',
            objectives: ['Архимед күшін түсіну', 'Күшті есептеу', 'Жүзу шарттарын анықтау'],
            keyConcepts: ['Архимед күші', 'Тығыздық', 'Жүзу'],
            youtube: 'https://www.youtube.com/watch?v=eQsmq3Hu9HA',
            videoTitle: 'Архимед заңы',
            videoDescription: 'Кері итеруші күш және денелердің жүзу шарттары',
            simulation: SimulationType.ARCHIMEDES,
            duration: 18,
            xp: 70,
            questions: archimedesQuestions,
          },
          { title: 'Денелердің жүзу шарттары', short: 'Бату, жүзу және тепе-теңдік', formula: 'ρдене vs ρсұйық', simulation: SimulationType.ARCHIMEDES },
        ],
      },
    ],
  },
  {
    number: 4,
    title: '4-тоқсан',
    description: 'Жұмыс, энергия, жай механизмдер, Жер және ғарыш',
    sections: [
      {
        title: 'Жұмыс және энергия',
        topics: [
          { title: 'Механикалық жұмыс', short: 'Күш пен орын ауыстырудың көбейтіндісі', content: theoryDensity, formula: 'A = F · s' },
          { title: 'Қуат', short: 'Жұмыстың орындалу шапшаңдығы', formula: 'N = A / t' },
          { title: 'Кинетикалық энергия', short: 'Қозғалыс энергиясы', formula: 'Eк = m·v² / 2' },
          { title: 'Потенциалдық энергия', short: 'Дене орнына байланысты энергия', formula: 'Eп = m·g·h' },
          { title: 'Энергияның сақталуы', short: 'Толық механикалық энергияның сақталу заңы', content: theoryDensity },
        ],
      },
      {
        title: 'Жай механизмдер',
        topics: [
          { title: 'Иіндік', short: 'Тірегі бар қатты дене', content: theoryDensity, formula: 'F₁·l₁ = F₂·l₂' },
          { title: 'Күш моменті', short: 'Айналдырушы әсер', formula: 'M = F · l' },
          { title: 'Массалар центрі', short: 'Дене салмағының түсу нүктесі' },
          { title: 'Көлбеу жазықтық', short: 'Күшті ұтуға арналған механизм' },
          { title: 'Пайдалы әрекет коэффициенті', short: 'ПӘК және тиімділік', formula: 'η = Aпайд / Aтолық · 100%' },
        ],
      },
      {
        title: 'Жер және ғарыш',
        topics: [
          { title: 'Аспан денелері', short: 'Жұлдыздар, планеталар және серіктер', content: theoryDensity },
          { title: 'Күн жүйесі', short: 'Күн және оны айналатын планеталар' },
          { title: 'Тәулік', short: 'Жердің өз осінен айналуы' },
          { title: 'Ай', short: 'Жердің табиғи серігі' },
          { title: 'Жыл', short: 'Жердің Күнді айналу кезеңі' },
        ],
      },
    ],
  },
];

const achievements = [
  { code: 'FIRST_LESSON', title: 'Алғашқы сабақ', description: 'Бірінші тақырыпты аштыңыз', icon: 'book-open', xpReward: 10 },
  { code: 'FIRST_VIDEO', title: 'Алғашқы видео', description: 'Бірінші видеоны көрдіңіз', icon: 'play-circle', xpReward: 10 },
  { code: 'FIRST_SIMULATION', title: 'Алғашқы тәжірибе', description: 'Бірінші симуляцияны аяқтадыңыз', icon: 'flask-conical', xpReward: 15 },
  { code: 'FIRST_QUIZ', title: 'Алғашқы тест', description: 'Бірінші тестті тапсырдыңыз', icon: 'check-circle', xpReward: 15 },
  { code: 'SPEED_MASTER', title: 'Жылдамдық шебері', description: 'Механикалық қозғалыс симуляциясын аяқтадыңыз', icon: 'gauge', xpReward: 20 },
  { code: 'ARCHIMEDES_FOLLOWER', title: 'Архимед ізбасары', description: 'Архимед заңы симуляциясын аяқтадыңыз', icon: 'waves', xpReward: 20 },
  { code: 'HOOKE_RESEARCHER', title: 'Гук заңының зерттеушісі', description: 'Гук заңы симуляциясын аяқтадыңыз', icon: 'move-vertical', xpReward: 20 },
  { code: 'FIVE_TOPICS', title: '5 тақырып аяқталды', description: '5 тақырыпты толық аяқтадыңыз', icon: 'layers', xpReward: 30 },
  { code: 'TEN_TOPICS', title: '10 тақырып аяқталды', description: '10 тақырыпты толық аяқтадыңыз', icon: 'trophy', xpReward: 50 },
  { code: 'FIVE_PERFECT', title: '5 тесттен 100%', description: '5 тестте толық ұпай жинадыңыз', icon: 'star', xpReward: 40 },
  { code: 'STREAK_3', title: '3 күндік оқу сериясы', description: '3 күн қатарынан оқыдыңыз', icon: 'flame', xpReward: 20 },
  { code: 'STREAK_7', title: '7 күндік оқу сериясы', description: '7 күн қатарынан оқыдыңыз', icon: 'flame', xpReward: 40 },
];

async function ensureAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'gggsayat2004@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'SmartPhysics2026!';
  const adminName = process.env.ADMIN_NAME ?? 'Сайат Админ';
  const adminHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminHash, role: 'ADMIN', fullName: adminName },
    create: { fullName: adminName, email: adminEmail, passwordHash: adminHash, role: 'ADMIN', avatar: 'atom' },
  });
  console.log(`✅ Admin ensured: ${adminEmail}`);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Idempotency guard: never wipe real data on a restart/redeploy.
  // Only a fresh (empty) DB gets the full curriculum. Use FORCE_SEED=true to override.
  const existingTopics = await prisma.topic.count();
  if (existingTopics > 0 && process.env.FORCE_SEED !== 'true') {
    console.log('ℹ️  Database already seeded — skipping curriculum wipe.');
    await ensureAdmin();
    return;
  }

  // Clean (order matters for FKs; cascade handles children)
  await prisma.userXPTransaction.deleteMany();
  await prisma.quizAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.simulationAttempt.deleteMany();
  await prisma.userTopicProgress.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.dailyActivity.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.uploadedFile.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.video.deleteMany();
  await prisma.topicObjective.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.section.deleteMany();
  await prisma.quarter.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.user.deleteMany();

  // Admin account (configurable via ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME env)
  await ensureAdmin();

  // Achievements
  await prisma.achievement.createMany({ data: achievements });
  console.log('✅ Achievements created');

  // Curriculum
  let topicCount = 0;
  for (const q of curriculum) {
    const quarter = await prisma.quarter.create({
      data: { number: q.number, title: q.title, description: q.description, orderNumber: q.number },
    });

    let sOrder = 0;
    for (const s of q.sections) {
      const section = await prisma.section.create({
        data: {
          quarterId: quarter.id,
          title: s.title,
          slug: `${slugify(s.title)}-q${q.number}`,
          orderNumber: sOrder++,
        },
      });

      let tOrder = 0;
      for (const t of s.topics) {
        const youtubeId = t.youtube ? extractId(t.youtube) : null;
        const topic = await prisma.topic.create({
          data: {
            sectionId: section.id,
            title: t.title,
            slug: `${slugify(t.title)}-${q.number}-${tOrder}`,
            shortDescription: t.short,
            content: t.content ?? '',
            formula: t.formula ?? null,
            coverImage: null,
            youtubeUrl: t.youtube ?? null,
            videoTitle: t.videoTitle ?? null,
            videoDescription: t.videoDescription ?? null,
            keyConcepts: t.keyConcepts ?? [],
            durationMinutes: t.duration ?? 10,
            xpReward: t.xp ?? 50,
            simulationType: t.simulation ?? SimulationType.NONE,
            orderNumber: tOrder++,
            isPublished: true,
            objectives: t.objectives
              ? { create: t.objectives.map((text, order) => ({ text, order })) }
              : undefined,
          },
        });
        topicCount++;

        if (youtubeId) {
          await prisma.video.create({
            data: {
              topicId: topic.id,
              youtubeId,
              title: t.videoTitle ?? t.title,
              description: t.videoDescription ?? null,
              durationSec: (t.duration ?? 10) * 60,
            },
          });
        }

        if (t.questions) {
          for (let qi = 0; qi < t.questions.length; qi++) {
            const question = t.questions[qi];
            await prisma.question.create({
              data: {
                topicId: topic.id,
                type: 'SINGLE',
                text: question.text,
                explanation: question.explanation,
                order: qi,
                options: {
                  create: question.options.map((o, oi) => ({
                    text: o.text,
                    isCorrect: !!o.correct,
                    order: oi,
                  })),
                },
              },
            });
          }
        }
      }
    }
  }
  console.log(`✅ Curriculum created — ${topicCount} topics`);
  console.log('🎉 Seeding complete!');
}

function extractId(url: string): string | null {
  const patterns = [/[?&]v=([a-zA-Z0-9_-]{11})/, /youtu\.be\/([a-zA-Z0-9_-]{11})/, /\/embed\/([a-zA-Z0-9_-]{11})/, /\/shorts\/([a-zA-Z0-9_-]{11})/];
  for (const p of patterns) {
    const m = p.exec(url);
    if (m) return m[1];
  }
  return null;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
