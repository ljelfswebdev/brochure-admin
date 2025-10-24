import Review from '@/models/Review';
import { json, requireRole } from '../_utils';

export async function GET(){
  const gate = await requireRole('editor'); if (!gate.ok) return json({error:gate.error},{status:gate.status});
  const items = await Review.find().sort({createdAt:-1}).lean();
  return json(items);
}

export async function POST(req){
  const gate = await requireRole('editor'); if (!gate.ok) return json({error:gate.error},{status:gate.status});
  const body = await req.json();
  const title = String(body.title||'').trim();
  if (!title) return json({error:'Title required'},{status:400});
  const text = String(body.text||'');
  const doc = await Review.create({ title, text });
  return json(doc);
}
