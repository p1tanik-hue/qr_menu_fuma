import { NextRequest } from 'next/server';
import { guard, ok, fail } from '@/lib/api';
import { processProductImage, type CropRegion } from '@/lib/images';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

export async function POST(req: NextRequest) {
  const session = await guard();
  if (session instanceof Response) return session;

  const form = await req.formData().catch(() => null);
  if (!form) return fail('Некорректная форма', 400);

  const file = form.get('file');
  if (!(file instanceof File)) return fail('Файл не найден', 400);
  if (file.size > MAX_BYTES) return fail('Файл слишком большой (макс. 12 МБ)', 413);
  if (file.type && !ALLOWED.includes(file.type)) {
    return fail('Неподдерживаемый формат изображения', 415);
  }

  // Optional crop region (natural pixels).
  let crop: CropRegion | undefined;
  const cw = form.get('cropWidth');
  if (cw != null) {
    crop = {
      left: Number(form.get('cropLeft') ?? 0),
      top: Number(form.get('cropTop') ?? 0),
      width: Number(cw),
      height: Number(form.get('cropHeight') ?? cw),
    };
    if (
      !Number.isFinite(crop.width) ||
      !Number.isFinite(crop.height) ||
      crop.width < 1 ||
      crop.height < 1
    ) {
      crop = undefined;
    }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const processed = await processProductImage(buffer, { crop });
    return ok(processed);
  } catch (e) {
    console.error('[upload] failed', e);
    return fail('Не удалось обработать изображение', 500);
  }
}
