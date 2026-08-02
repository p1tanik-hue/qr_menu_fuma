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

/**
 * Generate a premium branded placeholder image (dark + gold monogram).
 * Used by the seeder so the menu looks complete before real photos exist.
 */
export async function generatePlaceholderImage(
  name: string,
  variantHue: 'gold' | 'amber' | 'cool' = 'gold',
): Promise<ProcessedImage> {
  await ensureDir();
  const id = 'ph_' + crypto.createHash('md5').update(name).digest('hex').slice(0, 12);

  const initials = name
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const palettes = {
    gold: { a: '#141414', b: '#0A0A0A', accent: '#C9A55C' },
    amber: { a: '#1a1206', b: '#0A0A0A', accent: '#D8BE7E' },
    cool: { a: '#0d1417', b: '#0A0A0A', accent: '#B7AC94' },
  } as const;
  const pal = palettes[variantHue];

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
    <circle cx="500" cy="500" r="300" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.55"/>
    <circle cx="500" cy="500" r="250" fill="none" stroke="url(#gold)" stroke-width="1" opacity="0.30"/>
    <text x="500" y="520" font-family="Georgia, serif" font-size="220" font-weight="600"
      fill="url(#gold)" text-anchor="middle" dominant-baseline="middle">${initials || 'F'}</text>
    <text x="500" y="720" font-family="Georgia, serif" font-size="34" letter-spacing="14"
      fill="#C9A55C" opacity="0.8" text-anchor="middle">FUMA LOUNGE</text>
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
