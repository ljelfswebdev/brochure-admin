// app/news/[slug]/page.jsx
import { dbConnect } from '@/lib/db';
import News from '@/models/News';
import Category from '@/models/Category';
import NewsSidebar from '@/components/news/NewsSidebar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
        <p className="mt-4"><Link href="/news" className="text-blue-600 hover:underline">← Back to News</Link></p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-6">
        <div>
          <NewsSidebar categories={cats} basePath="/news" />
        </div>

        <article className="prose max-w-none">
          <h1>{item.title}</h1>
          {Array.isArray(item.blocks) && item.blocks.length ? (
            <div className="space-y-4">
              {item.blocks.map((b, i) => {
                // render your news blocks however you like
                if (b.type === 'paragraph') return <p key={i}>{b.text}</p>;
                if (b.type === 'image') {
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={b.url} alt={b.alt || ''} />
                  );
                }
                return null;
              })}
            </div>
          ) : (
            item.body ? <p>{item.body}</p> : null
          )}
        </article>
      </div>
    </section>
  );
}