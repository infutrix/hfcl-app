import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { isHfclAgent, isPortFree, showErrorDialog } from './port-guard';

const packagedFrontendDir = process.env.HFCL_FRONTEND_DIR;
const LOOPBACK_HOST = '127.0.0.1';

export async function bootstrap() {
  const rawServer = express();
  const isPackaged = Boolean(
    packagedFrontendDir && existsSync(packagedFrontendDir),
  );
  const port = Number(process.env.PORT ?? 3001);

  // Check before Nest starts, so a clash does not first open the OTDR and
  // discovery services only to tear them down again.
  if (isPackaged && !(await isPortFree(port, LOOPBACK_HOST))) {
    await handleBusyPort(port);
    return;
  }

  // Register static middleware before Nest routes so `/` is the Vite UI.
  // Nest's explicit API controllers still receive every non-static request.
  if (isPackaged) {
    rawServer.use(
      express.static(packagedFrontendDir!, { index: 'index.html' }),
    );
    // Keep known Nest route prefixes out of the SPA fallback. Register this
    // before Nest so Express reaches it instead of Nest's terminal 404 layer.
    rawServer.get(
      /^(?!\/(?:otdr|discovery|ui)(?:\/|$)).*/,
      (_request, response) => {
        response.sendFile(join(packagedFrontendDir!, 'index.html'));
      },
    );
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
  if (isPackaged) {
    try {
      await app.listen(port, LOOPBACK_HOST);
    } catch (error) {
      // Another process took the port between the check above and now.
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'EADDRINUSE' && code !== 'EACCES') throw error;
      await app.close();
      await handleBusyPort(port);
      return;
    }
  } else {
    await app.listen(port);
  }

  if (isPackaged) {
    const url = `http://${LOOPBACK_HOST}:${port}`;
    await waitForHttpReady(url);
    openBrowser(url);
  }
}

/**
 * A second launch while the app is already running is normal (the operator
 * double-clicked the shortcut again), so just bring the existing UI back up.
 * Anything else holding the port is a real problem the operator must see.
 */
async function handleBusyPort(port: number): Promise<void> {
  const url = `http://${LOOPBACK_HOST}:${port}`;

  if (await isHfclAgent(url)) {
    console.log(`HFCL is already running at ${url}; opening it.`);
    openBrowser(url);
    return;
  }

  const message = [
    'HFCL Testing App could not start.',
    '',
    `Port ${port} on this PC is in use or reserved by another program, so the app has nowhere to run.`,
    '',
    'To fix it:',
    '- Close the other program, or restart this PC, then start HFCL again.',
    `- If it keeps happening, ask IT to find what uses port ${port} (netstat -ano | findstr :${port}).`,
  ].join('\n');

  console.error(message);
  showErrorDialog('HFCL could not start', message);
  process.exitCode = 1;
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
    const browser = spawn(
      'rundll32.exe',
      ['url.dll,FileProtocolHandler', url],
      {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      },
    );
    browser.unref();
  }
}

if (process.env.HFCL_SEA_BOOTSTRAP !== '1') {
  void bootstrap();
}
