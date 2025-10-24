// app/api/admin/pages/route.js
import Page from '@/models/Page';
import slugify from 'slugify';
import { json, requireRole } from '../_utils';

export async function GET(req) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);

  const total = await Page.countDocuments();
  const items = await Page.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return json({ items, total, page, limit });
}

export async function POST(req) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  const body = await req.json();
  const title = String(body.title || '').trim();
  if (!title) return json({ error: 'Title required' }, { status: 400 });

  const slug = String(body.slug || '').trim() || slugify(title, { lower: true, strict: true });
  const blocks = Array.isArray(body.blocks) ? body.blocks : [];
  const protectedFlag = !!body.protected;
  const protectedBanners = body.protectedBanners && typeof body.protectedBanners === 'object'
    ? body.protectedBanners
    : undefined;

  const doc = await Page.create({
    title,
    slug,
    blocks: protectedFlag ? [] : blocks,
    protected: protectedFlag,
    protectedBanners,
  });

  return json(doc);
}