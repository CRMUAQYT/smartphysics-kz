#!/usr/bin/env bash
# One-shot backend deploy for the Hetzner server.
#
# Usage (on the server, inside the cloned repo):
#   bash scripts/deploy-hetzner.sh <github-username> [admin-password]
#
# It installs Docker (if missing), generates .env.prod with strong random
# secrets, opens the firewall, and starts the production stack.
set -euo pipefail

GH_USER="${1:-}"
ADMIN_PASSWORD_ARG="${2:-}"

if [ -z "$GH_USER" ]; then
  echo "❌ GitHub username керек: bash scripts/deploy-hetzner.sh <github-username> [admin-password]"
  exit 1
fi

# Detect this server's public IPv4 and build the sslip.io hostname
IP="$(curl -fsS4 https://api.ipify.org || hostname -I | awk '{print $1}')"
API_DOMAIN="$(echo "$IP" | tr '.' '-').sslip.io"

echo "▶ Server IP     : $IP"
echo "▶ API domain    : $API_DOMAIN"
echo "▶ Frontend CORS : https://${GH_USER}.github.io"

# 1. Docker
if ! command -v docker >/dev/null 2>&1; then
  echo "▶ Installing Docker..."
  curl -fsSL https://get.docker.com | sh
fi

# 2. Firewall (best-effort)
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22 >/dev/null 2>&1 || true
  ufw allow 80 >/dev/null 2>&1 || true
  ufw allow 443 >/dev/null 2>&1 || true
  yes | ufw enable >/dev/null 2>&1 || true
fi

# 3. Generate .env.prod (only if it doesn't already exist)
if [ ! -f .env.prod ]; then
  echo "▶ Generating .env.prod with random secrets..."
  ADMIN_PASSWORD="${ADMIN_PASSWORD_ARG:-SmartPhysics2026!}"
  GH_USER_LC="$(echo "$GH_USER" | tr '[:upper:]' '[:lower:]')" # github.io origin is lowercase
  cat > .env.prod <<EOF
API_DOMAIN=${API_DOMAIN}
DB_PASSWORD=$(openssl rand -hex 16)
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
CLIENT_URL=https://${GH_USER_LC}.github.io
ADMIN_EMAIL=gggsayat2004@gmail.com
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ADMIN_NAME=Сайат Админ
EOF
  echo "  ✓ .env.prod жасалды (админ құпиясөз: ${ADMIN_PASSWORD})"
else
  echo "▶ .env.prod бар — қайта жасалмайды."
fi

# 4. Launch
echo "▶ Building & starting stack..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

echo ""
echo "✅ Дайын! Бірнеше секундтан соң тексеріңіз:"
echo "   curl https://${API_DOMAIN}/api/health"
echo "   Backend API: https://${API_DOMAIN}/api"
echo "   Логтар:      docker compose -f docker-compose.prod.yml logs -f"
