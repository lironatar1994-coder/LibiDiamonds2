# LIBI DIAMONDS

אתר תדמית ומכירה לתכשיטי יהלומי מעבדה — עברית, RTL, בגישת "יוקרה שקטה".

Built with **Next.js 15 + Tailwind CSS 4** (App Router, fully static output).

## Run

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build (all pages pre-rendered)
```

## Before going live — things to replace

| What | Where |
| --- | --- |
| WhatsApp number (currently a placeholder) | [src/lib/site.ts](src/lib/site.ts) → `whatsapp` + `phoneDisplay` |
| Email, Instagram, domain | [src/lib/site.ts](src/lib/site.ts) |
| Product catalog, prices, carat options | [src/data/products.ts](src/data/products.ts) |
| Guide articles (LIBI Journal) | [src/data/guides.ts](src/data/guides.ts) |
| Real product photography | swap `JewelryArt` in `ProductCard` / `ProductView` for `next/image` photos |

## Structure

- `src/app/` — pages: home, `/jewelry/[category]`, `/product/[slug]`, `/journal`, `/about`, `/contact`, `/service`
- `src/components/JewelryArt.tsx` — SVG line-art jewelry illustrations (placeholder until photography)
- `src/data/` — catalog + articles as typed data (no CMS needed yet)
- Selling flow is **WhatsApp-first**: every CTA opens a prefilled WhatsApp message (product, carat, metal, price). No cart/checkout by design — high-touch jewelry sales convert better through conversation. A payment flow can be added later.
