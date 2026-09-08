'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { getAsset, getAssetKeys } = require('node:sea');

function extractFrontend() {
  const frontendKeys = getAssetKeys().filter((key) => key.startsWith('frontend/'));
  if (frontendKeys.length === 0) {
    throw new Error('No embedded frontend assets were found.');
  }

  const version = crypto
    .createHash('sha256')
    .update(frontendKeys.join('\n'))
    .update(Buffer.from(getAsset('frontend/index.html')))
    .digest('hex')
    .slice(0, 16);
  const root = path.join(
    process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
    'HFCL',
    'hfcl-app',
    version,
  );
  const marker = path.join(root, '.complete');

  if (!fs.existsSync(marker)) {
    for (const key of frontendKeys) {
      const output = path.join(root, ...key.slice('frontend/'.length).split('/'));
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, Buffer.from(getAsset(key)));
    }
    fs.writeFileSync(marker, version, 'utf8');
  }
  return root;
}

async function start() {
  const frontendDir = extractFrontend();
  process.env.HFCL_FRONTEND_DIR = frontendDir;
  process.env.HFCL_RUNTIME_DATA_DIR = path.dirname(frontendDir);
  process.env.HFCL_SEA_BOOTSTRAP = '1';
  const { bootstrap } = require('../server/dist/main.js');
  await bootstrap();
}

start().catch((error) => {
  console.error('HFCL application failed to start:', error);
  process.exitCode = 1;
});
