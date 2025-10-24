export default function ImagesSection({ items=[] }) {
  return (
    <section data-block='images-section'>
      {items.map((it, i) => (
        <figure key={i}>
          <img src={it.image} alt={it.title || ''} />
          <figcaption>
            <strong>{it.title}</strong>
            <p>{it.text}</p>
            {it.link?.url && <a href={it.link.url}>{it.link.text || 'Open'}</a>}
          </figcaption>
        </figure>
      ))}
    </section>
  );
}
