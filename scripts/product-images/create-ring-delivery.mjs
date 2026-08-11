import path from "node:path";
import sharp from "sharp";

const [, , ...inputs] = process.argv;

if (inputs.length === 0) {
  throw new Error("Pass one or more native PNG paths.");
}

for (const input of inputs) {
  if (!input.endsWith("-native.png")) {
    throw new Error(`Expected a -native.png input: ${input}`);
  }

  const output = input.replace(/-native\.png$/, "-8k.png");
  await sharp(input)
    .resize(7680, 7680, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.35, m1: 0.4, m2: 0.2 })
    .png({ compressionLevel: 9 })
    .toFile(output);

  const metadata = await sharp(output).metadata();
  if (metadata.width !== 7680 || metadata.height !== 7680) {
    throw new Error(`Delivery derivative has incorrect dimensions: ${output}`);
  }

  console.log(path.resolve(output));
}
