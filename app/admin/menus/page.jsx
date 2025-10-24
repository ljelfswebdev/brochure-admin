'use client';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function MenusAdmin(){
  const [menus, setMenus] = useState([]);
  const [key, setKey] = useState('header');
  const [items, setItems] = useState([]);

  // pages dropdown
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [target, setTarget] = useState('_self');

  useEffect(()=>{
    (async ()=>{
      // load menus
      const [rMenus, rPages] = await Promise.all([
        fetch('/api/admin/menus', { cache:'no-store' }),
        fetch('/api/admin/pages?page=1&limit=1000', { cache:'no-store' }),
      ]);
      const menusJson = await rMenus.json();
      const pagesJson = await rPages.json();
      setMenus(Array.isArray(menusJson) ? menusJson : []);
      setPages(Array.isArray(pagesJson?.items) ? pagesJson.items : []);
    })();
  },[]);

  // when switching "key" (header/footer/etc) try preload its items
  useEffect(()=>{
    const found = menus.find(m => m.key === key);
    setItems(found?.items || []);
  }, [key, menus]);

  function addFromPage(){
    if (!selectedPageId) return;
    const p = pages.find(x => String(x._id) === String(selectedPageId));
    if (!p) return;
    const label = p.title || p.slug;
    const url = `/${(p.slug || '').replace(/^\//,'')}`;
    setItems(prev => [...prev, { label, url, target: '_self' }]);
    setSelectedPageId('');
  }

  function addCustom(){
    if (!customLabel || !customUrl) return;
    setItems(prev => [...prev, { label: customLabel, url: customUrl, target }]);
    setCustomLabel(''); setCustomUrl(''); setTarget('_self');
  }

  function removeAt(idx){
    setItems(prev => prev.filter((_,i)=>i!==idx));
  }

  function updateItem(idx, patch){
    setItems(prev => {
      const next = [...prev]; next[idx] = { ...next[idx], ...patch }; return next;
    });
  }

  function onDragEnd(result){
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    setItems(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(from,1);
      copy.splice(to,0,moved);
      return copy;
    });
  }

  async function save(){
    const r = await fetch('/api/admin/menus', {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify({ key, items }),
    });
    if (!r.ok) return toast.error('Save failed');
    toast.success('Menu saved');
    // refresh menus list so switching keys shows fresh data
    const refreshed = await (await fetch('/api/admin/menus',{cache:'no-store'})).json();
    setMenus(Array.isArray(refreshed) ? refreshed : []);
  }

  const keyOptions = useMemo(()=> {
    const builtIns = ['header','footer'];
    const existing = Array.from(new Set([...(menus||[]).map(m=>m.key), ...builtIns]));
    return existing;
  }, [menus]);

  return (
    <div className="space-y-6">
      {/* Top bar: pick which menu key we're editing */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Choose Menu</h3>
        <div className="flex gap-2 items-center">
          <label className="label m-0">Menu Key</label>
          <select className="input" value={key} onChange={e=>setKey(e.target.value)}>
            {keyOptions.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <input
            className="input"
            placeholder="Or type new key e.g. sidebar"
            value={key}
            onChange={e=>setKey(e.target.value)}
          />
          <button className="button button--primary ml-auto" onClick={save}>Save Menu</button>
        </div>
      </div>

      {/* Add items: from existing pages */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Add Link from Page</h3>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            className="input flex-1"
            value={selectedPageId}
            onChange={e=>setSelectedPageId(e.target.value)}
          >
            <option value="">— Select page —</option>
            {pages.map(p => (
              <option key={p._id} value={p._id}>
                {p.title || p.slug} (/{p.slug})
              </option>
            ))}
          </select>
          <button className="button button--secondary" onClick={addFromPage}>Add</button>
        </div>
      </div>

      {/* Add items: custom link */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Add Custom Link</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="input" placeholder="Label" value={customLabel} onChange={e=>setCustomLabel(e.target.value)} />
          <input className="input md:col-span-2" placeholder="URL (e.g. /about or https://...)" value={customUrl} onChange={e=>setCustomUrl(e.target.value)} />
          <select className="input" value={target} onChange={e=>setTarget(e.target.value)}>
            <option value="_self">Same tab</option>
            <option value="_blank">New tab</option>
          </select>
        </div>
        <div className="text-right mt-2">
          <button className="button button--secondary" onClick={addCustom}>Add Custom Link</button>
        </div>
      </div>

      {/* Reorder + edit */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Menu Items (drag to reorder)</h3>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="menu-items">
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {items.map((it, idx) => (
                  <Draggable key={idx.toString()} draggableId={idx.toString()} index={idx}>
                    {(prov) => (
                      <li
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className="border rounded-xl p-3 bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            {...prov.dragHandleProps}
                            className="cursor-grab select-none px-2 py-1 border rounded-md text-xs"
                            title="Drag to reorder"
                          >
                            ⇅
                          </span>
                          <input
                            className="input flex-1"
                            placeholder="Label"
                            value={it.label || ''}
                            onChange={e=>updateItem(idx,{ label:e.target.value })}
                          />
                          <input
                            className="input flex-1"
                            placeholder="URL"
                            value={it.url || ''}
                            onChange={e=>updateItem(idx,{ url:e.target.value })}
                          />
                          <select
                            className="input w-32"
                            value={it.target || '_self'}
                            onChange={e=>updateItem(idx,{ target:e.target.value })}
                          >
                            <option value="_self">_self</option>
                            <option value="_blank">_blank</option>
                          </select>
                          <button className="button button--tertiary" onClick={()=>removeAt(idx)}>Remove</button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex justify-end mt-4">
          <button className="button button--primary" onClick={save}>Save Menu</button>
        </div>
      </div>

      {/* Existing menus overview */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Existing Menus</h3>
        <ul className="list-disc pl-5">
          {menus.map(m => (
            <li key={m._id}><strong>{m.key}</strong> — {m.items?.length || 0} items</li>
          ))}
        </ul>
      </div>
    </div>
  );
}