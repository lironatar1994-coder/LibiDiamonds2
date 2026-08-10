/*
 * White-point correction for white-metal product renders.
 *
 * docs/PRODUCT_PHOTOGRAPHY_STANDARD.md: "White diamonds stay neutral. Avoid blue
 * cast, warm haze." Two of the derived renders drifted off that in opposite
 * directions — the pear read champagne, the emerald read blue — which is visible
 * the moment they sit side by side in the homepage signature row.
 *
 * This measures the stone body's mean RGB, then applies a per-channel gain that
 * pulls it to neutral. It is idempotent: a file already within NEUTRAL_TOLERANCE
 * is reported and skipped, so re-running never compounds the correction.
 *
 * Yellow-gold pieces are deliberately absent — their warmth is the metal.
 *
 * Usage: node scripts/product-images/regrade-white-point.mjs [--check]
 */
import { stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// Files whose subject is a colourless stone in white metal.
const targets = [
  "public/images/editorial/home-signatures/seren-pear-solitaire-ring-white-primary.webp",
  "public/images/editorial/home-signatures/seren-pear-solitaire-ring-white-detail.webp",
  "public/images/editorial/home-signatures/atelier-emerald-cathedral-ring-white-primary.webp",
  "public/images/editorial/home-signatures/atelier-emerald-cathedral-ring-white-detail.webp",
  "public/images/products/catalog/seren-pear-solitaire-ring-white-primary.webp",
  "public/images/products/catalog/seren-pear-solitaire-ring-white-detail.webp",
  "public/images/products/catalog/atelier-emerald-cathedral-ring-white-primary.webp",
  "public/images/products/catalog/atelier-emerald-cathedral-ring-white-detail.webp",
];

const NEUTRAL_TOLERANCE = 1.2; // max |channel - mean| in 0-255 before a file is touched
const MAX_GAIN = 1.08; // refuse to "correct" something that is a different problem
// This re-encodes an already-lossy render, so the second pass has to be light
// enough not to compound. q97 reproduces the source files' byte size to within a
// couple of percent, i.e. it re-encodes at roughly the quality they were made at.
// (nearLossless would be ~2.9x the size for no visible gain.)
const WEBP = { quality: 97, effort: 6, smartSubsample: false };
const MAX_GROWTH = 1.15; // fail loudly rather than ship a much heavier render

/** Mean RGB of the opaque mid-tones in the centre of the frame — the stone body. */
async function measureBody(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  let n = 0;
  const sum = [0, 0, 0];

  for (let y = Math.floor(height * 0.28); y < height * 0.72; y += 1) {
    for (let x = Math.floor(width * 0.3); x < width * 0.7; x += 1) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 250) continue;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (luma < 90 || luma > 230) continue; // skip shadow and blown sparkle
      sum[0] += r;
      sum[1] += g;
      sum[2] += b;
      n += 1;
    }
  }

  if (!n) throw new Error(`No measurable stone body in ${file}`);
  return sum.map((total) => total / n);
}

async function regrade(relativePath, { check }) {
  const file = path.join(projectRoot, relativePath);
  const body = await measureBody(file);
  const target = body.reduce((a, b) => a + b, 0) / 3;
  const drift = Math.max(...body.map((channel) => Math.abs(channel - target)));
  const label = path.basename(relativePath).replace(".webp", "");
  const readout = body.map((c) => c.toFixed(1)).join(" / ");

  if (drift <= NEUTRAL_TOLERANCE) {
    console.log(`  neutral  ${label.padEnd(46)} ${readout}  (drift ${drift.toFixed(2)})`);
    return false;
  }

  const gains = body.map((channel) => target / channel);
  if (gains.some((gain) => gain > MAX_GAIN || gain < 1 / MAX_GAIN)) {
    throw new Error(`${relativePath}: gain ${gains.map((g) => g.toFixed(3))} exceeds ${MAX_GAIN}`);
  }

  if (check) {
    console.log(`  DRIFTED  ${label.padEnd(46)} ${readout}  (drift ${drift.toFixed(2)})`);
    return true;
  }

  const sizeBefore = (await stat(file)).size;
  // Split the alpha off so the gain never touches the cut-out edge.
  const alpha = await sharp(file).ensureAlpha().extractChannel(3).toBuffer();
  const corrected = await sharp(file)
    .removeAlpha()
    .linear(gains, [0, 0, 0])
    .toColourspace("srgb")
    .toBuffer();

  const output = await sharp(corrected).joinChannel(alpha).webp(WEBP).toBuffer();

  if (output.length > sizeBefore * MAX_GROWTH) {
    throw new Error(
      `${relativePath}: re-encode grew ${(output.length / sizeBefore).toFixed(2)}x ` +
        `(${sizeBefore} -> ${output.length} bytes)`,
    );
  }

  await writeFile(file, output);

  const after = await measureBody(file);
  const afterDrift = Math.max(
    ...after.map((c) => Math.abs(c - after.reduce((a, b) => a + b, 0) / 3)),
  );
  const sizeAfter = (await stat(file)).size;
  console.log(
    `  corrected ${label.padEnd(45)} ${readout} -> ${after.map((c) => c.toFixed(1)).join(" / ")}` +
      `  (drift ${drift.toFixed(2)} -> ${afterDrift.toFixed(2)},` +
      ` ${Math.round(sizeBefore / 1024)}KB -> ${Math.round(sizeAfter / 1024)}KB)`,
  );
  return true;
}

const check = process.argv.includes("--check");
console.log(check ? "Checking white point:" : "Correcting white point:");

let changed = 0;
for (const target of targets) {
  if (await regrade(target, { check })) changed += 1;
}

if (check && changed) {
  console.error(`\n${changed} render(s) off neutral. Run without --check to correct.`);
  process.exit(1);
}

console.log(check ? "\nAll renders neutral." : `\nDone. ${changed} render(s) corrected.`);
