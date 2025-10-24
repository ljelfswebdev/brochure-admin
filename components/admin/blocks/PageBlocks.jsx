'use client';
import React, { useMemo, useRef, useState } from 'react';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';

// small helper
const move = (arr, from, to) => {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};

export default function PageBlocks({ value = [], onChange }) {
  const blocks = Array.isArray(value) ? value : [];
  const [collapsed, setCollapsed] = useState({}); // {index: boolean}
  const dragFrom = useRef(null);

  const headerLabel = (b, i) => {
    const t = (b?.type || '').replace('-', ' ');
    const name =
      (b?.title?.trim?.() ||
        b?.slides?.[0]?.title ||
        b?.items?.[0]?.title ||
        '').trim();
    return `${i + 1}. ${t}${name ? ` — ${name}` : ''}`;
  };

  function toggleCollapsed(i) {
    setCollapsed((c) => ({ ...c, [i]: !c[i] }));
  }

  function updateBlock(index, next) {
    const copy = [...blocks];
    copy[index] = next;
    onChange(copy);
  }
  function removeBlock(index) {
    const copy = [...blocks];
    copy.splice(index, 1);
    onChange(copy);
  }
  function addBlock(type) {
    const defaults = {
      banner: { type: 'banner', size: 'large', slides: [] },
      'text-image': {
        type: 'text-image',
        title: '',
        text: '',
        image: '',
        layout: 'text-left',
        fullWidthPosition: 'none',
      },
      parallax: {
        type: 'parallax',
        title: '',
        text: '',
        link: { text: '', url: '' },
        image: '',
      },
      faqs: {
        type: 'faqs',
        title: '',
        text: '',
        link: { text: '', url: '' },
        faqs: [],
      },
      'images-section': { type: 'images-section', items: [] },
    };
    onChange([...(blocks || []), defaults[type]]);
  }

  // drag & drop handlers
  function onDragStart(e, i) {
    dragFrom.current = i;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(i)); // for Firefox
  }
  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  function onDrop(e, i) {
    e.preventDefault();
    const from = dragFrom.current ?? Number(e.dataTransfer.getData('text/plain'));
    const to = i;
    if (Number.isInteger(from) && Number.isInteger(to) && from !== to) {
      onChange(move(blocks, from, to));
      setCollapsed((prev) => {
        const remapped = {};
        const oldKeys = Object.keys(prev);
        for (const k of oldKeys) {
          const idx = Number(k);
          let newIndex = idx;
          if (idx === from) newIndex = to;
          else if (from < to && idx > from && idx <= to) newIndex = idx - 1;
          else if (from > to && idx < from && idx >= to) newIndex = idx + 1;
          remapped[newIndex] = prev[idx];
        }
        return remapped;
      });
    }
    dragFrom.current = null;
  }

  function moveUp(i) {
    if (i <= 0) return;
    onChange(move(blocks, i, i - 1));
    setCollapsed((c) => ({ ...c, [i - 1]: c[i] }));
  }
  function moveDown(i) {
    if (i >= blocks.length - 1) return;
    onChange(move(blocks, i, i + 1));
    setCollapsed((c) => ({ ...c, [i + 1]: c[i] }));
  }

  return (
    <div className="space-y-6">
      {(blocks || []).map((block, i) => {
        const isCollapsed = !!collapsed[i];
        return (
          <div
            key={i}
            className="border rounded-2xl bg-white"
            draggable
            onDragStart={(e) => onDragStart(e, i)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, i)}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
              onClick={() => toggleCollapsed(i)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none">↕</span>
                <div className="font-semibold">{headerLabel(block, i)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="button button--tertiary"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveUp(i);
                  }}
                >
                  Move Up
                </button>
                <button
                  type="button"
                  className="button button--tertiary"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveDown(i);
                  }}
                >
                  Move Down
                </button>
                <button
                  type="button"
                  className="button button--tertiary"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBlock(i);
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapsed(i);
                  }}
                >
                  {isCollapsed ? 'Expand' : 'Collapse'}
                </button>
              </div>
            </div>

            {/* Body */}
            {!isCollapsed && (
              <div className="p-4 space-y-4 border-t">
                {/* ---------------- Banner ---------------- */}
                {block.type === 'banner' && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="label m-0">Size</label>
                      <select
                        className="input"
                        value={block.size || 'large'}
                        onChange={(e) => updateBlock(i, { ...block, size: e.target.value })}
                      >
                        <option value="large">Large</option>
                        <option value="medium">Medium</option>
                        <option value="small">Small</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      {(block.slides || []).map((s, j) => (
                        <div key={j} className="border rounded-xl p-3 bg-white space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Slide {j + 1}</div>
                            <button
                              type="button"
                              className="button button--tertiary"
                              onClick={() => {
                                const slides = [...(block.slides || [])];
                                slides.splice(j, 1);
                                updateBlock(i, { ...block, slides });
                              }}
                            >
                              Remove slide
                            </button>
                          </div>

                          <label className="label">Image</label>
                          <CloudinaryUpload
                            value={s.image || ''}
                            onChange={(url) => {
                              const slides = [...(block.slides || [])];
                              slides[j] = { ...s, image: url };
                              updateBlock(i, { ...block, slides });
                            }}
                          />

                          <label className="label">Subtitle</label>
                          <input
                            className="input w-full"
                            value={s.subtitle || ''}
                            onChange={(e) => {
                              const slides = [...(block.slides || [])];
                              slides[j] = { ...s, subtitle: e.target.value };
                              updateBlock(i, { ...block, slides });
                            }}
                          />

                          <label className="label">Title</label>
                          <input
                            className="input w-full"
                            value={s.title || ''}
                            onChange={(e) => {
                              const slides = [...(block.slides || [])];
                              slides[j] = { ...s, title: e.target.value };
                              updateBlock(i, { ...block, slides });
                            }}
                          />

                          <label className="label">Text</label>
                          <RichTextEditor
                            value={s.text || ''}
                            onChange={(html) => {
                              const slides = [...(block.slides || [])];
                              slides[j] = { ...s, text: html };
                              updateBlock(i, { ...block, slides });
                            }}
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="label">Link Text</label>
                              <input
                                className="input w-full"
                                value={s.link?.text || ''}
                                onChange={(e) => {
                                  const slides = [...(block.slides || [])];
                                  slides[j] = { ...s, link: { ...(s.link || {}), text: e.target.value } };
                                  updateBlock(i, { ...block, slides });
                                }}
                              />
                            </div>
                            <div>
                              <label className="label">Link URL</label>
                              <input
                                className="input w-full"
                                value={s.link?.url || ''}
                                onChange={(e) => {
                                  const slides = [...(block.slides || [])];
                                  slides[j] = { ...s, link: { ...(s.link || {}), url: e.target.value } };
                                  updateBlock(i, { ...block, slides });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() => {
                        const slides = [
                          ...(block.slides || []),
                          { image: '', subtitle: '', title: '', text: '', link: { text: '', url: '' } },
                        ];
                        updateBlock(i, { ...block, slides });
                      }}
                    >
                      + Add Slide
                    </button>
                  </>
                )}

                {/* ---------------- Text / Image ---------------- */}
                {block.type === 'text-image' && (
                  <>
                    <label className="label">Title</label>
                    <input
                      className="input w-full"
                      value={block.title || ''}
                      onChange={(e) => updateBlock(i, { ...block, title: e.target.value })}
                    />

                    <label className="label mt-2">Text</label>
                    <RichTextEditor
                      value={block.text || ''}
                      onChange={(html) => updateBlock(i, { ...block, text: html })}
                    />

                    <label className="label mt-2">Image</label>
                    <CloudinaryUpload
                      value={block.image || ''}
                      onChange={(url) => updateBlock(i, { ...block, image: url })}
                    />

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="label">Layout</label>
                        <select
                          className="input w-full"
                          value={block.layout || 'text-left'}
                          onChange={(e) => updateBlock(i, { ...block, layout: e.target.value })}
                        >
                          <option value="text-left">Text left</option>
                          <option value="text-right">Text right</option>
                          <option value="full">Full width</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Full-width Position</label>
                        <select
                          className="input w-full"
                          value={block.fullWidthPosition || 'none'}
                          onChange={(e) => updateBlock(i, { ...block, fullWidthPosition: e.target.value })}
                        >
                          <option value="none">Not full-width</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* ---------------- Parallax ---------------- */}
                {block.type === 'parallax' && (
                  <>
                    <label className="label">Title</label>
                    <input
                      className="input w-full"
                      value={block.title || ''}
                      onChange={(e) => updateBlock(i, { ...block, title: e.target.value })}
                    />

                    <label className="label mt-2">Text</label>
                    <RichTextEditor
                      value={block.text || ''}
                      onChange={(html) => updateBlock(i, { ...block, text: html })}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label">Link Text</label>
                        <input
                          className="input w-full"
                          value={block.link?.text || ''}
                          onChange={(e) =>
                            updateBlock(i, { ...block, link: { ...(block.link || {}), text: e.target.value } })
                          }
                        />
                      </div>
                      <div>
                        <label className="label">Link URL</label>
                        <input
                          className="input w-full"
                          value={block.link?.url || ''}
                          onChange={(e) =>
                            updateBlock(i, { ...block, link: { ...(block.link || {}), url: e.target.value } })
                          }
                        />
                      </div>
                    </div>

                    <label className="label mt-2">Background Image</label>
                    <CloudinaryUpload
                      value={block.image || ''}
                      onChange={(url) => updateBlock(i, { ...block, image: url })}
                    />
                  </>
                )}

                {/* ---------------- FAQs ---------------- */}
                {block.type === 'faqs' && (
                  <>
                    <label className="label">Section Title</label>
                    <input
                      className="input w-full"
                      value={block.title || ''}
                      onChange={(e) => updateBlock(i, { ...block, title: e.target.value })}
                    />

                    <label className="label mt-2">Intro Text</label>
                    <RichTextEditor
                      value={block.text || ''}
                      onChange={(html) => updateBlock(i, { ...block, text: html })}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label">Link Text</label>
                        <input
                          className="input w-full"
                          value={block.link?.text || ''}
                          onChange={(e) =>
                            updateBlock(i, { ...block, link: { ...(block.link || {}), text: e.target.value } })
                          }
                        />
                      </div>
                      <div>
                        <label className="label">Link URL</label>
                        <input
                          className="input w-full"
                          value={block.link?.url || ''}
                          onChange={(e) =>
                            updateBlock(i, { ...block, link: { ...(block.link || {}), url: e.target.value } })
                          }
                        />
                      </div>
                    </div>

                    <h4 className="font-semibold mt-3">FAQs</h4>
                    <div className="space-y-2">
                      {(block.faqs || []).map((faq, j) => (
                        <div key={j} className="border rounded-md p-2 space-y-1">
                          <input
                            className="input w-full"
                            placeholder="Question"
                            value={faq.question || ''}
                            onChange={(e) => {
                              const faqs = [...(block.faqs || [])];
                              faqs[j] = { ...faq, question: e.target.value };
                              updateBlock(i, { ...block, faqs });
                            }}
                          />
                          <RichTextEditor
                            value={faq.answer || ''}
                            onChange={(html) => {
                              const faqs = [...(block.faqs || [])];
                              faqs[j] = { ...faq, answer: html };
                              updateBlock(i, { ...block, faqs });
                            }}
                          />
                          <button
                            type="button"
                            className="button button--tertiary"
                            onClick={() => {
                              const faqs = [...(block.faqs || [])];
                              faqs.splice(j, 1);
                              updateBlock(i, { ...block, faqs });
                            }}
                          >
                            Remove FAQ
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() => {
                        const faqs = [...(block.faqs || []), { question: '', answer: '' }];
                        updateBlock(i, { ...block, faqs });
                      }}
                    >
                      + Add FAQ
                    </button>
                  </>
                )}

                {/* ---------------- Images Section ---------------- */}
                {block.type === 'images-section' && (
                  <>
                    <div className="space-y-3">
                      {(block.items || []).map((it, j) => (
                        <div key={j} className="border rounded-xl p-3 bg-white space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Item {j + 1}</div>
                            <button
                              type="button"
                              className="button button--tertiary"
                              onClick={() => {
                                const items = [...(block.items || [])];
                                items.splice(j, 1);
                                updateBlock(i, { ...block, items });
                              }}
                            >
                              Remove
                            </button>
                          </div>

                          <label className="label">Image</label>
                          <CloudinaryUpload
                            value={it.image || ''}
                            onChange={(url) => {
                              const items = [...(block.items || [])];
                              items[j] = { ...it, image: url };
                              updateBlock(i, { ...block, items });
                            }}
                          />

                          <label className="label">Title</label>
                          <input
                            className="input w-full"
                            value={it.title || ''}
                            onChange={(e) => {
                              const items = [...(block.items || [])];
                              items[j] = { ...it, title: e.target.value };
                              updateBlock(i, { ...block, items });
                            }}
                          />

                          <label className="label">Text</label>
                          <RichTextEditor
                            value={it.text || ''}
                            onChange={(html) => {
                              const items = [...(block.items || [])];
                              items[j] = { ...it, text: html };
                              updateBlock(i, { ...block, items });
                            }}
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="label">Link Text</label>
                              <input
                                className="input w-full"
                                value={it.link?.text || ''}
                                onChange={(e) => {
                                  const items = [...(block.items || [])];
                                  items[j] = { ...it, link: { ...(it.link || {}), text: e.target.value } };
                                  updateBlock(i, { ...block, items });
                                }}
                              />
                            </div>
                            <div>
                              <label className="label">Link URL</label>
                              <input
                                className="input w-full"
                                value={it.link?.url || ''}
                                onChange={(e) => {
                                  const items = [...(block.items || [])];
                                  items[j] = { ...it, link: { ...(it.link || {}), url: e.target.value } };
                                  updateBlock(i, { ...block, items });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() => {
                        const items = [
                          ...(block.items || []),
                          { image: '', title: '', text: '', link: { text: '', url: '' } },
                        ];
                        updateBlock(i, { ...block, items });
                      }}
                    >
                      + Add Image Item
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="button button--secondary" onClick={() => addBlock('banner')}>
          + Add Banner
        </button>
        <button type="button" className="button button--secondary" onClick={() => addBlock('text-image')}>
          + Add Text/Image
        </button>
        <button type="button" className="button button--secondary" onClick={() => addBlock('parallax')}>
          + Add Parallax
        </button>
        <button type="button" className="button button--secondary" onClick={() => addBlock('faqs')}>
          + Add FAQs
        </button>
        <button type="button" className="button button--secondary" onClick={() => addBlock('images-section')}>
          + Add Images Section
        </button>
      </div>
    </div>
  );
}