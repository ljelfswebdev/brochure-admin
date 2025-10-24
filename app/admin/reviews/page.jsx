'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ReviewsAdmin(){
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  async function load(){
    const r = await fetch('/api/admin/reviews',{cache:'no-store'});
    setItems(await r.json());
  }
  useEffect(()=>{ load(); }, []);

  async function add(){
    const r = await fetch('/api/admin/reviews',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title, text})});
    if (!r.ok) return toast.error('Save failed');
    toast.success('Saved'); setTitle(''); setText(''); load();
  }
  async function del(id){
    if(!confirm('Delete?')) return;
    await fetch(`/api/admin/reviews/${id}`,{method:'DELETE'});
    load();
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Add Review</h3>
        <label className="label">Title</label>
        <input className="input w-full" value={title} onChange={e=>setTitle(e.target.value)} />
        <label className="label mt-2">Text</label>
        <textarea className="input w-full" rows={4} value={text} onChange={e=>setText(e.target.value)} />
        <div className="flex justify-end mt-3"><button className="button button--primary" onClick={add}>Save</button></div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Reviews</h3>
        <ul>
          {items.map(r => (
            <li key={r._id} className="border-t py-2">
              <strong>{r.title}</strong>
              <div className="text-sm">{r.text}</div>
              <button className="button button--tertiary mt-2" onClick={()=>del(r._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
