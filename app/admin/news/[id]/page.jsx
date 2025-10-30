// app/admin/news/[id]/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';
import PageBlocks from '@/components/admin/blocks/PageBlocks';
import RichTextEditor from '@/components/admin/RichTextEditor';

// normalize potential editor outputs (string | {html}|{value}|unknown) -> string
function toHtmlString(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    if (typeof v.html === 'string') return v.html;
    if (typeof v.value === 'string') return v.value;
  }
  return String(v);
}

export default function EditNews() {
  const { id } = useParams();
  const router = useRouter();

  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');    // HTML
  const [body, setBody] = useState('');          // HTML
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
        setExcerpt(d.excerpt || '');          // may already be HTML
        setBody(d.body || '');                // may already be HTML
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
        excerpt: toHtmlString(excerpt),
        body: toHtmlString(body),
        listingImage,
        status,
        categories: categoryIds,
        blocks, // blocks already handled by PageBlocks
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
            <a className="button button--secondary" href={`/news/${slug}`} target="_blank" rel="noreferrer">View</a>
            <button className="button button--tertiary" onClick={remove}>Delete</button>
          </div>
        </div>

        <label className="label mt-3">Title</label>
        <input className="input w-full" value={title} onChange={e=>setTitle(e.target.value)} />

        <label className="label mt-2">Slug</label>
        <input className="input w-full" value={slug} onChange={e=>setSlug(e.target.value)} />

        <label className="label mt-2">Excerpt (rich)</label>
        <RichTextEditor value={excerpt} onChange={(val)=>setExcerpt(toHtmlString(val))} />

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
            {cats.map(c => {
              const idStr = String(c._id);
              return (
                <label key={idStr} className="flex items-center gap-2 text-sm border rounded-md px-2 py-1">
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(idStr)}
                    onChange={() => toggleCat(idStr)}
                  />
                  {c.name}
                </label>
              );
            })}
          </div>
        </div>

        <label className="label mt-3">Body (rich, optional)</label>
        <RichTextEditor value={body} onChange={(val)=>setBody(toHtmlString(val))} />

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