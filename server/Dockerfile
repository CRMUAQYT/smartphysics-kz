FROM node:20-alpine

WORKDIR /app

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
