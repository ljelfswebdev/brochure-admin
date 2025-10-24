// components/blocks/FAQs.jsx
export default function FAQs({ title, text, link, faqs }) {
  const items = Array.isArray(faqs) ? faqs : [];
  if (!items.length && !title && !text) return null;

  return (
    <div data-block="faqs" className="my-6">
      {title ? <h2>{title}</h2> : null}
      {text ? <p>{text}</p> : null}
      <div className="space-y-2">
        {items.map((f, i) => (
          <details key={i} className="border rounded">
            <summary className="p-2 font-medium">{f.question}</summary>
            <div className="p-2">{f.answer}</div>
          </details>
        ))}
      </div>
      {link?.url ? <a href={link.url}>{link.text || link.url}</a> : null}
    </div>
  );
}