'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';
import PageBlocks from '@/components/admin/blocks/PageBlocks';

export default function CreateNews() {
  const router = useRouter();
  const [cats, setCats] = useState([]);
  const [saving, setSaving] = useState(false);

  // form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [listingImage, setListingImage] = useState('');
  const [status, setStatus] = useState('published');
  const [categoryIds, setCategoryIds] = useState([]);
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/admin/categories', { cache: 'no-store' });
      setCats(r.ok ? await r.json() : []);
    })();
  }, []);

  function toggleCat(id) {
    setCategoryIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        title,
        slug: slug.replace(/^\//,''),
        excerpt,
        body,
        listingImage,
        status,
        categories: categoryIds,
        blocks, // ✅ send builder blocks
      };
      const r = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      const created = await r.json();
      toast.success('Post created');
      router.push(`/admin/news/${created._id}`);
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <a href="/admin/news" className="text-sm text-blue-600 hover:underline">← Back to News</a>
      <div className="card">
        <h1 className="text-lg font-semibold mb-3">Create News</h1>

        <label className="label">Title</label>
        <input className="input w-full" value={title} onChange={e=>setTitle(e.target.value)} />

        <label className="label mt-2">Slug</label>
        <input className="input w-full" value={slug} onChange={e=>setSlug(e.target.value)} placeholder="auto if blank" />

        <label className="label mt-2">Excerpt</label>
        <textarea className="input w-full" value={excerpt} onChange={e=>setExcerpt(e.target.value)} />

        <label className="label mt-2">Listing Image</label>
        <CloudinaryUpload value={listingImage} onChange={setListingImage} />

        <label className="label mt-2">Status</label>
        <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <div className="mt-2">
          <div className="label">Categories</div>
          <div className="grid grid-cols-2 gap-2">
            {cats.map(c => (
              <label key={c._id} className="flex items-center gap-2 text-sm border rounded-md px-2 py-1">
                <input type="checkbox" checked={categoryIds.includes(c._id)} onChange={()=>toggleCat(c._id)} />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        <label className="label mt-3">Body (optional, legacy)</label>
        <textarea className="input w-full" value={body} onChange={e=>setBody(e.target.value)} />

        <div className="mt-4">
          <div className="label mb-2">Blocks</div>
          <PageBlocks value={blocks} onChange={setBlocks} />
        </div>

        <div className="flex justify-end mt-4">
          <button className="button button--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}