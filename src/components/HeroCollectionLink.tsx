"use client";

export default function HeroCollectionLink() {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const collectionTitle = document.getElementById("collection-title");

    if (!collectionTitle) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollMarginTop = Number.parseFloat(window.getComputedStyle(collectionTitle).scrollMarginTop) || 0;
    const destination = window.scrollY + collectionTitle.getBoundingClientRect().top - scrollMarginTop;

    window.scrollTo({
      top: destination,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    window.history.replaceState(null, "", "#collection-title");
  }

  return (
    <a href="#collection-title" className="home-hero-collection-link" onClick={handleClick}>
      <span>לצפייה בקולקציה</span>
      <span className="home-hero-collection-rule" aria-hidden="true" />
      <svg className="home-hero-collection-arrow" viewBox="0 0 10 14" aria-hidden="true">
        <path d="M5 1v10M1.75 8.5 5 11.75 8.25 8.5" />
      </svg>
    </a>
  );
}
