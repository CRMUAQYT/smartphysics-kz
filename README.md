# ⚛️ SmartPhysics KZ

**Физиканы жаттама. Зертте. Дәлелде.**

7-сынып оқушыларына арналған интерактивті физика оқыту платформасы (Қазақстан). Видео сабақтар, интерактивті физикалық симуляциялар, тесттер, XP/геймификация, оқушы профилі және мұғалімге арналған админ-панель.

> ⚠️ Демонстрациялық жоба. Төмендегі аккаунттар мен деректер тек көрсету үшін берілген.

---

## ✨ Мүмкіндіктер

- **Landing page** — анимациялық атом, бөлшектер, ғылыми grid, тірі интерактивті демо.
- **34+ тақырып** — 4 тоқсан, барлық бөлімдер PostgreSQL базасына seed арқылы енгізілген.
- **Тақырыптар каталогы** — тоқсан/бөлім бойынша сүзгі, іздеу, прогресс, статус.
- **Сабақ беті** — теория (қауіпсіз sanitize), формула, YouTube видео, интерактивті тәжірибе, тест.
- **3 физикалық симуляция** — Архимед заңы, Механикалық қозғалыс, Гук заңы (SVG/Canvas, нақты формулалар).
- **Тест жүйесі** — progress bar, түсіндірмелер, XP (бір рет қана беріледі).
- **Геймификация** — XP, 5 деңгей, 12 жетістік, оқу сериясы, achievement celebration.
- **Оқушы dashboard** — Recharts графиктер (апталық белсенділік, тест динамикасы, бөлімдер прогресі).
- **Админ-панель** — dashboard, тақырып CRUD, тест сұрақтарын басқару, оқушылар мен нәтижелер.
- **Толық responsive** — mobile-first, 320px-тен бастап, sidebar drawer, accessibility, reduced-motion.

---

## 🛠 Технологиялар

**Frontend:** React 18 · Vite · TypeScript · React Router · Tailwind CSS · Framer Motion · TanStack Query · Zustand · React Hook Form · Zod · Lucide React · Recharts

**Backend:** Node.js · Express · TypeScript · PostgreSQL · Prisma ORM · JWT (access + refresh) · bcrypt · Zod · Multer · Helmet · CORS · Rate limiting · DOMPurify · Swagger (OpenAPI)

**DevOps:** Docker · Docker Compose · ESLint · Prettier

---

## 📁 Папка құрылымы

```
smartphysics-kz/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # UI + decor + shared
│       ├── layouts/        # Public / Dashboard / Admin
│       ├── pages/          # Барлық беттер (+ admin/)
│       ├── simulations/    # Архимед / Қозғалыс / Гук
│       ├── services/       # axios API клиент + endpoints
│       ├── store/          # Zustand (auth, toast, achievements)
│       ├── types/          # ортақ TS типтер
│       └── utils/
├── server/                 # Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/         # env, prisma, openapi
│       ├── middleware/     # auth, validate, error, upload
│       ├── modules/        # auth / topics / profile / admin
│       ├── services/       # gamification (XP, streak, achievements)
│       ├── routes/
│       └── app.ts
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔑 Environment variables

`.env.example` файлын `.env` етіп көшіріңіз (немесе `server/.env`):

```env
DATABASE_URL=postgresql://smartphysics:smartphysics@localhost:5432/smartphysics?schema=public
JWT_ACCESS_SECRET=change_me_access_secret_at_least_32_chars_long
JWT_REFRESH_SECRET=change_me_refresh_secret_at_least_32_chars_long
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PORT=4000
UPLOAD_DIR=uploads
VITE_API_URL=http://localhost:4000/api
```

---

## 🚀 Локалды іске қосу (development)

Талаптар: **Node.js 20+**, **PostgreSQL 14+**.

```bash
# 1. Тәуелділіктерді орнату (root workspaces)
npm install

# 2. .env дайындау
cp .env.example .env
cp .env.example server/.env      # server өз .env-ін оқиды

# 3. Database migration + seed
npm run db:migrate -w server     # немесе: cd server && npx prisma migrate dev
npm run db:seed -w server

# 4. Екеуін қатар іске қосу (frontend + backend)
npm run dev
```

- Frontend → http://localhost:5173
- Backend  → http://localhost:4000
- Swagger  → http://localhost:4000/api/docs

Бөлек іске қосу:

```bash
npm run dev -w server     # тек backend
npm run dev -w client     # тек frontend
```

---

## 🐳 Docker арқылы іске қосу

```bash
docker compose up --build
```

Бұл команда PostgreSQL, backend (migrate + seed автоматты) және frontend-ті көтереді:

- Frontend → http://localhost:5173
- Backend  → http://localhost:4000

---

## 🧬 Database

```bash
# Миграция жасау / қолдану
cd server
npx prisma migrate dev            # dev миграция
npx prisma migrate deploy         # prod миграция

# Seed (демо деректер)
npx prisma db seed                # немесе npm run db:seed

# Толық reset (өшіру + migrate + seed)
npm run db:reset
```

Prisma Studio: `cd server && npx prisma studio`

---

## 👤 Demo аккаунттар

> Бұл деректер тек демонстрацияға арналған.

| Рөл     | Email                       | Құпиясөз      |
| ------- | --------------------------- | ------------- |
| Админ   | `admin@smartphysics.kz`     | `Admin123!`   |
| Оқушы   | `student@smartphysics.kz`   | `Student123!` |
| Оқушы 2 | `student2@smartphysics.kz`  | `Student123!` |

---

## 📡 Негізгі API

Барлық жауаптар біркелкі форматта:

```jsonc
// сәтті
{ "success": true, "data": { /* ... */ } }
// қате
{ "success": false, "message": "Validation failed", "errors": [] }
```

| Метод  | Route                                   | Сипаттама                    |
| ------ | --------------------------------------- | ---------------------------- |
| POST   | `/api/auth/register`                    | Тіркелу                      |
| POST   | `/api/auth/login`                       | Кіру                         |
| POST   | `/api/auth/refresh`                     | Токенді жаңарту (rotate)     |
| POST   | `/api/auth/logout`                      | Шығу                         |
| GET    | `/api/auth/me`                          | Ағымдағы қолданушы           |
| GET    | `/api/quarters` · `/api/sections`       | Тоқсандар / бөлімдер         |
| GET    | `/api/topics` · `/api/topics/:slug`     | Тақырыптар / жеке тақырып    |
| POST   | `/api/topics/:id/open`                  | Тақырыпты ашу (+XP)          |
| POST   | `/api/topics/:id/video-complete`        | Видеоны аяқтау (+XP)         |
| POST   | `/api/topics/:id/simulation-complete`   | Симуляцияны аяқтау (+XP)     |
| GET    | `/api/topics/:id/questions`             | Тест сұрақтары               |
| POST   | `/api/topics/:id/quiz-attempts`         | Тест тапсыру                 |
| GET    | `/api/profile` · `/progress` · `/activity` · `/achievements` | Профиль деректері |
| GET    | `/api/admin/dashboard`                  | Админ статистика             |
| CRUD   | `/api/admin/topics` · `/api/admin/questions` | Тақырып / сұрақ басқару  |
| GET    | `/api/admin/students` · `/:id`          | Оқушылар                     |

Толық құжаттама: **http://localhost:4000/api/docs**

---

## 🔐 Қауіпсіздік

Helmet · CORS (whitelist) · rate limiting (global + auth) · bcrypt (12 rounds) · JWT access/refresh (refresh DB-де сақталады және rotate жасалады) · role-based access control · Prisma (SQL injection қорғанысы) · rich-text sanitization (DOMPurify) · file validation (тип + өлшем) · body size limit · secure cookie (production) · env secrets · production-да stack trace жасырылған.

---

## 🎮 XP және деңгейлер

| Әрекет                 | XP  |
| ---------------------- | --- |
| Сабақты алғаш ашу      | 5   |
| Видеоны аяқтау         | 20  |
| Симуляцияны аяқтау     | 50  |
| Тесттен өту (≥60%)     | 50  |
| Тесттен 100%           | +30 |

**Деңгейлер:** Бақылаушы (0) · Ізденуші (200) · Зерттеуші (500) · Экспериментатор (1000) · Жас физик (2000+)

XP әр әрекет үшін тек бір рет беріледі (`UserXPTransaction` unique constraint арқылы кепілдендірілген).

---

## 🚢 Deployment нұсқаулығы

1. `.env` ішінде күшті `JWT_*` secret-терді орнатыңыз (32+ таңба), `NODE_ENV=production`.
2. `CLIENT_URL`-ды нақты домендеріңізге қойыңыз (үтірмен бірнешеу болуы мүмкін).
3. Backend: `npm run build -w server && npm run db:deploy -w server && npm start -w server`.
4. Frontend: `VITE_API_URL`-ды API доменіне қойып `npm run build -w client`, `dist/`-ті статик хостқа (nginx / Netlify / Vercel) орналастырыңыз.
5. Немесе `docker compose up --build -d` — барлығын бір команда көтереді.
6. Production-да HTTPS қосыңыз (secure cookie осыны талап етеді).

---

## 📜 Лицензия

Білім беру мақсатындағы демонстрациялық жоба.
