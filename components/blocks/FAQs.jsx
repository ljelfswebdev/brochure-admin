// components/blocks/FAQs.jsx
import Link from 'next/link';

export default function FAQs({ title, text, link, faqs }) {
  const items = Array.isArray(faqs) ? faqs : [];
  if (!items.length && !title && !text) return null;

  return (
    <section data-block="faqs" className="py-20 bg-linear text-white">
      <div className="container">
        <div className="flex flex-col max-w-5xl mx-auto gap-8">
          {title ? <h2 className="h2 text-center">{title}</h2> : null}
          {text ? <p className="text-center">{text}</p> : null}

          <div className="space-y-3">
            {items.map((f, i) => {
              const q = f?.question || '';
              const id = `faq-${i}`;
              return (
                <div key={i} className="rounded overflow-hidden border border-white/20 bg-white/5">
                  {/* Hidden checkbox controls open/closed */}
                  <input
                    id={id}
                    type="checkbox"
                    className="peer sr-only"
                    // defaultChecked={false} // uncomment if you want one open by default
                  />

                  {/* Label row */}
                  <label
                    htmlFor={id}
                    className="flex w-full items-center justify-between gap-4 cursor-pointer select-none px-4 py-3"
                  >
                    <span className="font-medium">{q}</span>

                    {/* Plus / minus icon (toggles via peer-checked) */}
                    <span className="ml-auto inline-flex h-6 w-6 items-center justify-center">
                      {/* Plus */}
                      <svg
                        className="peer-checked:hidden block"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Minus */}
                      <svg
                        className="peer-checked:block hidden"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </label>

                  {/* Answer panel */}
                  <div className="max-h-0 overflow-hidden transition-all duration-300 ease-in-out peer-checked:max-h-[1000px]">
                    <div
                      className="px-4 pb-4 pt-0 text-sm leading-relaxed bg-white/10"
                      dangerouslySetInnerHTML={{ __html: f?.answer || '' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {link?.url ? (
            <div className="text-center mt-6">
              <Link href={link.url} className="button button--primary inline-block">
                {link.text || link.url}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}