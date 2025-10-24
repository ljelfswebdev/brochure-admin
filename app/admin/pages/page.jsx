'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function PagesList() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);

  async function load(p = 1) {
    setLoading(true);
    const r = await fetch(`/api/admin/pages?page=${p}&limit=10`, { cache: 'no-store' });
    const d = await r.json();
    setRows(d.items || []);
    setMeta({ page: d.page, limit: d.limit, total: d.total });
    setLoading(false);
  }

  useEffect(() => { load(1); }, []);

  async function del(id) {
    if (!confirm('Delete this page?')) return;
    const r = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
    if (!r.ok) return toast.error('Delete failed');
    toast.success('Deleted');
    load(meta.page);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pages</h2>
        <a href="/admin/pages/create" className="button button--primary">Create Page</a>
      </div>

      <div className="card">
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
                  <td>/{r.slug}</td>
                  <td className="text-right flex gap-2 justify-end">
                    <a className="button button--secondary" href={`/admin/pages/${r._id}`}>Edit</a>
                    <button className="button button--tertiary" onClick={() => del(r._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={3} className="py-6 text-center text-sm text-gray-500">No pages yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}