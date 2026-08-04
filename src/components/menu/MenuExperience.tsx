'use client';

import { Fragment, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CategoryDTO, ProductDTO } from '@/lib/types';
import { normalizeSearch } from '@/lib/utils';
import { Logo } from './Logo';
import { CategoryNav, type NavItem } from './CategoryNav';
import { SearchBar } from './SearchBar';
import { FilterChips, type FilterOption } from './FilterChips';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { SectionDivider } from './SectionDivider';

interface FlatProduct {
  product: ProductDTO;
  categoryName: string;
  haystack: string;
}

export function MenuExperience({ categories }: { categories: CategoryDTO[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<ProductDTO | null>(null);

  const subcategories = useMemo(
    () => categories.flatMap((c) => c.children),
    [categories],
  );

  // Emoji intentionally omitted for a stricter, more premium look.
  const navItems: NavItem[] = useMemo(
    () =>
      categories.map((c) => ({
        slug: c.slug,
        label: c.name,
      })),
    [categories],
  );

  const filterOptions: FilterOption[] = useMemo(
    () => [
      { id: 'all', label: 'Всё' },
      ...subcategories.map((s) => ({
        id: s.id,
        label: s.name,
      })),
    ],
    [subcategories],
  );

  const flatProducts: FlatProduct[] = useMemo(() => {
    const list: FlatProduct[] = [];
    for (const top of categories) {
      const groups = top.children.length ? top.children : [top];
      for (const g of groups) {
        for (const p of g.products) {
          list.push({
            product: p,
            categoryName: g.name,
            haystack: normalizeSearch(
              [p.name, p.description ?? '', g.name, top.name].join(' '),
            ),
          });
        }
      }
    }
    return list;
  }, [categories]);

  const searchResults = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return [];
    return flatProducts.filter((f) => f.haystack.includes(q));
  }, [flatProducts, query]);

  const openProduct = useCallback((p: ProductDTO) => setSelected(p), []);
  const closeProduct = useCallback(() => setSelected(null), []);

  const handleJump = useCallback((slug: string) => {
    setQuery('');
    setFilter('all');
    requestAnimationFrame(() => {
      document.getElementById(`cat-${slug}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, []);

  const isSearching = query.trim().length > 0;

  return (
    <main className="min-h-dvh pb-24">
      {/* Hero */}
      <header className="relative flex flex-col items-center px-4 pt-12 pb-6 text-center sm:pt-16">
        {/* CSS entrance (not Framer) — animates from the first paint, so no
            SSR→hydration flash/flicker. */}
        <div className="animate-fade-up">
          <Logo size="lg" />
          <p className="mx-auto mt-5 max-w-md text-sm font-light leading-relaxed tracking-wide text-sand-muted">
            Премиальная кальянная. Авторский чай, кофе и натуральные лимонады.
          </p>
          <div className="gold-divider mx-auto mt-6 w-40" />
        </div>
      </header>

      <CategoryNav items={navItems} onJump={handleJump} />

      <div className="mx-auto max-w-5xl px-4">
        {/* Controls */}
        <div className="sticky-controls flex flex-col gap-3 py-5">
          <SearchBar value={query} onChange={setQuery} />
          {!isSearching && (
            <FilterChips
              options={filterOptions}
              active={filter}
              onChange={setFilter}
            />
          )}
        </div>

        {/* Content — initial={false} so nothing fades in on first load
            (prevents the SSR→hydration flicker); animates only on switches. */}
        <AnimatePresence mode="wait" initial={false}>
          {isSearching ? (
            <motion.section
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="mb-4 font-display text-xl text-sand">
                Результаты поиска
                <span className="ml-2 text-sm text-sand-muted">
                  {searchResults.length}
                </span>
              </h2>
              {searchResults.length > 0 ? (
                <ProductGrid
                  products={searchResults.map((f) => f.product)}
                  onOpen={openProduct}
                />
              ) : (
                <EmptyState text={`Ничего не найдено по запросу «${query}»`} />
              )}
            </motion.section>
          ) : (
            <motion.div
              key={`browse-${filter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-12"
            >
              {categories
                .map((top) => {
                  const groups = top.children.length ? top.children : [top];
                  const visibleGroups =
                    filter === 'all'
                      ? groups
                      : groups.filter((g) => g.id === filter);
                  return { top, visibleGroups };
                })
                .filter(({ visibleGroups }) => visibleGroups.length > 0)
                .map(({ top, visibleGroups }, ti) => (
                  <Fragment key={top.id}>
                    {ti > 0 && <SectionDivider className="my-1" />}
                    <section
                      id={`cat-${top.slug}`}
                      data-cat-section
                      className="scroll-mt-28"
                    >
                      <div className="mb-6 flex items-center gap-3">
                        <h2 className="font-display text-2xl font-semibold text-sand sm:text-3xl">
                          {top.name}
                        </h2>
                        <div className="gold-divider flex-1" />
                      </div>

                      <div className="flex flex-col gap-8">
                        {visibleGroups.map((group, gi) => (
                          <Fragment key={group.id}>
                            {gi > 0 && (
                              <SectionDivider size="sm" className="opacity-80" />
                            )}
                            <div>
                              {top.children.length > 0 && (
                                <h3 className="mb-4 text-center text-xs font-medium uppercase tracking-[0.35em] text-gold/80">
                                  {group.name}
                                </h3>
                              )}
                              {group.products.length > 0 ? (
                                <ProductGrid
                                  products={group.products}
                                  onOpen={openProduct}
                                />
                              ) : (
                                <p className="text-sm text-sand-muted">
                                  Скоро появится.
                                </p>
                              )}
                            </div>
                          </Fragment>
                        ))}
                      </div>
                    </section>
                  </Fragment>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-16 border-t border-gold/10 px-4 py-8 text-center">
        <Logo subtitle size="sm" className="opacity-80" />
        <p className="mt-4 text-xs text-sand-muted">
          © {new Date().getFullYear()} FUMA LOUNGE. Все права защищены.
        </p>
      </footer>

      <ProductModal product={selected} onClose={closeProduct} />
    </main>
  );
}

function ProductGrid({
  products,
  onOpen,
}: {
  products: ProductDTO[];
  onOpen: (p: ProductDTO) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} onOpen={onOpen} index={i} />
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="font-display text-4xl gold-text">F</span>
      <p className="text-sm text-sand-muted">{text}</p>
    </div>
  );
}
