export default function BrandSignature({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-signature ${className}`} aria-hidden="true">
      <span className="brand-signature-line" />
      <span className="brand-signature-diamond" />
      <span className="brand-signature-line" />
    </span>
  );
}
