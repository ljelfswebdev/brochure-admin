import User from '@/models/User';
import { json, requireRole } from '../../_utils';

export async function PATCH(req,{params}){
  const gate = await requireRole('admin'); if (!gate.ok) return json({error:gate.error},{status:gate.status});
  const body = await req.json();
  const update = {};
  if (body.role) update.role = String(body.role);
  const doc = await User.findByIdAndUpdate(params.id, update, { new:true });
  if (!doc) return json({error:'Not found'},{status:404});
  return json(doc);
}
