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
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map((opt) => {
        const isActive = opt.id === active;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ease-premium ${
              isActive
                ? 'border-gold bg-gold/15 text-gold shadow-gold'
                : 'border-graphite-light/50 text-sand-muted hover:border-gold/40 hover:text-sand'
            }`}
          >
            {opt.emoji ? `${opt.emoji} ` : ''}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
