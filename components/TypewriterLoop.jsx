'use client';
import { useEffect, useState } from 'react';


export default function TypewriterLoop({ texts = [], speed = 100, pause = 1500 }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  // Main typing effect
  useEffect(() => {
    if (!texts.length) return;

    const currentText = texts[index];
    let timeout;

    if (!deleting && subIndex < currentText.length) {
      timeout = setTimeout(() => setSubIndex(subIndex + 1), speed);
    } else if (deleting && subIndex > 0) {
      timeout = setTimeout(() => setSubIndex(subIndex - 1), speed / 2);
    } else if (!deleting && subIndex === currentText.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((index + 1) % texts.length);
    }

    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index, texts, speed, pause]);

  // Cursor blink
  useEffect(() => {
    const cursor = setInterval(() => setBlink((b) => !b), 500);
    return () => clearInterval(cursor);
  }, []);

  return (
    <span className="h3">
      {texts[index].substring(0, subIndex)}
      <span className={`${blink ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
    </span>
  );
}