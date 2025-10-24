// app/[slug]/page.jsx
import { dbConnect } from '@/lib/db';
import Page from '@/models/Page';

// Block components you already have
import Banner from '@/components/blocks/Banner';
import TextImage from '@/components/blocks/TextImage';
import Parallax from '@/components/blocks/Parallax';
import FAQs from '@/components/blocks/FAQs';
import ImagesSection from '@/components/blocks/ImagesSection';

// Optional: your own templates for special pages
import ContactTemplate from '@/components/templates/ContactTemplate';
import NewsTemplate from '@/components/templates/NewsTemplate';

const registry = {
  banner: Banner,
  'text-image': TextImage,
  parallax: Parallax,
  faqs: FAQs,
  'images-section': ImagesSection,
};

export default async function PageBySlug({ params }) {
  await dbConnect();
  const doc = await Page.findOne({ slug: params.slug }).lean();

  if (!doc) {
    return (
      <section>
        <h1>Not found</h1>
        <p>No page for /{params.slug}</p>
      </section>
    );
  }

  if (doc.protected) {
    const top = doc.protectedBanners?.top;
    const bottom = doc.protectedBanners?.bottom;

    let Inner = null;
    if (doc.slug === 'contact') Inner = ContactTemplate;
    if (doc.slug === 'news') Inner = NewsTemplate;

    return (
      <section>
        {top ? <Banner {...top} /> : null}
        {Inner ? <Inner /> : <div>Template-controlled page</div>}
        {bottom ? <Banner {...bottom} /> : null}
      </section>
    );
  }

  return (
    <section>
      {(doc.blocks || []).map((b, i) => {
        const Cmp = registry[b.type];
        if (!Cmp) return null;
        return <Cmp key={i} {...(b.data || {})} />;
      })}
    </section>
  );
}