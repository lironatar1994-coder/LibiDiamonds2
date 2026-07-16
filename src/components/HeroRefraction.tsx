"use client";

import { useEffect, useRef } from "react";
import { assetPath } from "@/lib/site";

type HeroRefractionProps = {
  variant: "mobile" | "desktop";
};

const MAX_OPACITY = 0.18;
const TRAVEL_X = 24;
const START_X = -12;
const START_Y = -2;
const TRAVEL_Y = 4;

export default function HeroRefraction({ variant }: HeroRefractionProps) {
  const layerRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const hero = layer?.closest<HTMLElement>(".hero-editorial");
    if (!layer || !hero) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;
    let introActive = !reducedMotion.matches;
    let introTimer: number | undefined;

    const hide = () => {
      layer.style.opacity = "0";
    };

    const updateFromScroll = () => {
      ticking = false;
      const heroRect = hero.getBoundingClientRect();
      if (
        reducedMotion.matches ||
        heroRect.bottom <= 0 ||
        heroRect.top >= window.innerHeight
      ) {
        hide();
        return;
      }

      const travel = Math.max(1, Math.min(hero.offsetHeight * 0.55, window.innerHeight * 0.55));
      const progress = Math.min(1, Math.max(0, window.scrollY / travel));
      const opacity = MAX_OPACITY * Math.sin(progress * Math.PI);
      const x = START_X + TRAVEL_X * progress;
      const y = START_Y + TRAVEL_Y * progress;

      layer.style.opacity = opacity.toFixed(3);
      layer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    };

    const scheduleUpdate = () => {
      if (ticking || introActive) return;
      ticking = true;
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(updateFromScroll);
      } else {
        window.setTimeout(updateFromScroll, 16);
      }
    };

    const finishIntro = () => {
      if (!introActive) return;
      introActive = false;
      layer.classList.remove("hero-refraction-intro");
      scheduleUpdate();
    };

    const onScroll = () => {
      finishIntro();
      scheduleUpdate();
    };

    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches) {
        introActive = false;
        layer.classList.remove("hero-refraction-intro");
        hide();
      } else {
        scheduleUpdate();
      }
    };

    if (reducedMotion.matches) {
      layer.classList.remove("hero-refraction-intro");
      hide();
    } else {
      introTimer = window.setTimeout(finishIntro, 2800);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    layer.addEventListener("animationend", finishIntro);
    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", onMotionPreferenceChange);
    } else {
      reducedMotion.addListener(onMotionPreferenceChange);
    }

    return () => {
      if (introTimer !== undefined) window.clearTimeout(introTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleUpdate);
      layer.removeEventListener("animationend", finishIntro);
      if (typeof reducedMotion.removeEventListener === "function") {
        reducedMotion.removeEventListener("change", onMotionPreferenceChange);
      } else {
        reducedMotion.removeListener(onMotionPreferenceChange);
      }
    };
  }, []);

  const responsiveClass =
    variant === "mobile"
      ? "object-cover object-top sm:object-[50%_18%] lg:hidden"
      : "hidden object-cover object-center lg:block";

  return (
    <img
      ref={layerRef}
      src={assetPath(`/images/hero/refraction/${variant}.svg`)}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`hero-refraction-intro pointer-events-none absolute inset-0 h-full w-full select-none mix-blend-screen ${responsiveClass}`}
      style={{ opacity: 0, willChange: "transform, opacity" }}
    />
  );
}
