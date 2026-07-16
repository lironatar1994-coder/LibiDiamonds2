"use client";

import { useEffect, useRef } from "react";

type HeroRefractionProps = {
  variant: "mobile" | "desktop";
};

type RefractionGeometry = {
  imageWidth: number;
  imageHeight: number;
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
};

const GEOMETRY: Record<HeroRefractionProps["variant"], RefractionGeometry> = {
  mobile: {
    imageWidth: 941,
    imageHeight: 1672,
    centerX: 470,
    centerY: 560,
    radiusX: 146,
    radiusY: 146,
  },
  desktop: {
    imageWidth: 1920,
    imageHeight: 1080,
    centerX: 1375,
    centerY: 625,
    radiusX: 150,
    radiusY: 150,
  },
};

const MAX_OPACITY = 0.42;
const SWEEP_START = -28;
const SWEEP_TRAVEL = 56;

export default function HeroRefraction({ variant }: HeroRefractionProps) {
  const maskRef = useRef<HTMLSpanElement>(null);
  const sweepRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mask = maskRef.current;
    const sweep = sweepRef.current;
    const frame = mask?.parentElement;
    const hero = mask?.closest<HTMLElement>(".hero-editorial");
    if (!mask || !sweep || !frame || !hero) return;

    const geometry = GEOMETRY[variant];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;
    let introActive = !reducedMotion.matches;
    let introTimer: number | undefined;

    const hide = () => {
      mask.style.opacity = "0";
    };

    const layoutMask = () => {
      const frameRect = frame.getBoundingClientRect();
      if (frameRect.width === 0 || frameRect.height === 0) return;

      const scale = Math.max(
        frameRect.width / geometry.imageWidth,
        frameRect.height / geometry.imageHeight,
      );
      const renderedWidth = geometry.imageWidth * scale;
      const renderedHeight = geometry.imageHeight * scale;
      const verticalPosition = variant === "mobile" && window.innerWidth >= 640 ? 0.18 : variant === "desktop" ? 0.5 : 0;
      const offsetX = (frameRect.width - renderedWidth) * 0.5;
      const offsetY = (frameRect.height - renderedHeight) * verticalPosition;
      const width = geometry.radiusX * 2 * scale;
      const height = geometry.radiusY * 2 * scale;

      mask.style.left = `${offsetX + geometry.centerX * scale - width / 2}px`;
      mask.style.top = `${offsetY + geometry.centerY * scale - height / 2}px`;
      mask.style.width = `${width}px`;
      mask.style.height = `${height}px`;
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

      const travel = Math.max(1, Math.min(hero.offsetHeight * 0.58, window.innerHeight * 0.58));
      const progress = Math.min(1, Math.max(0, window.scrollY / travel));
      const opacity = MAX_OPACITY * Math.sin(progress * Math.PI);
      const sweepPosition = SWEEP_START + SWEEP_TRAVEL * progress;

      mask.style.opacity = opacity.toFixed(3);
      sweep.style.transform = `translate3d(${sweepPosition.toFixed(2)}%, 0, 0)`;
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
      mask.classList.remove("hero-refraction-mask-intro");
      sweep.classList.remove("hero-refraction-sweep-intro");
      scheduleUpdate();
    };

    const onScroll = () => {
      finishIntro();
      scheduleUpdate();
    };

    const onResize = () => {
      layoutMask();
      scheduleUpdate();
    };

    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches) {
        introActive = false;
        mask.classList.remove("hero-refraction-mask-intro");
        sweep.classList.remove("hero-refraction-sweep-intro");
        hide();
      } else {
        scheduleUpdate();
      }
    };

    layoutMask();
    if (reducedMotion.matches) {
      mask.classList.remove("hero-refraction-mask-intro");
      sweep.classList.remove("hero-refraction-sweep-intro");
      hide();
    } else {
      introTimer = window.setTimeout(finishIntro, 2800);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    mask.addEventListener("animationend", finishIntro);
    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", onMotionPreferenceChange);
    } else {
      reducedMotion.addListener(onMotionPreferenceChange);
    }

    return () => {
      if (introTimer !== undefined) window.clearTimeout(introTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      mask.removeEventListener("animationend", finishIntro);
      if (typeof reducedMotion.removeEventListener === "function") {
        reducedMotion.removeEventListener("change", onMotionPreferenceChange);
      } else {
        reducedMotion.removeListener(onMotionPreferenceChange);
      }
    };
  }, [variant]);

  const responsiveClass = variant === "mobile" ? "lg:hidden" : "hidden lg:block";

  return (
    <span
      ref={maskRef}
      aria-hidden="true"
      className={`hero-refraction-mask-intro pointer-events-none absolute z-[1] overflow-hidden rounded-full mix-blend-screen ${responsiveClass}`}
      style={{ opacity: 0, willChange: "opacity" }}
    >
      <span
        ref={sweepRef}
        className="hero-refraction-sweep hero-refraction-sweep-intro absolute -inset-[42%]"
      />
    </span>
  );
}
