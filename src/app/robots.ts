import type { MetadataRoute } from "next";
import { absoluteUrl, allowIndexing } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (allowIndexing) {
    return {
      rules: [{ userAgent: "*", allow: "/" }],
      sitemap: absoluteUrl("/sitemap.xml"),
    };
  }

  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
