import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// CRC32 (PNG standard)
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function makePng(size, r, g, b, accentSize) {
  // RGBA raw data with rounded corners and centered accent circle
  const channels = 4;
  const raw = Buffer.alloc(size * size * channels + size); // +size for filter bytes per row
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.18; // rounded corner radius
  const accentR = (accentSize ?? size * 0.32);

  let pos = 0;
  for (let y = 0; y < size; y++) {
    raw[pos++] = 0; // filter byte (None)
    for (let x = 0; x < size; x++) {
      // Rounded corners
      const dx = Math.max(0, Math.abs(x - cx) - (cx - radius));
      const dy = Math.max(0, Math.abs(y - cy) - (cy - radius));
      const cornerDist = Math.sqrt(dx * dx + dy * dy);
      const insideRound = cornerDist <= radius;

      // Accent circle in center (lighter color)
      const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const insideAccent = distFromCenter <= accentR;

      let pr = r, pg = g, pb = b, pa = 255;
      if (!insideRound) {
        pa = 0; // transparent corner
      } else if (insideAccent) {
        // Lighter dumbbell-ish accent
        pr = Math.min(255, r + 80);
        pg = Math.min(255, g + 80);
        pb = Math.min(255, b + 80);
      }
      raw[pos++] = pr;
      raw[pos++] = pg;
      raw[pos++] = pb;
      raw[pos++] = pa;
    }
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const idat = zlib.deflateSync(raw);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(process.cwd(), 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

// emerald-500: rgb(16, 185, 129)
const sizes = [192, 512];
for (const size of sizes) {
  const png = makePng(size, 16, 185, 129);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`wrote icon-${size}.png (${png.length} bytes)`);
}

// Apple touch icon (180×180 recommended)
const apple = makePng(180, 16, 185, 129);
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), apple);
console.log(`wrote apple-touch-icon.png (${apple.length} bytes)`);
