// app/admin/forms/create/page.jsx
'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

function OptionItem({ value, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input className="input w-full" value={value} onChange={(e)=>onChange(e.target.value)} placeholder="Option value" />
      <button type="button" className="button button--tertiary" onClick={onRemove}>Remove</button>
    </div>
  );
}
function SelectOptions({ value = [], onChange }) {
  function add(){ onChange([...(value||[]), '']); }
  function updateAt(i,v){ const next=[...(value||[])]; next[i]=v; onChange(next); }
  function removeAt(i){ const next=[...(value||[])]; next.splice(i,1); onChange(next); }
  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between items-center">
        <label className="label m-0">Options</label>
        <button type="button" className="button button--secondary" onClick={add}>Add option</button>
      </div>
      {(value||[]).map((opt,i)=>(
        <OptionItem key={i} value={opt} onChange={(v)=>updateAt(i,v)} onRemove={()=>removeAt(i)} />
      ))}
      {!value?.length && <p className="text-sm text-gray-500">No options yet.</p>}
    </div>
  );
}
function FieldEditor({ field, onChange }) {
  const type = field.type || 'text';
  return (
    <div className="border rounded-xl p-3 bg-white">
      <label className="label">Label</label>
      <input className="input w-full" value={field.label||''} onChange={(e)=>onChange({ ...field, label:e.target.value })} />

      <label className="label mt-2">Placeholder</label>
      <input className="input w-full" value={field.placeholder||''} onChange={(e)=>onChange({ ...field, placeholder:e.target.value })} placeholder="Optional placeholder text" />

      <label className="label mt-2">Type</label>
      <select className="input w-full" value={type} onChange={(e)=>onChange({ ...field, type:e.target.value, options:e.target.value==='select'?(field.options||[]):undefined })}>
        <option value="text">Text</option>
        <option value="textarea">Textarea</option>
        <option value="select">Select</option>
      </select>

      {type==='select' && <SelectOptions value={field.options||[]} onChange={(opts)=>onChange({ ...field, options: opts })} />}
    </div>
  );
}
function RowEditor({ row, onChange, onRemove }) {
  function setColumns(cols){
    const columns = Number(cols)===2?2:1;
    let fields = row.fields || [];
    if (columns===1) fields = fields.slice(0,1).length?fields.slice(0,1):[{ label:'', type:'text', options:[] }];
    if (columns===2) fields = (fields.concat([{},{ }])).slice(0,2).map(f=>({ label:'', type:'text', options:[], ...f }));
    onChange({ ...row, columns, fields });
  }
  function updateField(i, patch){
    const fields = [...(row.fields||[])];
    fields[i] = patch;
    onChange({ ...row, fields });
  }
  const columns = row.columns===2?2:1;
  const fields = (columns===1)
    ? (row.fields||[]).slice(0,1).length ? (row.fields||[]).slice(0,1) : [{ label:'', type:'text', options:[] }]
    : (row.fields||[]).concat([{},{ }]).slice(0,2).map(f=>({ label:'', type:'text', options:[], ...f }));

  return (
    <div className="border rounded-xl p-3 mb-3 bg-white">
      <div className="flex items-center gap-3">
        <label className="label m-0">Columns</label>
        <select className="input w-24" value={columns} onChange={(e)=>setColumns(e.target.value)}>
          <option value={1}>1</option><option value={2}>2</option>
        </select>
        <button type="button" className="button button--tertiary ml-auto" onClick={onRemove}>Remove Row</button>
      </div>
      <div className={`grid gap-3 mt-3 ${columns===2?'grid-cols-2':''}`}>
        {fields.map((f,i)=>(
          <FieldEditor key={i} field={f} onChange={(patch)=>updateField(i,patch)} />
        ))}
      </div>
    </div>
  );
}

export default function CreateForm(){
  const [key, setKey] = useState('contact');
  const [rows, setRows] = useState([
    { columns: 2, fields: [
      { label:'Full Name', type:'text', placeholder:'Your name' },
      { label:'Email Address', type:'text', placeholder:'you@example.com' },
    ]}
  ]);
  const [autoReply, setAutoReply] = useState({ enabled:false, subject:'', message:'', fromName:'', fromEmail:'' });
  const [saving, setSaving] = useState(false);

  function addRow(){ setRows(prev => [...prev, { columns:1, fields:[{ label:'', type:'text' }] }]); }
  function updateRow(i, patch){ const next=[...rows]; next[i]=patch; setRows(next); }
  function removeRow(i){ const next=[...rows]; next.splice(i,1); setRows(next); }

  async function save(){
    setSaving(true);
    try{
      const r = await fetch('/api/admin/forms', {
        method:'POST', headers:{'content-type':'application/json'},
        body: JSON.stringify({ key, rows, autoReply })
      });
      if (!r.ok) throw new Error(await r.text());
      toast.success('Form created');
      window.location.href = '/admin/forms';
    }catch(e){
      toast.error(e.message || 'Save failed');
    }finally{ setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <a href="/admin/forms" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">← Back to Forms</a>

      <div className="card">
        <h3 className="text-lg font-semibold mb-3">Create Form</h3>

        <div className="flex items-center gap-2 mb-4">
          <span className="label m-0">Key</span>
          <input className="input" value={key} onChange={(e)=>setKey(e.target.value || 'contact')} />
        </div>

        {/* Auto-reply */}
        <div className="border rounded-2xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <input id="ar" type="checkbox" checked={!!autoReply.enabled} onChange={e=>setAutoReply(prev=>({ ...prev, enabled: e.target.checked }))} />
            <label htmlFor="ar" className="label m-0">Enable Auto-reply</label>
          </div>
          {autoReply.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="md:col-span-2">
                <label className="label">Subject</label>
                <input className="input w-full" value={autoReply.subject} onChange={e=>setAutoReply(prev=>({ ...prev, subject:e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Message</label>
                <textarea className="input w-full" rows={5} value={autoReply.message} onChange={e=>setAutoReply(prev=>({ ...prev, message:e.target.value }))} />
              </div>
              <div>
                <label className="label">From Name (optional)</label>
                <input className="input w-full" value={autoReply.fromName} onChange={e=>setAutoReply(prev=>({ ...prev, fromName:e.target.value }))} />
              </div>
              <div>
                <label className="label">From Email (optional)</label>
                <input className="input w-full" value={autoReply.fromEmail} onChange={e=>setAutoReply(prev=>({ ...prev, fromEmail:e.target.value }))} />
              </div>
            </div>
          )}
        </div>

        {rows.map((row,i)=>(
          <RowEditor key={i} row={row} onChange={(patch)=>updateRow(i,patch)} onRemove={()=>removeRow(i)} />
        ))}

        <div className="flex gap-2">
          <button type="button" className="button button--secondary" onClick={addRow}>Add Row</button>
          <button type="button" className="button button--primary ml-auto" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Create Form'}
          </button>
        </div>
      </div>
    </div>
  );
}