# Libi Diamonds agent instructions

## Visitor analytics

- `src/components/VisitorSignal.tsx` emits one anonymous first-party navigation signal after client-side rendering and route changes. Keep visitor IDs random and short-lived, session IDs session-scoped, and never add fingerprinting attributes.
- `src/app/api/visit-signal/route.ts` is the only browser-facing analytics bridge. Require a same-origin request, forward the visitor IP and user agent server-to-server, and never expose the shared key to client code or a `NEXT_PUBLIC_*` variable.
- Production reads the shared service key from `VISITOR_SIGNAL_KEY` or `/root/.visitor-signal-key` and forwards to the internal ServerMonitor endpoint. Signal failure must never block storefront navigation or rendering.
- A browser signal confirms that first-party JavaScript executed; it must never be described as proof of a human visitor or customer.

## Ring image work

Before writing a prompt, generating, editing, or approving any diamond-ring image, read `docs/RING_IMAGE_GENERATION.md` in full and follow it.

- Begin every new ring with a completed configuration. Never send bracketed placeholders to an image model.
- Use `C:\Users\User\Documents\LibiDiamondsAssets\references\RingPhotographyMaster.webp` as the canonical reference unless the user explicitly supplies another reference. Its lighting strength, zoom ratio, diamond color, and ring-metal color have highest priority.
- Use `C:\Users\User\Documents\LibiDiamondsAssets\generated\ring-variations\three-stone-pave-platinum-round-2ct-v6-sharp-native.png` as the approved generated-image benchmark for diamond realism, side-stone realism, focus-stacked sharpness, clean prongs, and final artifact polish. The canonical reference still has priority for lighting, zoom, diamond color, and metal color.
- Treat reference images as visual references, not edit targets, unless the user explicitly asks to modify them.
- Preserve every successful feature that the user did not request to change.
- Validate design geometry, stone/prong counts, manufacturability, diamond realism, symmetry, framing, and prohibited elements before accepting an output.
- Keep source/reference imagery in the adjacent `LibiDiamondsAssets` repository. Do not overwrite an existing asset; use a descriptive versioned filename.
- For every approved new catalog-ring image, preserve a sharp native PNG and create a separate exact `7680 x 7680` delivery derivative using the workflow and naming rules in `docs/RING_IMAGE_GENERATION.md`.
- For production catalog onboarding and export requirements, also follow `docs/PRODUCT_PHOTOGRAPHY_STANDARD.md`.
