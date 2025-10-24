// app/api/admin/pages/[id]/route.js
import Page from '@/models/Page';
import { dbConnect } from '@/lib/db';
import { json, requireRole } from '../../_utils';

function normString(v) { return v == null ? '' : String(v); }

export async function GET(_req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  await dbConnect();
  const doc = await Page.findById(params.id).lean();
  if (!doc) return json({ error: 'Not found' }, { status: 404 });
  return json(doc);
}

export async function PATCH(req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  await dbConnect();
  const body = await req.json();
  const update = {};

  if (body.title != null) update.title = normString(body.title);
  if (body.slug != null) update.slug = normString(body.slug);
  if (typeof body.protected === 'boolean') update.protected = body.protected;

  if (Array.isArray(body.blocks)) {
    const mapped = body.blocks.map((b) => {
      if (!b || typeof b !== 'object') return b;
      const type = String(b.type || '');

      if (type === 'banner') {
        const slides = Array.isArray(b.slides) ? b.slides.map(s => ({
          image: normString(s?.image),
          subtitle: normString(s?.subtitle),
          title: normString(s?.title),
          text: normString(s?.text),
          link: s?.link ? { text: normString(s.link.text), url: normString(s.link.url) } : undefined,
        })) : [];
        return { type, size: b.size || 'large', slides };
      }

      if (type === 'text-image') {
        return {
          type,
          title: normString(b.title),
          text: normString(b.text),
          image: normString(b.image),
          layout: ['text-left','text-right','full'].includes(b.layout) ? b.layout : 'text-left',
          fullWidthPosition: ['none','top','bottom'].includes(b.fullWidthPosition) ? b.fullWidthPosition : 'none',
        };
      }

      if (type === 'parallax') {
        return {
          type,
          title: normString(b.title),
          text: normString(b.text),
          link: b?.link ? { text: normString(b.link.text), url: normString(b.link.url) } : undefined,
          image: normString(b.image),
        };
      }

      if (type === 'faqs') {
        const faqs = Array.isArray(b.faqs) ? b.faqs.map(f => ({
          question: normString(f?.question),
          answer: normString(f?.answer),
        })) : [];
        return {
          type,
          title: normString(b.title),
          text: normString(b.text),
          link: b?.link ? { text: normString(b.link.text), url: normString(b.link.url) } : undefined,
          faqs,
        };
      }

      if (type === 'images-section') {
        const items = Array.isArray(b.items) ? b.items.map(it => ({
          image: normString(it?.image),
          title: normString(it?.title),
          text: normString(it?.text),
          link: it?.link ? { text: normString(it.link.text), url: normString(it.link.url) } : undefined,
        })) : [];
        return { type, items };
      }

      return { ...b, type };
    });

    update.blocks = body.protected ? [] : mapped;
  }

  if (body.protectedBanners && typeof body.protectedBanners === 'object') {
    update.protectedBanners = body.protectedBanners;
  }

  const doc = await Page.findByIdAndUpdate(params.id, update, { new: true, runValidators: true }).lean();
  if (!doc) return json({ error: 'Not found' }, { status: 404 });
  return json(doc);
}

export async function DELETE(_req, { params }) {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  await dbConnect();
  await Page.findByIdAndDelete(params.id);
  return json({ ok: true });
}