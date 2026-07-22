# LIBI Product Photography Standard

## Source masters

- Store source masters in the separate `LibiDiamondsAssets` repository.
- Use `masters/<product-slug>/primary.png` and `detail.png`.
- New masters must be square, at least 2400 x 2400, sRGB, and include alpha.
- Masters contain the product only. The render pipeline creates the standardized soft shadow so it stays consistent across the catalog.
- Existing 1600 x 1600 catalog images may be marked `legacyResolution` during migration. Do not upscale them to claim false detail.
- Keep the exact product geometry. Background cleanup must not change stone count, prongs, clasps, chain links, or metal color.

## Art direction

- Catalog surfaces use `--catalog-background: #f7f6f2`.
- Light comes from the upper left. A restrained, semi-transparent shadow is added during rendering.
- White diamonds stay neutral. Avoid blue cast, warm haze, clipped highlights, or heavy rainbow dispersion.
- Rings occupy 68% of the square, earring pairs 58%, and necklaces or bracelets 82%.
- Detail views occupy 84% and must depict the same product as the primary view.

## Product onboarding

1. Add the primary and detail masters to `LibiDiamondsAssets`.
2. Add the product to `media/catalog.manifest.json`.
3. Run `npm run images:check` from `LibiDiamonds2`.
4. Open `.media-reports/catalog-report.html` and inspect all three surface colors.
5. Verify product identity, edge quality, shadow, scale, and metal color.
6. Update product gallery paths only after validation and human review pass.

Set `LIBI_MEDIA_ROOT` when the media repository is not located next to the app repository.
