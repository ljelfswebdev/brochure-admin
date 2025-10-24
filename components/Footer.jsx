import Menu from '@/models/Menu';
import { dbConnect } from '@/lib/db';
import Link from 'next/link';

export default async function Footer() {
  await dbConnect();
  const footer = await Menu.findOne({ key: 'footer' }).lean();
  return (
    <footer>
      <ul>
        {(footer?.items || []).map((it, idx) => (
          <li key={idx}><Link href={it.url}>{it.label}</Link></li>
        ))}
      </ul>
    </footer>
  );
}
