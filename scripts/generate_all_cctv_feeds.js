/**
 * Generates gritty security camera feeds for CAM 02, CAM 03, CAM 04, and CAM 05
 * matching the authentic visual style, aspect ratio, and grain of the reference image.
 */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPNG(width, height, getPixel) {
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 3;
      rawData[pixelOffset] = Math.max(0, Math.min(255, Math.floor(r)));
      rawData[pixelOffset + 1] = Math.max(0, Math.min(255, Math.floor(g)));
      rawData[pixelOffset + 2] = Math.max(0, Math.min(255, Math.floor(b)));
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });

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
  ihdrData[9] = 2; // RGB
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  return Buffer.concat([sig, makeChunk('IHDR', ihdrData), makeChunk('IDAT', compressedData), makeChunk('IEND', Buffer.alloc(0))]);
}

const W = 1024;
const H = 572;

// --- CAM 02: MEMORIAL COLUMBARIUM / CATACOMBS ---
function renderColumbarium(outPath) {
  const buf = createPNG(W, H, (x, y, w, h) => {
    const px = x / w;
    const py = y / h;
    const distSq = ((px - 0.5) * 2) ** 2 + ((py - 0.5) * 2) ** 2;
    const vig = Math.max(0.18, 1.0 - distSq * 0.45);

    let r = 16 + py * 12;
    let g = 22 + py * 15;
    let b = 25 + py * 14;

    // Stone crypt corridor with marble niches
    if (px < 0.28 || px > 0.72) {
      // Marble niche rows
      const nicheY = Math.sin(py * 24);
      if (nicheY > 0.3) { r += 24; g += 30; b += 32; }
      else { r -= 10; g -= 10; b -= 10; }
    } else {
      // Floor perspective
      if (py > 0.45) {
        r += (py - 0.45) * 35;
        g += (py - 0.45) * 45;
        b += (py - 0.45) * 48;
      }
    }

    // Shrouded figure crouching atop distant tomb (x: 0.48 to 0.54, y: 0.42 to 0.58)
    if (px > 0.47 && px < 0.55 && py > 0.40 && py < 0.60) {
      const sDist = Math.hypot((px - 0.51) / 0.035, (py - 0.50) / 0.09);
      if (sDist <= 1.0) {
        r += 50; g += 55; b += 56;
        if (py > 0.43 && py < 0.46) { r = 10; g = 10; b = 15; } // Void face under shroud
      }
    }

    // Lens flare across center
    if (Math.abs(py - 0.38) < 0.008 && px > 0.3 && px < 0.7) {
      r += 40; g += 35; b += 20;
    }

    // Security tint & noise
    const luma = r * 0.3 + g * 0.59 + b * 0.11;
    r = luma * 0.82 + 5; g = luma * 1.06 + 9; b = luma * 0.90 + 6;
    const grain = (Math.random() - 0.5) * 16;
    return [(r + grain) * vig, (g + grain * 1.1) * vig, (b + grain) * vig];
  });
  fs.writeFileSync(outPath, buf);
}

// --- CAM 03: RECONCILIATION CHAPEL (CONFESSIONAL) ---
function renderConfessional(outPath) {
  const buf = createPNG(W, H, (x, y, w, h) => {
    const px = x / w;
    const py = y / h;
    const distSq = ((px - 0.5) * 2) ** 2 + ((py - 0.5) * 2) ** 2;
    const vig = Math.max(0.18, 1.0 - distSq * 0.45);

    let r = 22 + py * 10;
    let g = 18 + py * 10;
    let b = 16 + py * 8;

    // Slatted wood acoustic privacy screen (left)
    if (px > 0.15 && px < 0.42 && py > 0.18 && py < 0.85) {
      const slat = Math.sin(px * 80);
      if (slat > 0.2) { r += 28; g += 20; b += 14; }
      else { r -= 10; g -= 8; b -= 6; }
    }

    // Votive amber candle rack glow
    if (px > 0.65 && px < 0.82 && py > 0.45 && py < 0.68) {
      const cDist = Math.hypot((px - 0.73) / 0.08, (py - 0.56) / 0.10);
      if (cDist <= 1.0) {
        r += 55 * (1 - cDist);
        g += 35 * (1 - cDist);
        b += 10 * (1 - cDist);
      }
    }

    // Saint statue standing in shadow at rear (x: 0.50 to 0.58, y: 0.28 to 0.65)
    if (px > 0.51 && px < 0.59 && py > 0.28 && py < 0.68) {
      const sDist = Math.hypot((px - 0.55) / 0.035, (py - 0.48) / 0.19);
      if (sDist <= 1.0) {
        r += 42; g += 45; b += 46;
        // Golden halo faint glint
        if (Math.hypot(px - 0.55, py - 0.32) < 0.04) { r += 35; g += 30; b += 10; }
      }
    }

    const luma = r * 0.3 + g * 0.59 + b * 0.11;
    r = luma * 0.85 + 4; g = luma * 1.04 + 7; b = luma * 0.88 + 5;
    const grain = (Math.random() - 0.5) * 16;
    return [(r + grain) * vig, (g + grain * 1.1) * vig, (b + grain) * vig];
  });
  fs.writeFileSync(outPath, buf);
}

// --- CAM 04: HVAC AIR RETURN DUCT INTERIOR ---
function renderVentDuct(outPath) {
  const buf = createPNG(W, H, (x, y, w, h) => {
    const px = x / w;
    const py = y / h;
    const distSq = ((px - 0.5) * 2) ** 2 + ((py - 0.5) * 2) ** 2;
    const vig = Math.max(0.12, 1.0 - distSq * 0.6);

    // Claustrophobic galvanized square tunnel perspective
    const dx = Math.abs(px - 0.5);
    const dy = Math.abs(py - 0.5);
    const depth = Math.max(dx, dy);

    let r = 25 - depth * 15;
    let g = 32 - depth * 18;
    let b = 38 - depth * 20;

    // Sheet metal sheet ridges / seams
    const seam = Math.sin(depth * 30);
    if (Math.abs(seam) > 0.8) {
      r += 18; g += 22; b += 26;
    }

    // Security IR camera flash in center
    const irDist = Math.hypot(px - 0.5, py - 0.5);
    if (irDist < 0.25) {
      const glow = (0.25 - irDist) / 0.25;
      r += glow * 45; g += glow * 55; b += glow * 65;
    }

    const luma = r * 0.3 + g * 0.59 + b * 0.11;
    r = luma * 0.80 + 3; g = luma * 1.08 + 8; b = luma * 0.95 + 8;
    const grain = (Math.random() - 0.5) * 20;
    return [(r + grain) * vig, (g + grain * 1.1) * vig, (b + grain) * vig];
  });
  fs.writeFileSync(outPath, buf);
}

// --- CAM 05: NARTHEX CORRIDOR & BULLETIN BOARD OUTSIDE OFFICE ---
function renderNarthex(outPath) {
  const buf = createPNG(W, H, (x, y, w, h) => {
    const px = x / w;
    const py = y / h;
    const distSq = ((px - 0.5) * 2) ** 2 + ((py - 0.5) * 2) ** 2;
    const vig = Math.max(0.2, 1.0 - distSq * 0.45);

    let r = 18 + py * 14;
    let g = 24 + py * 16;
    let b = 28 + py * 16;

    // Structural columns
    if ((px > 0.18 && px < 0.26) || (px > 0.74 && px < 0.82)) {
      r += 26; g += 32; b += 35;
    }

    // Modern glass plate window of the office (center-right reflection)
    if (px > 0.35 && px < 0.65 && py > 0.25 && py < 0.7) {
      r += 15; g += 20; b += 24;
      // Aluminum storefront grid
      if (Math.abs(px - 0.5) < 0.006 || Math.abs(py - 0.48) < 0.006) {
        r += 30; g += 35; b += 40;
      }
    }

    const luma = r * 0.3 + g * 0.59 + b * 0.11;
    r = luma * 0.84 + 4; g = luma * 1.05 + 8; b = luma * 0.89 + 6;
    const grain = (Math.random() - 0.5) * 16;
    return [(r + grain) * vig, (g + grain * 1.1) * vig, (b + grain) * vig];
  });
  fs.writeFileSync(outPath, buf);
}

const outDir = path.join(__dirname, '..', 'assets', 'cctv');
console.log('Rendering all camera feeds...');
renderColumbarium(path.join(outDir, 'church_cam_02_columbarium.png'));
console.log('Saved church_cam_02_columbarium.png');
renderConfessional(path.join(outDir, 'church_cam_03_confessional.png'));
console.log('Saved church_cam_03_confessional.png');
renderVentDuct(path.join(outDir, 'church_cam_04_vent.png'));
console.log('Saved church_cam_04_vent.png');
renderNarthex(path.join(outDir, 'church_cam_05_narthex.png'));
console.log('Saved church_cam_05_narthex.png');
console.log('All feeds rendered successfully!');
