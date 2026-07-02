import { createApp } from './app';
import { env } from './config/env';
import prisma from './config/prisma';

async function main() {
  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`\n🚀 SmartPhysics KZ API — http://localhost:${env.port}`);
    console.log(`📚 Swagger docs   — http://localhost:${env.port}/api/docs`);
    console.log(`🌱 Environment    — ${env.nodeEnv}\n`);
  });

  const shutdown = async () => {
    console.log('\nShutting down...');
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
