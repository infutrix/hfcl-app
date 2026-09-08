'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');
const client = path.join(root, 'client');
const server = path.join(root, 'server');
const work = path.join(root, 'build', 'sea');
const output = path.join(root, 'dist', 'hfcl-app.exe');

function run(args, cwd) {
  const result = spawnSync(process.execPath, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

function resolvePackageRoot(directory, packageName) {
  let current = path.dirname(require.resolve(packageName, { paths: [directory] }));
  while (path.dirname(current) !== current) {
    const packageJson = path.join(current, 'package.json');
    if (fs.existsSync(packageJson) && JSON.parse(fs.readFileSync(packageJson)).name === packageName) {
      return current;
    }
    current = path.dirname(current);
  }
  throw new Error(`Could not find package root for ${packageName}.`);
}

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(filename) : [filename];
  });
}

async function main() {
  fs.rmSync(work, { recursive: true, force: true });
  fs.rmSync(output, { force: true });
  fs.mkdirSync(work, { recursive: true });
  fs.mkdirSync(path.dirname(output), { recursive: true });

  const typescript = resolvePackageRoot(client, 'typescript');
  const vite = resolvePackageRoot(client, 'vite');
  // The Nest CLI intentionally has no package main export.
  const nestCli = fs.realpathSync(path.join(server, 'node_modules', '@nestjs', 'cli'));
  run([path.join(typescript, 'bin', 'tsc'), '-b'], client);
  run([path.join(vite, 'bin', 'vite.js'), 'build'], client);
  run([path.join(nestCli, 'bin', 'nest.js'), 'build'], server);

  await build({
    entryPoints: [path.join(root, 'scripts', 'sea-entry.cjs')],
    outfile: path.join(work, 'application.cjs'),
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node25',
    sourcemap: false,
    minify: false,
    // Nest resolves these optional integrations lazily. This application does
    // not use either integration, and leaving the guarded requires untouched
    // avoids adding unused Nest packages to the executable.
    external: [
      'node:*',
      '@nestjs/websockets/socket-module',
      '@nestjs/microservices',
      '@nestjs/microservices/microservices-module',
    ],
  });

  const assets = {};
  for (const file of collectFiles(path.join(client, 'dist'))) {
    const relative = path.relative(path.join(client, 'dist'), file).split(path.sep).join('/');
    assets[`frontend/${relative}`] = file;
  }
  if (!assets['frontend/index.html']) throw new Error('Vite did not produce index.html.');

  const config = {
    main: path.join(work, 'application.cjs'),
    output,
    disableExperimentalSEAWarning: true,
    useCodeCache: false,
    execArgvExtension: 'none',
    assets,
  };
  const configPath = path.join(work, 'sea-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  run(['--build-sea', configPath], root);
}

main().catch((error) => {
  console.error('Unable to build hfcl-app.exe:', error);
  process.exitCode = 1;
});
