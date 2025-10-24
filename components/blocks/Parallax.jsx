// components/blocks/Parallax.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Parallax({ title, text, link, image }) {
  const wrapRef = useRef(null);
  const [y, setY] = useState(0);

  // simple parallax: translate the bg image a bit on scroll
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight || 0;
      const centerDelta = rect.top + rect.height / 2 - viewportH / 2;
      const translate = Math.max(-40, Math.min(40, centerDelta * 0.08)); // clamp
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(translate));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section
      ref={wrapRef}
      data-block="parallax"
      className="relative w-full overflow-hidden py-20"
    >
      {/* Background image behind content */}
      <div
        className="absolute inset-0 -z-10 will-change-transform"
        style={{ transform: `translateY(${y}px)` }}
        aria-hidden="true"
      >
        {image && (
          <Image
            src={image}
            alt={title || ''}
            fill
            sizes="100vw"
            priority={false}
            className="object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 text-center text-white">
        {title ? <h2 className="text-3xl md:text-5xl font-semibold">{title}</h2> : null}

        {text ? (
          <div
            className="mt-3 text-base md:text-lg"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        ) : null}

        {link?.url ? (
          <Link
            href={link.url}
            className="mt-6 inline-block rounded-lg bg-white/90 px-6 py-3 font-medium text-black hover:bg-white transition"
          >
            {link.text || link.url}
          </Link>
        ) : null}
      </div>
    </section>
  );
}