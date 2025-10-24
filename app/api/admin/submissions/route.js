// app/api/admin/submissions/route.js
import { json, requireRole } from '../_utils';
import { dbConnect } from '@/lib/db';
import FormSubmission from '@/models/FormSubmission';

export async function GET(req) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key') || ''; // optional
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 20);

  const query = key ? { key } : {};
  const total = await FormSubmission.countDocuments(query);
  const items = await FormSubmission.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return json({ items, total, page, limit, key: key || null });
}