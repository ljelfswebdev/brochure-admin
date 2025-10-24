// app/api/admin/pages/[id]/route.js
import Page from '@/models/Page';
import { json, requireRole } from '../../_utils';

export async function GET(_req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });
  const doc = await Page.findById(params.id).lean();
  if (!doc) return json({ error: 'Not found' }, { status: 404 });
  return json(doc);
}

export async function PATCH(req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  const body = await req.json();
  const update = {};

  if (body.title != null)  update.title = String(body.title);
  if (body.slug  != null)  update.slug  = String(body.slug);

  if (typeof body.protected === 'boolean') update.protected = body.protected;

  if (Array.isArray(body.blocks)) {
    update.blocks = body.protected ? [] : body.blocks;
  }

  if (body.protectedBanners && typeof body.protectedBanners === 'object') {
    update.protectedBanners = body.protectedBanners;
  }

  const doc = await Page.findByIdAndUpdate(params.id, update, { new: true });
  if (!doc) return json({ error: 'Not found' }, { status: 404 });
  return json(doc);
}

export async function DELETE(_req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  await Page.findByIdAndDelete(params.id);
  return json({ ok: true });
}