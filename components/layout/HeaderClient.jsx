// components/layout/HeaderClient.jsx
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

export default function HeaderClient({ items = [], phone = '' }) {
  const [open, setOpen] = useState(false);

  // normalize phone for tel: links
  const telHref = useMemo(() => {
    const digits = String(phone || '').replace(/[^\d+]/g, '');
    return digits ? `tel:${digits}` : '';
  }, [phone]);

  // Simple animation variants for the full-screen menu
  const overlayVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { when: 'beforeChildren', staggerChildren: 0.08 } },
    exit: { opacity: 0 },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      {/* Mobile call bar (visible < md) */}
      {telHref && (
        <div className="md:hidden bg-secondary">
          <div className="container mx-auto px-4">
            <a
              href={telHref}
              className="block w-full text-center py-2 text-white font-medium"
            >
              Call us: {phone}
            </a>
          </div>
        </div>
      )}

      {/* Main header */}
      <header className="w-full bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Left: brand */}
            <Link href="/" className="font-semibold tracking-tight">
              My app
            </Link>

            {/* Desktop nav (≥ md) */}
            <div className="hidden md:flex items-center gap-6">
              <nav>
                <ul className="flex items-center gap-6">
                  {items.map((it, idx) => (
                    <li key={idx}>
                      <Link href={it.url || '#'} className="hover:opacity-80">
                        {it.label || it.title || 'Link'}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              {telHref && (
                <a href={telHref} className="button button--primary">
                  Call {phone}
                </a>
              )}
            </div>

            {/* Mobile hamburger (< md) */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded hover:bg-white/10"
              aria-label="Open menu"
              aria-expanded={open ? 'true' : 'false'}
              onClick={() => setOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              {/* simple hamburger icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.aside
            className="fixed inset-0 z-50 bg-black text-white"
            initial="hidden"
            animate="show"
            exit="exit"
            variants={overlayVariants}
          >
            <div className="container mx-auto px-4 h-full flex flex-col">
              {/* top bar with close + optional call button */}
              <div className="flex items-center justify-between h-14">
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-10 h-10 rounded hover:bg-white/10"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  {/* X icon */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>

                {telHref && (
                  <a
                    href={telHref}
                    className="button button--primary"
                    onClick={() => setOpen(false)}
                  >
                    Call {phone}
                  </a>
                )}
              </div>

              {/* Links list (centered) */}
              <motion.ul className="flex-1 flex flex-col items-center justify-center gap-4 text-lg">
                {items.map((it, idx) => (
                  <motion.li key={idx} variants={itemVariants}>
                    <Link
                      href={it.url || '#'}
                      className="hover:opacity-80"
                      onClick={() => setOpen(false)}
                    >
                      {it.label || it.title || 'Link'}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              {/* optional footer area */}
              <div className="h-14" />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}