import fs from 'node:fs';
import zlib from 'node:zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const toCrc = Buffer.alloc(4 + len);
  toCrc.write(type, 0, 4, 'ascii');
  data.copy(toCrc, 4);
  buf.writeUInt32BE(crc32(toCrc), 8 + len);
  return buf;
}

function generateMedicalIconPNG(size, isMaskable = false) {
  // RGBA buffer with filter byte at start of each line
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * (size * 4 + 1);
    raw[rowOffset] = 0; // Filter: None
    for (let x = 0; x < size; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background
      let r = 15; // #0f172a slate-900
      let g = 23;
      let b = 42;
      let a = 255;

      if (!isMaskable && dist > radius) {
        // Outside circle for non-maskable icon
        a = 0;
      } else {
        // Subtle gradient background
        const grad = (x + y) / (size * 2);
        r = Math.floor(15 + grad * 12);
        g = Math.floor(23 + grad * 28);
        b = Math.floor(42 + grad * 45);

        // Medical Cross / ECG Heartbeat pattern inside safe zone
        const innerDist = Math.hypot(dx, dy);
        const crossThick = size * 0.08;
        const crossLen = size * 0.28;

        const inHorizCross = Math.abs(dy) <= crossThick && Math.abs(dx) <= crossLen;
        const inVertCross = Math.abs(dx) <= crossThick && Math.abs(dy) <= crossLen;

        // ECG Line across horizontal middle
        const ecgDistY = Math.abs(dy - (size * 0.08));
        const inLine = ecgDistY <= (size * 0.018) && Math.abs(dx) <= size * 0.38;

        // Peak and valley
        let inPeak = false;
        if (dx >= -size * 0.08 && dx <= size * 0.08) {
          const expectedY = size * 0.08 - (dx < 0 ? (dx + size * 0.08) * 3 : (size * 0.08 - dx) * 3);
          if (Math.abs(dy - expectedY) <= size * 0.02) inPeak = true;
        }

        if (inHorizCross || inVertCross) {
          // Emerald / Teal medical cross
          r = 16;  // #10b981
          g = 185;
          b = 129;
          a = 255;
        }

        if (inLine || inPeak) {
          // Bright cyan ECG line
          r = 56;  // #38bdf8
          g = 189;
          b = 248;
          a = 255;
        }
      }

      raw[pixelOffset] = r;
      raw[pixelOffset + 1] = g;
      raw[pixelOffset + 2] = b;
      raw[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(raw, { level: 9 });

  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // ColorType: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const chunks = [
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ];

  return Buffer.concat(chunks);
}

// Generate files
fs.mkdirSync('./public', { recursive: true });
fs.writeFileSync('./public/pwa-192x192.png', generateMedicalIconPNG(192, false));
fs.writeFileSync('./public/pwa-512x512.png', generateMedicalIconPNG(512, false));
fs.writeFileSync('./public/pwa-maskable-512x512.png', generateMedicalIconPNG(512, true));
fs.writeFileSync('./public/apple-touch-icon.png', generateMedicalIconPNG(180, true));
console.log('Icons generated successfully.');
