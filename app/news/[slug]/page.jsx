import { dbConnect } from '@/lib/db';
import News from '@/models/News';
import Banner from '@/components/blocks/Banner';
import TextImage from '@/components/blocks/TextImage';
import Parallax from '@/components/blocks/Parallax';
import FAQs from '@/components/blocks/FAQs';
import ImagesSection from '@/components/blocks/ImagesSection';
import { notFound } from 'next/navigation';

const registry = {
  banner: Banner,
  'text-image': TextImage,
  parallax: Parallax,
  faqs: FAQs,
  'images-section': ImagesSection
};

export default async function NewsDetail({ params }) {
  await dbConnect();
  const doc = await News.findOne({ slug: params.slug }).lean();
  if (!doc) return notFound();
  return (
    <article>
      <h1>{doc.title}</h1>
      {(doc.blocks || []).map((b, idx) => {
        const Cmp = registry[b.type];
        if (!Cmp) return null;
        return <Cmp key={idx} {...b.data} />;
      })}
    </article>
  );
}
