'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsAdmin(){
  const [contactNumber, setContact] = useState('');
  const [emailAddress, setEmail] = useState('');
  const [socials, setSocials] = useState({});
  const [homepageSlug, setHomepageSlug] = useState('');
  const [pageOptions, setPageOptions] = useState([]);

  useEffect(()=>{
    (async ()=>{
      const [rS, rP] = await Promise.all([
        fetch('/api/admin/settings',{cache:'no-store'}),
        fetch('/api/admin/pages?page=1&limit=1000',{cache:'no-store'}),
      ]);
      const s = (await rS.json()) || {};
      const p = (await rP.json()) || {};
      setContact(s.contactNumber||'');
      setEmail(s.emailAddress||'');
      setSocials(s.socials||{});
      setHomepageSlug(s.homepageSlug||'');
      setPageOptions(Array.isArray(p.items) ? p.items : []);
    })();
  },[]);

  async function save(){
    const r = await fetch('/api/admin/settings',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ contactNumber, emailAddress, socials, homepageSlug })
    });
    if (!r.ok) return toast.error('Save failed');
    toast.success('Saved');
  }

  function updateSocial(k, v){ setSocials(prev => ({...prev,[k]:v})); }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Global Settings</h3>

      {/* Homepage selector */}
      <label className="label">Homepage</label>
      <select className="input" value={homepageSlug} onChange={(e)=>setHomepageSlug(e.target.value)}>
        <option value="">— Select a page —</option>
        {pageOptions.map(p => <option key={p._id} value={p.slug}>{p.title} (/ {p.slug})</option>)}
      </select>

      <label className="label mt-3">Contact Number</label>
      <input className="input" value={contactNumber} onChange={e=>setContact(e.target.value)} />

      <label className="label mt-2">Email Address</label>
      <input className="input" value={emailAddress} onChange={e=>setEmail(e.target.value)} />

      <div className="grid grid-cols-2 gap-3 mt-3">
        {['facebook','instagram','linkedIn','tiktok','x','youtube'].map(k => (
          <div key={k}>
            <label className="label capitalize">{k}</label>
            <input className="input w-full" value={socials[k]||''} onChange={e=>updateSocial(k,e.target.value)} />
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-3">
        <button className="button button--primary" onClick={save}>Save Settings</button>
      </div>
    </div>
  );
}