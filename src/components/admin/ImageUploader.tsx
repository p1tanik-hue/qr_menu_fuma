'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/admin-client';

const FRAME = 260;

interface UploadResult {
  imageUrl: string;
  thumbUrl: string;
  blurData: string;
}

export function ImageUploader({
  value,
  onUploaded,
  onRemove,
}: {
  value?: string | null;
  onUploaded: (result: UploadResult) => void;
  onRemove?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [natSize, setNatSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const coverScale = natSize.w
    ? Math.max(FRAME / natSize.w, FRAME / natSize.h)
    : 1;
  const scale = coverScale * zoom;
  const dispW = natSize.w * scale;
  const dispH = natSize.h * scale;

  const clamp = useCallback(
    (o: { x: number; y: number }) => ({
      x: Math.min(0, Math.max(FRAME - dispW, o.x)),
      y: Math.min(0, Math.max(FRAME - dispH, o.y)),
    }),
    [dispW, dispH],
  );

  function loadFile(f: File) {
    if (!f.type.startsWith('image/')) {
      setError('Выберите изображение');
      return;
    }
    setError('');
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    const img = new window.Image();
    img.onload = () => {
      setNatSize({ w: img.naturalWidth, h: img.naturalHeight });
      const cs = Math.max(FRAME / img.naturalWidth, FRAME / img.naturalHeight);
      const dw = img.naturalWidth * cs;
      const dh = img.naturalHeight * cs;
      setOffset({ x: (FRAME - dw) / 2, y: (FRAME - dh) / 2 });
    };
    img.src = url;
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset(clamp({ x: dragState.current.ox + dx, y: dragState.current.oy + dy }));
  }
  function onPointerUp() {
    dragState.current = null;
  }

  function onZoom(z: number) {
    setZoom(z);
    // Re-clamp after scale change on next tick via state; approximate now.
    const cs = coverScale;
    const dw = natSize.w * cs * z;
    const dh = natSize.h * cs * z;
    setOffset((o) => ({
      x: Math.min(0, Math.max(FRAME - dw, o.x)),
      y: Math.min(0, Math.max(FRAME - dh, o.y)),
    }));
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (natSize.w) {
        const side = FRAME / scale;
        fd.append('cropLeft', String(Math.max(0, -offset.x / scale)));
        fd.append('cropTop', String(Math.max(0, -offset.y / scale)));
        fd.append('cropWidth', String(Math.min(side, natSize.w)));
        fd.append('cropHeight', String(Math.min(side, natSize.h)));
      }
      const result = await api<UploadResult>('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });
      onUploaded(result);
      // reset editor
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {!file && (
        <>
          {value ? (
            <div className="flex items-center gap-3">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-gold/20">
                <Image src={value} alt="Фото" fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer rounded-lg border border-gold/30 px-3 py-1.5 text-xs text-gold hover:bg-gold/10">
                  Заменить фото
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
                  />
                </label>
                {onRemove && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    Удалить фото
                  </button>
                )}
              </div>
            </div>
          ) : (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) loadFile(f);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center text-sm transition-colors ${
                dragOver
                  ? 'border-gold bg-gold/5 text-gold'
                  : 'border-graphite-light/50 text-sand-muted hover:border-gold/40'
              }`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" />
              </svg>
              Перетащите фото сюда или нажмите
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
              />
            </label>
          )}
        </>
      )}

      {file && preview && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-sand-muted">
            Перетащите и масштабируйте — область станет квадратным фото
          </p>
          <div
            className="relative overflow-hidden rounded-xl border border-gold/30 bg-ink-900 touch-none"
            style={{ width: FRAME, height: FRAME }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="crop"
              draggable={false}
              style={{
                position: 'absolute',
                left: offset.x,
                top: offset.y,
                width: dispW,
                height: dispH,
                maxWidth: 'none',
                userSelect: 'none',
              }}
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/40" />
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => onZoom(Number(e.target.value))}
            className="w-full max-w-[260px] accent-gold"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={upload}
              disabled={busy}
              className="btn-gold rounded-lg px-4 py-2 text-sm disabled:opacity-60"
            >
              {busy ? 'Загрузка…' : 'Сохранить фото'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (preview) URL.revokeObjectURL(preview);
                setFile(null);
                setPreview(null);
              }}
              className="rounded-lg border border-graphite-light/50 px-4 py-2 text-sm text-sand-muted hover:text-sand"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
