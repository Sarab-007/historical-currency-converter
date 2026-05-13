import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: resolveAllowedOrigins(process.env.CORS_ORIGIN),
  });

  await app.listen(port);
}

function resolveAllowedOrigins(origin?: string): string[] | boolean {
  if (!origin || origin === '*') {
    return true;
  }

  return origin
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

void bootstrap();
