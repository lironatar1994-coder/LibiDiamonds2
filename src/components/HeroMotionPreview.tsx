"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { assetPath, defaultWaMessage, waLink } from "@/lib/site";

type MotionMode = "video" | "cinemagraph";
type ViewportMode = "mobile" | "desktop";

const media = {
  mobile: {
    poster: "/images/hero/v3/hero-motion-mobile.webp",
    webm: "/videos/hero/v1/hero-loop-mobile.webm",
    mp4: "/videos/hero/v1/hero-loop-mobile.mp4",
  },
  desktop: {
    poster: "/images/hero/v3/hero-motion-desktop.webp",
    webm: "/videos/hero/v1/hero-loop-desktop.webm",
    mp4: "/videos/hero/v1/hero-loop-desktop.mp4",
  },
} as const;

function StaticMedia({ viewport, motion = false }: { viewport: ViewportMode; motion?: boolean }) {
  const item = media[viewport];

  return (
    <div className={motion ? "hero-cinemagraph-media absolute inset-0" : "absolute inset-0"}>
      <Image
        src={assetPath(item.poster)}
        alt="טבעת סוליטר גדולה בזהב צהוב עם יהלום מעבדה עגול"
        fill
        priority
        unoptimized
        sizes={viewport === "desktop" ? "58vw" : "100vw"}
        className={viewport === "desktop" ? "object-cover" : "object-cover object-[center_62%]"}
      />
      {motion && <span className={`hero-cinemagraph-glint hero-cinemagraph-glint-${viewport}`} aria-hidden />}
    </div>
  );
}

function MotionMedia({ mode, viewport, reduceMotion }: { mode: MotionMode; viewport: ViewportMode | null; reduceMotion: boolean }) {
  const fallbackViewport = viewport ?? "mobile";

  if (reduceMotion || viewport === null) {
    return <StaticMedia viewport={fallbackViewport} />;
  }

  if (mode === "cinemagraph") {
    return <StaticMedia viewport={viewport} motion />;
  }

  const item = media[viewport];
  return (
    <video
      key={viewport}
      className={viewport === "desktop" ? "absolute inset-0 h-full w-full object-cover" : "absolute inset-0 h-full w-full object-cover object-[center_62%]"}
      poster={assetPath(item.poster)}
      muted
      autoPlay
      loop
      playsInline
      preload="metadata"
      aria-label="טבעת סוליטר גדולה בזהב צהוב בתנועת מצלמה עדינה"
    >
      <source src={assetPath(item.webm)} type="video/webm" />
      <source src={assetPath(item.mp4)} type="video/mp4" />
    </video>
  );
}

export default function HeroMotionPreview() {
  const [mode, setMode] = useState<MotionMode>("video");
  const [viewport, setViewport] = useState<ViewportMode | null>(null);
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setViewport(desktopQuery.matches ? "desktop" : "mobile");
      setReduceMotion(motionQuery.matches);
    };

    sync();
    desktopQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);
    return () => {
      desktopQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  return (
    <>
      <div className="border-b border-line bg-ivory px-4 py-3">
        <div className="mx-auto flex max-w-7xl justify-center" role="group" aria-label="בחירת גרסת תנועה">
          <div className="inline-grid grid-cols-2 border border-line bg-white/55 p-1">
            {(["video", "cinemagraph"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={mode === option}
                onClick={() => setMode(option)}
                className={`min-h-10 min-w-[8.25rem] px-5 text-sm transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-gold-deep ${
                  mode === option ? "bg-espresso text-ivory" : "text-ink hover:text-gold-deep"
                }`}
              >
                {option === "video" ? "וידאו" : "Cinemagraph"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="hero-editorial relative isolate overflow-hidden">
        <div className="absolute inset-0 lg:hidden">
          <MotionMedia mode={mode} viewport={viewport === "mobile" ? viewport : null} reduceMotion={reduceMotion} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,248,243,0.9)_0%,rgba(250,248,243,0.7)_34%,rgba(250,248,243,0.08)_62%,rgba(250,248,243,0.78)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(74svh-60px)] max-w-7xl items-start px-4 py-4 sm:px-6 lg:min-h-[min(82vh,760px)] lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-10 lg:px-8 lg:py-14">
          <div className="pt-3 text-center sm:pt-10 lg:order-first lg:max-w-lg lg:pt-0 lg:text-right">
            <h1 className="mx-auto max-w-[8ch] font-display text-[2.75rem] font-light leading-[1.04] text-ink sm:text-6xl lg:mx-0 xl:text-7xl">
              נוכחות אמיתית.
            </h1>
            <p className="mx-auto mt-5 hidden max-w-[26rem] text-sm leading-7 tracking-[0.08em] text-stone sm:text-base lg:mx-0 lg:block">
              יהלומי מעבדה מוסמכים בזהב 14K/18K.
            </p>
            <div className="mt-5 flex flex-col items-center gap-3 sm:mt-7 lg:mt-10 lg:flex-row lg:justify-start">
              <Link href="/jewelry/rings" className="btn-primary px-14">
                גלו טבעות יהלום
              </Link>
              <a
                href={waLink(defaultWaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp hero-desktop-inline"
              >
                <WhatsAppIcon className="h-4 w-4" />
                ייעוץ אישי בוואטסאפ
              </a>
            </div>
            <p className="mx-auto mt-5 hidden text-xs tracking-[0.12em] text-stone lg:mx-0 lg:block">
              IGI/GIA · אחריות מלאה · משלוח מבוטח
            </p>
          </div>

          <div className="relative hidden lg:order-last lg:block lg:min-h-[520px]">
            <div className="hero-ring-light" />
            <MotionMedia mode={mode} viewport={viewport === "desktop" ? viewport : null} reduceMotion={reduceMotion} />
          </div>
        </div>
      </section>
    </>
  );
}
