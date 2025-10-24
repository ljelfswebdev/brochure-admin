// app/news/[slug]/page.jsx
import { dbConnect } from '@/lib/db';
import News from '@/models/News';
import Category from '@/models/Category';
import NewsSidebar from '@/components/news/NewsSidebar';
import Link from 'next/link';
import Image from 'next/image';

// Reuse page block components
import Banner from '@/components/blocks/Banner';
import TextImage from '@/components/blocks/TextImage';
import Parallax from '@/components/blocks/Parallax';
import FAQs from '@/components/blocks/FAQs';
import ImagesSection from '@/components/blocks/ImagesSection';

export const dynamic = 'force-dynamic';

const REGISTRY = {
  banner: Banner,
  'text-image': TextImage,
  parallax: Parallax,
  faqs: FAQs,
  'images-section': ImagesSection,
};

const PLACEHOLDER = '/images/placeholder.png';

// Normalize helper to tolerate different shapes
function normLink(v) {
  if (!v) return undefined;
  if (typeof v === 'string') return { url: v, text: v };
  return { url: v.url || '', text: v.text || v.url || '' };
}
function normImage(v) {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return v.url || v.secure_url || '';
}
function normHTML(v) {
  if (!v) return '';
  // allow CKEditor styles like { html: '<p>..</p>' } or raw string
  if (typeof v === 'string') return v;
  return v.html || v.value || '';
}

// Accept a bunch of shapes per block type
function normalizeBlock(b) {
  if (!b || typeof b !== 'object') return b;
  const type = b.type;

  if (type === 'parallax') {
    return {
      type,
      title: b.title || '',
      text: normHTML(b.text),
      link: normLink(b.link),
      image: normImage(b.image),
    };
  }

  if (type === 'text-image') {
    return {
      type,
      title: b.title || '',
      text: normHTML(b.text),
      image: normImage(b.image),
      layout: b.layout || 'text-left',
      fullWidthPosition: b.fullWidthPosition || 'none',
    };
  }

  if (type === 'banner') {
    const slides = Array.isArray(b.slides) ? b.slides.map(s => ({
      image: normImage(s.image),
      subtitle: s.subtitle || '',
      title: s.title || '',
      text: normHTML(s.text),
      link: normLink(s.link),
    })) : [];
    return { type, size: b.size || 'large', slides };
  }

  if (type === 'faqs') {
    const faqs = Array.isArray(b.faqs) ? b.faqs.map(f => ({
      question: f.question || '',
      answer: normHTML(f.answer),
    })) : [];
    return {
      type,
      title: b.title || '',
      text: normHTML(b.text),
      link: normLink(b.link),
      faqs,
    };
  }

  if (type === 'images-section') {
    const items = Array.isArray(b.items) ? b.items.map(it => ({
      image: normImage(it.image),
      title: it.title || '',
      text: normHTML(it.text),
      link: normLink(it.link),
    })) : [];
    return { type, items };
  }

  // Legacy simple blocks
  if (type === 'paragraph') {
    return { type, text: normHTML(b.text) };
  }
  if (type === 'image') {
    return { type, url: normImage(b.url || b.image), alt: b.alt || '' };
  }

  return b;
}

export default async function NewsDetail({ params }) {
  await dbConnect();

  const [item, cats] = await Promise.all([
    News.findOne({ slug: params.slug }).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  if (!item) {
    return (
      <section className="max-w-6xl mx-auto py-8">
        <h1 className="text-xl font-semibold">Not found</h1>
        <p>There is no news article at /news/{params.slug}</p>
        <p className="mt-4">
          <Link href="/news" className="text-blue-600 hover:underline">← Back to News</Link>
        </p>
      </section>
    );
  }

  const blocks = Array.isArray(item.blocks) ? item.blocks.map(normalizeBlock) : [];

  const heroImg = item.listingImage?.trim() ? item.listingImage : PLACEHOLDER;

  return (
    <section className="max-w-6xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-6">
        <div>
          <NewsSidebar categories={cats} basePath="/news" />
        </div>

        <article className="prose max-w-none">
          <h1>{item.title}</h1>

          {/* Optional listing/hero image */}
          {heroImg && (
            <div className="relative w-full aspect-[16/9] mb-6">
              <Image
                src={heroImg}
                alt={item.title || ''}
                fill
                sizes="100vw"
                className="object-cover object-center rounded-lg"
              />
            </div>
          )}

          {blocks.length ? (
            <div className="space-y-6">
              {blocks.map((b, i) => {
                const Cmp = REGISTRY[b.type];
                if (Cmp) return <Cmp key={i} {...b} />;

                if (b.type === 'paragraph' && b.text) {
                  return (
                    <div key={i} dangerouslySetInnerHTML={{ __html: b.text }} />
                  );
                }

                if (b.type === 'image' && (b.url || b.image)) {
                  const url = b.url || b.image || PLACEHOLDER;
                  return (
                    <div key={i} className="relative w-full aspect-[16/9]">
                      <Image
                        src={url}
                        alt={b.alt || item.title || ''}
                        fill
                        sizes="100vw"
                        className="object-cover object-center rounded-lg"
                      />
                    </div>
                  );
                }

                // Unknown/empty block → skip safely
                return null;
              })}
            </div>
          ) : item.body ? (
            <div dangerouslySetInnerHTML={{ __html: item.body }} />
          ) : null}
        </article>
      </div>
    </section>
  );
}