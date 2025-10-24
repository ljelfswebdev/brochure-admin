import Category from '@/models/Category';
import { json, requireRole } from '../../_utils';

export async function DELETE(_req,{params}){
  const gate = await requireRole('editor'); if (!gate.ok) return json({error:gate.error},{status:gate.status});
  await Category.findByIdAndDelete(params.id);
  return json({ ok:true });
}
