import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public/images/products/360");
const OUTPUT = path.resolve(".spin-reports");
const FRAME_COUNT = 24;
const TILE = 180;
const COLUMNS = 6;
const ROWS = 4;

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

const sets = [];
for (const productDirectory of await directoriesAt(ROOT)) {
  for (const metalDirectory of await directoriesAt(productDirectory)) sets.push(metalDirectory);
}

if (sets.length === 0) {
  console.log("No spin asset sets found. No contact sheets created.");
  process.exit(0);
}

await mkdir(OUTPUT, { recursive: true });
for (const setDirectory of sets) {
  const [slug, metal] = path.relative(ROOT, setDirectory).split(path.sep);
  const composites = [];
  for (let index = 0; index < FRAME_COUNT; index += 1) {
    const filePath = path.join(setDirectory, `frame-${String(index + 1).padStart(2, "0")}.webp`);
    const input = await sharp(filePath)
      .resize(TILE, TILE, { fit: "contain", background: "#f7f6f2" })
      .flatten({ background: "#f7f6f2" })
      .png()
      .toBuffer();
    composites.push({ input, left: (index % COLUMNS) * TILE, top: Math.floor(index / COLUMNS) * TILE });
  }
  const outputPath = path.join(OUTPUT, `${slug}-${metal}.png`);
  await sharp({
    create: { width: COLUMNS * TILE, height: ROWS * TILE, channels: 3, background: "#f7f6f2" },
  }).composite(composites).png().toFile(outputPath);
  console.log(`Created ${path.relative(process.cwd(), outputPath)}`);
}
