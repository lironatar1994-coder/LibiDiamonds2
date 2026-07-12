import type { Metadata } from "next";
import HeroMotionPreview from "@/components/HeroMotionPreview";

export const metadata: Metadata = {
  title: "Hero motion preview",
  robots: { index: false, follow: false },
};

export default function HeroPreviewPage() {
  return <HeroMotionPreview />;
}
