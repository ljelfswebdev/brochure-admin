import { dbConnect } from '@/lib/db';
import News from '@/models/News';
import { json, requireRole } from '../_utils'; // adjust path if different
import slugify from 'slugify';

export async function GET(req) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get('page')  || '1', 10) || 1);
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10);
  const skip  = (page - 1) * limit;
  const qRaw  = (searchParams.get('q') || '').trim();
  const cats  = searchParams.getAll('cats').filter(Boolean);

  const filter = {};
  if (qRaw) filter.title = { $regex: qRaw, $options: 'i' };
  if (cats.length) filter.categories = { $in: cats };

  const [items, total] = await Promise.all([
    News.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .select({ title: 1, slug: 1, createdAt: 1 }).lean(),
    News.countDocuments(filter),
  ]);

  return json({ page, limit, total, items });
}

export async function POST(req) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });
  await dbConnect();

  const body = await req.json(); // ✅ JSON payload
  const title = String(body.title || '').trim();
  if (!title) return json({ error: 'Title is required' }, { status: 400 });

  const slug = (body.slug && String(body.slug).trim()) ||
    slugify(title, { lower: true, strict: true });

  const doc = await News.create({
    title,
    slug,
    excerpt: body.excerpt || '',
    body: body.body || '',
    listingImage: body.listingImage || '',
    status: body.status === 'draft' ? 'draft' : 'published',
    categories: Array.isArray(body.categories) ? body.categories : [],
    blocks: Array.isArray(body.blocks) ? body.blocks : [],
  });

  return json(doc, { status: 201 });
}