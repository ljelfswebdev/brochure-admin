export default function FAQs({ title, text, link, faqs=[] }) {
  return (
    <section data-block='faqs'>
      <h2>{title}</h2>
      <p>{text}</p>
      <ul>
        {faqs.map((f, i) => (
          <li key={i}>
            <strong>{f.question}</strong>
            <div>{f.answer}</div>
          </li>
        ))}
      </ul>
      {link?.url && <a href={link.url}>{link.text || 'More'}</a>}
    </section>
  );
}
