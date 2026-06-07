import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser';
import { join } from 'path';
import * as express from 'express';
import { PrismaService } from './shared/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.setGlobalPrefix('api');

  const allowedOrigins = (
    process.env.FRONTEND_ORIGIN ??
    'https://localhost'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const prisma = app.get(PrismaService);
  const docsErrorPage = (message: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>API Docs — Unauthorized</title>
      <style>
        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a2e; color: #eee; }
        .box { text-align: center; padding: 2rem; border: 1px solid #444; border-radius: 8px; background: #16213e; max-width: 420px; }
        h1 { font-size: 1.4rem; margin-bottom: 0.5rem; color: #e74c3c; }
        p { color: #aaa; font-size: 0.95rem; }
        code { background: #0f3460; padding: 2px 6px; border-radius: 4px; color: #74b9ff; font-size: 0.9rem; }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>401 — Unauthorized</h1>
        <p>${message}</p>
        <p>Access the docs with:<br><code>?key=your-api-key</code></p>
      </div>
    </body>
    </html>`;

  app.use(['/docs', '/docs-json', '/docs-yaml'], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path !== '/' && req.path !== '') return next();
    const key = req.query.key as string | undefined;
    if (!key) return res.status(401).send(docsErrorPage('No API key provided.'));
    const apiKey = await prisma.apiKey.findUnique({ where: { key } });
    if (!apiKey) return res.status(401).send(docsErrorPage('Invalid API key.'));
    next();
  });

  const config = new DocumentBuilder()
      .setTitle('Transcendance API')
      .setDescription('Public API for the Transcendance marketplace')
      .setVersion('1.0')
      .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' }, 'api-key')
      .addSecurityRequirements('api-key')
      .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
