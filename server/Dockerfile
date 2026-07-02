FROM node:20-slim

WORKDIR /app

# Prisma needs OpenSSL; Debian slim ships a compatible openssl-3.0.x
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies (leverages layer caching)
COPY package.json ./
COPY prisma ./prisma
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

EXPOSE 4000

# Run migrations, seed (ignore failure if already seeded), then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && (npx tsx prisma/seed.ts || true) && node dist/server.js"]
