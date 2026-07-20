"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { products } from "@/data/products";
import { assetPath } from "@/lib/site";

const TryOnDialog = dynamic(() => import("@/components/try-on/TryOnDialog"), { ssr: false });

const auraProduct = products.find((product) => product.slug === "aura-solitaire-ring")!;
const auraCarat = auraProduct.carats.find((option) => option.value === "1.00") ?? auraProduct.carats[0];

export default function HomeTryOnFeature() {
  const [open, setOpen] = useState(false);

  if (!auraProduct.tryOn || auraProduct.tryOn.target !== "finger") return null;

  return (
    <>
      <section className="home-try-on" aria-labelledby="home-try-on-title">
        <div className="home-try-on-layout mx-auto max-w-7xl">
          <div className="home-try-on-media">
            <Image
              src={assetPath("/images/editorial/try-on/v4-story/aura-try-on-mobile.webp")}
              alt="טבעת סוליטר אורה מזהב צהוב על שכבות אבן כחולה"
              fill
              sizes="100vw"
              className="object-cover md:hidden"
            />
            <Image
              src={assetPath("/images/editorial/try-on/v3-no-hands/aura-focus-desktop.webp")}
              alt="טבעת סוליטר אורה מזהב צהוב על שכבות אבן כחולה"
              fill
              sizes="(min-width: 1280px) 810px, 65vw"
              className="hidden object-cover md:block"
            />
            <span className="home-try-on-media-shade" aria-hidden="true" />
            <span className="home-try-on-focus" aria-hidden="true" />
          </div>

          <div className="home-try-on-copy text-center">
            <div className="home-try-on-copy-inner">
              <h2 id="home-try-on-title" className="font-display text-[2.35rem] font-medium leading-[1.08] text-ivory sm:text-5xl lg:text-[3.25rem]">
                לפני שבוחרים, רואים.
              </h2>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="home-try-on-cta mx-auto mt-7 inline-flex min-h-[52px] items-center justify-center gap-3 px-7 text-sm font-semibold"
              >
                <span className="home-try-on-cta-gem" aria-hidden="true" />
                נסו את ״אורה״ על היד
              </button>
            </div>
          </div>
        </div>
      </section>

      <TryOnDialog
        open={open}
        onClose={() => setOpen(false)}
        productName={auraProduct.name}
        metal="yellow"
        caratValue={auraCarat.value}
        caratSelected={false}
        ringSize="unsure"
        config={auraProduct.tryOn}
      />
    </>
  );
}
