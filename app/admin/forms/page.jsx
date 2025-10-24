'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function FormsList(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load(){
    setLoading(true);
    const r = await fetch('/api/admin/forms', { cache: 'no-store' });
    const d = await r.json();
    setRows(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  useEffect(()=>{ load(); }, []);

  async function del(id){
    if (!confirm('Delete this form?')) return;
    const r = await fetch(`/api/admin/forms/${id}`, { method:'DELETE' });
    if (!r.ok) return toast.error('Delete failed');
    toast.success('Deleted');
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Forms</h2>
        <a href="/admin/forms/create" className="button button--primary">Create Form</a>
      </div>

      <div className="card">
        {loading ? (
          <div>Loading…</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Key</th>
                <th className="text-left">Rows</th>
                <th className="text-left">Fields (total)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(f => {
                const fieldCount = (f.rows || []).reduce((n, r) => n + (Array.isArray(r.fields) ? r.fields.length : 0), 0);
                return (
                  <tr key={f._id} className="border-t">
                    <td>{f.key}</td>
                    <td>{(f.rows || []).length}</td>
                    <td>{fieldCount}</td>
                    <td className="text-right flex gap-2 justify-end">
                      <a className="button button--secondary" href={`/admin/forms/${f._id}`}>Edit</a>
                      <button className="button button--tertiary" onClick={()=>del(f._id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr><td colSpan={4} className="py-6 text-center text-sm text-gray-500">No forms yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}