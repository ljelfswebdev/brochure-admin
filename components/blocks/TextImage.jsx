'use client';

import Image from 'next/image';

export default function TextImage({
  title,
  text,
  image,
  layout = 'text-left',
  fullWidthPosition = 'none',
}) {
  // Layouts: 'text-left' | 'text-right' | 'full'
  // fullWidthPosition: 'none' | 'top' | 'bottom' (only used when layout === 'full')

  return (
    <section data-block="text-image" className="my-6">
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
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">{title}</h2>
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
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={image}
                alt={title || ''}
                fill
                sizes="50vw"
                className="object-cover object-center rounded-lg"
              />
            </div>
          ) : null}

          <div
            className={`px-4 ${
              layout === 'text-right' ? 'md:[direction:ltr]' : ''
            }`}
          >
            {title ? (
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                {title}
              </h2>
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
    </section>
  );
}