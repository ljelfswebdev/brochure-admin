// app/api/admin/forms/[id]/route.js
import Form from '@/models/Form';
import { json, requireRole } from '../../_utils';

export async function GET(_req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  const doc = await Form.findById(params.id).lean();
  if (!doc) return json({ error: 'Not found' }, { status: 404 });
  return json(doc);
}

export async function PATCH(req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  const body = await req.json();
  const update = {};

  if (body.key != null) update.key = String(body.key);
  if (Array.isArray(body.rows)) update.rows = body.rows;

  // 🔥 force full replacement of autoReply object
  if (body.autoReply && typeof body.autoReply === 'object') {
    update.autoReply = {
      enabled:   !!body.autoReply.enabled,
      subject:   body.autoReply.subject || '',
      message:   body.autoReply.message || '',
      fromName:  body.autoReply.fromName || '',
      fromEmail: body.autoReply.fromEmail || '',
    };
  }

  const doc = await Form.findByIdAndUpdate(params.id, update, { new: true, runValidators: true });
  if (!doc) return json({ error: 'Not found' }, { status: 404 });
  return json(doc);
}

export async function DELETE(_req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  await Form.findByIdAndDelete(params.id);
  return json({ ok: true });
}