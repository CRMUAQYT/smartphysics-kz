# 🚀 Deployment: Backend → Hetzner, Frontend → GitHub Pages

Архитектура:

```
GitHub Pages (https)  ──API──►  Caddy (https, Let's Encrypt)  ──►  Node backend  ──►  PostgreSQL
  frontend (static)                 Hetzner сервер 178.105.152.178 (Docker Compose)
```

Frontend GitHub Pages-те (https), сондықтан backend те **https** болуы шарт. Оны Hetzner-де **Caddy** автоматты Let's Encrypt сертификатымен қамтамасыз етеді. Домен ретінде `sslip.io` қолданылады (IP-ды нақты DNS атауына айналдырады): `178-105-152-178.sslip.io`.

---

## 1-бөлім. Backend → Hetzner сервер

### 1.1. Серверге кіру

```bash
ssh root@178.105.152.178
```

### 1.2. Docker орнату (әлі болмаса)

```bash
curl -fsSL https://get.docker.com | sh
```

### 1.3. Кодты серверге көшіру

Git арқылы (repo push жасалғаннан кейін):

```bash
git clone https://github.com/<USERNAME>/smartphysics-kz.git
cd smartphysics-kz
```

### 1.4. Production env дайындау

```bash
cp .env.prod.example .env.prod
nano .env.prod
```

Мыналарды толтырыңыз:

| Айнымалы | Мән |
| --- | --- |
| `API_DOMAIN` | `178-105-152-178.sslip.io` (IP өзгерсе, нүктелерді сызықшамен жазыңыз) |
| `DB_PASSWORD` | күшті құпиясөз |
| `JWT_ACCESS_SECRET` | `openssl rand -hex 32` нәтижесі |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 32` (басқа) |
| `CLIENT_URL` | `https://<USERNAME>.github.io` (тек origin, жолсыз) |
| `ADMIN_EMAIL` | `gggsayat2004@gmail.com` |
| `ADMIN_PASSWORD` | қалаған әкімші құпиясөзіңіз |

Секреттерді тез генерациялау:

```bash
echo "JWT_ACCESS_SECRET=$(openssl rand -hex 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 32)"
```

### 1.5. Firewall (80/443 ашық болуы керек)

Hetzner Cloud Firewall немесе сервердің ішінде:

```bash
ufw allow 80 && ufw allow 443 && ufw allow 22 && ufw --force enable
```

> ⚠️ Caddy-дің Let's Encrypt сертификатын алуы үшін **80 және 443** порттары интернеттен ашық болуы міндетті.

### 1.6. Іске қосу

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Бұл: PostgreSQL + backend (migrate + seed автоматты) + Caddy-ді көтереді.
Caddy бірнеше секундта сертификат алады.

### 1.7. Тексеру

```bash
curl https://178-105-152-178.sslip.io/api/health
# {"success":true,"data":{"status":"ok"}}
```

Логтар: `docker compose -f docker-compose.prod.yml logs -f`

### Жаңарту (кейін код өзгергенде)

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

---

## 2-бөлім. Frontend → GitHub Pages

### 2.1. Repo жасау және push

Жергілікті машинада (жоба папкасында):

```bash
git init
git add .
git commit -m "SmartPhysics KZ"
git branch -M main
git remote add origin https://github.com/<USERNAME>/smartphysics-kz.git
git push -u origin main
```

### 2.2. Pages-ті қосу

GitHub → repo → **Settings → Pages** → **Source: GitHub Actions**.

### 2.3. Backend URL-ды тексеру

[.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) ішіндегі:

```yaml
VITE_BASE: /smartphysics-kz/                       # repo атауы
VITE_API_URL: https://178-105-152-178.sslip.io/api # backend HTTPS URL
```

Repo атауы немесе сервер IP басқа болса, осы жерді өзгертіңіз.
`main`-ге әр push автоматты build + deploy жасайды.

### 2.4. Сайт мекенжайы

```
https://<USERNAME>.github.io/smartphysics-kz/
```

---

## 3-бөлім. Байланысты тексеру

1. Backend health: `https://178-105-152-178.sslip.io/api/health` → OK.
2. Frontend ашылады: `https://<USERNAME>.github.io/smartphysics-kz/`.
3. Әкімшімен кіру: `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

CORS қатесі шықса — сервердегі `.env.prod` ішіндегі `CLIENT_URL` дәл сіздің `https://<USERNAME>.github.io` екеніне көз жеткізіп, backend-ті қайта іске қосыңыз.

---

## Ескертпелер

- **Домен қосқыңыз келсе:** `API_DOMAIN`-ды нақты доменге (мыс. `api.example.kz`, DNS A-жазба серверге бағытталған) ауыстырсаңыз, Caddy сол үшін де автоматты сертификат алады.
- **sslip.io** — IP-ды DNS атауына айналдыратын тегін сервис; Let's Encrypt-тің сертификат беруіне мүмкіндік береді.
- Seed идемпотентті: қайта деплойда оқушы деректері **өшпейді**. Толық қайта себу керек болса — сервердегі env-ке `FORCE_SEED=true` қосыңыз.
