import Category from '@/models/Category';
import { json, requireRole } from '../_utils';
import slugify from 'slugify';

async function uniqueSlug(base) {
  let slug = base;
  let i = 2;
  // keep incrementing suffix until it's unique
  // (fast enough for admin use; create index on slug for safety)
  while (await Category.exists({ slug })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function GET() {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });
  const items = await Category.find().sort({ name: 1 }).lean();
  return json(items);
}

export async function POST(req) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  const body = await req.json();
  const id = body.id ? String(body.id) : null;
  const name = String(body.name || '').trim();
  if (!name) return json({ error: 'Name required' }, { status: 400 });

  if (id) {
    // Rename existing category; recompute slug from new name
    const base = slugify(name, { lower: true, strict: true });
    const slug = await uniqueSlug(base);
    const doc = await Category.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true }
    );
    if (!doc) return json({ error: 'Not found' }, { status: 404 });
    return json(doc);
  } else {
    // Create new category with auto slug
    const base = slugify(name, { lower: true, strict: true });
    const slug = await uniqueSlug(base);
    const doc = await Category.create({ name, slug });
    return json(doc);
  }
}