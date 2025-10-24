// app/page.jsx
import { dbConnect } from '@/lib/db';
import Settings from '@/models/Settings';
import Page from '@/models/Page';
import Banner from '@/components/blocks/Banner';
import TextImage from '@/components/blocks/TextImage';
import Parallax from '@/components/blocks/Parallax';
import FAQs from '@/components/blocks/FAQs';
import ImagesSection from '@/components/blocks/ImagesSection';

const registry = {
  banner: Banner,
  'text-image': TextImage,
  parallax: Parallax,
  faqs: FAQs,
  'images-section': ImagesSection
};

export default async function Home() {
  await dbConnect();
  const s = await Settings.findOne().lean();
  let doc = null;

  if (s?.homepageSlug) {
    doc = await Page.findOne({ slug: s.homepageSlug }).lean();
  }
  // Fallbacks: try a page with slug 'home', otherwise first created page
  if (!doc) doc = await Page.findOne({ slug: 'home' }).lean();
  if (!doc) doc = await Page.findOne().sort({ createdAt: 1 }).lean();

  if (!doc) {
    return (
      <section>
        <h1>Welcome</h1>
        <p>Create a page and set it as the Homepage in Admin → Settings.</p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="sr-only">{doc.title}</h1>
      {(doc.blocks || []).map((b, idx) => {
        const Cmp = registry[b.type];
        if (!Cmp) return null;
        return <Cmp key={idx} {...(b.data || {})} />;
      })}
    </section>
  );
}