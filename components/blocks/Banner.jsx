'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Banner(props) {
  const size = props.size || 'large';
  const slides = Array.isArray(props.slides) ? props.slides : [];

  if (!slides.length) return null;

  const padClass = useMemo(() => {
    if (size === 'small') return 'py-20';
    if (size === 'medium') return 'py-32';
    return 'py-48';
  }, [size]);

  const getUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    return img.url || img.secure_url || '';
  };

  // Single slide content (with zoom-in effect)
  const Content = ({ s, active }) => {
    const imgUrl = getUrl(s.image);
    return (
      <section
        className={`relative w-full overflow-hidden ${padClass}`}
      >
        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          {imgUrl && (
            <motion.div
              key={imgUrl}
              initial={{ scale: 1 }}
              animate={active ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 6, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <Image
                src={imgUrl}
                alt={s.title || s.subtitle || ''}
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority={false}
              />
            </motion.div>
          )}
          <div className="absolute inset-0 bg-black/25" />
        </div>

        {/* Centered text */}
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            {s.subtitle ? <div className="mb-2">{s.subtitle}</div> : null}
            {s.title ? (
              <h2 className="text-3xl md:text-5xl font-semibold">{s.title}</h2>
            ) : null}
            {s.text ? (
              <div
                className="mt-3 text-base md:text-lg"
                dangerouslySetInnerHTML={{ __html: s.text }}
              />
            ) : null}
            {s.link?.url ? (
              <div className="mt-6">
                <Link href={s.link.url} className="button button--primary">
                  {s.link.text || s.link.url}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  };

  // SINGLE SLIDE — simple fade-in zoom
  if (slides.length === 1) {
    return (
      <div data-block="banner" data-size={size} className="w-full">
        <Content s={slides[0]} active />
      </div>
    );
  }

  // MULTI SLIDE — Swiper with zoom-in on active slide
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div data-block="banner" data-size={size} className="w-full">
      <div className="text-primary">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          slidesPerView={1}
          loop
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        >
          {slides.map((s, i) => (
            <SwiperSlide key={i}>
              <Content s={s} active={i === activeIndex} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Pagination styling */}
      <style jsx global>{`
        .swiper-pagination-bullets {
          bottom: 12px !important;
        }
        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: currentColor;
          opacity: 0.4;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}