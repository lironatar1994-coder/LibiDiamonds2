import Link from "next/link";
import { assetPath } from "@/lib/site";

type BrandLogoProps = {
  className?: string;
  mobilePrimary?: boolean;
  onClick?: () => void;
  size?: "header" | "footer";
  tone?: "ink" | "inverse";
};

export default function BrandLogo({
  className = "",
  mobilePrimary = false,
  onClick,
  size = "header",
  // The footer sits on graphite, so it takes the inverse wordmark by default.
  tone = size === "footer" ? "inverse" : "ink",
}: BrandLogoProps) {
  const asset = tone === "inverse"
    ? "/brand/libi-diamonds-logo-inverse.svg"
    : "/brand/libi-diamonds-logo.svg";
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`brand-logo brand-logo-${size} ${mobilePrimary ? "brand-logo-mobile-primary" : ""} ${className}`}
      aria-label="LIBI DIAMONDS"
    >
      <img
        src={assetPath(asset)}
        alt=""
        className="brand-logo-asset brand-logo-asset-wordmark"
        width="184"
        height="92"
        aria-hidden="true"
      />
      {mobilePrimary && tone === "ink" && (
        <span className="brand-logo-mobile-lockup" aria-hidden="true">
          <img
            src={assetPath("/brand/libi-diamonds-mark.svg")}
            alt=""
            className="brand-logo-mobile-mark"
            width="100"
            height="100"
          />
          <img
            src={assetPath("/brand/libi-diamonds-logo.svg")}
            alt=""
            className="brand-logo-mobile-wordmark"
            width="184"
            height="92"
          />
        </span>
      )}
    </Link>
  );
}
