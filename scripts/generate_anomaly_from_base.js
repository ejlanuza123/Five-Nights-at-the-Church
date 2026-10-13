/**
 * Decodes church_cam_normal.png and creates the Active Anomaly (Possessed/Moved) version
 * church_cam_anomaly.png matching all 4 paranormal shifts.
 */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function decodePNG(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];

  if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
    throw new Error(`Unsupported PNG: bitDepth=${bitDepth}, colorType=${colorType}`);
  }

  const channels = colorType === 6 ? 4 : 3;

  // Find all IDAT chunks and concatenate
  let pos = 8;
  const idatParts = [];
  while (pos < buf.length) {
    const chunkLen = buf.readUInt32BE(pos);
    const chunkType = buf.toString('ascii', pos + 4, pos + 8);
    if (chunkType === 'IDAT') {
      idatParts.push(buf.subarray(pos + 8, pos + 8 + chunkLen));
    }
    pos += 12 + chunkLen;
  }

  const compressedData = Buffer.concat(idatParts);
  const uncompressed = zlib.inflateSync(compressedData);

  // Unfilter scanlines
  const rowBytes = width * channels;
  const rgbaBuffer = Buffer.alloc(width * height * 4);

  const prevRow = Buffer.alloc(rowBytes);
  const curRow = Buffer.alloc(rowBytes);

  let inOffset = 0;
  for (let y = 0; y < height; y++) {
    const filterType = uncompressed[inOffset++];
    for (let i = 0; i < rowBytes; i++) {
      const raw = uncompressed[inOffset++];
      const a = i >= channels ? curRow[i - channels] : 0;
      const b = prevRow[i];
      const c = i >= channels ? prevRow[i - channels] : 0;

      let val = 0;
      switch (filterType) {
        case 0: val = raw; break;
        case 1: val = (raw + a) & 0xff; break;
        case 2: val = (raw + b) & 0xff; break;
        case 3: val = (raw + Math.floor((a + b) / 2)) & 0xff; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
          val = (raw + pr) & 0xff;
          break;
        }
        default: val = raw;
      }
      curRow[i] = val;
    }

    // Write to RGBA buffer
    const outRowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const inX = x * channels;
      const outX = outRowOffset + x * 4;
      rgbaBuffer[outX] = curRow[inX];
      rgbaBuffer[outX + 1] = curRow[inX + 1];
      rgbaBuffer[outX + 2] = curRow[inX + 2];
      rgbaBuffer[outX + 3] = channels === 4 ? curRow[inX + 3] : 255;
    }

    curRow.copy(prevRow);
  }

  return { width, height, data: rgbaBuffer };
}

function encodePNG(width, height, rgbaBuffer) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const inOffset = y * width * 4;
    const outOffset = y * rowSize;
    rawData[outOffset] = 0; // Filter 0
    rgbaBuffer.copy(rawData, outOffset + 1, inOffset, inOffset + width * 4);
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);
    const crcVal = zlib.crc32(body);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal >>> 0, 0);
    return Buffer.concat([len, body, crcBuf]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Transform Base Image into Active Anomaly Version
const baseImgPath = path.join(__dirname, '..', 'assets', 'cctv', 'church_cam_normal.png');
const outAnomalyPath = path.join(__dirname, '..', 'assets', 'cctv', 'church_cam_anomaly.png');

console.log('Decoding base image:', baseImgPath);
const img = decodePNG(baseImgPath);
const { width, height, data } = img;
console.log(`Image decoded successfully (${width}x${height})`);

// Helper to get/set pixels
function getPixel(x, y) {
  x = Math.max(0, Math.min(width - 1, Math.floor(x)));
  y = Math.max(0, Math.min(height - 1, Math.floor(y)));
  const idx = (y * width + x) * 4;
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
}

function setPixel(x, y, r, g, b, a = 255) {
  x = Math.max(0, Math.min(width - 1, Math.floor(x)));
  y = Math.max(0, Math.min(height - 1, Math.floor(y)));
  const idx = (y * width + x) * 4;
  data[idx] = Math.max(0, Math.min(255, Math.floor(r)));
  data[idx + 1] = Math.max(0, Math.min(255, Math.floor(g)));
  data[idx + 2] = Math.max(0, Math.min(255, Math.floor(b)));
  data[idx + 3] = Math.max(0, Math.min(255, Math.floor(a)));
}

// Clone original buffer for sampling
const originalData = Buffer.from(data);
function getOriginalPixel(x, y) {
  x = Math.max(0, Math.min(width - 1, Math.floor(x)));
  y = Math.max(0, Math.min(height - 1, Math.floor(y)));
  const idx = (y * width + x) * 4;
  return [originalData[idx], originalData[idx + 1], originalData[idx + 2], originalData[idx + 3]];
}

console.log('Applying paranormal anomaly shifts...');

// 1. SHIFT 1: Saint in Left Alcove (x: 100-140, y: 360-440)
// Turns body and head to face DIRECTLY toward camera, staring upward with dead hollow eyes!
for (let y = 360; y <= 450; y++) {
  for (let x = 95; x <= 145; x++) {
    const [r, g, b] = getOriginalPixel(x, y);
    // Saint's head region (y: 365 to 395, x: 105 to 130)
    if (y >= 365 && y <= 395 && x >= 105 && x <= 130) {
      // Re-illuminate face looking upward towards camera
      const headDist = Math.hypot((x - 117) / 10, (y - 380) / 12);
      if (headDist <= 1.0) {
        // Bright stone highlight looking up
        const shade = 100 - headDist * 35;
        // Eyes staring up at camera (x: 113 and 121, y: 376)
        const isLeftEye = Math.hypot(x - 113, y - 376) < 2.5;
        const isRightEye = Math.hypot(x - 121, y - 376) < 2.5;
        if (isLeftEye || isRightEye) {
          // Dead pitch-black hollow eye sockets
          setPixel(x, y, 10, 10, 15);
        } else {
          setPixel(x, y, shade * 1.1, shade * 1.15, shade * 1.1);
        }
      }
    } else {
      // Body turned toward camera: increase stone front illumination
      if (r > 30) {
        setPixel(x, y, r * 1.25, g * 1.3, b * 1.2);
      }
    }
  }
}

// 2. SHIFT 2: Angel on Pedestal (original x: 300-335, y: 460-530)
// Steps down off pedestal, shifts closer to aisle (x += 45, y += 20), hands raised into active reaching posture!
// First: empty original pedestal area with shadow
for (let y = 460; y <= 530; y++) {
  for (let x = 300; x <= 335; x++) {
    const [r, g, b] = getOriginalPixel(x - 30, y); // sample pillar background
    setPixel(x, y, r * 0.7, g * 0.7, b * 0.75);
  }
}

// Second: stamp the shifted angel closer to the aisle (x: 345 to 385, y: 475 to 550)
for (let y = 460; y <= 530; y++) {
  for (let x = 300; x <= 335; x++) {
    const [r, g, b] = getOriginalPixel(x, y);
    const isStatue = (r + g + b) > 130; // statue brightness
    if (isStatue) {
      const destX = x + 45;
      const destY = y + 18;
      // Active grasping hands / flared wings modification
      let modR = r * 1.25;
      let modG = g * 1.3;
      let modB = b * 1.25;

      // Unnatural hollow face
      if (y >= 462 && y <= 485) {
        if (Math.abs(x - 317) < 3) {
          modR = 15; modG = 15; modB = 20; // Hollow eyes
        }
      }
      setPixel(destX, destY, modR, modG, modB);
    }
  }
}

// 3. SHIFT 3: Distant Silhouette Peering Around Aisle Column (x: 485-515, y: 395-465)
// Standing much closer behind column, staring forward
for (let y = 395; y <= 465; y++) {
  for (let x = 485; x <= 515; x++) {
    const [r, g, b] = getOriginalPixel(x, y);
    // Silhouette shape
    const sDist = Math.hypot((x - 498) / 9, (y - 425) / 28);
    if (sDist <= 1.0) {
      // Dark stone figure half-hidden
      const isEye = (y >= 405 && y <= 408) && (x === 495 || x === 501);
      if (isEye) {
        // Glowing pale white anomaly eyes peering from dark
        setPixel(x, y, 220, 240, 210);
      } else {
        setPixel(x, y, Math.min(r, 22), Math.min(g, 26), Math.min(b, 28));
      }
    }
  }
}

// 4. SHIFT 4: Subtle Security Sensor Glitches & Tracking Scanline Artifacts
// Localized camera glitch line at y = 145 and y = 370
for (let y = 144; y <= 147; y++) {
  for (let x = 0; x < width; x++) {
    const [r, g, b] = getPixel(x, y);
    const noise = (Math.random() - 0.5) * 45;
    setPixel(x, y, r + noise + 10, g + noise + 15, b + noise + 10);
  }
}
for (let y = 368; y <= 371; y++) {
  for (let x = 200; x < 600; x++) {
    const [r, g, b] = getPixel(x, y);
    const noise = (Math.random() - 0.5) * 60;
    setPixel(x, y, r + noise, g + noise + 20, b + noise + 5);
  }
}

// Encode to church_cam_anomaly.png
console.log('Encoding anomaly image to PNG:', outAnomalyPath);
const outBuf = encodePNG(width, height, data);
fs.writeFileSync(outAnomalyPath, outBuf);
console.log('Saved church_cam_anomaly.png (' + (outBuf.length / 1024).toFixed(1) + ' KB)');
console.log('Anomaly generation complete!');
