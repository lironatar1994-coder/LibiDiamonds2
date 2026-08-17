---
name: LIBI DIAMONDS
description: Pearl-white light table with a garnet velvet counterpoint — the inside of the box
colors:
  paper: "#ffffff"
  pearl: "#fdfdfb"
  mist: "#f7f6f2"
  fog: "#f0eee8"
  hairline: "#e3e0d8"
  ink: "#1c2126"
  ink-soft: "#41454a"
  stone: "#6b6c66"
  velvet: "#41151f"
  velvet-2: "#54202c"
  velvet-press: "#2f0e16"
  on-velvet: "#f7f0e6"
  gilt: "#b5924b"
  gilt-deep: "#7c5d28"
  clay: "#8a4b3b"
  selection: "#efe3cf"
typography:
  display:
    fontFamily: "Frank Ruhl Libre, serif"
    fontSize: "clamp(3rem, 5.2vw, 5.8rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Assistant, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Assistant, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  square: "0px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "32px"
  lg: "64px"
  xl: "128px"
components:
  button-primary:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.on-velvet}"
    rounded: "{rounded.square}"
    padding: "14px 35px"
  product-tray:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
  header:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    height: "64px"
---

# Design System: LIBI DIAMONDS

## Overview

**Creative North Star: "The LIBI Box"**

The brand mark is a jewelry box: pearl-white outside, garnet velvet inside. The site is built from the same two materials.

The light half is a jeweler''s light table — bright, calm, exact, free of decorative chrome — and it carries the clear majority of every page. Real photography supplies the material richness; the interface contributes white space, fine gilt hairlines and decisive typography, then steps back.

Garnet velvet is the single dark counterpoint: the box interior. It appears in the virtual try-on passage, the packaging story and decisive controls, and nowhere else. Where a competitor reaches for another navy, LIBI reaches for the colour of the lining — warm, close to the skin, and unmistakably ours.

**Key Characteristics:**

- Paper-white page fields with mist-toned product trays.
- Large Hebrew display typography paired with quiet utility text.
- Flat, square-edged compositions with hairline separation.
- One velvet counterpoint per long commerce surface, never two.
- Real jewelry, packaging and atelier photography. No people, ever.

## Colors

Every colour in the build resolves through the token block at the top of `src/app/globals.css`. There are no raw hexes in rules — add or reuse a token instead.

### Primary

- **Velvet (#41151f):** The box interior. Dark sections, primary buttons, the try-on passage. **Velvet-2** raises panels inside it; **velvet-press** is the pressed state.
- **On-Velvet (#f7f0e6):** The one warm white used for text on velvet.

### Secondary

- **Gilt / Gilt-Deep:** Hairlines, selection, the 45° signature diamond and the focus ring on light grounds. Three hairline weights only — faint, mid, strong.
- **Clay (#8a4b3b):** The single corrective tone, for form errors. A muted terracotta in velvet''s family; never signal red.

### Neutral

- **Paper → Pearl → Mist → Fog:** Four light surfaces, lightest to deepest. Paper is the page, pearl is a card, mist is a tray or quiet panel, fog is the deepest light tone and the hover fill.
- **Ink / Ink-Soft / Stone:** Warm near-black, secondary and tertiary text. All three sit warm; nothing in the palette leans blue.
- **Hairline (#e3e0d8):** Rules, tray boundaries and structural dividers.

**The Light Majority Rule.** Light surfaces occupy the clear majority of every commerce page; velvet is rare enough to remain meaningful.

**The Hairline Gilt Rule.** Gold marks selection and craft at small scale. It never becomes a decorative background.

## Typography

**Display Font:** Frank Ruhl Libre (serif)

**Body Font:** Assistant (sans-serif)

**Character:** The display face brings a distinctly Hebrew editorial voice, while Assistant keeps configuration, prices and service copy practical and legible.

### Hierarchy

- **Display** (400, fluid up to 5.8rem, 0.98): Hero and major section statements; keep line breaks intentional and short.
- **Headline** (400–500, 2–4.8rem, about 1): Collection and editorial headings.
- **Title** (400–500, 1–1.5rem): Product names and supporting stories.
- **Body** (400, 1rem, 1.8): Explanatory content; keep readable measures around 65–75 characters.
- **Label** (600, 0.6875rem, 0.12em): Navigation, actions and configuration labels. Hebrew has no ascender rhythm to carry wide tracking, so labels sit far tighter than an all-caps Latin equivalent. Prices and measurements always carry `tabular-nums`.

**The One Display Voice Rule.** Frank Ruhl Libre owns expressive hierarchy; utility copy stays in Assistant instead of introducing additional decorative faces.

## Layout

Desktop uses a wide editorial shell up to roughly 94rem. The hero is a crisp split between image and message, while category discovery uses a 12-column mosaic: one dominant ring field, two smaller study fields and one wide collection field. Product selections use an editorial rail rather than equal-card repetition.

Mobile stacks the same content into a direct reading order with 16px side gutters and at least 44px controls. Photography remains large; supporting items become compact rows where that reduces scrolling. The 1024px breakpoint changes composition, not merely scale.

Sections use generous vertical rhythm, with more space before a new idea than between its heading and content. Long pages alternate image density, quiet white fields and one dark experiential passage.

## Elevation & Depth

The system is flat by default. Depth comes from real photographic lighting, tonal fields and occasional inset hairlines. Product cards may gain one soft ambient shadow on hover, but resting cards, navigation, footer and editorial panels remain unlifted.

**The Flat Light-Table Rule.** A surface does not receive both a visible border and a resting shadow. Structural separation is normally a one-pixel line.

## Shapes

Major surfaces, image frames, buttons and controls use square corners. The recurring diamond is a small 45-degree square used in signatures and selected states. Circular forms are reserved for physical color swatches, range thumbs and familiar icons.

## Components

### Buttons

- **Shape:** Square and architectural.
- **Primary:** Velvet background, on-velvet text and generous horizontal padding.
- **Hover / Press:** Fill shifts to velvet-press and the control drops 1px; keyboard focus is a 2px gilt-deep ring that inverts to warm white inside velvet.
- **Text action:** A quiet underline or hairline rule replaces a secondary button container.

### Cards / Containers

- **Corner Style:** Square.
- **Background:** Paper or mist field.
- **Shadow Strategy:** None at rest; soft ambient lift only as an interactive response.
- **Border:** One translucent ink hairline when separation is required.
- **Internal Padding:** Kept outside the image whenever possible so jewelry photography remains uninterrupted.

### Navigation

The header is translucent white over a hairline divider. Navigation uses small Assistant labels and a centered LIBI wordmark. Hover is indicated by a fine growing underline; mobile uses a full-screen white menu with generous touch targets.

### Product Tray

Products sit on a nearly white optical field with a restrained central light bloom and a physical shadow belonging to the photographed jewelry. Yellow and white metal share the same background world so catalog comparison remains stable.

### Virtual Try-On Passage

This is the single immersive velvet section. It pairs a large real product image with one short promise and a bordered action, then returns immediately to the light page world.

## Do's and Don'ts

### Do:

- **Do** give jewelry photography more area than interface chrome.
- **Do** use white space, scale and reading order before adding containers.
- **Do** reserve gilt for hairlines, selection and signature geometry.
- **Do** verify the 390px mobile composition and desktop composition independently.
- **Do** keep factual prices, materials, certificates and service claims sourced from product data.

### Don't:

- **Don't** rebuild the storefront from equal beige cards with layered shadows.
- **Don't** place consecutive full-width velvet sections on a commerce page.
- **Don't** add decorative kickers above headings or invented luxury copy.
- **Don't** use gradients or texture to imitate jewelry, paper, stone or metal when a real image should carry the material.
- **Don't** let gold become a large background or dominant text color.
