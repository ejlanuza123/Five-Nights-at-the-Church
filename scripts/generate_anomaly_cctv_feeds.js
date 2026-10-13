/**
 * Generates the "ANOMALY SPOTTED" (Possessed / Paranormal Shift) versions
 * for CAM 02, CAM 03, CAM 04, and CAM 05.
 * Matches authentic low-light security CCTV aesthetic with paranormal anomalies.
 */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPNG(width, height, getPixel) {
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter 0
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

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', compressedData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const W = 1024;
const H = 572;

// --- CAM 02 ANOMALY: COLUMBARIUM / CATACOMBS ---
// Anomaly: Distant tomb is now EMPTY, and the shrouded penitent looms right in front of the camera lens!
function renderColumbariumAnomaly(outPath) {
  const buf = createPNG(W, H, (x, y, w, h) => {
    const px = x / w;
    const py = y / h;
    const distSq = ((px - 0.5) * 2) ** 2 + ((py - 0.5) * 2) ** 2;
    const vig = Math.max(0.15, 1.0 - distSq * 0.5);

    let r = 14 + py * 10;
    let g = 20 + py * 12;
    let b = 23 + py * 12;

    // Crypt walls and niche rows
    if (px < 0.28 || px > 0.72) {
      const nicheY = Math.sin(py * 24);
      if (nicheY > 0.3) { r += 20; g += 26; b += 28; }
      else { r -= 10; g -= 10; b -= 10; }
    } else {
      if (py > 0.45) {
        r += (py - 0.45) * 30;
        g += (py - 0.45) * 40;
        b += (py - 0.45) * 42;
      }
    }

    // Distant tomb now disturbed / empty
    if (px > 0.47 && px < 0.55 && py > 0.42 && py < 0.58) {
      r -= 12; g -= 12; b -= 10; // Dark void where it once sat
    }

    // CLOSE-UP ANOMALY: Looming shrouded penitent right in the foreground (center-right: x: 0.42 to 0.78, y: 0.15 to 1.0)
    const cx = 0.58;
    const cy = 0.55;
    const bodyDist = Math.hypot((px - cx) / 0.18, (py - cy) / 0.42);
    if (bodyDist <= 1.0) {
      // Marble shroud texture
      const shroudFolds = Math.sin((px * 35 + py * 15)) * 18;
      const stoneTone = 75 + shroudFolds + (1.0 - bodyDist) * 35;
      r += stoneTone;
      g += stoneTone * 1.05;
      b += stoneTone * 1.02;

      // Dark shrouded cowl / hollow face area
      const faceDist = Math.hypot((px - 0.56) / 0.08, (py - 0.32) / 0.11);
      if (faceDist <= 1.0) {
        r = 12 + faceDist * 20;
        g = 12 + faceDist * 22;
        b = 18 + faceDist * 25;

        // Faint glowing hollow pinprick eyes
        const eyeL = Math.hypot((px - 0.54) / 0.015, (py - 0.32) / 0.015);
        const eyeR = Math.hypot((px - 0.59) / 0.015, (py - 0.32) / 0.015);
        if (eyeL < 1.0 || eyeR < 1.0) {
          r += 140; g += 170; b += 210;
        }
      }

      // Reaching chipped stone claw hands in foreground
      const handDist = Math.hypot((px - 0.46) / 0.07, (py - 0.72) / 0.12);
      if (handDist <= 1.0) {
        r += 65; g += 70; b += 68;
      }
    }

    // Paranormal camera glitch: horizontal static bands & phosphor tear
    if (Math.abs(py - 0.32) < 0.012 || Math.abs(py - 0.68) < 0.008) {
      r += 45; g += 60; b += 70;
    }

    // Security tint & heavy sensor noise
    const luma = r * 0.3 + g * 0.59 + b * 0.11;
    r = luma * 0.84 + 6; g = luma * 1.08 + 10; b = luma * 0.92 + 7;
    const grain = (Math.random() - 0.5) * 26;
    return [(r + grain) * vig, (g + grain * 1.1) * vig, (b + grain) * vig];
  });
  fs.writeFileSync(outPath, buf);
}

// --- CAM 03 ANOMALY: RECONCILIATION CHAPEL (CONFESSIONAL) ---
// Anomaly: The saint statue has moved right against the slatted privacy grille, staring through with hollow eyes!
function renderConfessionalAnomaly(outPath) {
  const buf = createPNG(W, H, (x, y, w, h) => {
    const px = x / w;
    const py = y / h;
    const distSq = ((px - 0.5) * 2) ** 2 + ((py - 0.5) * 2) ** 2;
    const vig = Math.max(0.18, 1.0 - distSq * 0.45);

    let r = 20 + py * 10;
    let g = 18 + py * 10;
    let b = 15 + py * 8;

    // Distant alcove is empty
    // Votive amber candle rack flickering / half extinguished
    if (px > 0.65 && px < 0.82 && py > 0.45 && py < 0.68) {
      const cDist = Math.hypot((px - 0.73) / 0.08, (py - 0.56) / 0.10);
      if (cDist <= 1.0) {
        r += 35 * (1 - cDist);
        g += 20 * (1 - cDist);
        b += 5 * (1 - cDist);
      }
    }

    // STATUE AT THE SCREEN: Haloed Saint face pressed against the slatted screen (x: 0.22 to 0.46, y: 0.25 to 0.72)
    const faceCenterDist = Math.hypot((px - 0.32) / 0.10, (py - 0.45) / 0.16);
    if (faceCenterDist <= 1.0) {
      // Weathered marble face
      let fVal = 70 + (1.0 - faceCenterDist) * 45;
      r += fVal; g += fVal * 1.03; b += fVal * 0.98;

      // Dark sunken eye sockets
      const eyeL = Math.hypot((px - 0.29) / 0.022, (py - 0.42) / 0.025);
      const eyeR = Math.hypot((px - 0.36) / 0.022, (py - 0.42) / 0.025);
      if (eyeL <= 1.0 || eyeR <= 1.0) {
        r = 8; g = 8; b = 12; // Pitch black void sockets
      }

      // Golden halo warped / cracked right behind the head
      const haloDist = Math.hypot((px - 0.32) / 0.14, (py - 0.36) / 0.14);
      if (haloDist > 0.75 && haloDist < 1.05 && py < 0.48) {
        r += 80; g += 65; b += 15;
      }
    }

    // Slatted wood acoustic privacy screen in foreground over the face!
    if (px > 0.15 && px < 0.48 && py > 0.18 && py < 0.85) {
      const slat = Math.sin(px * 80);
      if (slat > 0.3) {
        // Wood slat in front of the statue
        r = r * 0.4 + 32;
        g = g * 0.4 + 24;
        b = b * 0.4 + 16;
      }
    }

    // Video noise line & glitch
    if (Math.abs(py - 0.44) < 0.015) {
      r += 50; g += 50; b += 50;
    }

    const luma = r * 0.3 + g * 0.59 + b * 0.11;
    r = luma * 0.88 + 5; g = luma * 1.06 + 8; b = luma * 0.86 + 4;
    const grain = (Math.random() - 0.5) * 22;
    return [(r + grain) * vig, (g + grain * 1.1) * vig, (b + grain) * vig];
  });
  fs.writeFileSync(outPath, buf);
}

// --- CAM 04 ANOMALY: HVAC AIR RETURN DUCT INTERIOR ---
// Anomaly: The stone statue is crawling directly through the duct right towards the camera, filling the lens!
function renderVentDuctAnomaly(outPath) {
  const buf = createPNG(W, H, (x, y, w, h) => {
    const px = x / w;
    const py = y / h;
    const distSq = ((px - 0.5) * 2) ** 2 + ((py - 0.5) * 2) ** 2;
    const vig = Math.max(0.12, 1.0 - distSq * 0.6);

    // Galvanized tunnel perspective
    const dx = Math.abs(px - 0.5);
    const dy = Math.abs(py - 0.5);
    const depth = Math.max(dx, dy);

    let r = 24 - depth * 14;
    let g = 30 - depth * 16;
    let b = 35 - depth * 18;

    // Seams
    const seam = Math.sin(depth * 30);
    if (Math.abs(seam) > 0.8) {
      r += 16; g += 20; b += 24;
    }

    // HUGE STATUE IN VENT DUCT FILLING FOREGROUND (x: 0.28 to 0.72, py: 0.25 to 0.88)
    const vHeadDist = Math.hypot((px - 0.50) / 0.16, (py - 0.52) / 0.22);
    if (vHeadDist <= 1.0) {
      // Rough cracked marble texture
      const crack = Math.sin(px * 120 + py * 70) > 0.92 ? -30 : 0;
      let stoneVal = 85 + (1.0 - vHeadDist) * 55 + crack;
      r += stoneVal;
      g += stoneVal * 1.05;
      b += stoneVal * 1.08;

      // Unnaturally wide hollow stone mouth and empty eyes
      const eyeL = Math.hypot((px - 0.44) / 0.03, (py - 0.48) / 0.035);
      const eyeR = Math.hypot((px - 0.56) / 0.03, (py - 0.48) / 0.035);
      const mouth = Math.hypot((px - 0.50) / 0.06, (py - 0.62) / 0.04);
      if (eyeL <= 1.0 || eyeR <= 1.0 || mouth <= 1.0) {
        r = 10; g = 12; b = 15;
      }

      // IR Night vision reflection in eyes
      if (eyeL < 0.35 || eyeR < 0.35) {
        r += 150; g += 190; b += 220;
      }
    }

    // Chipped stone hands grasping edge of duct floor
    const handL = Math.hypot((px - 0.32) / 0.08, (py - 0.80) / 0.10);
    const handR = Math.hypot((px - 0.68) / 0.08, (py - 0.80) / 0.10);
    if (handL <= 1.0 || handR <= 1.0) {
      r += 65; g += 72; b += 78;
    }

    // Heavy IR bloom and static interference
    if (Math.abs(py - 0.52) < 0.02) {
      r += 40; g += 55; b += 65;
    }

    const luma = r * 0.3 + g * 0.59 + b * 0.11;
    r = luma * 0.80 + 4; g = luma * 1.10 + 10; b = luma * 0.96 + 9;
    const grain = (Math.random() - 0.5) * 28;
    return [(r + grain) * vig, (g + grain * 1.1) * vig, (b + grain) * vig];
  });
  fs.writeFileSync(outPath, buf);
}

// --- CAM 05 ANOMALY: NARTHEX CORRIDOR / OUTSIDE OFFICE WINDOW ---
// Anomaly: The Weeping Angel is standing right outside the plate glass office window, staring directly inside!
function renderNarthexAnomaly(outPath) {
  const buf = createPNG(W, H, (x, y, w, h) => {
    const px = x / w;
    const py = y / h;
    const distSq = ((px - 0.5) * 2) ** 2 + ((py - 0.5) * 2) ** 2;
    const vig = Math.max(0.18, 1.0 - distSq * 0.45);

    let r = 16 + py * 12;
    let g = 22 + py * 14;
    let b = 25 + py * 14;

    // Structural columns in background
    if ((px > 0.18 && px < 0.26) || (px > 0.74 && px < 0.82)) {
      r += 22; g += 28; b += 30;
    }

    // WEEPING ANGEL STANDING RIGHT AT THE OBSERVATION GLASS (Center-middle: x: 0.36 to 0.64, y: 0.20 to 0.85)
    // Wings flared outward
    const wingDistL = Math.hypot((px - 0.28) / 0.15, (py - 0.42) / 0.24);
    const wingDistR = Math.hypot((px - 0.72) / 0.15, (py - 0.42) / 0.24);
    if (wingDistL <= 1.0 || wingDistR <= 1.0) {
      r += 45; g += 52; b += 55;
    }

    // Angel body & head
    const bodyDist = Math.hypot((px - 0.50) / 0.11, (py - 0.52) / 0.30);
    if (bodyDist <= 1.0) {
      let stoneTone = 70 + (1.0 - bodyDist) * 50;
      r += stoneTone; g += stoneTone * 1.04; b += stoneTone * 1.02;

      // Face uncovered, hands pulled away from face, mouth open, hollow eyes staring into office!
      const headDist = Math.hypot((px - 0.50) / 0.065, (py - 0.34) / 0.095);
      if (headDist <= 1.0) {
        const eyeL = Math.hypot((px - 0.48) / 0.016, (py - 0.32) / 0.018);
        const eyeR = Math.hypot((px - 0.52) / 0.016, (py - 0.32) / 0.018);
        const openMouth = Math.hypot((px - 0.50) / 0.025, (py - 0.38) / 0.025);
        if (eyeL <= 1.0 || eyeR <= 1.0 || openMouth <= 1.0) {
          r = 10; g = 10; b = 14;
        }
      }
    }

    // Plate glass window reflections & aluminum mullion grid in front of the angel
    if (px > 0.35 && px < 0.65 && py > 0.25 && py < 0.7) {
      // Glass sheen
      r += 12; g += 16; b += 22;
      if (Math.abs(px - 0.5) < 0.005 || Math.abs(py - 0.48) < 0.005) {
        r += 32; g += 38; b += 44;
      }
    }

    // Glitch tearing artifact
    if (Math.abs(py - 0.35) < 0.01 || Math.abs(py - 0.72) < 0.008) {
      r += 48; g += 62; b += 68;
    }

    const luma = r * 0.3 + g * 0.59 + b * 0.11;
    r = luma * 0.84 + 5; g = luma * 1.06 + 9; b = luma * 0.90 + 7;
    const grain = (Math.random() - 0.5) * 22;
    return [(r + grain) * vig, (g + grain * 1.1) * vig, (b + grain) * vig];
  });
  fs.writeFileSync(outPath, buf);
}

const outDir = path.join(__dirname, '..', 'assets', 'cctv');
console.log('Rendering all anomaly feeds...');
renderColumbariumAnomaly(path.join(outDir, 'church_cam_02_columbarium_anomaly.png'));
console.log('Saved church_cam_02_columbarium_anomaly.png');
renderConfessionalAnomaly(path.join(outDir, 'church_cam_03_confessional_anomaly.png'));
console.log('Saved church_cam_03_confessional_anomaly.png');
renderVentDuctAnomaly(path.join(outDir, 'church_cam_04_vent_anomaly.png'));
console.log('Saved church_cam_04_vent_anomaly.png');
renderNarthexAnomaly(path.join(outDir, 'church_cam_05_narthex_anomaly.png'));
console.log('Saved church_cam_05_narthex_anomaly.png');
console.log('All anomaly camera feeds generated successfully!');
