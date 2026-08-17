/* Service glyphs drawn in the site's 1.5-stroke icon voice (see icons.tsx /
   ProductView glyphs). Used by the PDP assurance row. */
export function CertificateGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M5 3.75h14v16.5H5z" strokeLinejoin="round" />
      <path d="M8.5 7.5h7M8.5 10.5h7" strokeLinecap="round" />
      <path d="m12 13.6 1.9 1.9-1.9 1.9-1.9-1.9z" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.4 7 9 4.1-1.6 7-4.8 7-9V6z" strokeLinejoin="round" />
      <path d="m9.2 11.8 2 2 3.6-3.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ReturnGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M5.5 9.5a7 7 0 1 1-1 5.2" strokeLinecap="round" />
      <path d="M5 5v4.7h4.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
