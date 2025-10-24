'use client';
import { useState } from 'react';

export default function CloudinaryUpload({ value, onChange, folder='uploads' }){
  const [uploading, setUploading] = useState(false);

  async function pick(e){
    const file = e.target.files?.[0];
    if(!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (preset) {
        form.append('file', file);
        form.append('upload_preset', preset);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method:'POST', body: form });
        const data = await res.json();
        onChange?.(data.secure_url || data.url);
      } else {
        // signed upload fallback
        const sign = await fetch(`/api/cloudinary/sign?folder=${encodeURIComponent(folder)}`);
        const { timestamp, apiKey, signature } = await sign.json();
        form.append('file', file);
        form.append('api_key', apiKey);
        form.append('timestamp', timestamp);
        form.append('signature', signature);
        form.append('folder', folder);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method:'POST', body: form });
        const data = await res.json();
        onChange?.(data.secure_url || data.url);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={pick} />
      {uploading ? <div>Uploading...</div> : null}
      {value ? <div><img src={value} alt="" style={{maxWidth:220, marginTop:6}}/></div> : null}
    </div>
  );
}
