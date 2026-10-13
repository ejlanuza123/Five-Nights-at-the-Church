const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

async function generateCam05Anomaly() {
  console.log('Loading Cam 5 and Cam 1 images...');
  const cam5 = await Jimp.read('assets/cctv/church_cam_05_narthex.png');
  const cam1 = await Jimp.read('assets/cctv/church_cam_anomaly.png');

  const bgW = cam5.bitmap.width;
  const bgH = cam5.bitmap.height;
  console.log(`CAM 05 Dimensions: ${bgW} x ${bgH}`);

  // Crop the Weeping Angel statue from Cam 1
  // Cam 1 is 2752 x 1536
  const angel = cam1.clone();
  angel.crop({ x: 2110, y: 470, w: 410, h: 960 });

  const aW = angel.bitmap.width;
  const aH = angel.bitmap.height;

  // Process alpha mask based on luminance & edge feathering
  const data = angel.bitmap.data;
  for (let y = 0; y < aH; y++) {
    for (let x = 0; x < aW; x++) {
      const idx = (y * aW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      // Distance from edges
      const edgeDistX = Math.min(x, aW - 1 - x);
      const edgeDistY = Math.min(y, aH - 1 - y);
      const edgeFadeX = Math.min(1.0, edgeDistX / 28);
      const edgeFadeY = Math.min(1.0, edgeDistY / 20);
      const edgeFade = edgeFadeX * edgeFadeY;

      // Dark background removal
      let lumaAlpha = 1.0;
      if (luma < 48) {
        lumaAlpha = 0.0;
      } else if (luma < 78) {
        lumaAlpha = (luma - 48) / 30;
      }

      // Smooth alpha
      let alpha = lumaAlpha * edgeFade;

      // Slightly enhance contrast & cold tint of the statue to match narthex lighting
      data[idx] = Math.min(255, Math.floor(r * 0.96));
      data[idx + 1] = Math.min(255, Math.floor(g * 1.02));
      data[idx + 2] = Math.min(255, Math.floor(b * 1.02));
      data[idx + 3] = Math.floor(255 * alpha);
    }
  }

  // Scale angel to match perspective in CAM 05 corridor outside observation window
  // Target height ~ 48% of corridor height
  const targetH = Math.floor(bgH * 0.72);
  const targetW = Math.floor((targetH / aH) * aW);
  angel.resize({ w: targetW, h: targetH });

  console.log(`Resized statue: ${targetW} x ${targetH}`);

  // Base canvas is CAM 05 corridor
  const composite = cam5.clone();

  // Position angel standing in hallway outside the observation window
  // In CAM 05 (1376x768), hallway arches are around x: 420 to 680, window is on right (x: 800 to 1200)
  // Placing angel at x: 440, y: 190 puts it right in the center corridor facing toward the office window!
  const posX = Math.floor(bgW * 0.33);
  const posY = Math.floor(bgH * 0.24);

  // 1. Draw floor contact shadow on the flagstones
  const cData = composite.bitmap.data;
  const shadowCenterX = posX + targetW * 0.52;
  const shadowCenterY = posY + targetH * 0.94;
  const shadowRadiusX = targetW * 0.55;
  const shadowRadiusY = targetH * 0.08;

  for (let sy = Math.floor(shadowCenterY - shadowRadiusY); sy <= Math.ceil(shadowCenterY + shadowRadiusY); sy++) {
    for (let sx = Math.floor(shadowCenterX - shadowRadiusX); sx <= Math.ceil(shadowCenterX + shadowRadiusX); sx++) {
      if (sx >= 0 && sx < bgW && sy >= 0 && sy < bgH) {
        const dx = (sx - shadowCenterX) / shadowRadiusX;
        const dy = (sy - shadowCenterY) / shadowRadiusY;
        const distSq = dx * dx + dy * dy;
        if (distSq <= 1.0) {
          const sFactor = 1.0 - (1.0 - distSq) * 0.65;
          const pIdx = (sy * bgW + sx) * 4;
          cData[pIdx] = Math.floor(cData[pIdx] * sFactor);
          cData[pIdx + 1] = Math.floor(cData[pIdx + 1] * sFactor);
          cData[pIdx + 2] = Math.floor(cData[pIdx + 2] * sFactor);
        }
      }
    }
  }

  // 2. Alpha composite the angel onto the corridor
  const angelData = angel.bitmap.data;
  for (let ay = 0; ay < targetH; ay++) {
    for (let ax = 0; ax < targetW; ax++) {
      const cx = posX + ax;
      const cy = posY + ay;
      if (cx >= 0 && cx < bgW && cy >= 0 && cy < bgH) {
        const aIdx = (ay * targetW + ax) * 4;
        const cIdx = (cy * bgW + cx) * 4;

        const aAlpha = angelData[aIdx + 3] / 255;
        if (aAlpha > 0.01) {
          const invAlpha = 1.0 - aAlpha;
          cData[cIdx] = Math.floor(angelData[aIdx] * aAlpha + cData[cIdx] * invAlpha);
          cData[cIdx + 1] = Math.floor(angelData[aIdx + 1] * aAlpha + cData[cIdx + 1] * invAlpha);
          cData[cIdx + 2] = Math.floor(angelData[aIdx + 2] * aAlpha + cData[cIdx + 2] * invAlpha);
        }
      }
    }
  }

  // 3. Subtle camera sensor noise & scanline shimmer across the entire image
  for (let i = 0; i < cData.length; i += 4) {
    const grain = (Math.random() - 0.5) * 10;
    cData[i] = Math.max(0, Math.min(255, cData[i] + grain));
    cData[i + 1] = Math.max(0, Math.min(255, cData[i + 1] + grain));
    cData[i + 2] = Math.max(0, Math.min(255, cData[i + 2] + grain));
  }

  const outPath = path.join(__dirname, '..', 'assets', 'cctv', 'church_cam_05_narthex_anomaly.png');
  await composite.write(outPath);
  console.log(`Successfully generated and saved ${outPath}!`);
}

generateCam05Anomaly().catch(err => {
  console.error('Error generating CAM 05 anomaly:', err);
});
