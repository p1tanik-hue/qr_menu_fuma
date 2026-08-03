'use client';

export interface FilterOption {
  id: string;
  label: string;
  emoji?: string | null;
}

export function FilterChips({
  options,
  active,
  onChange,
}: {
  options: FilterOption[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map((opt) => {
        const isActive = opt.id === active;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[0.7rem] uppercase tracking-[0.16em] transition-all duration-300 ease-premium ${
              isActive
                ? 'border-gold/70 bg-gold/10 text-gold'
                : 'border-graphite-light/40 text-sand-muted hover:border-gold/40 hover:text-sand'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
