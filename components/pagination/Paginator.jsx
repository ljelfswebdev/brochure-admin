'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Select from 'react-select';

/**
 * Generic paginator with react-select controls.
 *
 * Props:
 * - total: number (total results)
 * - page: number (current page, 1-based)
 * - pageSize: number
 * - pageSizeOptions?: number[] (defaults [10, 20, 50])
 * - paramNames?: { page?: string; pageSize?: string } (defaults { page:'page', pageSize:'pageSize' })
 * - basePath?: string (defaults to current pathname)
 * - className?: string
 */
export default function Paginator({
  total,
  page,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  paramNames = { page: 'page', pageSize: 'pageSize' },
  basePath,
  className = '',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil((+total || 0) / (+pageSize || 1)));
  const safePage = Math.min(Math.max(1, +page || 1), totalPages);

  const currentPath = basePath || pathname;

  const pageOptions = useMemo(() => {
    // Keep it light if many pages; cap at 200 visual options
    const cap = Math.min(totalPages, 200);
    return Array.from({ length: cap }, (_, i) => ({
      value: i + 1,
      label: `Page ${i + 1}`,
    }));
  }, [totalPages]);

  const pageSizeSelectOptions = useMemo(
    () => pageSizeOptions.map(n => ({ value: n, label: `${n} / page` })),
    [pageSizeOptions]
  );

  function buildUrl(next) {
    const params = new URLSearchParams(searchParams?.toString() || '');
    // normalize keys
    const pageKey = paramNames.page || 'page';
    const sizeKey = paramNames.pageSize || 'pageSize';

    if (next.page != null) {
      if (+next.page <= 1) params.delete(pageKey);
      else params.set(pageKey, String(next.page));
    }
    if (next.pageSize != null) {
      // when pageSize changes, reset page to 1
      if (+next.pageSize === pageSizeOptions[0]) {
        params.delete(sizeKey);
      } else {
        params.set(sizeKey, String(next.pageSize));
      }
      params.delete(pageKey);
    }
    const qs = params.toString();
    return `${currentPath}${qs ? `?${qs}` : ''}`;
  }

  function goToPage(p) {
    router.push(buildUrl({ page: p }));
  }
  function changePageSize(size) {
    router.push(buildUrl({ pageSize: size }));
  }

  const summaryStart = (safePage - 1) * pageSize + 1;
  const summaryEnd = Math.min(total, safePage * pageSize);

  return (
    <div className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${className}`}>
      {/* Left: summary */}
      <div className="text-sm text-gray-600">
        {total > 0 ? `Showing ${summaryStart}–${summaryEnd} of ${total}` : 'No results'}
      </div>

      {/* Right: controls */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        {/* Page size */}
        <div className="min-w-[180px]">
          <Select
            instanceId="page-size"
            options={pageSizeSelectOptions}
            value={pageSizeSelectOptions.find(o => o.value === +pageSize)}
            onChange={(opt) => changePageSize(opt.value)}
            menuPlacement="auto"
            classNamePrefix="rs"
          />
        </div>

        {/* Page select */}
        <div className="min-w-[180px]">
          <Select
            instanceId="page-number"
            options={pageOptions}
            value={pageOptions.find(o => o.value === safePage)}
            onChange={(opt) => goToPage(opt.value)}
            menuPlacement="auto"
            classNamePrefix="rs"
            isSearchable
          />
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="button button--tertiary"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage <= 1}
          >
            ← Prev
          </button>
          <button
            type="button"
            className="button button--tertiary"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= totalPages}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}