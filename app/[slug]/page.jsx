// app/[slug]/page.jsx
import { dbConnect } from '@/lib/db';
import Page from '@/models/Page';

// Synchronous (non-lazy) block components for the FIRST block only
import Banner from '@/components/blocks/Banner';
import TextImage from '@/components/blocks/TextImage';
import Parallax from '@/components/blocks/Parallax';
import FAQs from '@/components/blocks/FAQs';
import ImagesSection from '@/components/blocks/ImagesSection';

// Client wrapper that lazily loads blocks after the first
import BlocksClient from '@/components/BlocksClient';

// Optional templates for protected pages
function ContactTemplate() { return <div>Contact template content</div>; }
function NewsTemplate() { return <div>News template content</div>; }

const FIRST_BLOCK_REGISTRY = {
  'banner': Banner,
  'text-image': TextImage,
  'parallax': Parallax,
  'faqs': FAQs,
  'images-section': ImagesSection,
};

export default async function PageBySlug({ params }) {
  await dbConnect();
  const doc = await Page.findOne({ slug: params.slug }).lean();

  if (!doc) {
    return (
      <section className="max-w-4xl mx-auto py-10">
        <h1 className="text-xl font-semibold">Not found</h1>
        <p>No page for /{params.slug}</p>
      </section>
    );
  }

  // Protected/template-controlled pages
  if (doc.protected) {
    const top = doc.protectedBanners?.top;
    const bottom = doc.protectedBanners?.bottom;

    let Inner = null;
    if (doc.slug === 'contact') Inner = ContactTemplate;
    if (doc.slug === 'news') Inner = NewsTemplate;

    return (
      <section className="max-w-6xl mx-auto">
        {top ? <Banner {...top} /> : null}
        {Inner ? <Inner /> : <div>Template-controlled page</div>}
        {bottom ? <Banner {...bottom} /> : null}
      </section>
    );
  }

  const blocks = Array.isArray(doc.blocks) ? doc.blocks : [];
  const [first, ...rest] = blocks;

  return (
    <>
      {/* First block: render immediately, no lazy-loading */}
      {first ? (() => {
        const FirstCmp = FIRST_BLOCK_REGISTRY[first.type];
        return FirstCmp ? <FirstCmp {...first} /> : null;
      })() : null}

      {/* Remaining blocks: lazy load in the client */}
      {rest?.length ? <BlocksClient blocks={rest} /> : null}
    </>
  );
}