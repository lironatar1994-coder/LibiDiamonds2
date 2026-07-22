import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public/images/products/360");
const FRAME_COUNT = 24;
const DIMENSION = 1400;
const MAX_BYTES = 120 * 1024;

async function directoriesAt(directory) {
  try {
    return (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(directory, entry.name));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

const productDirectories = await directoriesAt(ROOT);
const sets = [];
for (const productDirectory of productDirectories) {
  for (const metalDirectory of await directoriesAt(productDirectory)) {
    sets.push(metalDirectory);
  }
}

if (sets.length === 0) {
  console.log("No spin asset sets found. Nothing to validate.");
  process.exit(0);
}

const failures = [];
for (const setDirectory of sets) {
  const label = path.relative(ROOT, setDirectory).replaceAll(path.sep, "/");
  for (let index = 1; index <= FRAME_COUNT; index += 1) {
    const filename = `frame-${String(index).padStart(2, "0")}.webp`;
    const filePath = path.join(setDirectory, filename);
    try {
      const [metadata, fileStats] = await Promise.all([sharp(filePath).metadata(), stat(filePath)]);
      if (metadata.format !== "webp") failures.push(`${label}/${filename}: expected WebP`);
      if (metadata.width !== DIMENSION || metadata.height !== DIMENSION) {
        failures.push(`${label}/${filename}: expected ${DIMENSION}x${DIMENSION}, got ${metadata.width}x${metadata.height}`);
      }
      if (fileStats.size > MAX_BYTES) {
        failures.push(`${label}/${filename}: ${(fileStats.size / 1024).toFixed(1)} KB exceeds 120 KB`);
      }
    } catch (error) {
      failures.push(`${label}/${filename}: ${error.code === "ENOENT" ? "missing" : error.message}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Spin validation failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Validated ${sets.length} spin set(s), ${sets.length * FRAME_COUNT} frames.`);
