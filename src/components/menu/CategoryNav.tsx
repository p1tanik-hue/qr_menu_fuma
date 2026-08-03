'use client';

import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';

export interface NavItem {
  slug: string;
  label: string;
  emoji?: string | null;
}

export function CategoryNav({
  items,
  onJump,
}: {
  items: NavItem[];
  onJump: (slug: string) => void;
}) {
  const [active, setActive] = useState(items[0]?.slug ?? '');
  const navRef = useRef<HTMLDivElement>(null);

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(`cat-${i.slug}`))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActive(visible.target.id.replace('cat-', ''));
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  // Bring the active chip into view within the nav ONLY if it is off-edge —
  // scroll just the chip container horizontally (never the page), aligning to
  // the nearest edge with padding. Never yanks an already-visible chip
  // (which previously hid the first chip behind the logo).
  useEffect(() => {
    const container = navRef.current;
    if (!container) return;
    const chip = container.querySelector<HTMLElement>(`[data-slug="${active}"]`);
    if (!chip) return;
    const c = container.getBoundingClientRect();
    const r = chip.getBoundingClientRect();
    const pad = 16;
    if (r.left < c.left + pad) {
      container.scrollBy({ left: r.left - c.left - pad, behavior: 'smooth' });
    } else if (r.right > c.right - pad) {
      container.scrollBy({ left: r.right - c.right + pad, behavior: 'smooth' });
    }
  }, [active]);

  return (
    <div className="sticky top-0 z-40 border-b border-gold/10 glass">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
        <button
          onClick={() => onJump(items[0]?.slug ?? '')}
          aria-label="Наверх"
          className="shrink-0"
        >
          <Logo subtitle={false} size="sm" />
        </button>
        <div
          ref={navRef}
          className="flex flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const isActive = item.slug === active;
            return (
              <button
                key={item.slug}
                data-slug={item.slug}
                onClick={() => onJump(item.slug)}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ease-premium ${
                  isActive
                    ? 'bg-gold-sheen text-ink'
                    : 'text-sand-muted hover:text-sand'
                }`}
              >
                {item.emoji ? `${item.emoji} ` : ''}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
