import { dbConnect } from '@/lib/db';
import News from '@/models/News';
import { json, requireRole } from '../../_utils';
import slugify from 'slugify';

export async function GET(_req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });
  await dbConnect();

  const doc = await News.findById(params.id).lean();
  if (!doc) return json({ error: 'Not found' }, { status: 404 });
  return json(doc);
}

export async function PATCH(req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });
  await dbConnect();

  const body = await req.json(); // ✅ JSON payload
  const update = {};

  if (body.title != null) update.title = String(body.title);
  if (body.slug != null) {
    const raw = String(body.slug).trim();
    update.slug = raw || slugify(update.title || '', { lower: true, strict: true });
  }
  if (body.excerpt != null) update.excerpt = String(body.excerpt || '');
  if (body.body != null) update.body = String(body.body || '');
  if (body.listingImage != null) update.listingImage = String(body.listingImage || '');
  if (body.status != null) update.status = body.status === 'draft' ? 'draft' : 'published';
  if (Array.isArray(body.categories)) update.categories = body.categories;
  if (Array.isArray(body.blocks)) update.blocks = body.blocks;

  const doc = await News.findByIdAndUpdate(params.id, update, { new: true });
  if (!doc) return json({ error: 'Not found' }, { status: 404 });
  return json(doc);
}

export async function DELETE(_req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });
  await dbConnect();

  await News.findByIdAndDelete(params.id);
  return json({ ok: true });
}