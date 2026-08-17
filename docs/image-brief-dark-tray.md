# Image brief — "The Display Tray" (onyx world)

The site has two photographic worlds. World 1, the **light table**, already
exists and stays: ivory stone and marble, high-key, soft daylight, used for the
hero, category tiles, catalog cutouts, journal covers and the atelier still-life.

World 2, **the display tray**, matches the onyx sections in the CSS. These nine
frames do not exist yet. Until they do, the current cool-dark images stay in
place — they read as neutral enough to hold, but they are not the intended world.

## Non-negotiables for every frame

- **No people.** No hands, no models, no body parts, no reflections of a person.
  Jewelry, packaging, tools and fabric only.
- **Neutral dark ground only.** Black or charcoal velvet / suede / matte stone.
  No blue-black, no brown-black, no coloured lining. A diamond graded for the
  absence of colour must not sit on a surface that casts into it — this is the
  whole reason the palette is neutral.
- One warm key light, raking low, so the fabric shows nap and the metal shows
  warmth. The ground stays neutral; only the gold is allowed to be warm.
- Diamonds must hold white sparkle with no colour cast. Grade the stone neutral.
- Square-format-friendly: nothing critical within 8% of any edge, so one master
  survives 4:3, 16:9 and 1:1 crops.
- Deliver ≥1600px on the long edge, then convert to `.webp` (quality ~82).
- No text and no logos other than the real LIBI wordmark on packaging.

## Palette to match

| Role | Hex |
|---|---|
| Onyx ground | `#1c1c1c` |
| Raised / lit fold | `#2a2a2a` |
| Deepest shadow | `#000000` |
| Packaging white | `#ffffff` |
| Gilt accents | `#b5924b` |

## Shot list

### 1–2. Try-on passage — `public/images/editorial/try-on/v7-onyx/`
`aura-try-on-mobile.webp` (portrait 3:4) and `aura-focus-desktop.webp` (landscape 16:9).

A yellow-gold solitaire ring on black velvet beside a phone lying face-up, screen
dark and reflective. A single gilt light streak crosses the fabric behind them.
*Current files:* `v4-story/aura-try-on-mobile.webp`, `v3-no-hands/aura-focus-desktop.webp`
*Used by:* `src/components/HomeTryOnFeature.tsx`

### 3–6. Packaging suite — `public/images/trust/v7-onyx/`
`libi-packaging-ring.webp`, `-earrings.webp`, `-necklaces.webp`, `-bracelets.webp` (4:3).

The white LIBI box **open** on a charcoal ground, gold logo embossing on the lid,
the matching piece seated inside. The box must stay the lightest thing in frame.
*Current files:* `v5-pearl/libi-packaging-*-pearl-v1.webp`
*Used by:* `packagingByCategory` in `src/components/ProductView.tsx`

### 7. Shopping bag — `public/images/trust/v7-onyx/libi-shopping-bag.webp` (1:1)
The white shopping bag standing on a charcoal ground, ribbon handles catching the
key light.
*Current file:* `v5-pearl/libi-shopping-bag-pearl-v1.webp`

### 8. Certificate — `public/images/trust/v7-onyx/libi-certificate.webp` (1:1)
The certificate folder open on black velvet, a loose round diamond resting beside
it, tweezers just out of frame.
*Current file:* `v5-pearl/libi-certificate-pearl-v1.webp`

### 9. Bespoke contrast — `public/images/editorial/v7-onyx/bespoke-two-worlds.webp` (3:2)
The two worlds meeting in one frame: pencil sketch and ring on white marble on
one side, the finished twin on black velvet on the other, the seam running
through the middle of the composition.
*Current file:* `v6-bespoke/bespoke-combined-contrast.webp`
*Used by:* the bespoke section in `src/app/page.tsx`

## After generating

1. Convert to `.webp` and place at the paths above.
2. Update the `src` values in `HomeTryOnFeature.tsx`, `ProductView.tsx`
   (`packagingByCategory`) and `src/app/page.tsx`.
3. Update the Hebrew `alt` text — the current strings describe blue stone and
   pearl fabric ("על שכבות אבן כחולה", "מבד פנינה") and would be wrong.
4. Re-run `npm run build` and check the try-on and packaging sections at 375px.
