// Composes the LIBI DIAMONDS logo kit into public/brand/ + src/app/icon.svg.
// Wordmark glyphs live pre-outlined in paths.json (Bodoni MT, converted once
// via text2path.js + jobs.json — needs `npm i opentype.js` and the font file).
// Run: node scripts/brand/compose.js
const fs = require("fs");
const path = require("path");

const P = JSON.parse(fs.readFileSync(path.join(__dirname, "paths.json"), "utf8"));
const ROOT = path.join(__dirname, "..", "..");
const OUT = path.join(ROOT, "public", "brand");

// Mineral-gallery palette (matches @theme in src/app/globals.css)
const INK = "#121313";
const STONE = "#686B69";
const GOLD = "#A88F60";
const IVORY = "#F7F6F2";
const CHAMPAGNE = "#A88F60"; // gold doubles as the accent on dark surfaces
const SUBTLE = "#9EA29F"; // footer-subtle — DIAMONDS line on graphite

// The mark: heart outline (Libi = "my heart" in Hebrew) with an inscribed
// brilliant-cut stone — crown triangle over a tapering pavilion, girdle chord.
// 100x100 box, stroke-only, near-even weights.
function mark(colOutline, colFacet, opts = {}) {
  const ow = opts.outlineW ?? 2.4;
  const fw = opts.facetW ?? 1.9;
  const detail = opts.detail ?? true;
  const outline = `M50 87 C41 79.5 26 67 18.5 54 C14 46 12 39.5 12 33.5 C12 21.5 20 13.5 30.5 13.5 C39.5 13.5 47.5 19.5 50 28.5 C52.5 19.5 60.5 13.5 69.5 13.5 C80 13.5 88 21.5 88 33.5 C88 39.5 86 46 81.5 54 C74 67 59 79.5 50 87 Z`;
  const facets = detail
    ? `<path d="M50 30.5 L29 38.5 L50 83.5 L71 38.5 Z M29 38.5 H71" stroke="${colFacet}" stroke-width="${fw}" stroke-linejoin="round" fill="none"/>`
    : "";
  return `<g fill="none" stroke-linecap="round">
    ${facets}
    <path d="${outline}" stroke="${colOutline}" stroke-width="${ow}" stroke-linejoin="round"/>
  </g>`;
}

function svgDoc(w, h, inner) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="t">
  <title id="t">LIBI DIAMONDS</title>
${inner}
</svg>`;
}

const libi = P["libi-bodoni"];
const diamonds = P["diamonds-bodoni"];
const cx = (canvasW, pathW) => (canvasW - pathW) / 2;

function wordmark(colName, colSub) {
  return svgDoc(
    360,
    150,
    `  <g transform="translate(${cx(360, libi.width)} 76)"><path d="${libi.d}" fill="${colName}"/></g>
  <g transform="translate(${cx(360, diamonds.width)} 110)"><path d="${diamonds.d}" fill="${colSub}"/></g>`
  );
}

function primary(colName, colSub, colMarkOutline, colFacet) {
  return svgDoc(
    360,
    240,
    `  <g transform="translate(153 6) scale(0.54)">${mark(colMarkOutline, colFacet)}</g>
  <g transform="translate(${cx(360, libi.width)} 158)"><path d="${libi.d}" fill="${colName}"/></g>
  <g transform="translate(${cx(360, diamonds.width)} 194)"><path d="${diamonds.d}" fill="${colSub}"/></g>`
  );
}

const markOnly = (colOutline, colFacet) => svgDoc(100, 100, mark(colOutline, colFacet));

// Footer lockup: like primary, but the mark is larger and its strokes are
// boosted so the heart stays crisp at the footer's ~9rem display width.
function footerLockup(colName, colSub, colMarkOutline, colFacet) {
  return svgDoc(
    360,
    250,
    `  <g transform="translate(145 4) scale(0.7)">${mark(colMarkOutline, colFacet, { outlineW: 4.4, facetW: 2.9 })}</g>
  <g transform="translate(${cx(360, libi.width)} 172)"><path d="${libi.d}" fill="${colName}"/></g>
  <g transform="translate(${cx(360, diamonds.width)} 206)"><path d="${diamonds.d}" fill="${colSub}"/></g>`
  );
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${INK}"/>
  <g transform="translate(6.4 6.4) scale(0.512)">${mark(CHAMPAGNE, CHAMPAGNE, { outlineW: 4.2, facetW: 2.6 })}</g>
</svg>`;

fs.writeFileSync(path.join(OUT, "libi-diamonds-logo.svg"), wordmark(INK, STONE));
fs.writeFileSync(path.join(OUT, "libi-diamonds-logo-inverse.svg"), wordmark(IVORY, SUBTLE));
fs.writeFileSync(path.join(OUT, "libi-diamonds-logo-primary.svg"), primary(INK, STONE, INK, GOLD));
fs.writeFileSync(path.join(OUT, "libi-diamonds-logo-primary-inverse.svg"), primary(IVORY, SUBTLE, IVORY, GOLD));
fs.writeFileSync(path.join(OUT, "libi-diamonds-mark.svg"), markOnly(INK, GOLD));
fs.writeFileSync(path.join(OUT, "libi-diamonds-mark-inverse.svg"), markOnly(IVORY, GOLD));
fs.writeFileSync(path.join(OUT, "libi-diamonds-logo-footer.svg"), footerLockup(IVORY, SUBTLE, IVORY, GOLD));
fs.writeFileSync(path.join(ROOT, "src", "app", "icon.svg"), favicon);
console.log("logo kit written to public/brand + src/app/icon.svg");
