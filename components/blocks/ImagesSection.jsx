// components/blocks/ImagesSection.jsx
export default function ImagesSection({ items }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;

  return (
    <div data-block="images-section" className="my-6 grid gap-4 md:grid-cols-3">
      {list.map((it, i) => (
        <div key={i} className="border rounded p-2">
          {it.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={it.image} alt={it.title || ''} className="w-full mb-2" />
          ) : null}
          {it.title ? <h3>{it.title}</h3> : null}
          {it.text ? <p>{it.text}</p> : null}
          {it.link?.url ? <a href={it.link.url}>{it.link.text || it.link.url}</a> : null}
        </div>
      ))}
    </div>
  );
}