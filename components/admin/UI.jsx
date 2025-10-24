'use client';
import { useState } from 'react';

export function Field({ label, children }){
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:'block', fontWeight:'600', marginBottom:4}}>{label}</label>
      {children}
    </div>
  );
}

export function Repeater({ items, onChange, renderItem, addLabel='Add' }){
  function add(){ onChange([...(items||[]), {}]); }
  function remove(idx){
    const next = [...items]; next.splice(idx,1); onChange(next);
  }
  return (
    <div>
      <button className="button button--secondary" type="button" onClick={add}>{addLabel}</button>
      <div style={{marginTop:8}}>
        {(items||[]).map((it, idx) => (
          <div key={idx} style={{border:'1px solid #eee', padding:12, borderRadius:12, marginBottom:8}}>
            {renderItem(it, (val)=>{
              const next = [...items]; next[idx] = val; onChange(next);
            })}
            <div style={{textAlign:'right'}}>
              <button className="button button--tertiary" type="button" onClick={()=>remove(idx)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
