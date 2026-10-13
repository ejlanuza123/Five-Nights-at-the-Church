/**
 * Generates raw, gritty CCTV security camera stills for Five Nights at the Church
 * Outputs:
 * 1. assets/cctv/church_cam_normal.png  (Normal feed)
 * 2. assets/cctv/church_cam_anomaly.png (Active Anomaly feed)
 */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPNG(width, height, getPixel) {
  const rowSize = 1 + width * 3; // 1 filter byte + RGB
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
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
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 2; // RGB (truecolor)
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Non-interlaced

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Generate the high-angle corner security perspective
function renderChurchFeed(isAnomaly) {
  const W = 960;
  const H = 540;

  return createPNG(W, H, (x, y, w, h) => {
    // 1. Lens Distortion & Security Vignette (Barrel warp)
    const nx = (x / w - 0.5) * 2;
    const ny = (y / h - 0.5) * 2;
    const distSq = nx * nx + ny * ny;
    const vignette = Math.max(0.2, 1.0 - distSq * 0.45);

    // 2. High-angle corner perspective looking down towards nave & pews
    // Vanishing point towards upper-center-right (distant altar)
    const vpX = 0.58;
    const vpY = 0.28;
    const px = x / w;
    const py = y / h;

    // Base dark cathedral ambient (deep shadow with cold slate tones)
    let r = 14 + py * 10;
    let g = 20 + py * 12;
    let b = 22 + py * 10;

    // Floor perspective (terrazzo / flagstone aisle)
    if (py > 0.4) {
      const depth = (py - 0.4) / 0.6;
      // Dark polished stone floor reflections
      r += depth * 18;
      g += depth * 22;
      b += depth * 24;

      // Central aisle carpet/runner
      const aisleCenter = vpX + (0.5 - vpX) * depth;
      const aisleWidth = 0.08 + depth * 0.16;
      if (Math.abs(px - aisleCenter) < aisleWidth) {
        r += 12;
        g += 6;
        b += 8;
      }

      // Wooden Pews on left and right
      const inPewAreaL = px > aisleCenter - aisleWidth - 0.28 && px < aisleCenter - aisleWidth;
      const inPewAreaR = px > aisleCenter + aisleWidth && px < aisleCenter + aisleWidth + 0.28;
      if (inPewAreaL || inPewAreaR) {
        // Repeated pew slats
        const pewFreq = Math.sin(depth * 38);
        if (pewFreq > 0.1) {
          r += 14;
          g += 10;
          b += 8;
        } else {
          r -= 6;
          g -= 6;
          b -= 6;
        }
      }
    }

    // 3. Columns & Vaulted Arches
    // Left massive structural column
    if (px > 0.08 && px < 0.22) {
      const colEdge = Math.sin((px - 0.08) / 0.14 * Math.PI);
      r += colEdge * 26;
      g += colEdge * 32;
      b += colEdge * 34;
    }

    // Right pillar
    if (px > 0.82 && px < 0.94) {
      const colEdge = Math.sin((px - 0.82) / 0.12 * Math.PI);
      r += colEdge * 20;
      g += colEdge * 25;
      b += colEdge * 28;
    }

    // Mid aisle column on left
    if (px > 0.32 && px < 0.40 && py > 0.25 && py < 0.8) {
      const edge = Math.sin((px - 0.32) / 0.08 * Math.PI);
      r += edge * 18;
      g += edge * 24;
      b += edge * 26;
    }

    // 4. Distant Sanctuary & Modern Altar / Cross
    if (Math.abs(px - vpX) < 0.12 && py > 0.22 && py < 0.42) {
      // Raised altar platform
      r += 16;
      g += 20;
      b += 22;
      // Modern white Carrara marble altar block
      if (Math.abs(px - vpX) < 0.05 && py > 0.32 && py < 0.37) {
        r += 40;
        g += 46;
        b += 48;
      }
      // Distant suspended crucifix
      if (Math.abs(px - vpX) < 0.008 && py > 0.22 && py < 0.31) {
        r += 35; g += 30; b += 15;
      }
      if (Math.abs(px - vpX) < 0.035 && py > 0.245 && py < 0.26) {
        r += 35; g += 30; b += 15;
      }
    }

    // 5. Stained Glass Ribbon Window High Light Glints
    if (py < 0.25 && px > 0.45 && px < 0.72) {
      const stripe = Math.sin(px * 80);
      if (stripe > 0.2) {
        r += 12; g += 22; b += 38;
      }
    }

    // 6. STATUES - Normal vs Active Anomaly
    // STATUE 1: Large Saint Statue in left alcove (px: 0.12 to 0.18, py: 0.32 to 0.62)
    const inSaintAlcove = px > 0.11 && px < 0.19 && py > 0.32 && py < 0.65;
    if (inSaintAlcove) {
      const sY = (py - 0.32) / 0.33; // 0 top (head) to 1 bottom
      const sX = (px - 0.15) / 0.04; // -1 to +1

      if (!isAnomaly) {
        // Normal: Still, head bowed downward, facing slightly away/inward
        if (sY < 0.25 && Math.abs(sX) < 0.45) { // Head
          r += 38; g += 42; b += 42;
          // Facing down: shadow on eyes
          if (sY > 0.12 && sY < 0.18) { r -= 15; g -= 15; b -= 15; }
        } else if (sY >= 0.25) { // Robes / Torso
          r += 45 - Math.abs(sX) * 20;
          g += 48 - Math.abs(sX) * 20;
          b += 50 - Math.abs(sX) * 20;
        }
      } else {
        // ANOMALY 1: Saint completely turned body and head to face DIRECTLY toward camera!
        // Staring upward with dead hollow eyes!
        if (sY < 0.28 && Math.abs(sX) < 0.55) { // Head raised facing camera
          r += 65; g += 68; b += 66; // Illuminated by camera
          // Glowing/hollow eyes staring right at security feed
          if (sY > 0.12 && sY < 0.18 && Math.abs(Math.abs(sX) - 0.25) < 0.1) {
            r = 180; g = 195; b = 175; // Hollow glint
          }
          if (sY > 0.20 && sY < 0.23 && Math.abs(sX) < 0.2) {
            r -= 30; g -= 30; b -= 30; // Dark gaping stone mouth
          }
        } else if (sY >= 0.28) { // Torso turned directly forward
          r += 58 - Math.abs(sX) * 15;
          g += 62 - Math.abs(sX) * 15;
          b += 62 - Math.abs(sX) * 15;
        }
      }
    }

    // STATUE 2: Angel Statue on pedestal near column (px: 0.34 to 0.42)
    if (!isAnomaly) {
      // Normal: On pedestal near column, still, prayer pose
      const inAngelArea = px > 0.34 && px < 0.40 && py > 0.42 && py < 0.72;
      if (inAngelArea) {
        const aY = (py - 0.42) / 0.30;
        const aX = (px - 0.37) / 0.03;
        if (Math.abs(aX) < 0.6) {
          r += 42; g += 46; b += 48;
          // Wings behind
          if (Math.abs(aX) > 0.35) { r += 15; g += 18; b += 20; }
        }
      }
    } else {
      // ANOMALY 2: Angel stepped down OFF pedestal, shifted closer to aisle!
      // Hands raised into unnatural active stalking posture!
      const inAngelAnomaly = px > 0.38 && px < 0.46 && py > 0.48 && py < 0.82;
      if (inAngelAnomaly) {
        const aY = (py - 0.48) / 0.34;
        const aX = (px - 0.42) / 0.04;
        if (Math.abs(aX) < 0.75) {
          r += 55; g += 60; b += 62;
          // Flared wings reaching wide
          if (Math.abs(aX) > 0.4 && aY < 0.6) { r += 28; g += 32; b += 34; }
          // Raised grasping claws
          if (aY > 0.3 && aY < 0.5 && Math.abs(aX) < 0.35) {
            r += 70; g += 75; b += 78;
          }
          // Face peering with hollow sockets
          if (aY < 0.25) {
            if (aY > 0.10 && aY < 0.16 && Math.abs(Math.abs(aX) - 0.2) < 0.08) {
              r = 20; g = 15; b = 15; // Void eyes
            }
          }
        }
      }
    }

    // STATUE 3: Distant Veiled Figure
    if (!isAnomaly) {
      // Normal: Far back near altar, tiny silhouette, motionless
      if (px > 0.52 && px < 0.55 && py > 0.32 && py < 0.42) {
        r += 18; g += 20; b += 22;
      }
    } else {
      // ANOMALY 3: Distant silhouette now standing MUCH closer, half-hidden behind column!
      if (px > 0.30 && px < 0.35 && py > 0.36 && py < 0.58) {
        const dY = (py - 0.36) / 0.22;
        const dX = (px - 0.325) / 0.025;
        r += 42; g += 48; b += 50;
        // Two glowing needle eyes peering from shadow
        if (dY > 0.12 && dY < 0.18 && Math.abs(Math.abs(dX) - 0.2) < 0.12) {
          r = 190; g = 210; b = 180;
        }
      }
    }

    // 7. Security Camera Desaturation & Subtle Greenish Surveillance Tint
    const luma = r * 0.3 + g * 0.59 + b * 0.11;
    r = luma * 0.85 + 4;
    g = luma * 1.05 + 8; // Faint security green
    b = luma * 0.88 + 5;

    // 8. Low-Resolution Sensor Noise & Film Grain
    const grain = (Math.random() - 0.5) * 18;
    r += grain;
    g += grain * 1.1;
    b += grain;

    // Scanline raster
    if (y % 2 === 0) {
      r *= 0.92; g *= 0.92; b *= 0.92;
    }

    // Anomaly glitch line
    if (isAnomaly) {
      if ((y > 180 && y < 186) || (y > 340 && y < 344)) {
        r += (Math.random() - 0.3) * 60;
        g += (Math.random() - 0.3) * 70;
        b += (Math.random() - 0.3) * 60;
      }
    }

    // Apply vignette
    r *= vignette;
    g *= vignette;
    b *= vignette;

    return [r, g, b];
  });
}

// Write the files to assets/cctv/
const outDir = path.join(__dirname, '..', 'assets', 'cctv');
fs.mkdirSync(outDir, { recursive: true });

console.log('Rendering church_cam_normal.png...');
const normalPNG = renderChurchFeed(false);
fs.writeFileSync(path.join(outDir, 'church_cam_normal.png'), normalPNG);
console.log('Saved church_cam_normal.png (' + (normalPNG.length / 1024).toFixed(1) + ' KB)');

console.log('Rendering church_cam_anomaly.png...');
const anomalyPNG = renderChurchFeed(true);
fs.writeFileSync(path.join(outDir, 'church_cam_anomaly.png'), anomalyPNG);
console.log('Saved church_cam_anomaly.png (' + (anomalyPNG.length / 1024).toFixed(1) + ' KB)');

console.log('All CCTV camera footage images rendered successfully!');
