import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function runMigrations() {
  try {
    const { stdout } = await execAsync('npx prisma migrate deploy', {
      cwd: process.cwd(),
      timeout: 30000,
    });
    if (stdout.includes('successfully applied')) {
      console.log('[Authlode] ✓ 数据库迁移已应用');
    } else {
      console.log('[Authlode] 数据库已是最新');
    }
  } catch (error) {
    console.warn('[Authlode] 数据库迁移警告:', error.message?.slice(0, 80));
    // 不阻止启动 — 让 PrismaService.$connect 决定是否致命
  }
}

async function bootstrap() {
  await runMigrations();

  const app = await NestFactory.create(AppModule);
  // APP_PORT 与 .env / config DTO（app.config.ts）对齐；默认 3001
  await app.listen(Number(process.env.APP_PORT ?? 3001));
  console.log(`[Authlode] ✓ 服务已启动 → http://localhost:${process.env.APP_PORT ?? 3001}`);
}
bootstrap();
