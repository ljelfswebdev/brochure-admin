import Menu from '@/models/Menu';
import { json, requireRole } from '../_utils';

export async function GET(){
  const gate = await requireRole('editor'); if (!gate.ok) return json({error:gate.error},{status:gate.status});
  const items = await Menu.find().lean();
  return json(items);
}

export async function POST(req){
  const gate = await requireRole('editor'); if (!gate.ok) return json({error:gate.error},{status:gate.status});
  const body = await req.json();
  const key = String(body.key||'').trim();
  if (!key) return json({error:'Key required'},{status:400});
  const items = Array.isArray(body.items) ? body.items : [];
  const doc = await Menu.findOneAndUpdate({ key }, { key, items }, { new:true, upsert:true });
  return json(doc);
}
