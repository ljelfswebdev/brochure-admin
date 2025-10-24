// components/admin/blocks/SingleBannerEditor.jsx
'use client';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';
import { useState, useEffect } from 'react';

export default function SingleBannerEditor({ value, onChange, label = 'Banner' }) {
  const [size, setSize] = useState(value?.size || 'large');
  const [slides, setSlides] = useState(Array.isArray(value?.slides) ? value.slides : []);

  useEffect(() => {
    onChange({ size, slides });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, slides]);

  function addSlide() {
    setSlides(prev => [...prev, { image: '', subtitle: '', title: '', text: '', link: { text: '', url: '' } }]);
  }
  function updateSlide(i, patch) {
    const next = [...slides];
    next[i] = { ...next[i], ...patch };
    setSlides(next);
  }
  function removeSlide(i) {
    const next = [...slides];
    next.splice(i, 1);
    setSlides(next);
  }

  return (
    <div className="border rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <strong className="text-base">{label}</strong>
        <div className="flex items-center gap-2">
          <span className="label m-0">Size</span>
          <select className="input" value={size} onChange={e => setSize(e.target.value)}>
            <option value="large">Large</option>
            <option value="medium">Medium</option>
            <option value="small">Small</option>
          </select>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {slides.map((s, i) => (
          <div key={i} className="border rounded-xl p-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="font-medium">Slide {i + 1}</span>
              <button type="button" className="button button--tertiary" onClick={() => removeSlide(i)}>Remove</button>
            </div>

            <label className="label mt-2">Image</label>
            <CloudinaryUpload value={s.image || ''} onChange={url => updateSlide(i, { image: url })} />

            <label className="label mt-2">Subtitle</label>
            <input className="input w-full" value={s.subtitle || ''} onChange={e => updateSlide(i, { subtitle: e.target.value })} />

            <label className="label mt-2">Title</label>
            <input className="input w-full" value={s.title || ''} onChange={e => updateSlide(i, { title: e.target.value })} />

            <label className="label mt-2">Text</label>
            <textarea className="input w-full" rows={3} value={s.text || ''} onChange={e => updateSlide(i, { text: e.target.value })} />

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="label">Link Text</label>
                <input className="input w-full" value={s.link?.text || ''} onChange={e => updateSlide(i, { link: { ...(s.link || {}), text: e.target.value } })} />
              </div>
              <div>
                <label className="label">Link URL</label>
                <input className="input w-full" value={s.link?.url || ''} onChange={e => updateSlide(i, { link: { ...(s.link || {}), url: e.target.value } })} />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="button button--secondary" onClick={addSlide}>Add Slide</button>
      </div>
    </div>
  );
}