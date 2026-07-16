"use client";

import { useEffect, useRef } from "react";
import { assetPath } from "@/lib/site";

type HeroRefractionProps = {
  variant: "mobile" | "desktop";
};

const MAX_OPACITY = 0.12;
const TRAVEL_X = 18;
const START_X = -8;
const START_Y = -2;
const TRAVEL_Y = 4;

export default function HeroRefraction({ variant }: HeroRefractionProps) {
  const layerRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const hero = layer?.closest<HTMLElement>(".hero-editorial");
    if (!layer || !hero) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    let ticking = false;
    let introActive = !reducedMotion.matches;

    const hide = () => {
      layer.style.opacity = "0";
    };

    const updateFromScroll = () => {
      ticking = false;
      if (reducedMotion.matches || !visible || layer.offsetParent === null) {
        hide();
        return;
      }

      const travel = Math.max(1, Math.min(hero.offsetHeight * 0.4, window.innerHeight * 0.38));
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
      requestAnimationFrame(updateFromScroll);
    };

    const intro = reducedMotion.matches
      ? null
      : layer.animate(
          [
            { opacity: 0, transform: "translate3d(-8px, -2px, 0)" },
            { opacity: MAX_OPACITY, transform: "translate3d(1px, 0, 0)", offset: 0.52 },
            { opacity: 0, transform: "translate3d(10px, 2px, 0)" },
          ],
          {
            delay: 650,
            duration: 2000,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          },
        );

    intro?.finished
      .catch(() => undefined)
      .finally(() => {
        introActive = false;
        scheduleUpdate();
      });

    const onScroll = () => {
      if (introActive) {
        intro?.cancel();
        introActive = false;
      }
      scheduleUpdate();
    };

    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches) {
        intro?.cancel();
        introActive = false;
        hide();
      } else {
        scheduleUpdate();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) hide();
      else scheduleUpdate();
    });

    observer.observe(hero);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    reducedMotion.addEventListener("change", onMotionPreferenceChange);

    return () => {
      intro?.cancel();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", onMotionPreferenceChange);
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
      className={`pointer-events-none absolute inset-0 h-full w-full select-none mix-blend-screen ${responsiveClass}`}
      style={{ opacity: 0, willChange: "transform, opacity" }}
    />
  );
}
