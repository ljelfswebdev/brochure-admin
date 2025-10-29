// components/blocks/TextImage.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * Props:
 *  - title (string)
 *  - text (HTML string)
 *  - image (url)
 *  - layout: 'text-left' | 'text-right' | 'full'
 *  - fullWidthPosition: 'none' | 'top' | 'bottom' (only used when layout === 'full')
 *  - typeSpeed (ms per character) optional, default 40
 *  - triggerThreshold (0..1) optional, default 0.5 (fires when 50% visible)
 */
export default function TextImage({
  title,
  text,
  image,
  layout = 'text-left',
  fullWidthPosition = 'none',
  typeSpeed = 40,
  triggerThreshold = 0.5,
}) {
  const sectionRef = useRef(null);

  // typing state
  const [hasTriggered, setHasTriggered] = useState(false);
  const [typed, setTyped] = useState('');

  // Observe the section; trigger once when ~50% visible
  useEffect(() => {
    if (!sectionRef.current || !title) return;

    const el = sectionRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio >= triggerThreshold) {
          setHasTriggered(true);
        }
      },
      { threshold: buildThresholdList() } // fine-grained thresholds
    );

    io.observe(el);
    return () => io.disconnect();
  }, [title, triggerThreshold]);

  // Typewriter effect (runs once)
  useEffect(() => {
    if (!hasTriggered || !title) return;
    let i = 0;
    let raf = 0;
    let lastTime = 0;

    // Use rAF + accumulator for stable timing
    const step = (time) => {
      if (!lastTime) lastTime = time;
      const dt = time - lastTime;
      if (dt >= typeSpeed) {
        i += Math.max(1, Math.floor(dt / typeSpeed));
        lastTime = time;
        setTyped(title.slice(0, i));
      }
      if (i < title.length) {
        raf = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(raf);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [hasTriggered, title, typeSpeed]);

  // Helper to build many thresholds for smoother intersectionRatio
  function buildThresholdList() {
    const steps = 20;
    return Array.from({ length: steps + 1 }, (_, i) => i / steps);
  }

  // Render typed title if present, otherwise keep empty (no flash)
  const Title = ({ className = '' }) =>
    title ? <h2 className={className} aria-label={title}>{typed}</h2> : null;

  return (
    <section ref={sectionRef} data-block="text-image" className="py-20 bg-linear">
      <div className="container">
        {layout === 'full' ? (
          <div className="max-w-5xl mx-auto px-4 text-center">
            {fullWidthPosition === 'top' && image ? (
              <div className="relative w-full aspect-[16/9] mb-6">
                <Image
                  src={image}
                  alt={title || ''}
                  fill
                  sizes="100vw"
                  className="object-cover object-center rounded-lg"
                />
              </div>
            ) : null}

            {title ? (
              <Title className="h3 mb-4" />
            ) : null}

            {text ? (
              <div
                className="prose prose-lg mx-auto"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            ) : null}

            {fullWidthPosition === 'bottom' && image ? (
              <div className="relative w-full aspect-[16/9] mt-6">
                <Image
                  src={image}
                  alt={title || ''}
                  fill
                  sizes="100vw"
                  className="object-cover object-center rounded-lg"
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div
            className={`grid gap-8 md:grid-cols-2 items-center ${
              layout === 'text-right' ? 'md:[direction:rtl]' : ''
            }`}
          >
            {image ? (
              <div className="aspect-square w-full rounded-full overflow-hidden relative">
                <Image
                  src={image}
                  alt={title || ''}
                  fill
                  sizes="50vw"
                  className="object-cover object-center rounded-lg"
                />
              </div>
            ) : null}

            <div className={`px-4 ${layout === 'text-right' ? 'md:[direction:ltr]' : ''}`}>
              {title ? (
                <Title className="h3 mb-4" />
              ) : null}

              {text ? (
                <div
                  className="prose prose-lg"
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}