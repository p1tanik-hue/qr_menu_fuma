/**
 * Generates PWA icons, favicon and the OpenGraph image from SVG using sharp.
 * Run: `node scripts/gen-assets.mjs`
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

function monogramSvg(size, { padding = 0, bg = true } = {}) {
  const r = size / 2;
  const inner = size - padding * 2;
  const fontSize = inner * 0.52;
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#E7CE93"/>
        <stop offset="55%" stop-color="#C9A55C"/>
        <stop offset="100%" stop-color="#A9863F"/>
      </linearGradient>
      <radialGradient id="bg" cx="50%" cy="38%" r="75%">
        <stop offset="0%" stop-color="#161616"/>
        <stop offset="100%" stop-color="#0A0A0A"/>
      </radialGradient>
    </defs>
    ${bg ? `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>` : ''}
    <circle cx="${r}" cy="${r}" r="${inner * 0.42}" fill="none" stroke="url(#gold)" stroke-width="${size * 0.012}" opacity="0.6"/>
    <text x="${r}" y="${r + fontSize * 0.03}" font-family="Georgia, serif" font-size="${fontSize}"
      font-weight="600" fill="url(#gold)" text-anchor="middle" dominant-baseline="middle">F</text>
  </svg>`;
}

function ogSvg() {
  return `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#E7CE93"/>
        <stop offset="55%" stop-color="#C9A55C"/>
        <stop offset="100%" stop-color="#A9863F"/>
      </linearGradient>
      <radialGradient id="bg" cx="50%" cy="20%" r="90%">
        <stop offset="0%" stop-color="#181818"/>
        <stop offset="100%" stop-color="#0A0A0A"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="600" cy="250" r="90" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.55"/>
    <text x="600" y="262" font-family="Georgia, serif" font-size="96" font-weight="600"
      fill="url(#gold)" text-anchor="middle" dominant-baseline="middle">F</text>
    <text x="600" y="430" font-family="Georgia, serif" font-size="84" font-weight="600"
      letter-spacing="24" fill="url(#gold)" text-anchor="middle">FUMA</text>
    <text x="600" y="490" font-family="Georgia, serif" font-size="26"
      letter-spacing="30" fill="#B7AC94" text-anchor="middle">LOUNGE</text>
    <text x="600" y="560" font-family="ui-sans-serif, sans-serif" font-size="24"
      fill="#8a8171" text-anchor="middle">Электронное меню · Премиальная кальянная</text>
  </svg>`;
}

async function png(svg, size, out) {
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  await writeFile(out, buf);
  console.log('•', path.relative(process.cwd(), out));
}

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });

  await png(monogramSvg(32), 32, path.join(ICONS_DIR, 'icon-32.png'));
  await png(monogramSvg(192), 192, path.join(ICONS_DIR, 'icon-192.png'));
  await png(monogramSvg(512), 512, path.join(ICONS_DIR, 'icon-512.png'));
  await png(monogramSvg(180), 180, path.join(ICONS_DIR, 'apple-touch-icon.png'));
  // Maskable: extra padding so the safe zone isn't clipped.
  await png(
    monogramSvg(512, { padding: 80 }),
    512,
    path.join(ICONS_DIR, 'maskable-512.png'),
  );
  // Favicon (png is accepted by modern browsers).
  await png(monogramSvg(48), 48, path.join(ICONS_DIR, 'favicon.ico'));

  const og = await sharp(Buffer.from(ogSvg())).png().toBuffer();
  await writeFile(path.join(PUBLIC_DIR, 'og.png'), og);
  console.log('• public/og.png');

  console.log('✅ Assets generated.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
