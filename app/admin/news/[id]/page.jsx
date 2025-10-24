'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';
import PageBlocks from '@/components/admin/blocks/PageBlocks';

export default function EditNews() {
  const { id } = useParams();
  const router = useRouter();

  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
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
    let cancel = false;
    (async () => {
      try {
        const [rDoc, rCats] = await Promise.all([
          fetch(`/api/admin/news/${id}`, { cache: 'no-store' }),
          fetch('/api/admin/categories', { cache: 'no-store' }),
        ]);
        if (!rDoc.ok) throw new Error('Failed to load');
        const d = await rDoc.json();
        const c = rCats.ok ? await rCats.json() : [];
        if (cancel) return;
        setCats(Array.isArray(c) ? c : []);
        setTitle(d.title || '');
        setSlug(d.slug || '');
        setExcerpt(d.excerpt || '');
        setBody(d.body || '');
        setListingImage(d.listingImage || '');
        setStatus(d.status || 'published');
        setCategoryIds(Array.isArray(d.categories) ? d.categories.map(String) : []);
        setBlocks(Array.isArray(d.blocks) ? d.blocks : []);
      } catch (e) {
        toast.error(e.message || 'Load failed');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  function toggleCat(cid) {
    setCategoryIds(prev => prev.includes(cid) ? prev.filter(x => x !== cid) : [...prev, cid]);
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
        blocks, // ✅ save blocks
      };
      const r = await fetch(`/api/admin/news/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      toast.success('Saved');
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('Delete this post?')) return;
    const r = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
    if (!r.ok) return toast.error('Delete failed');
    toast.success('Deleted');
    router.push('/admin/news');
  }

  if (loading) return <div className="card">Loading…</div>;

  return (
    <div className="space-y-6">
      <a href="/admin/news" className="text-sm text-blue-600 hover:underline">← Back to News</a>
      <div className="card">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Edit News</h1>
          <div className="flex gap-2">
            <a className="button button--secondary" href={`/news/${slug}`} target="_blank">View</a>
            <button className="button button--tertiary" onClick={remove}>Delete</button>
          </div>
        </div>

        <label className="label mt-3">Title</label>
        <input className="input w-full" value={title} onChange={e=>setTitle(e.target.value)} />

        <label className="label mt-2">Slug</label>
        <input className="input w-full" value={slug} onChange={e=>setSlug(e.target.value)} />

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
                <input
                  type="checkbox"
                  checked={categoryIds.includes(c._id)}
                  onChange={() => toggleCat(c._id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        <label className="label mt-3">Body (optional)</label>
        <textarea className="input w-full" value={body} onChange={e=>setBody(e.target.value)} />

        <div className="mt-4">
          <div className="label mb-2">Blocks</div>
          <PageBlocks value={blocks} onChange={setBlocks} />
        </div>

        <div className="flex justify-end mt-4">
          <button className="button button--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}