import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import {
  exists,
  outputPath,
  productMetals,
  reportDirectory,
  selectedProducts,
} from "./common.mjs";

const scopeIndex = process.argv.indexOf("--scope");
const scope = scopeIndex >= 0 ? process.argv[scopeIndex + 1] : "all";
const allowedScopes = new Set(["all", "rings", "non-rings"]);
if (!allowedScopes.has(scope)) {
  throw new Error(`Unknown review scope: ${scope}`);
}

const products = selectedProducts().filter((product) => {
  if (scope === "rings") return product.category === "rings";
  if (scope === "non-rings") return product.category !== "rings";
  return true;
});
const reviewSlug = scope === "non-rings" ? "non-ring-review" : `${scope}-review`;
const filePrefix = scope === "non-rings" ? "non-rings" : scope;
const outputDirectory = resolve(reportDirectory, reviewSlug);
await mkdir(outputDirectory, { recursive: true });

const tileWidth = 620;
const tileHeight = 690;
const columns = 3;
const rows = 2;
const productsPerPage = columns * rows;
const pages = Math.ceil(products.length / productsPerPage);
const imageSize = 280;
const imagePositions = [
  { metal: "yellow", view: "primary", left: 20, top: 55 },
  { metal: "white", view: "primary", left: 320, top: 55 },
  { metal: "yellow", view: "detail", left: 20, top: 365 },
  { metal: "white", view: "detail", left: 320, top: 365 },
];
const auditEntries = [];

for (let page = 0; page < pages; page += 1) {
  const pageProducts = products.slice(page * productsPerPage, (page + 1) * productsPerPage);
  const composites = [];

  for (const [productIndex, product] of pageProducts.entries()) {
    const column = productIndex % columns;
    const row = Math.floor(productIndex / columns);
    const tileLeft = column * tileWidth;
    const tileTop = row * tileHeight;
    const availableMetals = new Set(productMetals(product));

    composites.push({
      input: Buffer.from(
        `<svg width="${tileWidth}" height="${tileHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#ffffff"/>
          <rect x="0.5" y="0.5" width="${tileWidth - 1}" height="${tileHeight - 1}" fill="none" stroke="#e8e8e8"/>
          <text x="${tileWidth / 2}" y="24" text-anchor="middle" font-family="Arial" font-size="17" fill="#111111">${product.slug}</text>
          <text x="${tileWidth / 2}" y="44" text-anchor="middle" font-family="Arial" font-size="12" fill="#777777">${product.category}</text>
          <text x="160" y="354" text-anchor="middle" font-family="Arial" font-size="13" fill="#666666">yellow / primary</text>
          <text x="460" y="354" text-anchor="middle" font-family="Arial" font-size="13" fill="#666666">white / primary</text>
          <text x="160" y="664" text-anchor="middle" font-family="Arial" font-size="13" fill="#666666">yellow / detail</text>
          <text x="460" y="664" text-anchor="middle" font-family="Arial" font-size="13" fill="#666666">white / detail</text>
        </svg>`,
      ),
      left: tileLeft,
      top: tileTop,
    });

    const files = [];
    for (const position of imagePositions) {
      if (!availableMetals.has(position.metal) || !product.views.includes(position.view)) continue;
      const path = outputPath(product, position.metal, position.view);
      if (!(await exists(path))) throw new Error(`Missing catalog render: ${path}`);
      const image = await sharp(path)
        .resize(imageSize, imageSize, { fit: "contain" })
        .png()
        .toBuffer();
      composites.push({
        input: image,
        left: tileLeft + position.left,
        top: tileTop + position.top,
      });
      files.push({ metal: position.metal, view: position.view, path });
    }
    auditEntries.push({ category: product.category, slug: product.slug, page: page + 1, files });
  }

  const pageHeight = Math.ceil(pageProducts.length / columns) * tileHeight;
  await sharp({
    create: {
      width: columns * tileWidth,
      height: pageHeight,
      channels: 3,
      background: "#ffffff",
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(resolve(outputDirectory, `${filePrefix}-page-${String(page + 1).padStart(2, "0")}.png`));
}

await writeFile(
  resolve(outputDirectory, `${filePrefix}-review-index.json`),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), scope, products: auditEntries }, null, 2)}\n`,
  "utf8",
);

console.log(`Created ${pages} review sheet(s) for ${products.length} ${scope} products.`);
