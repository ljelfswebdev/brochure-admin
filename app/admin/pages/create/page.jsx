// app/admin/pages/create/page.jsx
'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Blocks from '@/components/admin/blocks/PageBlocks';
import SingleBannerEditor from '@/components/admin/blocks/SingleBannerEditor';

export default function CreatePage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [topBanner, setTopBanner] = useState(null);
  const [bottomBanner, setBottomBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch('/api/admin/pages', {
        method: 'POST',
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
      toast.success('Page created');
      window.location.href = '/admin/pages';
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <a href="/admin/pages" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">← Back to Pages</a>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Create Page</h3>

        <label className="label">Title</label>
        <input className="input w-full" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Page title" />

        <label className="label mt-2">Slug (optional)</label>
        <input className="input w-full" value={slug} onChange={e=>setSlug(e.target.value.replace(/^\//,''))} placeholder="auto from title if blank" />

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
            {saving ? 'Saving…' : 'Create Page'}
          </button>
        </div>
      </div>
    </div>
  );
}