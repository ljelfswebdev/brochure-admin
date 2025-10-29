// components/SocialLinks.jsx
import { dbConnect } from '@/lib/db';
import Settings from '@/models/Settings';

const ICONS = {
  facebook: (size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.53 17.52 2 12 2S2 6.53 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.86h2.77l-.44 2.9h-2.33V22c4.78-.78 8.44-4.94 8.44-9.94Z" />
    </svg>
  ),
  instagram: (size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5ZM18 6.25a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 18 6.25Z"/>
    </svg>
  ),
  linkedIn: (size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.94 21H3.56V8.99h3.38V21ZM5.25 7.44a1.97 1.97 0 1 1 0-3.94 1.97 1.97 0 0 1 0 3.94ZM21 21h-3.36v-6.1c0-1.45-.03-3.32-2.03-3.32-2.04 0-2.35 1.59-2.35 3.22V21H9.9V8.99h3.22v1.64h.05c.45-.86 1.56-1.76 3.22-1.76 3.45 0 4.09 2.27 4.09 5.21V21Z"/>
    </svg>
  ),
  tiktok: (size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 8.5a7.5 7.5 0 0 1-5.1-2.03v8.2a5.67 5.67 0 1 1-4.9-5.62v3.04a2.56 2.56 0 1 0 1.9 2.47V2h3a4.5 4.5 0 0 0 4.1 4.46V8.5Z"/>
    </svg>
  ),
  x: (size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 3h4.6l5 6.9L18.7 3H21l-6.9 8.6L21 21h-4.6l-5.3-7.3L7 21H3l7.1-8.8L3 3Z"/>
    </svg>
  ),
  youtube: (size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 12c0 2.13-.2 3.57-.2 3.57a3.3 3.3 0 0 1-2.32 2.33C18.9 18.2 12 18.2 12 18.2s-6.9 0-8.48-.3A3.3 3.3 0 0 1 1.2 15.6S1 14.14 1 12s.2-3.58.2-3.58A3.3 3.3 0 0 1 3.5 6.1C5.1 5.8 12 5.8 12 5.8s6.9 0 8.48.3a3.3 3.3 0 0 1 2.33 2.33S23 9.87 23 12Zm-13.6 2.18 6.1-3.17-6.1-3.18v6.35Z"/>
    </svg>
  ),
};

function normalizeUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  // allow @handles for some networks
  if (url.startsWith('@')) return url;
  return `https://${url}`;
}

/**
 * Server component: fetches Settings.socials and renders icon links.
 * Props:
 *  - className: extra classes for the wrapper
 *  - size: icon size (px)
 *  - showLabels: show text labels after icons
 *  - gap: Tailwind gap utility (e.g. "gap-4")
 *  - scheme: "light" | "dark" (affects default colors)
 */
export default async function SocialLinks({
  className = '',
  size = 20,
  showLabels = false,
  gap = 'gap-4',
  scheme = 'light',
}) {
  await dbConnect();
  const settings = await Settings.findOne().lean();

  const socials = settings?.socials || {};
  const order = ['facebook', 'instagram', 'linkedIn', 'tiktok', 'x', 'youtube'];

  const items = order
    .map((k) => ({ key: k, url: normalizeUrl(socials[k]) }))
    .filter((it) => !!it.url && it.url !== 'https://');

  if (!items.length) return null;

  const baseColor = scheme === 'dark' ? 'text-white hover:text-secondary' : 'text-black hover:text-primary';

  return (
    <nav aria-label="Social media" className={className}>
      <ul className={`flex items-center ${gap}`}>
        {items.map(({ key, url }) => (
          <li key={key} className="flex items-center">
            <a
              href={url.startsWith('@') ? `https://instagram.com/${url.slice(1)}` : url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={key}
              className={`inline-flex items-center ${baseColor} transition-colors`}
              title={key}
            >
              <span className="inline-flex">{ICONS[key]?.(size)}</span>
              {showLabels && (
                <span className="ml-2 capitalize">{key === 'x' ? 'X' : key}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}