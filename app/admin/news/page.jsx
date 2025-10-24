'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function NewsList() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);

  // categories state (restored)
  const [cats, setCats] = useState([]);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');

  async function load(p = 1) {
    setLoading(true);
    const [rPosts, rCats] = await Promise.all([
      fetch(`/api/admin/news?page=${p}&limit=10`, { cache: 'no-store' }),
      fetch('/api/admin/categories', { cache: 'no-store' }),
    ]);
    const d = await rPosts.json();
    const c = await rCats.json();
    setRows(d.items || []);
    setMeta({ page: d.page, limit: d.limit, total: d.total });
    setCats(Array.isArray(c) ? c : []);
    setLoading(false);
  }

  useEffect(() => { load(1); }, []);

  async function delPost(id) {
    if (!confirm('Delete this post?')) return;
    const r = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
    if (!r.ok) return toast.error('Delete failed');
    toast.success('Deleted');
    load(meta.page);
  }

  async function addCat() {
    if (!catName || !catSlug) return;
    const r = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: catName, slug: catSlug }),
    });
    if (!r.ok) return toast.error('Could not save category');
    setCatName(''); setCatSlug('');
    toast.success('Category saved');
    load(meta.page);
  }

  async function delCat(id) {
    if (!confirm('Delete this category?')) return;
    const r = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (!r.ok) return toast.error('Delete failed');
    toast.success('Category deleted');
    load(meta.page);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">News</h2>
        <a href="/admin/news/create" className="button button--primary">Create Post</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts list */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Posts</h3>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Title</th>
                  <th className="text-left">Slug</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-t">
                    <td>{r.title}</td>
                    <td>/news/{r.slug}</td>
                    <td className="text-right flex gap-2 justify-end">
                      <a className="button button--secondary" href={`/admin/news/${r._id}`}>Edit</a>
                      <button className="button button--tertiary" onClick={() => delPost(r._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={3} className="py-6 text-center text-sm text-gray-500">No posts yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

<div className="card">
  <h3 className="text-lg font-semibold mb-2">Categories</h3>

  <div className="grid grid-cols-1 gap-2">
    <input
      className="input"
      placeholder="Name (e.g. Company News)"
      value={catName}
      onChange={(e)=>setCatName(e.target.value)}
    />
    <button
      className="button button--secondary"
      onClick={async ()=>{
        if (!catName.trim()) return;
        const r = await fetch('/api/admin/categories', {
          method:'POST',
          headers:{'content-type':'application/json'},
          body: JSON.stringify({ name: catName.trim() })
        });
        if (!r.ok) return toast.error('Could not save category');
        setCatName('');
        toast.success('Category saved');
        load(meta.page);
      }}
    >
      Add Category
    </button>
  </div>

  <ul className="mt-3">
    {cats.map(c => (
      <li key={c._id} className="border-t py-2 flex items-center justify-between">
        <span>
          <strong>{c.name}</strong>{' '}
          <code className="text-xs text-gray-500">{c.slug}</code>
        </span>
        <button
          className="button button--tertiary"
          onClick={async ()=>{
            if (!confirm('Delete this category?')) return;
            const r = await fetch(`/api/admin/categories/${c._id}`, { method:'DELETE' });
            if (!r.ok) return toast.error('Delete failed');
            toast.success('Category deleted');
            load(meta.page);
          }}
        >
          Delete
        </button>
      </li>
    ))}
    {!cats.length && <li className="py-2 text-sm text-gray-500">No categories yet.</li>}
  </ul>
</div>
      </div>
    </div>
  );
}