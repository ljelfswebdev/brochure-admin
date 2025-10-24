// components/news/NewsSidebar.jsx
'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Loading from '@/components/Loading';

export default function NewsSidebar({ categories = [], basePath = '/news' }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 🕒 enforce min 500ms loader visibility
  const [showLoading, setShowLoading] = useState(false);
  useEffect(() => {
    let timeout;
    if (isPending) {
      setShowLoading(true);
    } else {
      timeout = setTimeout(() => setShowLoading(false), 500);
    }
    return () => clearTimeout(timeout);
  }, [isPending]);

  // URL → state
  const initialQ = searchParams.get('q') || '';
  const initialCats = useMemo(() => {
    const all = searchParams.getAll('cats');
    if (all.length) return new Set(all);
    const single = searchParams.get('cat');
    return single ? new Set([single]) : new Set();
  }, [searchParams]);

  const [q, setQ] = useState(initialQ);
  const [selected, setSelected] = useState(initialCats);
  const [showAll, setShowAll] = useState(false);

  // 👇 mobile categories accordion
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);

  const debounceRef = useRef(null);

  // build URL with q + repeated ?cats=
  const buildUrl = (nextQ, nextSelected) => {
    const params = new URLSearchParams();
    if (nextQ) params.set('q', nextQ);
    for (const id of Array.from(nextSelected)) params.append('cats', id);
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ''}`;
  };

  const scheduleNavigate = (nextQ, nextSelected) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const url = buildUrl(nextQ, nextSelected);
      startTransition(() => {
        router.push(url, { scroll: true });
      });
    }, 3000);
  };

  function onSearchChange(e) {
    const val = e.target.value;
    setQ(val);
    scheduleNavigate(val, selected);
  }

  function onToggleCat(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    scheduleNavigate(q, next);
  }

  // keep local state in sync when URL changes
  useEffect(() => {
    setQ(initialQ);
    setSelected(initialCats);
    // collapse mobile cats when navigating
    setMobileCatsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ, initialCats.size, pathname]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const visibleCats = showAll ? categories : categories.slice(0, 5);

  return (
    <aside className="space-y-4">
      {showLoading && (
        <div className="mb-2">
          <Loading />
        </div>
      )}

      {/* Search (always visible) */}
      <div>
        <label className="label">Search</label>
        <input
          className="input w-full"
          placeholder="Search news..."
          value={q}
          onChange={onSearchChange}
        />
        <p className="text-xs text-gray-500 mt-1">Auto-applies after 3 seconds.</p>
      </div>

      {/* Categories header + mobile toggle */}
      <div className="flex items-center justify-between md:block">
        <div className="label mb-2">Categories</div>
        <button
          type="button"
          className="button button--tertiary px-2 py-1 text-sm md:hidden"
          aria-expanded={mobileCatsOpen}
          aria-controls="news-cats"
          onClick={() => setMobileCatsOpen((o) => !o)}
        >
          {mobileCatsOpen ? 'Hide categories' : 'Show categories'}
        </button>
      </div>

      {/* Categories list:
          - hidden on mobile until toggled open
          - always shown on md+ */}
      <div
        id="news-cats"
        className={`${mobileCatsOpen ? 'block' : 'hidden'} md:block`}
      >
        <div className="space-y-2">
          {visibleCats.map((c) => {
            const id = String(c._id);
            const checked = selected.has(id);
            return (
              <label key={id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleCat(id)}
                />
                <span>{c.name}</span>
              </label>
            );
          })}
        </div>

        {categories.length > 5 && (
          <button
            type="button"
            className="button button--tertiary mt-2"
            onClick={() => setShowAll((s) => !s)}
          >
            {showAll ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </aside>
  );
}