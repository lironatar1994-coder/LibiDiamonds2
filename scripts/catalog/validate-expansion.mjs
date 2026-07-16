import { access, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
async function loadProducts(sourcePath, exportName) {
  const source = await readFile(sourcePath, "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
  return module[exportName];
}

const products = [
  ...await loadProducts(path.join(root, "src/data/catalog/expansion.ts"), "expansionProducts"),
  ...await loadProducts(path.join(root, "src/data/catalog/ring-expansion.ts"), "ringExpansionProducts"),
];
const manifest = JSON.parse(await readFile(path.join(root, "media/catalog.manifest.json"), "utf8"));
const mediaRoot = path.resolve(root, process.env.LIBI_MEDIA_ROOT || "../LibiDiamondsAssets/masters");
const failures = [];

if (!Array.isArray(products) || products.length !== 49) {
  failures.push(`expected 49 expansion products, found ${products?.length ?? 0}`);
}

const slugs = new Set();
for (const product of products) {
  if (slugs.has(product.slug)) failures.push(`${product.slug}: duplicate expansion slug`);
  slugs.add(product.slug);
  if (!product.name || !product.subtitle || !product.description) failures.push(`${product.slug}: missing Hebrew copy`);
  if (!product.style || !product.caratScope) failures.push(`${product.slug}: missing style or caratScope`);
  if (product.metals?.join(",") !== "yellow,white") failures.push(`${product.slug}: expected yellow and white metals`);
  if (!Array.isArray(product.carats) || product.carats.length < 3) failures.push(`${product.slug}: expected at least three carat options`);
  const prices = product.carats?.map((option) => option.price) ?? [];
  if (product.priceFrom !== Math.min(...prices)) failures.push(`${product.slug}: priceFrom does not match lowest carat price`);
  if (prices.some((price, index) => index > 0 && price <= prices[index - 1])) failures.push(`${product.slug}: carat prices are not ascending`);
  if (!Array.isArray(product.dimensions) || product.dimensions.length < 2) failures.push(`${product.slug}: missing dimensions`);

  const manifestMatches = manifest.products.filter((entry) => entry.slug === product.slug);
  if (manifestMatches.length !== 1) failures.push(`${product.slug}: expected exactly one manifest entry`);
  if (manifestMatches[0]?.category !== product.category) failures.push(`${product.slug}: category differs from manifest`);

  if (process.argv.includes("--images")) {
    for (const metal of ["yellow", "white"]) {
      for (const view of ["primary", "detail"]) {
        const master = path.join(mediaRoot, product.slug, metal, `${view}.png`);
        const output = path.join(root, "public/images/products/catalog", `${product.slug}-${metal}-${view}.webp`);
        try { await access(master); } catch { failures.push(`${product.slug}: missing ${metal}/${view} master`); }
        try { await access(output); } catch { failures.push(`${product.slug}: missing ${metal}/${view} output`); }
      }
    }
  }
}

const allManifestSlugs = manifest.products.map((entry) => entry.slug);
if (new Set(allManifestSlugs).size !== allManifestSlugs.length) failures.push("manifest contains duplicate slugs");
if (manifest.products.length !== 85) failures.push(`expected 85 manifest products, found ${manifest.products.length}`);

if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  throw new Error(`${failures.length} catalog validation issue(s)`);
}

console.log(`Validated ${products.length} expansion products and ${manifest.products.length} manifest entries.`);
