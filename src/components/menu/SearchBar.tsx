'use client';

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold/70">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </span>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Поиск по меню — например, «кола»"
        aria-label="Поиск по меню"
        className="w-full rounded-full border border-gold/20 bg-ink-800/70 py-3 pl-11 pr-11 text-sm text-sand placeholder:text-sand-muted/70 outline-none transition-colors duration-300 focus:border-gold/60"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Очистить поиск"
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-sand-muted transition-colors hover:text-gold"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}
