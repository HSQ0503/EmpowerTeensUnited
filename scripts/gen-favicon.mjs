// One-off: rasterize app/icon.svg into apple-icon.png + favicon.ico.
// Run with: node scripts/gen-favicon.mjs   (sharp ships with Next 16)
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const p = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const svg = readFileSync(p("../app/icon.svg"));

const png = (size) =>
  sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

// Apple touch icon — 180x180 on an opaque navy bg (iOS ignores transparency).
await sharp(svg, { density: 384 })
  .resize(180, 180)
  .flatten({ background: "#0F4566" })
  .png()
  .toFile(p("../app/apple-icon.png"));

// favicon.ico — pack 16/32/48 PNG entries into an ICO container.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4);

const entries = [];
let offset = 6 + images.length * 16;
images.forEach((img, i) => {
  const e = Buffer.alloc(16);
  const s = sizes[i];
  e.writeUInt8(s >= 256 ? 0 : s, 0); // width
  e.writeUInt8(s >= 256 ? 0 : s, 1); // height
  e.writeUInt8(0, 2); // palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(img.length, 8); // size
  e.writeUInt32LE(offset, 12); // offset
  offset += img.length;
  entries.push(e);
});

const ico = Buffer.concat([header, ...entries, ...images]);
writeFileSync(p("../app/favicon.ico"), ico);

console.log("Wrote app/apple-icon.png and app/favicon.ico");
