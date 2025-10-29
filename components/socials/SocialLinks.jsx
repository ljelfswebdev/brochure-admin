// components/SocialLinks.jsx
import { dbConnect } from '@/lib/db';
import Settings from '@/models/Settings';
import SocialIcons from '@/components/socials/SocialIcons'; // separate icons helper (below)

export default async function SocialLinks({
  className = '',
  size = 32,
  showLabels = false,
  gap = 'gap-8',
  scheme = 'light',
}) {
  await dbConnect();
  const settings = await Settings.findOne().lean();
  const socials = settings?.socials || {};

  const links = Object.entries(socials)
    .filter(([_, v]) => !!v && v.trim() !== '')
    .map(([name, url]) => ({
      name,
      url: url.startsWith('http') ? url : `https://${url}`,
    }));

  if (!links.length) return null;

  const baseColor =
    scheme === 'dark'
      ? 'text-white hover:text-secondary'
      : 'text-black hover:text-primary';

  return (
    <nav aria-label="Social media" className={className}>
      <ul className={`pt-8 flex items-center flex-wrap ${gap}`}>
        {links.map(({ name, url }) => (
          <li key={name}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center transition-colors ${baseColor}`}
            >
              <SocialIcons name={name} size={size} />
              {showLabels && <span className="ml-2 capitalize">{name}</span>}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}