'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Blocks from '@/components/admin/blocks/PageBlocks';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';

export default function CreateNews() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [listingImage, setListingImage] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [cats, setCats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/admin/categories', { cache: 'no-store' });
      setCats(await r.json());
    })();
  }, []);

  function toggleCat(id) {
    setCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function save() {
    setSaving(true);
    try {
      const r = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, slug, listingImage, blocks, categories }),
      });
      if (!r.ok) throw new Error(await r.text());
      toast.success('Post created');
      window.location.href = '/admin/news';
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <a href="/admin/news" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">← Back to News</a>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Create Post</h3>

        <label className="label">Title</label>
        <input className="input w-full" value={title} onChange={e=>setTitle(e.target.value)} />

        <label className="label mt-2">Slug (optional)</label>
        <input className="input w-full" value={slug} onChange={e=>setSlug(e.target.value.replace(/^\//,''))} />

        <label className="label mt-2">Listing Image</label>
        <CloudinaryUpload value={listingImage} onChange={setListingImage} />

        <div className="mt-3">
          <label className="label">Categories</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {cats.map(c => (
              <label key={c._id} className="flex items-center gap-2 border rounded-xl px-2 py-1">
                <input type="checkbox" checked={categories.includes(c._id)} onChange={()=>toggleCat(c._id)} />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Blocks value={blocks} onChange={setBlocks} />
        </div>

        <div className="flex justify-end mt-4">
          <button className="button button--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  );
}