import sharp from 'sharp';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const PUBLIC_PREFIX = '/uploads';

export interface ProcessedImage {
  imageUrl: string; // full-size WebP
  thumbUrl: string; // thumbnail WebP
  blurData: string; // base64 LQIP data URL
}

export interface CropRegion {
  left: number;
  top: number;
  width: number;
  height: number;
}

async function ensureDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Process an uploaded image buffer:
 *  - optional crop
 *  - resize to a consistent card size, cover-fit
 *  - encode to WebP (main + thumbnail)
 *  - produce a tiny blurred base64 placeholder (LQIP)
 * All product images become uniform in size and format.
 */
export async function processProductImage(
  input: Buffer,
  opts: { crop?: CropRegion; quality?: number } = {},
): Promise<ProcessedImage> {
  await ensureDir();

  const id = crypto.randomBytes(8).toString('hex');
  const quality = opts.quality ?? 80;

  let pipeline = sharp(input, { failOn: 'none' }).rotate(); // respect EXIF

  if (opts.crop) {
    const { left, top, width, height } = opts.crop;
    pipeline = pipeline.extract({
      left: Math.max(0, Math.round(left)),
      top: Math.max(0, Math.round(top)),
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    });
  }

  // Main image — 1000x1000 square, cover (uniform product photos).
  const mainBuffer = await pipeline
    .clone()
    .resize(1000, 1000, { fit: 'cover', position: 'centre' })
    .webp({ quality, effort: 4 })
    .toBuffer();

  // Thumbnail — 400x400.
  const thumbBuffer = await pipeline
    .clone()
    .resize(400, 400, { fit: 'cover', position: 'centre' })
    .webp({ quality: 70, effort: 4 })
    .toBuffer();

  // LQIP — 16px blurred base64 placeholder.
  const blurBuffer = await pipeline
    .clone()
    .resize(16, 16, { fit: 'cover' })
    .webp({ quality: 30 })
    .toBuffer();

  const imageName = `${id}.webp`;
  const thumbName = `${id}_thumb.webp`;

  await writeFile(path.join(UPLOAD_DIR, imageName), mainBuffer);
  await writeFile(path.join(UPLOAD_DIR, thumbName), thumbBuffer);

  return {
    imageUrl: `${PUBLIC_PREFIX}/${imageName}`,
    thumbUrl: `${PUBLIC_PREFIX}/${thumbName}`,
    blurData: `data:image/webp;base64,${blurBuffer.toString('base64')}`,
  };
}

export type PlaceholderIcon =
  | 'coffee'
  | 'tea'
  | 'ceremony'
  | 'water'
  | 'soda'
  | 'lemonade'
  | 'default';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Wrap a name into up to `maxLines` centered lines (rough char-based). */
function wrapName(name: string, maxChars = 15, maxLines = 2): string[] {
  const words = name.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length <= maxChars) {
      cur = (cur + ' ' + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  const used = lines.join(' ').length;
  if (used < name.length && lines.length) {
    // Keep the last word, just mark truncation.
    lines[lines.length - 1] = lines[lines.length - 1] + '…';
  }
  return lines.length ? lines : [name.slice(0, maxChars)];
}

/** Gold line-art icons (drawn in a 0..100 coordinate box). */
function iconSvg(kind: PlaceholderIcon): string {
  const s =
    'fill="none" stroke="url(#gold)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"';
  const map: Record<PlaceholderIcon, string> = {
    coffee: `<g ${s}>
      <path d="M36 20 q-5 -7 0 -14"/><path d="M50 20 q-5 -7 0 -14"/><path d="M64 20 q-5 -7 0 -14"/>
      <path d="M24 32 h50 v14 a25 25 0 0 1 -50 0 z"/>
      <path d="M74 34 h8 a12 12 0 0 1 0 24 h-6"/>
      <path d="M20 78 h58"/></g>`,
    tea: `<g ${s}>
      <path d="M34 22 q-5 -7 0 -14"/><path d="M52 22 q-5 -7 0 -14"/>
      <path d="M28 30 h40 v20 a20 20 0 0 1 -40 0 z"/>
      <path d="M68 34 h8 a11 11 0 0 1 0 22 h-6"/>
      <path d="M24 78 h50"/>
      <path d="M44 40 q9 -2 14 -12 q2 12 -14 12z"/></g>`,
    ceremony: `<g ${s}>
      <circle cx="50" cy="16" r="3.2"/>
      <path d="M28 42 a22 16 0 0 1 44 0 a22 22 0 0 1 -44 0 z"/>
      <path d="M31 40 h38"/>
      <path d="M28 48 q-18 0 -22 12 q11 -3 18 1"/>
      <path d="M72 42 q15 5 7 24"/>
      <path d="M34 80 h32"/></g>`,
    water: `<g ${s}>
      <path d="M44 8 h12 v7 q0 4 4 8 q7 7 7 19 v33 a6 6 0 0 1 -6 6 h-22 a6 6 0 0 1 -6 -6 v-33 q0 -12 7 -19 q4 -4 4 -8 z"/>
      <path d="M41 46 h18"/><path d="M41 58 h18"/></g>`,
    soda: `<g ${s}>
      <path d="M44 12 h12"/>
      <rect x="33" y="18" width="34" height="66" rx="7"/>
      <path d="M33 30 h34"/>
      <path d="M42 46 q8 6 16 0"/></g>`,
    lemonade: `<g ${s}>
      <path d="M32 30 h36 l-5 50 a4 4 0 0 1 -4 4 h-18 a4 4 0 0 1 -4 -4 z"/>
      <path d="M38 30 h24"/>
      <path d="M60 20 l-9 46"/>
      <circle cx="64" cy="24" r="8"/>
      <path d="M56 24 h16 M64 16 v16"/></g>`,
    default: `<g ${s}><circle cx="50" cy="45" r="26"/><path d="M50 22 v46 M27 45 h46"/></g>`,
  };
  return map[kind] ?? map.default;
}

/**
 * Generate a premium branded placeholder image: dark background, thin gold
 * frame, a themed gold line-art icon for the drink type, the product name and
 * the FUMA LOUNGE wordmark. Used by the seeder before real photos exist.
 */
export async function generatePlaceholderImage(
  name: string,
  icon: PlaceholderIcon = 'default',
  variantHue: 'gold' | 'amber' | 'cool' = 'gold',
): Promise<ProcessedImage> {
  await ensureDir();
  const id = 'ph_' + crypto.createHash('md5').update(name).digest('hex').slice(0, 12);

  const palettes = {
    gold: { a: '#141414', b: '#0A0A0A', accent: '#C9A55C' },
    amber: { a: '#1a1206', b: '#0A0A0A', accent: '#D8BE7E' },
    cool: { a: '#0d1417', b: '#0A0A0A', accent: '#B7AC94' },
  } as const;
  const pal = palettes[variantHue];

  const lines = wrapName(name);
  const nameTspans = lines
    .map(
      (line, i) =>
        `<tspan x="500" dy="${i === 0 ? 0 : 54}">${escapeXml(line)}</tspan>`,
    )
    .join('');

  const svg = `
  <svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="50%" cy="35%" r="80%">
        <stop offset="0%" stop-color="${pal.a}"/>
        <stop offset="100%" stop-color="${pal.b}"/>
      </radialGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#E7CE93"/>
        <stop offset="55%" stop-color="${pal.accent}"/>
        <stop offset="100%" stop-color="#A9863F"/>
      </linearGradient>
    </defs>
    <rect width="1000" height="1000" fill="url(#g)"/>
    <circle cx="500" cy="440" r="230" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.5"/>
    <circle cx="500" cy="440" r="192" fill="none" stroke="url(#gold)" stroke-width="1" opacity="0.28"/>
    <svg x="350" y="290" width="300" height="300" viewBox="0 0 100 100">${iconSvg(icon)}</svg>
    <text x="500" y="720" font-family="Georgia, serif" font-size="46" font-weight="600"
      fill="url(#gold)" text-anchor="middle">${nameTspans}</text>
    <text x="500" y="900" font-family="Georgia, serif" font-size="26" letter-spacing="12"
      fill="#C9A55C" opacity="0.75" text-anchor="middle">FUMA LOUNGE</text>
  </svg>`;

  const base = sharp(Buffer.from(svg));
  const mainBuffer = await base.clone().webp({ quality: 82 }).toBuffer();
  const thumbBuffer = await base
    .clone()
    .resize(400, 400)
    .webp({ quality: 70 })
    .toBuffer();
  const blurBuffer = await base
    .clone()
    .resize(16, 16)
    .webp({ quality: 30 })
    .toBuffer();

  const imageName = `${id}.webp`;
  const thumbName = `${id}_thumb.webp`;
  await writeFile(path.join(UPLOAD_DIR, imageName), mainBuffer);
  await writeFile(path.join(UPLOAD_DIR, thumbName), thumbBuffer);

  return {
    imageUrl: `${PUBLIC_PREFIX}/${imageName}`,
    thumbUrl: `${PUBLIC_PREFIX}/${thumbName}`,
    blurData: `data:image/webp;base64,${blurBuffer.toString('base64')}`,
  };
}

/** Delete previously stored upload files (best-effort). */
export async function deleteUpload(url?: string | null): Promise<void> {
  if (!url || !url.startsWith(PUBLIC_PREFIX)) return;
  const fileName = url.slice(PUBLIC_PREFIX.length + 1);
  if (!fileName || fileName.includes('..')) return;
  try {
    await unlink(path.join(UPLOAD_DIR, fileName));
  } catch {
    /* ignore missing file */
  }
}
