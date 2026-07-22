# Product 360 asset standard

Use exact CAD renders or a controlled turntable shoot of the authoritative product. Do not create a spin sequence from unrelated AI-generated angles: prongs, stone geometry and band thickness must remain identical between every frame.

## Delivery

- 24 frames at 15-degree increments.
- 1400 x 1400 WebP.
- Up to 120 KB per frame.
- Fixed camera, product center, scale, light direction and background.
- Frame 01 is the approved poster view.
- Separate sets for yellow and white gold.

```text
public/images/products/360/{product-slug}/{metal}/frame-01.webp
...
public/images/products/360/{product-slug}/{metal}/frame-24.webp
```

Valid metal directory names are `yellow`, `white` and `rose`.

Run `npm run spin:check` before adding `spinByMetal` to the product data. Inspect the generated `.spin-reports` contact sheet for geometry drift, camera jumps, changing stone count, malformed prongs and inconsistent reflections.
