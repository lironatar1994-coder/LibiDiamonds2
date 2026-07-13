import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import sharp from "sharp";
import {
  config,
  ensureDirectories,
  exists,
  outputPath,
  reportDirectory,
  selectedProducts,
} from "./common.mjs";

await ensureDirectories();
const entries = [];

for (const product of selectedProducts()) {
  for (const view of product.views) {
    const path = outputPath(product, view);
    if (!(await exists(path))) continue;
    const image = await readFile(path);
    entries.push({
      slug: product.slug,
      category: product.category,
      view,
      filename: basename(path),
      dataUrl: `data:image/webp;base64,${image.toString("base64")}`,
    });
  }
}

if (entries.length === 0) {
  throw new Error("No rendered catalog images are available for a contact sheet.");
}

for (const [surfaceIndex, background] of config.previewSurfaces.entries()) {
  const columns = 4;
  const tileWidth = 360;
  const tileHeight = 405;
  const rows = Math.ceil(entries.length / columns);
  const composites = [];

  for (const [index, entry] of entries.entries()) {
    const image = await sharp(outputPath(entry, entry.view))
      .resize(330, 330, { fit: "contain" })
      .webp({ quality: 86 })
      .toBuffer();
    const label = Buffer.from(
      `<svg width="340" height="55" xmlns="http://www.w3.org/2000/svg"><text x="170" y="22" text-anchor="middle" font-family="Arial" font-size="15" fill="#121313">${entry.slug}</text><text x="170" y="43" text-anchor="middle" font-family="Arial" font-size="12" fill="#686b69">${entry.view}</text></svg>`,
    );
    const column = index % columns;
    const row = Math.floor(index / columns);
    composites.push({ input: image, left: column * tileWidth + 15, top: row * tileHeight + 10 });
    composites.push({ input: label, left: column * tileWidth + 10, top: row * tileHeight + 340 });
  }

  await sharp({
    create: {
      width: columns * tileWidth,
      height: rows * tileHeight,
      channels: 3,
      background,
    },
  })
    .composite(composites)
    .webp({ quality: 88, effort: 5 })
    .toFile(`${reportDirectory}/catalog-contact-sheet-${surfaceIndex + 1}.webp`);
}

const cards = entries
  .map(
    (entry) => `
      <article class="item">
        <div class="surface"><img src="${entry.dataUrl}" alt="" /></div>
        <strong>${entry.slug}</strong><span>${entry.category} / ${entry.view}</span>
      </article>`,
  )
  .join("");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>LIBI catalog media report</title>
<style>
:root{--surface:${config.catalogBackground}}*{box-sizing:border-box}body{margin:0;background:#121313;color:#f7f6f2;font:14px Arial,sans-serif}header{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:18px 24px;background:#121313;border-bottom:1px solid #343636}h1{margin:0;font:24px Georgia,serif}.controls{display:flex;gap:8px}.controls button{width:30px;height:30px;border:1px solid #686b69;background:var(--button);cursor:pointer}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1px;background:#343636}.item{background:#1c1e1d;padding:14px}.surface{aspect-ratio:1;background:var(--surface);margin-bottom:12px}.surface img{display:block;width:100%;height:100%;object-fit:contain}.item strong,.item span{display:block}.item span{margin-top:4px;color:#9ea29f}
</style></head><body><header><h1>LIBI catalog media report</h1><div class="controls">${config.previewSurfaces.map((color) => `<button style="--button:${color}" title="${color}" onclick="document.documentElement.style.setProperty('--surface','${color}')"></button>`).join("")}</div></header><main class="grid">${cards}</main></body></html>`;

await writeFile(`${reportDirectory}/catalog-report.html`, html, "utf8");
console.log(`Created contact sheets and HTML report for ${entries.length} image(s).`);
