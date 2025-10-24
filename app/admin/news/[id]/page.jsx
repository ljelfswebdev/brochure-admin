'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Blocks from '@/components/admin/blocks/PageBlocks';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';

export default function EditNews() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [listingImage, setListingImage] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [cats, setCats] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rPost, rCats] = await Promise.all([
          fetch(`/api/admin/news/${id}`, { cache: 'no-store' }),
          fetch('/api/admin/categories', { cache: 'no-store' }),
        ]);
        if (!rPost.ok) throw new Error('Failed to load post');
        const p = await rPost.json();
        const c = await rCats.json();
        if (cancelled) return;
        setTitle(p.title || '');
        setSlug(p.slug || '');
        setListingImage(p.listingImage || '');
        setBlocks(Array.isArray(p.blocks) ? p.blocks : []);
        setCategories(Array.isArray(p.categories) ? p.categories.map(String) : []);
        setCats(Array.isArray(c) ? c : []);
      } catch (e) {
        toast.error(e.message || 'Error loading data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  function toggleCat(id) {
    setCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function save() {
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/news/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, slug, listingImage, blocks, categories }),
      });
      if (!r.ok) throw new Error(await r.text());
      toast.success('Post updated');
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
      <a href="/admin/news" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">← Back to News</a>

      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Post</h3>
          <div className="flex gap-2">
            <a className="button button--secondary" href={`/news/${slug}`} target="_blank" rel="noreferrer">View</a>
            <button className="button button--tertiary" onClick={remove}>Delete</button>
          </div>
        </div>

        <label className="label mt-3">Title</label>
        <input className="input w-full" value={title} onChange={e=>setTitle(e.target.value)} />

        <label className="label mt-2">Slug</label>
        <input className="input w-full" value={slug} onChange={e=>setSlug(e.target.value.replace(/^\//,''))} />

        <label className="label mt-2">Listing Image</label>
        <CloudinaryUpload value={listingImage} onChange={setListingImage} />

        <div className="mt-3">
          <label className="label">Categories</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {cats.map(c => (
              <label key={c._id} className="flex items-center gap-2 border rounded-xl px-2 py-1">
                <input
                  type="checkbox"
                  checked={categories.includes(String(c._id))}
                  onChange={()=>toggleCat(String(c._id))}
                />
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
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}