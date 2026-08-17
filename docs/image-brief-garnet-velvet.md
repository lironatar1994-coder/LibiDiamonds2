# Image brief — "Inside the Box" (garnet velvet world)

The site now has two photographic worlds. World 1, the **light table**, already
exists and stays: ivory stone and marble, high-key, soft daylight, used for the
hero, category tiles, catalog cutouts, journal covers and the atelier still-life.

World 2, **inside the box**, is new and matches the garnet velvet sections in the
CSS. These nine images do not exist yet. Until they do, the current cool-dark
images stay in place — they read as neutral and do not clash badly with velvet,
but they are not the intended world.

## Non-negotiables for every frame

- **No people.** No hands, no models, no body parts, no reflections of a person.
  Jewelry, packaging, tools and fabric only.
- Square-format-friendly composition: nothing critical within 8% of any edge, so
  the same master survives 4:3, 16:9 and 1:1 crops.
- One warm key light, raking low. Velvet must read as *fibre* — visible nap and
  sheen, not a flat maroon field.
- Gold jewelry photographed warm; diamonds must keep white sparkle and not pick
  up a red cast. Grade the stone neutral even though the ground is warm.
- Deliver ≥1600px on the long edge, then convert to `.webp` (quality ~82).
- No text, no logos other than the real LIBI wordmark on packaging, no props
  that imply a physical store.

## Palette to match

| Role | Hex |
|---|---|
| Velvet ground | `#41151f` |
| Velvet raised / lit fold | `#54202c` |
| Deepest shadow | `#2f0e16` |
| Warm white (packaging, paper) | `#f7f0e6` |
| Gilt accents | `#b5924b` |

## Shot list

### 1–2. Try-on passage — `public/images/editorial/try-on/v7-garnet-velvet/`
`aura-try-on-mobile.webp` (portrait 3:4) and `aura-focus-desktop.webp` (landscape 16:9).

A yellow-gold solitaire ring resting on draped garnet velvet beside a phone lying
face-up, its screen dark and reflective. A single gilt light streak crosses the
velvet behind them. Replaces the current blue-stone scene.
*Current files:* `v4-story/aura-try-on-mobile.webp`, `v3-no-hands/aura-focus-desktop.webp`
*Used by:* `src/components/HomeTryOnFeature.tsx`

### 3–6. Packaging suite — `public/images/trust/v7-garnet-velvet/`
`libi-packaging-ring.webp`, `-earrings.webp`, `-necklaces.webp`, `-bracelets.webp` (4:3).

The pearl-white LIBI box **open**, revealing a garnet velvet interior, gold logo
embossing on the lid, the matching piece seated in the velvet slot. Shot on a
warm-white surface so the box stays the lightest thing in frame — the reveal is
the point: white outside, velvet inside.
*Current files:* `v5-pearl/libi-packaging-*-pearl-v1.webp`
*Used by:* `packagingByCategory` in `src/components/ProductView.tsx`

### 7. Shopping bag — `public/images/trust/v7-garnet-velvet/libi-shopping-bag.webp` (1:1)
The pearl shopping bag standing on a garnet velvet ground, pearl ribbon handles
catching the key light.
*Current file:* `v5-pearl/libi-shopping-bag-pearl-v1.webp`

### 8. Certificate — `public/images/trust/v7-garnet-velvet/libi-certificate.webp` (1:1)
The certificate folder open on garnet velvet, a loose round diamond resting
beside it on the fabric, tweezers just out of frame.
*Current file:* `v5-pearl/libi-certificate-pearl-v1.webp`

### 9. Bespoke contrast — `public/images/editorial/v7-garnet-velvet/bespoke-two-worlds.webp` (3:2)
The two worlds meeting in one frame: a pencil sketch and ring on ivory marble on
one side, the same ring's finished twin on garnet velvet on the other, with the
seam running through the middle of the composition.
*Current file:* `v6-bespoke/bespoke-combined-contrast.webp`
*Used by:* the bespoke section in `src/app/page.tsx`

## After generating

1. Convert to `.webp` and place at the paths above.
2. Update the `src` values in `HomeTryOnFeature.tsx`, `ProductView.tsx`
   (`packagingByCategory`) and `src/app/page.tsx`.
3. Update the Hebrew `alt` text — the current strings describe blue stone and
   pearl fabric ("על שכבות אבן כחולה", "מבד פנינה") and would be wrong.
4. Re-run `npm run build` and check the try-on and packaging sections at 375px.
