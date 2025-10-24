// app/admin/pages/[id]/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Blocks from '@/components/admin/blocks/PageBlocks';
import SingleBannerEditor from '@/components/admin/blocks/SingleBannerEditor';

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [topBanner, setTopBanner] = useState(null);
  const [bottomBanner, setBottomBanner] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/admin/pages/${id}`, { cache: 'no-store' });
        if (!r.ok) throw new Error('Failed to load page');
        const p = await r.json();
        if (cancelled) return;
        setTitle(p.title || '');
        setSlug(p.slug || '');
        setIsProtected(!!p.protected);
        setBlocks(Array.isArray(p.blocks) ? p.blocks : []);
        setTopBanner(p?.protectedBanners?.top || null);
        setBottomBanner(p?.protectedBanners?.bottom || null);
      } catch (e) {
        toast.error(e.message || 'Error loading page');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/pages/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          protected: isProtected,
          blocks: isProtected ? [] : blocks,
          protectedBanners: isProtected ? { top: topBanner, bottom: bottomBanner } : undefined,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      toast.success('Page updated');
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('Delete this page?')) return;
    const r = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
    if (!r.ok) return toast.error('Delete failed');
    toast.success('Deleted');
    router.push('/admin/pages');
  }

  if (loading) return <div className="card">Loading…</div>;

  return (
    <div className="space-y-6">
      <a href="/admin/pages" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">← Back to Pages</a>

      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Page</h3>
          <div className="flex gap-2">
            <a className="button button--secondary" href={`/${slug}`} target="_blank" rel="noreferrer">View</a>
            <button className="button button--tertiary" onClick={remove}>Delete</button>
          </div>
        </div>

        <label className="label mt-3">Title</label>
        <input className="input w-full" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Page title" />

        <label className="label mt-2">Slug</label>
        <input className="input w-full" value={slug} onChange={e=>setSlug(e.target.value.replace(/^\//,''))} placeholder="auto if blank when creating" />

        <div className="mt-3 flex items-center gap-2">
          <input id="protected" type="checkbox" checked={isProtected} onChange={e=>setIsProtected(e.target.checked)} />
          <label htmlFor="protected" className="label m-0">Template-controlled (Protected)</label>
        </div>

        {!isProtected && (
          <div className="mt-4">
            <Blocks value={blocks} onChange={setBlocks} />
          </div>
        )}

        {isProtected && (
          <div className="mt-4 space-y-4">
            <SingleBannerEditor label="Top Banner" value={topBanner} onChange={setTopBanner} />
            <SingleBannerEditor label="Bottom Banner" value={bottomBanner} onChange={setBottomBanner} />
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button className="button button--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}