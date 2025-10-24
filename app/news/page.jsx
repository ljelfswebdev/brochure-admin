import { dbConnect } from '@/lib/db';
import News from '@/models/News';
import Category from '@/models/Category';
import Link from 'next/link';

export default async function NewsListing({ searchParams }) {
  await dbConnect();
  const q = searchParams.q || '';
  const cat = searchParams.cat || '';
  const filter = {};
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (cat) filter.categories = cat;
  const items = await News.find(filter).lean();
  const cats = await Category.find().lean();

  return (
    <section>
      <h1>News</h1>
      <form>
        <input name="q" defaultValue={q} placeholder="Search news..." />
        <select name="cat" defaultValue={cat}>
          <option value="">All categories</option>
          {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <button type="submit">Filter</button>
      </form>
      <ul>
        {items.map(n => (
          <li key={n._id}>
            <Link href={`/news/${n.slug}`}>{n.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
