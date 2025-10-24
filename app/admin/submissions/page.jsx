// app/admin/submissions/page.jsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SubmissionsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyFilter, setKeyFilter] = useState('');

  async function load(k = '') {
    setLoading(true);
    const q = k ? `?key=${encodeURIComponent(k)}` : '';
    const r = await fetch(`/api/admin/submissions${q}`, { cache: 'no-store' });
    const d = await r.json();
    setItems(Array.isArray(d.items) ? d.items : []);
    setLoading(false);
  }

  useEffect(() => { load(''); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Form Submissions</h2>
        <div className="flex items-center gap-2">
          <input
            className="input"
            placeholder="Filter by key (e.g. contact)"
            value={keyFilter}
            onChange={(e)=>setKeyFilter(e.target.value)}
          />
          <button className="button button--secondary" onClick={()=>load(keyFilter)}>Apply</button>
          <button className="button button--tertiary" onClick={()=>{ setKeyFilter(''); load(''); }}>Clear</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div>Loading…</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Form Key</th>
                <th className="text-left">Name</th>
                <th className="text-left">Email</th>
                <th className="text-left">Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(s => (
                <tr key={s._id} className="border-t">
                  <td>{s.key}</td>
                  <td>{s.name || '—'}</td>
                  <td>{s.email || '—'}</td>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="text-right">
                    <Link className="button button--secondary" href={`/admin/submissions/${s._id}`}>View</Link>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr><td colSpan={5} className="py-6 text-center text-sm text-gray-500">No submissions yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}