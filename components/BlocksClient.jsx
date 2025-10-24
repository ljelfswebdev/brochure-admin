// components/BlocksClient.jsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

// Lazy versions of all block components
const LazyBanner = dynamic(() => import('@/components/blocks/Banner'), { ssr: true, loading: () => null });
const LazyTextImage = dynamic(() => import('@/components/blocks/TextImage'), { ssr: true, loading: () => null });
const LazyParallax = dynamic(() => import('@/components/blocks/Parallax'), { ssr: true, loading: () => null });
const LazyFAQs = dynamic(() => import('@/components/blocks/FAQs'), { ssr: true, loading: () => null });
const LazyImagesSection = dynamic(() => import('@/components/blocks/ImagesSection'), { ssr: true, loading: () => null });

const REGISTRY_LAZY = {
  'banner': LazyBanner,
  'text-image': LazyTextImage,
  'parallax': LazyParallax,
  'faqs': LazyFAQs,
  'images-section': LazyImagesSection,
};

// IntersectionObserver wrapper: only mount children when in view
function InViewMount({ children, margin = '200px' }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (!ref.current || seen) return;
    const el = ref.current;

    // If unsupported (very old browsers), just render
    if (!('IntersectionObserver' in window)) {
      setSeen(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSeen(true);
            io.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: margin, threshold: 0.01 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [seen, margin]);

  return <div ref={ref}>{seen ? children : null}</div>;
}

export default function BlocksClient({ blocks = [] }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <>
      {blocks.map((b, i) => {
        const Cmp = REGISTRY_LAZY[b.type];
        if (!Cmp) return null;

        // Each block mounts only when scrolled near the viewport
        return (
          <InViewMount key={i}>
            <Cmp {...b} />
          </InViewMount>
        );
      })}
    </>
  );
}