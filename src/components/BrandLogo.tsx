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
      className={`brand-logo brand-logo-${size} ${className}`}
      aria-label="LIBI DIAMONDS"
    >
      <img
        src={assetPath(asset)}
        alt=""
        className="brand-logo-asset"
        width="184"
        height="92"
        aria-hidden="true"
      />
    </Link>
  );
}
