import { NextRequest } from 'next/server';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

// Serve uploaded/generated images from disk at request time.
// `next start` only serves files from `public/` that existed at BUILD time, so
// runtime-written images (admin uploads, seeder-generated files in the mounted
// volume) are served through this handler under /media/<file> instead. The
// `/uploads` path collides with public static serving, so /media is used.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;

  if (!file || file.includes('/') || file.includes('\\') || file.includes('..')) {
    return new Response('Not found', { status: 404 });
  }

  const ext = path.extname(file).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return new Response('Not found', { status: 404 });

  const filePath = path.join(UPLOAD_DIR, file);
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new Response('Not found', { status: 404 });
    const data = await readFile(filePath);
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(info.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
