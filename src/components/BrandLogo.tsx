import Link from "next/link";

type BrandLogoProps = {
  className?: string;
  onClick?: () => void;
  size?: "header" | "footer";
  variant?: "minimal" | "signature";
};

export default function BrandLogo({
  className = "",
  onClick,
  size = "header",
  variant = size === "header" ? "minimal" : "signature",
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`brand-logo brand-logo-${size} brand-logo-${variant} ${className}`}
      aria-label="LIBI DIAMONDS"
    >
      {variant === "minimal" ? (
        <img
          src="/brand/libi-diamonds-logo.svg"
          alt=""
          className="brand-logo-asset"
          width="360"
          height="150"
          aria-hidden="true"
        />
      ) : (
        <>
          <span className="brand-logo-name">LIBI</span>
          <span className="brand-logo-rule" aria-hidden>
            <span />
          </span>
          <span className="brand-logo-subtitle">DIAMONDS</span>
        </>
      )}
    </Link>
  );
}
