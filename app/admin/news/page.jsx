'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Paginator from '@/components/pagination/Paginator';

export default function NewsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);

  // categories state
  const [cats, setCats] = useState([]);
  const [catName, setCatName] = useState('');

  // derive state from URL
  const urlQ = searchParams.get('q') || '';
  const urlPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const urlPageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10) || 10);

  // local search input state (synced with URL)
  const [q, setQ] = useState(urlQ);
  useEffect(() => setQ(urlQ), [urlQ]);

  // load function – hits admin API with page/limit/q
  async function load({ page = urlPage, limit = urlPageSize, q = urlQ } = {}) {
    setLoading(true);
    try {
      const [rPosts, rCats] = await Promise.all([
        fetch(`/api/admin/news?page=${page}&limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ''}`, { cache: 'no-store' }),
        fetch('/api/admin/categories', { cache: 'no-store' }),
      ]);

      if (!rPosts.ok) throw new Error(await rPosts.text());
      const d = await rPosts.json();
      setRows(Array.isArray(d.items) ? d.items : []);
      setMeta({ page: d.page ?? page, limit: d.limit ?? limit, total: d.total ?? 0 });

      const c = rCats.ok ? await rCats.json() : [];
      setCats(Array.isArray(c) ? c : []);
    } catch (e) {
      toast.error(e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  // initial + on URL param change
  useEffect(() => {
    load({ page: urlPage, limit: urlPageSize, q: urlQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPage, urlPageSize, urlQ, pathname]);

  // search debounce (500ms)
  const debounceRef = useRef(null);
  function onSearchChange(e) {
    const next = e.target.value;
    setQ(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set('q', next); else params.delete('q');
      params.delete('page'); // reset to 1 on new search
      startTransition(() => router.push(`${pathname}${params.toString() ? `?${params}` : ''}`));
    }, 500);
  }
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  async function delPost(id) {
    if (!confirm('Delete this post?')) return;
    const r = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
    if (!r.ok) return toast.error('Delete failed');
    toast.success('Deleted');
    load(); // reload with current URL params
  }

  async function addCat() {
    const name = catName.trim();
    if (!name) return;
    const r = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!r.ok) return toast.error('Could not save category');
    setCatName('');
    toast.success('Category saved');
    load();
  }

  async function delCat(id) {
    if (!confirm('Delete this category?')) return;
    const r = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (!r.ok) return toast.error('Delete failed');
    toast.success('Category deleted');
    load();
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">News</h2>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Search by title…"
            value={q}
            onChange={onSearchChange}
          />
          <a href="/admin/news/create" className="button button--primary">Create Post</a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts list */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Posts</h3>
            <div className="text-sm text-gray-500">
              {meta.total ? `Total: ${meta.total}` : '—'}
            </div>
          </div>

          {loading ? (
            <div>Loading…</div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2">Title</th>
                    <th className="text-left py-2">Slug</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="py-2">{r.title}</td>
                      <td className="py-2 text-gray-600">/news/{r.slug}</td>
                      <td className="py-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <a className="button button--secondary" href={`/admin/news/${r._id}`}>Edit</a>
                          <button className="button button--tertiary" onClick={() => delPost(r._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-sm text-gray-500">No posts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Paginator: reads/writes URL; server keeps honoring page/pageSize */}
              <div className="mt-4">
                <Paginator
                  total={meta.total}
                  page={meta.page}
                  pageSize={meta.limit}
                  pageSizeOptions={[10, 20, 50]}
                  // basePath defaults to current pathname; preserves q and others
                />
              </div>
            </>
          )}
        </div>

        {/* Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Categories</h3>

          <div className="grid grid-cols-1 gap-2">
            <input
              className="input"
              placeholder="Name (e.g. Company News)"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
            />
            <button className="button button--secondary" onClick={addCat}>
              Add Category
            </button>
          </div>

          <ul className="mt-3">
            {cats.map((c) => (
              <li key={c._id} className="border-t py-2 flex items-center justify-between">
                <span>
                  <strong>{c.name}</strong>{' '}
                  <code className="text-xs text-gray-500">{c.slug}</code>
                </span>
                <button
                  className="button button--tertiary"
                  onClick={() => delCat(c._id)}
                >
                  Delete
                </button>
              </li>
            ))}
            {!cats.length && (
              <li className="py-2 text-sm text-gray-500">No categories yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}