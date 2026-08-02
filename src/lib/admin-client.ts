'use client';

/** Thin fetch wrapper for admin API calls. Throws on non-OK responses. */
export async function api<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => ({ ok: false, error: 'Ошибка сети' }));
  if (!res.ok || !json.ok) {
    throw new Error(json.error ?? `Ошибка ${res.status}`);
  }
  return json.data as T;
}
