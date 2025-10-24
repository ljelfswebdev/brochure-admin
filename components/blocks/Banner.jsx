export default function Banner({ slides = [], size='large' }) {
  return (
    <section data-block='banner' data-size={size}>
      {slides.map((s, i) => (
        <div key={i}>
          <img src={s.image} alt={s.title || ''} />
          <div>
            <h3>{s.subtitle}</h3>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
            {s.link?.url && <a href={s.link.url}>{s.link.text || 'Read more'}</a>}
          </div>
        </div>
      ))}
    </section>
  );
}
