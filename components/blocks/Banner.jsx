'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Banner(props) {
  const size = props.size || 'large';
  const slides = Array.isArray(props.slides) ? props.slides : [];

  const padClass = useMemo(() => {
    if (size === 'small') return 'py-20';
    if (size === 'medium') return 'py-32';
    return 'py-48'; // large
  }, [size]);

  if (!slides.length) return null;

  // normalize helper: accept string or object with url/secure_url
  const getUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    return img.url || img.secure_url || '';
  };

  const Content = ({ s }) => {
    const imgUrl = getUrl(s.image);
    return (
      <section
        className={`relative w-full overflow-hidden ${padClass}`}
        // full-width background image
      >
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt={s.title || s.subtitle || ''}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority={false}
            />
          ) : null}
          {/* optional subtle overlay for legibility; remove if you don't want it */}
          <div className="absolute inset-0 bg-black/25" />
        </div>

        {/* Centered content */}
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            {s.subtitle ? <div className="mb-2">{s.subtitle}</div> : null}
            {s.title ? (
              <h2 className="text-3xl md:text-5xl font-semibold">
                {s.title}
              </h2>
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

  // Single slide: no Swiper
  if (slides.length === 1) {
    return (
      <div data-block="banner" data-size={size} className="w-full">
        <Content s={slides[0]} />
      </div>
    );
  }

  // Multiple slides: Swiper with pagination dots (primary color)
  return (
    <div data-block="banner" data-size={size} className="w-full">
      {/* Wrap with text-primary so bullets use your primary color via currentColor */}
      <div className="text-primary">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          slidesPerView={1}
          loop={true}
        >
          {slides.map((s, i) => (
            <SwiperSlide key={i}>
              <Content s={s} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Make Swiper bullets small and use currentColor (inherits from text-primary wrapper) */}
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