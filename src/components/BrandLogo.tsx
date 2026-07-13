import Link from "next/link";
import { assetPath } from "@/lib/site";

type BrandLogoProps = {
  className?: string;
  onClick?: () => void;
  size?: "header" | "footer";
  tone?: "ink" | "inverse";
};

export default function BrandLogo({
  className = "",
  onClick,
  size = "header",
  // the footer sits on graphite, so it takes the inverse asset by default
  tone = size === "footer" ? "inverse" : "ink",
}: BrandLogoProps) {
  // footer shows the full lockup (heart mark + wordmark) tuned for its size
  const asset =
    size === "footer"
      ? "/brand/libi-diamonds-logo-footer.svg"
      : tone === "inverse"
        ? "/brand/libi-diamonds-logo-inverse.svg"
        : "/brand/libi-diamonds-logo.svg";
  const height = size === "footer" ? "250" : "150";
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`brand-logo brand-logo-${size} ${className}`}
      aria-label="LIBI DIAMONDS"
    >
      <img
        src={assetPath(asset)}
        alt=""
        className="brand-logo-asset"
        width="360"
        height={height}
        aria-hidden="true"
      />
    </Link>
  );
}
