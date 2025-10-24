// app/api/admin/forms/route.js
import Form from '@/models/Form';
import { json, requireRole } from '../_utils';

export async function GET(req) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (key) {
    const doc = await Form.findOne({ key }).lean();
    return json(doc || { key, rows: [], autoReply: { enabled:false, subject:'', message:'', fromName:'', fromEmail:'' } });
  } else {
    const items = await Form.find().sort({ key: 1 }).lean();
    return json(items);
  }
}

export async function POST(req) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  const body = await req.json();
  const key = String(body.key || 'contact');
  const rows = Array.isArray(body.rows) ? body.rows : [];
  const autoReply = body.autoReply && typeof body.autoReply === 'object'
    ? body.autoReply
    : { enabled:false, subject:'', message:'', fromName:'', fromEmail:'' };

  const doc = await Form.findOneAndUpdate(
    { key },
    { key, rows, autoReply },
    { new: true, upsert: true }
  );

  return json(doc);
}