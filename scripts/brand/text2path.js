// Convert text to outlined SVG path data with manual letterspacing.
const opentype = require("opentype.js");
const fs = require("fs");

function textToPath(font, text, fontSize, tracking) {
  // tracking in em units (e.g. 0.22 = 22% of fontSize added between letters)
  const scale = fontSize / font.unitsPerEm;
  const track = tracking * fontSize;
  let x = 0;
  const paths = [];
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    const p = glyph.getPath(x, 0, fontSize);
    paths.push(p.toPathData(2));
    x += glyph.advanceWidth * scale + track;
  }
  const width = x - track; // no tracking after last letter
  return { d: paths.join(" "), width };
}

const jobs = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const out = {};
for (const job of jobs) {
  const buf = fs.readFileSync(job.font);
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const r = textToPath(font, job.text, job.size, job.tracking);
  out[job.id] = { ...r, ascender: (font.ascender / font.unitsPerEm) * job.size, capHeight: font.tables.os2 ? (font.tables.os2.sCapHeight / font.unitsPerEm) * job.size : null };
}
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
console.log("done", Object.keys(out).join(", "));
