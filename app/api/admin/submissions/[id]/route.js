// app/api/admin/submissions/[id]/route.js
import { json, requireRole } from '../../_utils';
import { dbConnect } from '@/lib/db';
import FormSubmission from '@/models/FormSubmission';

export async function GET(_req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  await dbConnect();

  const doc = await FormSubmission.findById(params.id).lean();
  if (!doc) return json({ error: 'Not found' }, { status: 404 });
  return json(doc);
}