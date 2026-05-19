import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SRC = resolve('public/Lexavo-logo.png');
const APP_DIR = resolve('app');

async function pngBuffer(size) {
  return sharp(SRC).resize(size, size, { fit: 'cover' }).png().toBuffer();
}

// 1. app/icon.png — 512x512 (servi par Next 16 avec <link rel="icon">)
await writeFile(resolve(APP_DIR, 'icon.png'), await pngBuffer(512));

// 2. app/apple-icon.png — 180x180 (iOS home screen)
await writeFile(resolve(APP_DIR, 'apple-icon.png'), await pngBuffer(180));

// 3. app/favicon.ico — multi-résolutions 16/32/48 (Google exige >= 48)
const ico = await pngToIco([
  await pngBuffer(16),
  await pngBuffer(32),
  await pngBuffer(48),
]);
await writeFile(resolve(APP_DIR, 'favicon.ico'), ico);

console.log('OK: app/icon.png (512), app/apple-icon.png (180), app/favicon.ico (16/32/48)');
