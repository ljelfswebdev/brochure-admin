// components/blocks/Banner.jsx
export default function Banner(props) {
  const size = props.size || 'large';
  const slides = Array.isArray(props.slides) ? props.slides : [];

  if (!slides.length) return null;

  return (
    <div data-block="banner" data-size={size} className="my-6">
      {slides.map((s, i) => (
        <div key={i} className="mb-4">
          {s.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.image} alt={s.title || s.subtitle || ''} className="w-full" />
          ) : null}
          {s.subtitle ? <div>{s.subtitle}</div> : null}
          {s.title ? <h2>{s.title}</h2> : null}
          {s.text ? <p>{s.text}</p> : null}
          {s.link?.url ? (
            <a href={s.link.url}>{s.link.text || s.link.url}</a>
          ) : null}
        </div>
      ))}
    </div>
  );
}