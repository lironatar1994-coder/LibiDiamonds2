import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const input = path.join(root, "public/images/editorial/categories/rings-mobile.webp");
const output = path.join(root, "public/images/editorial/categories/rings-mobile-viewing-tray.webp");

const metadata = await sharp(input).metadata();
const width = metadata.width ?? 1200;
const height = metadata.height ?? 1600;
const cropWidth = Math.round(width / 1.1);
const cropHeight = Math.round(height / 1.1);
const left = Math.max(0, Math.round((width - cropWidth) / 2));
const top = Math.min(height - cropHeight, Math.round((height - cropHeight) * 0.82));

await sharp(input)
  .extract({ left, top, width: cropWidth, height: cropHeight })
  .resize(width, height, { fit: "fill" })
  .sharpen({ sigma: 0.55, m1: 0.75, m2: 1.6 })
  .modulate({ brightness: 1.005, saturation: 1.02 })
  .linear(1.025, -2.5)
  .webp({ quality: 92, smartSubsample: true })
  .toFile(output);

console.log(`Created ${path.relative(root, output)} from the authentic rings editorial photograph.`);
