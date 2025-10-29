// components/blocks/ImagesSection.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function ImagesSection({ title, text, items }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length && !title && !text) return null;

  const count = list.length;

  const Card = ({ it }) => {
    const img = it?.image || '/images/placeholder.png';
    return (
      <div className="border-4 rounded  border-tertiary">
        <div className="relative w-full h-[400px] mb-2 overflow-hidden rounded">
          <Image
            src={img}
            alt={it?.title || ''}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain object-center"
            priority={false}
          />
        </div>

        <div className="p-4">
                  {it?.title ? <h3>{it.title}</h3> : null}

        {it?.text ? (
          <div
            className="prose max-w-none text-sm mt-2"
            dangerouslySetInnerHTML={{ __html: it.text }}
          />
        ) : null}

        {it?.link?.url ? (
          <Link
            href={it.link.url}
            className="button button--primary inline-block mt-3 !w-full"
          >
            {it.link.text || it.link.url}
          </Link>
        ) : null}
        </div>


      </div>
    );
  };

  return (
    <section data-block="images-section" className="py-10">
      <div className="container">
        {/* Section heading */}
        {(title || text) ? (
          <div className="max-w-3xl mx-auto text-center mb-8 px-4">
            {title ? <h3 className="">{title}</h3> : null}
            {text ? (
              <div
                className="prose prose-lg mx-auto mt-3"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            ) : null}
          </div>
        ) : null}

        {/* Mobile swiper for 2+ items */}
        {count > 1 && (
          <div className="md:hidden">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={16}
              slidesPerView={1}
            >
              {list.map((it, i) => (
                <SwiperSlide key={i}>
                  <Card it={it} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Static layouts from md+ */}
        <div className="hidden md:block">
          {/* 1 item — centered, max-w 400 */}
          {count === 1 && (
            <div className="flex justify-center">
              <div className="w-full max-w-[400px]">
                <Card it={list[0]} />
              </div>
            </div>
          )}

          {/* 2 items — two columns, each max-w 400, centered */}
          {count === 2 && (
            <div className="flex justify-center gap-6">
              {list.map((it, i) => (
                <div key={i} className="w-full max-w-[400px]">
                  <Card it={it} />
                </div>
              ))}
            </div>
          )}

          {/* 3+ items — responsive grid */}
          {count >= 3 && (
            <div className="grid gap-6 md:grid-cols-3">
              {list.map((it, i) => (
                <Card key={i} it={it} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Swiper pagination bullets color tweak */}
      <style jsx global>{`
        .swiper-pagination-bullets {
          bottom: 10px !important;
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
    </section>
  );
}