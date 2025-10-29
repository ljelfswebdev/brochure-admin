// components/SocialLinksClient.jsx
'use client';
import { useEffect, useState } from 'react';
import SocialIcons from '@/components/socials/SocialIcons';

export default function SocialLinksClient({
  className = '',
  size = 32,
  showLabels = false,
  gap = 'gap-8',
  scheme = 'light',
}) {
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/admin/settings', { cache: 'no-store' });
      const s = await r.json();
      const links = Object.entries(s.socials || {})
        .filter(([_, v]) => !!v && v.trim() !== '')
        .map(([name, url]) => ({
          name,
          url: url.startsWith('http') ? url : `https://${url}`,
        }));
      setSocials(links);
    })();
  }, []);

  if (!socials.length) return null;
  const baseColor =
    scheme === 'light'
      ? 'text-white hover:text-secondary'
      : 'text-black hover:text-primary';

  return (
    <nav aria-label="Social media" className={className}>
      <ul className={`pt-8 flex items-center flex-wrap ${gap}`}>
        {socials.map(({ name, url }) => (
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