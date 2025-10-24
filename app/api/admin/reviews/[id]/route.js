import Review from '@/models/Review';
import { json, requireRole } from '../../_utils';

export async function DELETE(_req,{params}){
  const gate = await requireRole('editor'); if (!gate.ok) return json({error:gate.error},{status:gate.status});
  await Review.findByIdAndDelete(params.id);
  return json({ ok:true });
}
