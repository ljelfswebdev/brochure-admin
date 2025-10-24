'use client';
import { useState } from 'react';
import { Field, Repeater } from '../UI';
import CloudinaryUpload from '../CloudinaryUpload';

function BannerEditor({value={}, onChange}){
  const [size, setSize] = useState(value.size || 'large');
  const [slides, setSlides] = useState(value.slides || []);
  function update(){ onChange({ size, slides }); }
  return (
    <div>
      <Field label="Size">
        <select value={size} onChange={e=>{setSize(e.target.value); update();}}>
          <option>large</option><option>medium</option><option>small</option>
        </select>
      </Field>
      <Field label="Slides">
        <Repeater items={slides} onChange={(v)=>{setSlides(v); onChange({ size, slides:v });}} addLabel="Add slide"
          renderItem={(slide, setSlide)=>(
            <div>
              <Field label="Image">
                <CloudinaryUpload value={slide.image||''} onChange={(url)=>setSlide({...slide, image:url})} />
              </Field>
              <Field label="Subtitle"><input value={slide.subtitle||''} onChange={e=>setSlide({...slide, subtitle:e.target.value})} /></Field>
              <Field label="Title"><input value={slide.title||''} onChange={e=>setSlide({...slide, title:e.target.value})} /></Field>
              <Field label="Text"><textarea value={slide.text||''} onChange={e=>setSlide({...slide, text:e.target.value})} /></Field>
              <Field label="Link Text"><input value={slide.link?.text||''} onChange={e=>setSlide({...slide, link:{...(slide.link||{}), text:e.target.value}})} /></Field>
              <Field label="Link URL"><input value={slide.link?.url||''} onChange={e=>setSlide({...slide, link:{...(slide.link||{}), url:e.target.value}})} /></Field>
            </div>
        )} />
      </Field>
    </div>
  );
}

function TextImageEditor({value={}, onChange}){
  const [layout, setLayout] = useState(value.layout || 'text-left');
  const [text, setText] = useState(value.text || '');
  const [image, setImage] = useState(value.image || '');
  return (
    <div>
      <Field label="Layout">
        <select value={layout} onChange={e=>{setLayout(e.target.value); onChange({ layout:e.target.value, text, image });}}>
          <option value="text-left">Text Left</option>
          <option value="text-right">Text Right</option>
          <option value="full-top">Full-width Top</option>
          <option value="full-bottom">Full-width Bottom</option>
        </select>
      </Field>
      <Field label="Text"><textarea value={text} onChange={e=>{setText(e.target.value); onChange({ layout, text:e.target.value, image });}} /></Field>
      <Field label="Image"><CloudinaryUpload value={image} onChange={(url)=>{setImage(url); onChange({ layout, text, image:url });}} /></Field>
    </div>
  );
}

function ParallaxEditor({value={}, onChange}){
  const [title, setTitle] = useState(value.title || '');
  const [text, setText] = useState(value.text || '');
  const [image, setImage] = useState(value.image || '');
  const [linkText, setLinkText] = useState(value.link?.text || '');
  const [linkUrl, setLinkUrl] = useState(value.link?.url || '');
  return (
    <div>
      <Field label="Title"><input value={title} onChange={e=>{setTitle(e.target.value); onChange({ title:e.target.value, text, image, link:{text:linkText,url:linkUrl} });}} /></Field>
      <Field label="Text"><textarea value={text} onChange={e=>{setText(e.target.value); onChange({ title, text:e.target.value, image, link:{text:linkText,url:linkUrl} });}} /></Field>
      <Field label="Image"><CloudinaryUpload value={image} onChange={(url)=>{setImage(url); onChange({ title, text, image:url, link:{text:linkText,url:linkUrl} });}} /></Field>
      <Field label="Link Text"><input value={linkText} onChange={e=>{setLinkText(e.target.value); onChange({ title, text, image, link:{text:e.target.value,url:linkUrl} });}} /></Field>
      <Field label="Link URL"><input value={linkUrl} onChange={e=>{setLinkUrl(e.target.value); onChange({ title, text, image, link:{text:linkText,url:e.target.value} });}} /></Field>
    </div>
  );
}

function FAQsEditor({value={}, onChange}){
  const [title, setTitle] = useState(value.title||'');
  const [text, setText] = useState(value.text||'');
  const [linkText, setLinkText] = useState(value.link?.text||'');
  const [linkUrl, setLinkUrl] = useState(value.link?.url||'');
  const [faqs, setFaqs] = useState(value.faqs||[]);
  return (
    <div>
      <Field label="Section Title"><input value={title} onChange={e=>{setTitle(e.target.value); onChange({ title:e.target.value, text, link:{text:linkText,url:linkUrl}, faqs });}} /></Field>
      <Field label="Section Text"><textarea value={text} onChange={e=>{setText(e.target.value); onChange({ title, text:e.target.value, link:{text:linkText,url:linkUrl}, faqs });}} /></Field>
      <Field label="Link Text"><input value={linkText} onChange={e=>{setLinkText(e.target.value); onChange({ title, text, link:{text:e.target.value,url:linkUrl}, faqs });}} /></Field>
      <Field label="Link URL"><input value={linkUrl} onChange={e=>{setLinkUrl(e.target.value); onChange({ title, text, link:{text:linkText,url:e.target.value}, faqs });}} /></Field>
      <Field label="FAQs">
        <Repeater items={faqs} onChange={setFaqs} addLabel="Add FAQ"
          renderItem={(f,setF)=>(
            <div>
              <Field label="Question"><input value={f.question||''} onChange={e=>setF({...f, question:e.target.value})} /></Field>
              <Field label="Answer"><textarea value={f.answer||''} onChange={e=>setF({...f, answer:e.target.value})} /></Field>
            </div>
          )}
        />
      </Field>
    </div>
  );
}

function ImagesSectionEditor({value={}, onChange}){
  const [items, setItems] = useState(value.items||[]);
  return (
    <div>
      <Field label="Images">
        <Repeater items={items} onChange={setItems} addLabel="Add image"
          renderItem={(it, setIt)=>(
            <div>
              <Field label="Image"><CloudinaryUpload value={it.image||''} onChange={(url)=>setIt({...it, image:url})} /></Field>
              <Field label="Title"><input value={it.title||''} onChange={e=>setIt({...it, title:e.target.value})} /></Field>
              <Field label="Text"><textarea value={it.text||''} onChange={e=>setIt({...it, text:e.target.value})} /></Field>
              <Field label="Link Text"><input value={it.link?.text||''} onChange={e=>setIt({...it, link:{...(it.link||{}), text:e.target.value}})} /></Field>
              <Field label="Link URL"><input value={it.link?.url||''} onChange={e=>setIt({...it, link:{...(it.link||{}), url:e.target.value}})} /></Field>
            </div>
          )}
        />
      </Field>
    </div>
  );
}

const Editors = {
  banner: BannerEditor,
  'text-image': TextImageEditor,
  parallax: ParallaxEditor,
  faqs: FAQsEditor,
  'images-section': ImagesSectionEditor
};

export default function PageBlocksEditor({ value=[], onChange }){
  const [blocks, setBlocks] = useState(value);

  function add(type){
    const next = [...blocks, { type, data:{} }];
    setBlocks(next); onChange(next);
  }
  function update(idx, data){
    const next = [...blocks]; next[idx] = { ...next[idx], data }; setBlocks(next); onChange(next);
  }
  function remove(idx){
    const next = [...blocks]; next.splice(idx,1); setBlocks(next); onChange(next);
  }

  return (
    <div>
      <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:8}}>
        {Object.keys(Editors).map(t => (
          <button key={t} type="button" className="button button--secondary" onClick={()=>add(t)}>
            Add {t}
          </button>
        ))}
      </div>
      {(blocks||[]).map((b, idx)=>{
        const Editor = Editors[b.type];
        if(!Editor) return null;
        return (
          <div key={idx} style={{border:'1px solid #ddd', padding:12, borderRadius:12, marginBottom:10}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <strong>{b.type}</strong>
              <button type="button" className="button button--tertiary" onClick={()=>remove(idx)}>Remove</button>
            </div>
            <Editor value={b.data||{}} onChange={(d)=>update(idx,d)} />
          </div>
        );
      })}
    </div>
  );
}
