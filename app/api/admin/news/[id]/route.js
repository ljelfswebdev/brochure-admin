import News from '@/models/News';
import { json, requireRole } from '../../_utils';

export async function GET(_req,{params}){
  const gate = await requireRole('editor'); if (!gate.ok) return json({error:gate.error},{status:gate.status});
  const doc = await News.findById(params.id).lean();
  if (!doc) return json({error:'Not found'},{status:404});
  return json(doc);
}

export async function PATCH(req,{params}){
  const gate = await requireRole('editor'); if (!gate.ok) return json({error:gate.error},{status:gate.status});
  const body = await req.json();
  const update = {};
  ['title','slug','listingImage'].forEach(k => { if (k in body) update[k] = String(body[k]||''); });
  if (Array.isArray(body.blocks)) update.blocks = body.blocks;
  if (Array.isArray(body.categories)) update.categories = body.categories;
  const doc = await News.findByIdAndUpdate(params.id, update, {new:true});
  if (!doc) return json({error:'Not found'},{status:404});
  return json(doc);
}

export async function DELETE(_req,{params}){
  const gate = await requireRole('editor'); if (!gate.ok) return json({error:gate.error},{status:gate.status});
  await News.findByIdAndDelete(params.id);
  return json({ ok:true });
}
