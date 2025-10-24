// app/news/page.jsx
import { dbConnect } from '@/lib/db';
import News from '@/models/News';
import Category from '@/models/Category';
import Link from 'next/link';
import NewsSidebar from '@/components/news/NewsSidebar';

export const dynamic = 'force-dynamic';

export default async function NewsListing({ searchParams }) {
  await dbConnect();

  const q = searchParams.q || '';
  const catsMulti = Array.isArray(searchParams.cats)
    ? searchParams.cats
    : (searchParams.cats ? [searchParams.cats] : []);
  // Back-compat: support single ?cat=
  const singleCat = searchParams.cat ? [searchParams.cat] : [];
  const catIds = catsMulti.length ? catsMulti : singleCat;

  const filter = {};
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (catIds.length) filter.categories = { $in: catIds };

  const [items, cats] = await Promise.all([
    News.find(filter).sort({ createdAt: -1 }).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  return (
    <section className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">News</h1>

      <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-6">
        <div>
          <NewsSidebar categories={cats} basePath="/news" />
        </div>

        <div>
          {!items.length ? (
            <p className="text-sm text-gray-500">No news found.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((n) => (
                <li key={n._id} className="border rounded-lg p-3">
                  <Link href={`/news/${n.slug}`} className="font-medium hover:underline">
                    {n.title}
                  </Link>
                  {n.excerpt ? <p className="text-sm mt-1">{n.excerpt}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}