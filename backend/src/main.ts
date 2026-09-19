import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // APP_PORT 与 .env / config DTO（app.config.ts）对齐；默认 3001
  await app.listen(Number(process.env.APP_PORT ?? 3001));
}
bootstrap();
