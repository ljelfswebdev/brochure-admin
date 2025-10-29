// app/page.jsx
import { dbConnect } from '@/lib/db';
import Settings from '@/models/Settings';
import Page from '@/models/Page';

// Blocks
import Banner from '@/components/blocks/Banner';
import TextImage from '@/components/blocks/TextImage';
import Parallax from '@/components/blocks/Parallax';
import FAQs from '@/components/blocks/FAQs';
import ImagesSection from '@/components/blocks/ImagesSection';

// Rename the import to avoid conflict with `export const dynamic`
import dynamicImport from 'next/dynamic';
const TypewriterLoop = dynamicImport(() => import('@/components/TypewriterLoop'), { ssr: false });

const REGISTRY = {
  banner: Banner,
  'text-image': TextImage,
  parallax: Parallax,
  faqs: FAQs,
  'images-section': ImagesSection,
};

// This controls caching for the route (keep this name as `dynamic`)
export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();

  const s = await Settings.findOne().lean();

  // If homepageSlug is "/", map it to your canonical slug (e.g. "homepage")
  const preferredSlug = s?.homepageSlug === '/' ? 'homepage' : (s?.homepageSlug || null);

  // Resolve the page to render
  let doc = null;
  if (preferredSlug) {
    doc = await Page.findOne({ slug: preferredSlug }).lean();
  }
  if (!doc) doc = await Page.findOne({ slug: 'home' }).lean();        // fallback 1
  if (!doc) doc = await Page.findOne().sort({ createdAt: 1 }).lean(); // fallback 2

  if (!doc) {
    return (
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-xl font-semibold">Welcome</h1>
        <p>
          Create a page and set it as the Homepage in <strong>Admin → Settings</strong>.
        </p>
      </section>
    );
  }

  const blocks = Array.isArray(doc.blocks) ? doc.blocks : [];

  return (
    <section>
      <h1 className="sr-only">{doc.title || 'Home'}</h1>

      {blocks.map((b, i) => {
        const Cmp = REGISTRY[b?.type];
        if (!Cmp) return null;

        return (
          <div key={i}>
            {/* Render the block */}
            <Cmp {...b} />

            {/* ===== Inject custom content AFTER specific blocks ===== */}

            {i === 0 && (
              <section className="py-10 bg-black">
                <div className="container text-center">
                  <div className="text-white text-3xl md:text-5xl font-light tracking-wide">
                    <TypewriterLoop
                      texts={['Paz Gutiérrez', 'California Love']}
                      speed={100}
                      pause={1500}
                    />
                  </div>
                </div>
              </section>
            )}

            {i === 2 && (
              <section className="py-16 bg-black text-white">
                <div className="container text-center">
                  <h2 className="text-2xl font-medium">Another injected section</h2>
                  <p className="mt-2 text-white/80">Appears after the third block.</p>
                </div>
              </section>
            )}
          </div>
        );
      })}
    </section>
  );
}