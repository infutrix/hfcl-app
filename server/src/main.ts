import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const packagedFrontendDir = process.env.HFCL_FRONTEND_DIR;

export async function bootstrap() {
  const rawServer = express();
  const isPackaged = Boolean(
    packagedFrontendDir && existsSync(packagedFrontendDir),
  );

  // Register static middleware before Nest routes so `/` is the Vite UI.
  // Nest's explicit API controllers still receive every non-static request.
  if (isPackaged) {
    rawServer.use(express.static(packagedFrontendDir!, { index: 'index.html' }));
    // Keep known Nest route prefixes out of the SPA fallback. Register this
    // before Nest so Express reaches it instead of Nest's terminal 404 layer.
    rawServer.get(/^(?!\/(?:otdr|discovery|ui)(?:\/|$)).*/, (_request, response) => {
      response.sendFile(join(packagedFrontendDir!, 'index.html'));
    });
  }

  const app = isPackaged
    ? await NestFactory.create(AppModule, new ExpressAdapter(rawServer))
    : await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.enableCors({
    origin: isPackaged ? false : ['http://localhost:3000'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(express.json({ limit: '500mb' }));
  app.use(express.urlencoded({ limit: '500mb', extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const port = Number(process.env.PORT ?? 3001);
  if (isPackaged) {
    await app.listen(port, '127.0.0.1');
  } else {
    await app.listen(port);
  }

  if (isPackaged) {
    const url = `http://127.0.0.1:${port}`;
    await waitForHttpReady(url);
    openBrowser(url);
  }
}

async function waitForHttpReady(url: string): Promise<void> {
  const deadline = Date.now() + 10_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(
    `The local HTTP server did not become ready: ${
      lastError instanceof Error ? lastError.message : 'unknown error'
    }`,
  );
}

function openBrowser(url: string): void {
  if (process.platform === 'win32') {
    const browser = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    browser.unref();
  }
}

if (process.env.HFCL_SEA_BOOTSTRAP !== '1') {
  void bootstrap();
}
