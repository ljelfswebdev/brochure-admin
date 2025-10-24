export default function TextImage({ layout='text-left', text='', image='' }) {
  return (
    <section data-block='text-image' data-layout={layout}>
      <div>{text}</div>
      {image && <img src={image} alt='' />}
    </section>
  );
}
