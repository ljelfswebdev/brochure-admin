export default function Parallax({ title, text, link, image }) {
  return (
    <section data-block='parallax'>
      <h2>{title}</h2>
      <p>{text}</p>
      {link?.url && <a href={link.url}>{link.text || 'Learn more'}</a>}
      {image && <img src={image} alt='' />}
    </section>
  );
}
