# AI image generation guide — LIBI DIAMONDS

Everything an image model needs to produce photography that matches the site.
Read sections 0–2 before any prompt: section 0 is the context that lets you make
good judgement calls on the details a prompt cannot spell out, and sections 1–2
are the rules that decide whether an image drops straight in or has to be redone.

---

## 0. What you are shooting for

**The brand.** LIBI DIAMONDS sells lab-grown diamond jewelry in Israel — mostly
engagement rings, plus earrings, necklaces and bracelets in 14K/18K gold. The
site is Hebrew, right-to-left.

**Why the imagery carries unusual weight.** There is no physical store. A
customer cannot come in and hold the ring, and there is no cart — every sale
starts as a WhatsApp conversation. So the photography *is* the showroom. It is
the entire basis on which someone decides to spend five figures with a brand
they have not met. That is the job each frame has to do: make the piece feel
real, present, and honestly represented.

**Why "honestly represented" is not a platitude here.** These are diamonds
graded E–F, meaning graded for the *absence* of colour. Photograph one on a
warm or coloured surface and it picks up that cast and reads as a lower colour
grade than the certificate says. Getting this wrong is not just an aesthetic
miss — it misrepresents the product. This is the reason behind the neutral rule
in section 1, and it is why "make it feel warm and romantic" is the wrong
instinct for this brand even though it is the right instinct for most jewelry.

**The look the site is built around.** White surfaces, one neutral near-black,
and metal as the only colour. This is where every serious jeweler lands —
measured on the reference set: Malka `#1c1c1c`, Jared `#000`, Kay `#000`, none of
them putting a chromatic ground behind a stone. Restraint reads as confidence;
decoration reads as compensating.

**Tone.** Quiet, exact, adult. A jeweler's bench photographed well, not a
perfume advert. No romance staging, no lifestyle narrative, no drama.

---

## 1. Absolute rules

**No people. Ever. This includes hands.** No models, no hands, no fingers, no
ears, no necks, no skin, no silhouettes, no reflections of a person — and no
drawn, outlined, wireframe or illustrated body parts either. A line-art finger
is still a finger. Jewelry, packaging, tools and surfaces only.

This is a standing instruction from the site owner, confirmed explicitly when
asked whether a cropped hand with no face would be acceptable for showing
scale. The answer was no. There is no exception anywhere in this document, and
if a prompt seems to need a hand, the answer is one of the scale techniques in
section 6 — never a hand.

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

## 3. What actually needs regenerating

**Almost nothing is broken.** Every image on the site was measured for colour
cast against the section it sits in. The result:

| Where | Status |
|---|---|
| Hero, category tiles, catalog, journal, bespoke | **Fine.** Light images on white. Their warmth (R−B +17 to +87) is warm gold on warm stone, which is correct on a white ground. |
| Packaging, shopping bag, certificate (PDP + homepage) | **Fine.** Light images with light grounds sitting on the dark band — they read as deliberately lit tiles, not a clash. Ground warmth only R−B +8 to +15. |
| **Try-on frames (homepage)** | **The one real mismatch.** |

So the product pages need nothing. The list below is **one genuine fix and a set
of optional improvements** — not a backlog of defects.

### The one real problem

All three try-on crops are graded blue-black:

| File | Dark pixels | Cast |
|---|---|---|
| `v4-story/aura-try-on-mobile.webp` | rgb(19,24,31) | **R−B = −12** |
| `v3-no-hands/aura-focus-desktop.webp` | rgb(41,48,60) | **R−B = −19** |
| `v3-no-hands/aura-focus-mobile.webp` | rgb(36,44,53) | **R−B = −17** |

These are the only images whose *own dark ground* meets the section's dark
ground edge to edge, so the seam between photo and page is visible. Everything
else on the site is a light image on white, where the two never touch.

The site currently masks this with `filter: saturate(0.5)`, marked `INTERIM` on
`.home-try-on-media img` in `src/app/globals.css`. It works — the slate reads
neutral charcoal and the gold survives. **If you regenerate these, delete that
filter. If you don't, the filter is a perfectly acceptable permanent answer.**

### Two changes from the existing composition

The current frame is otherwise good — a gold solitaire on gold-veined slate, a
phone standing upright, a thread of light linking the two. Keep that concept.
Two things change:

1. **The grading**, charcoal instead of blue-black. That is the actual fix.
2. **The line-drawn finger on the phone screen comes out.** The owner's rule
   covers illustrated body parts, not only photographed ones.

Removing the finger means the phone screen has to say "augmented reality" on its
own. It can: AR corner brackets, a faint horizontal placement guide where a
finger would sit, and the ring rendered floating in that space with a soft glow
beneath it. Viewfinder furniture reads as AR without anything to wear it.

### 1. `public/images/editorial/try-on/v7-onyx/aura-try-on-mobile.webp`
**Portrait 4:5** · onyx world · replaces `v4-story/aura-try-on-mobile.webp`

> Product photograph, no people. A yellow gold solitaire engagement ring with a
> round brilliant diamond stands upright on a slab of dark charcoal grey slate
> with fine gold veining. Behind and above it, a modern smartphone stands
> upright. Its dark glossy screen shows the same ring rendered floating in the
> centre, framed by four small gold augmented-reality corner brackets, with a
> faint thin horizontal guide line beneath the ring and a soft glow under it —
> an AR viewfinder with nothing in it yet. A fine thread of warm gold light runs
> from the phone down to the real ring below. Background is deep neutral
> charcoal falling into shadow. One warm key light from upper left fires white
> sparkle in the diamond. Neutral greys throughout, no colour cast.

Negative: *people, hands, fingers, drawn or outlined hands, line-art body parts,
skin, blue, teal, navy, purple tint, coloured gel lighting, text, logos,
watermark, CGI plastic look.*

### 2. `public/images/editorial/try-on/v7-onyx/aura-focus-desktop.webp`
**Landscape 16:9** · onyx world · replaces `v3-no-hands/aura-focus-desktop.webp`

Same scene and lighting, recomposed wide: ring and phone grouped to the right
third, wide empty charcoal to the left — **the left half is where the Hebrew
headline and button sit, so keep it clean and evenly lit,** no busy texture or
bright highlight there.

---

## 4. Optional — the packaging suite

**Nothing here is broken.** The current pearl versions sit on the PDP's dark
band as light tiles and that reads as a deliberate choice, not a mistake. Their
grounds are only mildly warm (R−B +8 to +15) against the neutral section.

Regenerate these only if you want the dark band to read as one continuous scene
rather than as lit tiles on a dark surface. It is a taste call, not a fix.

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

## 5. Optional — editorial

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

## 6. The hero image

The hero is not on the defect list — it is sharp, well-shot and reads fine. But
it is the one image worth reconsidering on the merits, because two things are
working against it and both are documented rather than matters of taste.

### Why the current hero is the weakest strong image on the site

It is a yellow-gold solitaire on warm ivory travertine, high-key.

**1. Veined stone is technically hostile to diamonds and polished metal.** Two
separate problems, both documented by product-photography specialists. Colour:
"every slab hides a unique undertone — anything from bluish to green or even
yellow," so white marble and travertine are *not* neutral grounds. Reflection:
"shiny products like metals or glass reflect their entire environment —
including veined marble," which puts the veining and its colour cast *inside*
the gold and inside the stone. For a brand selling E–F colour grades, the ground
is casting into the exact property the customer is paying for.
([Replica Surfaces](https://www.replicasurfaces.com/blogs/updates/unlocking-the-science-of-marble-in-product-photography-what-nobody-talks-about))

**2. Travertine is a 2025 interior-design trend, now sold as a stock backdrop.**
It is described as "the most seductive trend of 2025" and is retailed as a
photography backdrop SKU to content creators. A trend-cycle surface dates a hero
within about eighteen months. The industry test for this is direct: "Does this
strengthen our brand, or is it simply following the current conversation?"
([Porcelanosa](https://www.porcelanosa.com/trendbook/en/interior-design-natural-travertine-stone/),
[Timothy Hogan Studio](https://www.timothy-hogan.com/resources/future-of-jewelry-photography))

Third, smaller point: the warm ivory predates the palette rebuild. The site is
now neutral white + `#1c1c1c` + gold, with no cream anywhere in it.

### What the surfaces actually do

| Ground | Effect on a diamond |
|---|---|
| **Black velvet / gloss black** | The most-recommended diamond surface in professional guidance — "best for highlighting diamonds and metallic textures"; gloss black gives "a mirror-like effect that makes the diamond appear more radiant." Cost: shows every speck of dust. |
| **White seamless** | The versatile pro standard, but "can look flat without proper lighting" — a white stone on white has almost no tonal separation and facet edges vanish. Fixable (see Option A). |
| **Veined stone (marble/travertine)** | Colour undertones plus environment reflection. Avoid. |
| **Woven fabric (silk, linen)** | Texture competes at macro scale; linen reads craft-market. |
| **Gradient** | Quietly effective — "enhances lighting effects, making sparkle more pronounced." |
| **Water, sand, mirror** | Not hero conventions for diamonds. |

### The scale problem, and why it matters less here than it looks

With no person in frame, no photograph can tell the viewer how big the ring is.
The industry sources are unanimous and blunt about this: "a ruler beside a ring
says it's 6mm wide; a ring on a finger says what 6mm actually feels like." Props
offered as substitutes — coins, rulers, flowers — are called inferior, and on a
luxury site they read cheap.

**The site already solves this better than a photograph could.** LIBI has a live
virtual try-on that renders the selected ring, at the selected carat, on the
customer's own hand through their camera — plus a 360° viewer and a ring-size
guide with a millimetre calculator. A stock hand in a hero shows a stranger's
finger; the AR tool shows the customer their own. Scale is a *product* problem
here and the product handles it, which is precisely why the photography does not
need to.

So the photography's job is not to convey millimetres. It is to make the piece
look real, present and honestly graded, and then hand the scale question to the
tool. Techniques, in order of how much they actually contribute:

1. **A real contact shadow.** The single most important one. An object with a
   grounded shadow reads as a real object at a real size; a floating object
   reads as a graphic, and graphics have no size.
2. **Don't over-crop.** Frame at roughly natural hand-viewing distance so band
   thickness, prong height and shank taper are all legible together — those
   internal proportions are what the eye actually reads size from, and they work
   without any external reference.
3. **Shallow depth of field with a visible falloff** implies a small object
   photographed close.
4. **Brand-native objects, never generic props.** If something must sit in
   frame, it should be a LIBI box, a loupe or tweezers — objects that belong to
   the world and happen to carry known dimensions. Never a coin or a ruler.
5. **Relative scale across a set.** The same setting photographed at 0.70, 1.00
   and 2.00 carat, framed identically, communicates size better than any single
   image — and it maps directly onto the carat selector on the product page.
6. **Put the millimetres in the layout,** not in the photograph.

### Composition requirement (do not skip)

**The hero layout changed, and it changed what the photograph has to do.** Type
no longer sits on top of the image. The headline, the paragraph and both buttons
now live on white beneath it (mobile) or beside it (desktop). So the photograph
is no longer a background that has to leave a clean corner for text — it is a
picture, and it should be composed as one.

What this means practically:

- **Do not leave a large empty zone for copy.** The old brief asked for one; it
  is now wasted frame. Fill the frame with the subject and its ground.
- **The product can be larger and more central** than the current hero allows.
- **Two crops, both edge to edge:**
  - `hero-mobile.webp` — **portrait 9:16**, but only the middle band is
    guaranteed visible: the frame renders at roughly `46svh` and crops from the
    top. Keep the ring within the central 60% vertically.
  - `hero-desktop.webp` — **landscape 3:2 or 16:9**, rendered `object-cover` in
    a tall left-hand column roughly 60% of viewport width. It is cropped
    *narrower and taller* than the source, so keep the ring near the horizontal
    centre and do not put anything essential in the left or right 20%.
- Both crops are taken from the same scene. Shoot it once, deliver two framings.

### Option A — "Clinical light" (recommended)
`public/images/hero/v7/hero-desktop.webp` (16:9) · `hero-mobile.webp` (9:16)

> Studio product photograph, no people. A single yellow-gold solitaire
> engagement ring with a round brilliant diamond stands upright on a seamless
> matte pure-white surface. Shot on a 100mm macro lens at f/5.6 from a low
> three-quarter angle just above the band line. Neutral 5500K daylight: one
> large soft key light from the upper left through a scrim, plus a narrow black
> negative-fill card just out of frame on the right, which reads as a crisp
> near-black band across the diamond's table and pavilion and gives every facet
> a hard defined edge. One soft directional contact shadow falls to the right of
> the ring, anchoring it to the surface. No colour cast anywhere — the gold is
> the only warm element and the white is truly neutral, not ivory or cream. The
> ring sits centred and fills roughly half the frame height — close enough that
> the band thickness, prong height and shank taper are all clearly legible.
> Sharp facet edges, visible prong detail. No lens flare, no glitter effects,
> no props.

Negative: *people, hands, marble, travertine, veined stone, fabric texture,
cream, ivory, warm cast, coloured background, glitter overlay, lens flare,
props, text, watermark.*

**Why this one.** The black negative-fill is the specific technique that fixes
white's one real weakness for diamonds — facets get structure instead of washing
out. It also means your `#1c1c1c` appears in the frame *as light*, not as a
prop, so the hero and the palette are the same idea. It reads modern,
transparent and lab-honest rather than old-money, which is the correct register
for lab-grown. And it is trend-proof: white seamless will not date the way a
trend surface does.

**Risk:** it demands real execution. A lazy white hero looks like a marketplace
packshot. If the negative-fill reflection is missed, the diamond goes to mush.

### Option B — "Onyx ground"

> Studio product photograph, no people. A single yellow-gold solitaire
> engagement ring stands upright on a seamless matte near-black surface
> (#1c1c1c), low three-quarter angle. Low-key lighting: one small hard specular
> source creating bright fire and controlled dispersion in the diamond's crown,
> plus a soft grazing fill from the left defining the curve of the gold band.
> The near-black graduates to true black at the top of the frame. A faint soft
> reflection of the ring in the surface beneath gives it weight. Gold and the
> diamond's sparkle are the only bright elements. Ring centred, filling about
> half the frame height. Immaculate — no dust, no props, no smoke.

**Why:** the most-recommended diamond ground in every professional source;
maximum sparkle; the most "jeweller's vault" reading of the palette.

**Risk:** it is the *expected* luxury move, so it is harder to feel distinctive.
Dark heroes lower perceived brightness on mobile, it leans traditional-luxury
against a modern lab-grown story, and it shows dust mercilessly.

### Option C — "Crown macro" — supporting frame, not the hero

> Extreme macro, no people. A round brilliant diamond's crown and table fill 70%
> of the frame, held by four yellow-gold prongs entering from the frame edges,
> on an out-of-focus neutral near-black ground. Hard specular light produces
> distinct white fire and controlled spectral dispersion inside the facets;
> facet junctions razor sharp; shallow depth of field with the table tack-sharp
> and the girdle falling away. No props, no glitter overlay.

**Why not the hero:** it fails the two jobs a stranger's first screen must do —
show what the ring looks like, and imply how big it is. For a brand with no
store where the photograph *is* the showroom, "what does the actual ring look
like" is the trust question. Excellent as a second frame or a section header.

---

## 7. After the images land

1. Save each `.webp` at the exact path listed.
2. Update the `src` values:
   - `src/components/HomeTryOnFeature.tsx` L218, L228 — try-on frames
   - `src/components/ProductView.tsx` L117–129 (`packagingByCategory`), L660
     (shopping bag), L672 (certificate)
   - `src/app/page.tsx` L415 (bespoke), L550 / L559 (experience section)
   - `src/app/page.tsx` L29 / L38 — hero desktop and mobile, via `getImageProps`
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
