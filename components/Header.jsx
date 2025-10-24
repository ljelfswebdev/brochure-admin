import Menu from '@/models/Menu';
import { dbConnect } from '@/lib/db';
import Link from 'next/link';

export default async function Header() {
  await dbConnect();
  const header = await Menu.findOne({ key: 'header' }).lean();
  return (
    <header>
      <nav>
        <ul>
          {(header?.items || []).map((it, idx) => (
            <li key={idx}><Link href={it.url}>{it.label}</Link></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
