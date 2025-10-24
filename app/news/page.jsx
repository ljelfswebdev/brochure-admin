// app/news/page.jsx
import { dbConnect } from '@/lib/db';
import News from '@/models/News';
import Category from '@/models/Category';
import Link from 'next/link';
import Image from 'next/image';
import NewsSidebar from '@/components/news/NewsSidebar';
import Paginator from '@/components/pagination/Paginator';

export const dynamic = 'force-dynamic';

export default async function NewsListing({ searchParams }) {
  await dbConnect();

  const q = searchParams.q || '';
  const catsMulti = Array.isArray(searchParams.cats)
    ? searchParams.cats
    : (searchParams.cats ? [searchParams.cats] : []);
  const singleCat = searchParams.cat ? [searchParams.cat] : [];
  const catIds = catsMulti.length ? catsMulti : singleCat;

  // pagination params
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const pageSize = Math.max(1, parseInt(searchParams.pageSize || '10', 10) || 10);
  const skip = (page - 1) * pageSize;

  const filter = {};
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (catIds.length) filter.categories = { $in: catIds };

  const [items, total, cats] = await Promise.all([
    News.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    News.countDocuments(filter),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  return (
    <section className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">News</h1>

      {/* grid with sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-6">
        <div>
          <NewsSidebar categories={cats} basePath="/news" />
        </div>

        <div className="space-y-6">
          {!items.length ? (
            <p className="text-sm text-gray-500">No news found.</p>
          ) : (
            <>
              {/* Responsive grid:
                  base: 1 col
                  sm: 2 cols
                  md: 1 col
                  lg+: 2 cols
               */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                {items.map((n) => {
                  const imgSrc =
                    n.listingImage && n.listingImage.trim()
                      ? n.listingImage
                      : '/images/placeholder.png'; // place in /public/images/placeholder.png

                  return (
                    <article key={n._id} className="border rounded-lg overflow-hidden bg-white">
                      <Link href={`/news/${n.slug}`} className="block group">
                        <div className="relative w-full aspect-[16/9]">
                          <Image
                            src={imgSrc}
                            alt={n.title || 'News image'}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover object-center transition-transform duration-200 group-hover:scale-[1.02]"
                            priority={false}
                          />
                        </div>
                        <div className="p-3">
                          <h2 className="font-medium group-hover:underline">{n.title}</h2>
                          {n.excerpt ? (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-3">{n.excerpt}</p>
                          ) : null}
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>

              {/* Generic paginator */}
              <Paginator
                total={total}
                page={page}
                pageSize={pageSize}
                pageSizeOptions={[10, 20, 50]}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}