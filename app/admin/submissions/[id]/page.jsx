// app/admin/submissions/[id]/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function SubmissionDetail() {
  const { id } = useParams();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetch(`/api/admin/submissions/${id}`, { cache: 'no-store' });
      const d = await r.json();
      if (!cancelled) { setSub(d); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="card">Loading…</div>;
  if (!sub) return <div className="card">Not found</div>;

  return (
    <div className="space-y-6">
      <a href="/admin/submissions" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">← Back to Submissions</a>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Submission</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><div className="text-sm text-gray-500">Form Key</div><div className="font-medium">{sub.key}</div></div>
          <div><div className="text-sm text-gray-500">Date</div><div className="font-medium">{new Date(sub.createdAt).toLocaleString()}</div></div>
          <div><div className="text-sm text-gray-500">Name</div><div className="font-medium">{sub.name || '—'}</div></div>
          <div><div className="text-sm text-gray-500">Email</div><div className="font-medium">{sub.email || '—'}</div></div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-1">Data</div>
          <div className="border rounded-xl p-3 bg-white">
            {Object.entries(sub.data || {}).map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2 py-1 border-b last:border-b-0">
                <div className="font-medium col-span-1">{k}</div>
                <div className="col-span-2">{String(v)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}