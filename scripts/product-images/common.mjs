import { readFile, mkdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));

export const projectRoot = resolve(scriptDirectory, "../..");
export const config = JSON.parse(
  await readFile(resolve(projectRoot, "media/catalog.config.json"), "utf8"),
);
export const manifest = JSON.parse(
  await readFile(resolve(projectRoot, "media/catalog.manifest.json"), "utf8"),
);
export const outputDirectory = resolve(projectRoot, config.outputDirectory);
export const reportDirectory = resolve(projectRoot, ".media-reports");
export const masterRoot = resolve(
  projectRoot,
  process.env.LIBI_MEDIA_ROOT || config.defaultMasterRoot,
);

export function requestedProduct() {
  const index = process.argv.indexOf("--product");
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export function selectedProducts() {
  const slug = requestedProduct();
  const products = slug
    ? manifest.products.filter((product) => product.slug === slug)
    : manifest.products;

  if (slug && products.length === 0) {
    throw new Error(`Unknown product slug: ${slug}`);
  }

  return products;
}

export function productMetals(product) {
  return product.metals?.length ? product.metals : ["yellow", "white"];
}

export function masterPath(product, metal, view) {
  return resolve(masterRoot, product.slug, metal, `${view}.png`);
}

export function outputPath(product, metal, view) {
  return resolve(outputDirectory, `${product.slug}-${metal}-${view}.webp`);
}

export function targetOccupancy(product, view) {
  return view === "detail"
    ? config.occupancy.detail
    : config.occupancy[product.category];
}

export async function ensureDirectories() {
  await Promise.all([
    mkdir(outputDirectory, { recursive: true }),
    mkdir(reportDirectory, { recursive: true }),
  ]);
}

export async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function alphaBounds(input, threshold = config.alphaThreshold) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;
  let visiblePixels = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * info.channels + 3];
      if (alpha <= threshold) continue;
      visiblePixels += 1;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (right < left || bottom < top) {
    throw new Error(`No visible pixels found in ${input}`);
  }

  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
    right,
    bottom,
    canvasWidth: info.width,
    canvasHeight: info.height,
    visiblePixels,
  };
}

export async function inspectImage(path, product, view) {
  const metadata = await sharp(path).metadata();
  const bounds = await alphaBounds(path);
  const file = await stat(path);
  const occupancy = Math.max(bounds.width, bounds.height) / config.outputSize;
  const target = targetOccupancy(product, view);
  const margins = {
    left: bounds.left,
    top: bounds.top,
    right: config.outputSize - bounds.right - 1,
    bottom: config.outputSize - bounds.bottom - 1,
  };

  return {
    path,
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    hasAlpha: Boolean(metadata.hasAlpha),
    bytes: file.size,
    occupancy,
    targetOccupancy: target,
    bounds,
    margins,
  };
}

export function publicImagePath(product, metal, view) {
  return `/images/products/catalog/${product.slug}-${metal}-${view}.webp`;
}
