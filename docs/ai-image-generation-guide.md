# AI image generation guide — LIBI DIAMONDS

Everything an image model needs to produce photography that matches the site.
Read the two rule sections first; they apply to every prompt in this file and
are the difference between an image that drops in and one that has to be redone.

---

## 1. Absolute rules

**No people. Ever.** No models, no hands, no fingers, no ears, no necks, no
skin, no silhouettes, no reflections of a person. Jewelry, packaging, tools and
surfaces only. This is a standing instruction from the site owner and there is
no exception for any image on this list. If a prompt seems to want a hand to
show scale, use a ring stand, a tray, or the jewelry alone instead.

**Neutral grounds only.** White, cream, grey, charcoal or black. Never a
coloured backdrop — no blue, teal, wine, burgundy, navy, green or purple, and no
coloured gels on the lighting. A diamond is graded for the *absence* of colour,
so a coloured surface casts into the stone and misrepresents the product. This
is also the whole reason the site palette is neutral; a tinted photo will visibly
clash with the section it sits in.

**The only warmth in frame is the metal.** Yellow gold should read warm and
buttery. Everything else — fabric, stone, paper, shadow — stays neutral.

**No text, no logos, no watermarks,** except the real LIBI wordmark where a
prompt explicitly asks for embossing on packaging. Never invent a logo.

**No promotional styling.** No confetti, rose petals, sparkle overlays, bokeh
hearts, gift ribbons in colour, price stickers or sale badges.

---

## 2. House style

| | |
|---|---|
| **Lighting** | One soft key light, slightly raking. Gentle falloff. Real, physical shadow under the object. No ring-light flatness, no HDR, no glow effects. |
| **Optics** | Macro or short telephoto look. Shallow but not extreme depth of field — the stone stays sharp. No fisheye, no heavy vignette. |
| **Finish** | Photographic and restrained. Not glossy CGI, not over-retouched, not "luxury advert" over-saturated. Think a jeweler's bench photographed well. |
| **Composition** | Generous negative space. Object off-centre is fine, but nothing important within 8% of any edge — the site crops these to 4:3, 16:9, 3:2 and 1:1. |
| **Diamonds** | Bright white sparkle, visible facets, no colour cast, no rainbow fire overload. |

### Palette to match

| Role | Hex |
|---|---|
| Paper / lightest ground | `#ffffff` |
| Light panel | `#f7f7f7` |
| Deepest light ground | `#efefef` |
| Onyx (dark ground) | `#1c1c1c` |
| Raised / lit fold on dark | `#2a2a2a` |
| Deepest shadow | `#000000` |
| Gilt (metal accents) | `#b5924b` |

### Two worlds

The site has a **light table** world (white/ivory stone, high-key, soft daylight)
and an **onyx** world (charcoal or black ground, single warm key). Each image
below states which world it belongs to. Do not mix them within one frame except
where a prompt explicitly asks for the seam.

### Output spec

- **≥1600px** on the long edge, ≥2000px preferred for hero-scale frames.
- Deliver as PNG or JPG, then convert to **`.webp` at quality 82** and save to
  the exact path given. The site loads `.webp` only.
- Aspect ratios are listed per image; generate at that ratio rather than cropping
  a square down, so the composition is built for the frame.

---

## 3. Priority 1 — the try-on frames

**This is the only image currently causing a visible problem.** The existing
frame was shot on blue stone: its dark pixels average R19 G25 B31, so it reads
teal inside the neutral `#1c1c1c` band and the seam between photo and section is
visible. The site is currently masking this with a `saturate(0.5)` CSS filter as
a stopgap. **When these two land, delete that filter** — it is marked `INTERIM`
in `src/app/globals.css` on `.home-try-on-media img`.

### 1. `public/images/editorial/try-on/v7-onyx/aura-try-on-mobile.webp`
**Portrait 4:5** · onyx world · replaces `v4-story/aura-try-on-mobile.webp`

> Product photograph, no people. A yellow gold solitaire engagement ring with a
> round brilliant diamond stands upright on a slab of charcoal grey stone. Behind
> it, a modern smartphone lies face up, screen dark and glossy, reflecting a thin
> warm highlight. The background is soft black fabric falling out of focus. A
> single warm key light rakes from upper left, catching the gold band and firing
> white sparkle in the diamond. Deep neutral shadows, no colour cast. Macro
> product photography, generous empty space above the ring.

Negative: *people, hands, fingers, skin, blue, teal, navy, purple tint, coloured
gel lighting, text, logos, watermark, glow overlay, CGI plastic look.*

### 2. `public/images/editorial/try-on/v7-onyx/aura-focus-desktop.webp`
**Landscape 16:9** · onyx world · replaces `v3-no-hands/aura-focus-desktop.webp`

Same scene and lighting as above, recomposed wide: ring and phone grouped to the
right third, wide empty charcoal to the left — **the left half is where the
Hebrew headline and button sit, so keep it clean and evenly lit,** no busy
texture or bright highlight there.

---

## 4. Priority 2 — the packaging suite

These sit inside the PDP's dark band. The current versions are shot on cream,
so they read as light tiles on dark rather than as one continuous scene. The
white box must stay the brightest thing in every frame.

Consumed by `packagingByCategory` in `src/components/ProductView.tsx` and by the
homepage experience section in `src/app/page.tsx`.

### 3–6. `public/images/trust/v7-onyx/libi-packaging-{ring|earrings|necklaces|bracelets}.webp`
**4:3** · onyx world · replaces `v5-pearl/libi-packaging-*-pearl-v1.webp`

> Product photograph, no people. A matte white jewelry box sits open on a smooth
> charcoal grey surface, its lid resting behind it. Small gold foil lettering
> reading "LIBI DIAMONDS" is embossed on the lid. The interior is pale grey
> suede. [PIECE] rests inside. A soft cream ribbon curves loosely beside the box.
> One warm key light from the upper left; the white box is the brightest element
> and casts a soft neutral shadow to the right. Calm, quiet, high-end product
> photography.

Substitute `[PIECE]` per file:
| File | `[PIECE]` |
|---|---|
| `libi-packaging-ring` | a yellow gold solitaire ring with a round diamond, seated in the ring slot |
| `libi-packaging-earrings` | a pair of round diamond stud earrings in yellow gold |
| `libi-packaging-necklaces` | a fine yellow gold diamond tennis necklace, coiled |
| `libi-packaging-bracelets` | a yellow gold diamond tennis bracelet, gently curved |

Negative: *people, hands, coloured box lining, red, wine, burgundy, navy, blue,
busy patterned fabric, text other than the LIBI wordmark, watermark.*

### 7. `public/images/trust/v7-onyx/libi-shopping-bag.webp`
**1:1** · onyx world · replaces `v5-pearl/libi-shopping-bag-pearl-v1.webp`

> Product photograph, no people. A matte white paper shopping bag with flat cream
> ribbon handles stands upright on a charcoal grey surface, small gold foil "LIBI
> DIAMONDS" lettering on the front. One warm key light from the left, soft
> neutral shadow to the right. Clean, minimal, generous empty space above.

### 8. `public/images/trust/v7-onyx/libi-certificate.webp`
**1:1** · onyx world · replaces `v5-pearl/libi-certificate-pearl-v1.webp`

> Product photograph, no people. A cream folder lies open on black velvet,
> showing a printed certificate page with fine grey ruled lines and a small
> diamond diagram. A loose round brilliant diamond rests on the fabric beside it,
> next to slim steel tweezers. Warm key light from the upper left picks out the
> nap of the velvet. Neutral tones throughout, crisp white sparkle in the stone.

**The certificate text must be illegible** — fine grey lines suggesting print,
never readable numbers or grades. This image represents a document type, and
generating specific-looking values would misstate a real gemological report.

---

## 5. Priority 3 — editorial

### 9. `public/images/editorial/v7-onyx/bespoke-two-worlds.webp`
**3:2** · both worlds, deliberately

> Product photograph, no people. A single frame split down the middle by a clean
> seam: on the left, a pencil sketch of a solitaire ring on white paper over pale
> ivory marble, with a graphite pencil and a brass loupe. On the right, the
> finished yellow gold solitaire ring standing on black velvet. Soft daylight on
> the left half, one warm key light on the right. The two halves share the same
> warm gold; everything else is neutral.

Replaces `v6-bespoke/bespoke-combined-contrast.webp` (`src/app/page.tsx` L415).

### Also available if you want to refresh the light world

`v6-bespoke/atelier-tools.webp` (sketch, loupe, dividers on marble) is currently
used in the homepage experience section and is **already correct** — no people,
neutral marble, warm brass. It is the reference for what "right" looks like in
the light world. Only regenerate it if you want a higher-resolution version.

---

## 6. After the images land

1. Save each `.webp` at the exact path listed.
2. Update the `src` values:
   - `src/components/HomeTryOnFeature.tsx` L218, L228 — try-on frames
   - `src/components/ProductView.tsx` L117–129 (`packagingByCategory`), L660
     (shopping bag), L672 (certificate)
   - `src/app/page.tsx` L415 (bespoke), L550 / L559 (experience section)
3. **Rewrite the Hebrew `alt` text.** The current strings describe the old
   scenes — "על שכבות אבן כחולה" (on layers of blue stone) and "מבד פנינה"
   (pearl fabric) — and would be wrong and misleading to a screen-reader user.
4. **Delete the interim filter** in `src/app/globals.css` — the block commented
   `INTERIM — remove when the onyx photography lands` on `.home-try-on-media img`.
5. Run `npm run build`, then check the try-on band and the PDP packaging band at
   375px width.

### Verifying a generated image is actually neutral

Paste into the browser console with the image on screen. It averages the dark
pixels; on a neutral image R, G and B land within a few points of each other. On
the old try-on frame this returned R19 G25 B31 — blue 63% above red, which is
what made it clash.

```js
const img = document.querySelector('YOUR_IMG_SELECTOR');
const c = document.createElement('canvas'); c.width = c.height = 60;
const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, 60, 60);
const d = ctx.getImageData(0, 0, 60, 60).data;
let r=0, g=0, b=0, n=0;
for (let i = 0; i < d.length; i += 4) {
  if ((d[i] + d[i+1] + d[i+2]) / 3 < 110) { r += d[i]; g += d[i+1]; b += d[i+2]; n++; }
}
console.log({ r: Math.round(r/n), g: Math.round(g/n), b: Math.round(b/n) });
```
