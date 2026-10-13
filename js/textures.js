/**
 * Five Nights at the Church - Modern Architectural & Material Textures
 * Generates textures for modern parish church (Carrara marble, terrazzo, modern oak, brushed steel, LCD)
 */

const TextureGen = {
  // --- MODERN POLISHED PARISH TERRAZZO / PORCELAIN TILE FLOOR ---
  createTerrazzoFloorTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Warm modern architectural grey-beige porcelain tile
    ctx.fillStyle = '#2a2b2f';
    ctx.fillRect(0, 0, width, height);

    // Grid of large modern 60x60cm tiles
    const tileSize = width / 4;
    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        // Subtle tile-to-tile tone variance
        const val = Math.floor(38 + (Math.random() - 0.5) * 8);
        ctx.fillStyle = `rgb(${val}, ${val + 1}, ${val + 3})`;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Fine speckles / terrazzo stone chips
        for (let i = 0; i < 60; i++) {
          const sx = x + Math.random() * (tileSize - 2);
          const sy = y + Math.random() * (tileSize - 2);
          const sColor = Math.random() > 0.5 ? '#1a1b1d' : '#4d4f55';
          ctx.fillStyle = sColor;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }
      }
    }

    // Clean modern thin grout lines
    ctx.strokeStyle = '#18191c';
    ctx.lineWidth = 2;
    for (let x = 0; x <= width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // --- RETRO GRUNGY PLASTER WALL (Matching Reference Office Photo) ---
  createGrungyPlasterWallTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Desaturated moody greenish-grey base tone matching photo (#262f2b)
    ctx.fillStyle = '#28312e';
    ctx.fillRect(0, 0, width, height);

    // Mottled water stains, grime and damp plaster gradients
    for (let i = 0; i < 25; i++) {
      const gx = Math.random() * width;
      const gy = Math.random() * height;
      const gr = 30 + Math.random() * 90;
      const rad = ctx.createRadialGradient(gx, gy, 5, gx, gy, gr);
      const isDark = Math.random() > 0.4;
      rad.addColorStop(0, isDark ? 'rgba(18, 24, 21, 0.45)' : 'rgba(52, 65, 58, 0.3)');
      rad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rad;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vertical moisture runoff streaks and water marks
    for (let i = 0; i < 18; i++) {
      const rx = Math.random() * width;
      const rw = 2 + Math.random() * 8;
      const rgrad = ctx.createLinearGradient(rx, 0, rx, height);
      rgrad.addColorStop(0, 'rgba(15, 20, 18, 0.1)');
      rgrad.addColorStop(Math.random() * 0.5, 'rgba(18, 25, 22, 0.35)');
      rgrad.addColorStop(1, 'rgba(10, 14, 12, 0.6)');
      ctx.fillStyle = rgrad;
      ctx.fillRect(rx, 0, rw, height);
    }

    // Grungy micro-noise
    const imgData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 22;
      imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + n * 0.9));
      imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + n * 1.05));
      imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + n * 0.95));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // --- MODERN ARCHITECTURAL WALL (Clean Painted Plaster & Acoustic Panels) ---
  createModernWallTexture(width = 512, height = 512) {
    return this.createGrungyPlasterWallTexture(width, height);
  },

  // --- POLISHED WHITE CARRARA MARBLE (For Sacred Parish Statues & Modern Altar) ---
  createCarraraMarbleTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Luminous polished white marble base
    ctx.fillStyle = '#e5e3df';
    ctx.fillRect(0, 0, width, height);

    // Elegant grey marble veins (smooth and artistic)
    for (let v = 0; v < 8; v++) {
      ctx.strokeStyle = 'rgba(130, 135, 142, 0.28)';
      ctx.lineWidth = 1.2 + Math.random() * 2;
      ctx.beginPath();
      let vx = Math.random() * width;
      let vy = 0;
      ctx.moveTo(vx, vy);
      while (vy < height) {
        vx += (Math.random() - 0.5) * 36;
        vy += 20 + Math.random() * 30;
        ctx.lineTo(vx, vy);
      }
      ctx.stroke();
    }

    // Secondary subtle micro-veins
    for (let v = 0; v < 14; v++) {
      ctx.strokeStyle = 'rgba(160, 165, 172, 0.15)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      let vx = Math.random() * width;
      let vy = Math.random() * height;
      ctx.moveTo(vx, vy);
      for (let s = 0; s < 4; s++) {
        vx += (Math.random() - 0.5) * 45;
        vy += (Math.random() - 0.5) * 45;
        ctx.lineTo(vx, vy);
      }
      ctx.stroke();
    }

    // Dark tear-stains / weeping hollow discoloration under eyes
    for (let s = 0; s < 6; s++) {
      const sx = width * (0.35 + Math.random() * 0.3);
      const sy = height * (0.4 + Math.random() * 0.3);
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 25);
      grad.addColorStop(0, 'rgba(40, 42, 45, 0.35)');
      grad.addColorStop(1, 'rgba(40, 42, 45, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- MODERN HONEY OAK / WALNUT (For Modern Church Pews & Office Desk) ---
  createModernWoodTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Warm contemporary walnut / natural oak
    ctx.fillStyle = '#3a271c';
    ctx.fillRect(0, 0, width, height);

    // Linear grain lines (smooth architectural millwork)
    for (let i = 0; i < 150; i++) {
      const y = Math.random() * height;
      ctx.strokeStyle = Math.random() > 0.5 ? '#2c1d14' : '#4a3325';
      ctx.lineWidth = 0.8 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y + (Math.random() - 0.5) * 8);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- MODERN CONTEMPORARY GEOMETRIC STAINED GLASS (Sleek Ribbon Window) ---
  createModernStainedGlassTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, height);

    // Modern vertical color bands and minimalist geometric segments
    const colors = [
      '#1b4f8a', '#8a1b2d', '#d49b28', '#247b52', 
      '#49226e', '#1e6896', '#9c341b', '#1f5f73'
    ];

    const cols = 8;
    const rows = 4;
    const colW = width / cols;
    const rowH = height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * colW;
        const y = r * rowH;
        ctx.fillStyle = colors[(r * 3 + c) % colors.length];
        ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);

        // Modern thin black aluminum glazing frame
        ctx.strokeStyle = '#05070a';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, colW, rowH);
      }
    }

    // Modern minimalist cross motif in center
    ctx.fillStyle = 'rgba(255, 230, 160, 0.7)';
    const cx = width / 2;
    const cy = height / 2;
    ctx.fillRect(cx - 14, cy - 120, 28, 240);
    ctx.fillRect(cx - 70, cy - 50, 140, 28);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- BRUSHED STAINLESS STEEL / GALVANIZED METAL (Modern Fire Door & HVAC Damper) ---
  createBrushedSteelTexture(width = 256, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#55585d';
    ctx.fillRect(0, 0, width, height);

    // Horizontal brush lines
    for (let y = 0; y < height; y++) {
      const val = Math.floor(75 + (Math.random() - 0.5) * 35);
      ctx.strokeStyle = `rgb(${val}, ${val}, ${val})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- MODERN HVAC FIRE SHUTTER LOUVERS ---
  createHVACLouverTexture(width = 256, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, width, height);

    // Horizontal metal shutter slats
    const slats = 16;
    const slatH = height / slats;

    for (let s = 0; s < slats; s++) {
      const y = s * slatH;
      // Gradient on each louver
      const grad = ctx.createLinearGradient(0, y, 0, y + slatH);
      grad.addColorStop(0, '#50545c');
      grad.addColorStop(0.7, '#2f3238');
      grad.addColorStop(1, '#15171a');

      ctx.fillStyle = grad;
      ctx.fillRect(2, y + 1, width - 4, slatH - 2);

      // Slat edge highlight
      ctx.strokeStyle = '#6e737c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(2, y + 1);
      ctx.lineTo(width - 2, y + 1);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- MODERN PARISH BULLETIN BOARD TEXTURE ---
  createBulletinBoardTexture(width = 512, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Natural cork / dark felt background
    ctx.fillStyle = '#1c1f24';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#444850';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Parish Notice Sheets
    ctx.fillStyle = '#e8eaed';
    ctx.fillRect(24, 24, 130, 180);
    ctx.fillStyle = '#111';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('ST. JUDE PARISH', 32, 45);
    ctx.font = '8px sans-serif';
    ctx.fillText('MASS SCHEDULE', 32, 60);
    ctx.fillText('Sun 8am, 10am, 5pm', 32, 75);
    ctx.fillText('Confession: Sat 4pm', 32, 90);
    ctx.fillText('NOCTURNAL VIGIL', 32, 115);
    ctx.fillStyle = '#aa2222';
    ctx.fillText('DO NOT TOUCH STATUES', 32, 130);

    // Second memo (Parish Security Policy)
    ctx.fillStyle = '#f5e8cf';
    ctx.fillRect(175, 24, 140, 190);
    ctx.fillStyle = '#222';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('SECURITY DIRECTIVE', 185, 45);
    ctx.font = '8px sans-serif';
    ctx.fillText('Night Sexton Instructions:', 185, 60);
    ctx.fillText('1. Keep Maglock armed', 185, 75);
    ctx.fillText('2. Monitor CCTV feeds', 185, 90);
    ctx.fillText('3. Check HVAC duct', 185, 105);
    ctx.fillText('4. Flash window spotlight', 185, 120);
    ctx.fillText('Survive until 06:00:00', 185, 140);

    // Modern Church Cross Decal
    ctx.fillStyle = '#f0c050';
    ctx.fillRect(360, 60, 80, 12);
    ctx.fillRect(394, 30, 12, 80);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- MODERN LCD SCREEN TEXTURE ---
  createModernLCDTexture(width = 512, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#060a0f';
    ctx.fillRect(0, 0, width, height);

    // Modern digital interface grid
    ctx.strokeStyle = 'rgba(40, 90, 160, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Top status bar
    ctx.fillStyle = '#1e70ba';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillText('ST. JUDE PARISH — DIGITAL SURVEILLANCE v4.2', 18, 30);

    ctx.fillStyle = '#4ade80';
    ctx.font = '12px monospace';
    ctx.fillText('SYS: OPTIMAL  |  FPS: 60.0  |  BATTERY: BACKUP ON', 18, 55);

    // Quad view wireframes on monitor screen
    ctx.strokeStyle = '#2563eb';
    ctx.strokeRect(18, 70, 220, 150);
    ctx.strokeRect(250, 70, 240, 150);

    ctx.fillStyle = '#60a5fa';
    ctx.font = '11px monospace';
    ctx.fillText('[CAM 01: SANCTUARY]', 26, 90);
    ctx.fillText('[CAM 05: NARTHEX]', 260, 90);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- GOTHIC ARCHED CHURCH DOOR (Solid Vertical Oak Planks with Black Iron Straps) ---
  createArchedChurchDoorTexture(width = 512, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Dark rustic stained oak
    ctx.fillStyle = '#261912';
    ctx.fillRect(0, 0, width, height);

    // 5 vertical wood planks
    const plankCount = 5;
    const plankW = width / plankCount;
    for (let p = 0; p < plankCount; p++) {
      const px = p * plankW;
      const shade = Math.floor(35 + (Math.random() - 0.5) * 12);
      ctx.fillStyle = `rgb(${shade + 8}, ${shade}, ${shade - 6})`;
      ctx.fillRect(px + 2, 0, plankW - 4, height);

      // Wood grain lines
      for (let g = 0; g < 40; g++) {
        const gx = px + 4 + Math.random() * (plankW - 8);
        ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(20, 12, 8, 0.45)' : 'rgba(55, 38, 26, 0.35)';
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.bezierCurveTo(gx + (Math.random() - 0.5) * 15, height * 0.3, gx + (Math.random() - 0.5) * 15, height * 0.7, gx + (Math.random() - 0.5) * 8, height);
        ctx.stroke();
      }

      // Plank vertical seam groove
      ctx.strokeStyle = '#120b08';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }

    // Heavy Forged-Iron Horizontal Strap Hinges with Rivets
    const hingeYPositions = [height * 0.22, height * 0.52, height * 0.82];
    hingeYPositions.forEach(hy => {
      // Iron strap band
      ctx.fillStyle = '#1c1e21';
      ctx.fillRect(8, hy - 20, width - 16, 40);
      // Highlight on top of strap
      ctx.strokeStyle = '#474a52';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, hy - 20, width - 16, 40);

      // Large iron round bolt studs / rivets
      for (let rx = 35; rx < width - 20; rx += 75) {
        ctx.fillStyle = '#101114';
        ctx.beginPath();
        ctx.arc(rx, hy, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#555a64';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Specular gleam on rivet
        ctx.fillStyle = '#828894';
        ctx.beginPath();
        ctx.arc(rx - 3, hy - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Wrought Iron Latch Handle & Escutcheon Plate (Center Right)
    const lx = width * 0.82;
    const ly = height * 0.56;
    ctx.fillStyle = '#141618';
    ctx.fillRect(lx - 22, ly - 50, 44, 100);
    ctx.strokeStyle = '#383b42';
    ctx.lineWidth = 2;
    ctx.strokeRect(lx - 22, ly - 50, 44, 100);

    // Keyhole
    ctx.fillStyle = '#060708';
    ctx.beginPath();
    ctx.arc(lx, ly + 18, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(lx - 2.5, ly + 18, 5, 12);

    // Heavy iron drop handle ring
    ctx.strokeStyle = '#2d3036';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(lx, ly - 10, 16, 0, Math.PI * 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- RED BRICK CLOISTER PILLARS (Hallway Visible Through Window) ---
  createBrickArchTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Dark grey mortar background
    ctx.fillStyle = '#222326';
    ctx.fillRect(0, 0, width, height);

    const rows = 16;
    const rowH = height / rows;
    const brickW = width / 6;

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      const xOffset = (r % 2) * (brickW / 2);
      for (let x = -brickW; x < width + brickW; x += brickW) {
        const bx = x + xOffset;
        // Aged terracotta brick tones
        const redTone = Math.floor(75 + (Math.random() - 0.5) * 25);
        const greenTone = Math.floor(38 + (Math.random() - 0.5) * 15);
        const blueTone = Math.floor(28 + (Math.random() - 0.5) * 12);
        ctx.fillStyle = `rgb(${redTone}, ${greenTone}, ${blueTone})`;
        ctx.fillRect(bx + 2, y + 2, brickW - 4, rowH - 4);

        // Brick surface soot and texture
        for (let i = 0; i < 8; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(15,10,8,0.3)' : 'rgba(120,60,40,0.2)';
          ctx.fillRect(bx + Math.random() * brickW, y + Math.random() * rowH, 3, 3);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // --- VAULTED ASHLAR STONE ARCHES ---
  createVaultedStoneTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#303436';
    ctx.fillRect(0, 0, width, height);

    // Weathered Gothic stone blocks
    const cols = 4;
    const rows = 8;
    const bw = width / cols;
    const bh = height / rows;
    for (let r = 0; r < rows; r++) {
      const y = r * bh;
      const xOff = (r % 2) * (bw / 2);
      for (let c = -1; c <= cols; c++) {
        const x = c * bw + xOff;
        const val = Math.floor(45 + (Math.random() - 0.5) * 14);
        ctx.fillStyle = `rgb(${val}, ${val + 2}, ${val + 1})`;
        ctx.fillRect(x + 2, y + 2, bw - 4, bh - 4);

        // Grain & damp marks
        for (let i = 0; i < 20; i++) {
          ctx.fillStyle = 'rgba(20, 24, 22, 0.2)';
          ctx.fillRect(x + Math.random() * bw, y + Math.random() * bh, 4, 4);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // --- DROP CEILING ACOUSTIC GRID TILES ---
  createDropCeilingTileTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Desaturated aged off-white / concrete ceiling tile
    ctx.fillStyle = '#3a3f3c';
    ctx.fillRect(0, 0, width, height);

    // 4x4 Grid of square tiles
    const tileSize = width / 4;
    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        // Subtle tile variance
        const val = Math.floor(54 + (Math.random() - 0.5) * 10);
        ctx.fillStyle = `rgb(${val - 4}, ${val}, ${val - 2})`;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        // Acoustic pinholes / stipples
        for (let i = 0; i < 80; i++) {
          const px = x + Math.random() * tileSize;
          const py = y + Math.random() * tileSize;
          ctx.fillStyle = 'rgba(22, 26, 24, 0.45)';
          ctx.fillRect(px, py, 1.5, 1.5);
        }
      }
    }

    // Industrial Metal T-bar grid rails
    ctx.strokeStyle = '#202422';
    ctx.lineWidth = 3;
    for (let x = 0; x <= width; x += tileSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += tileSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // --- INDUSTRIAL ELECTRICAL GAUGE BOX (Right Wall Meters) ---
  createIndustrialGaugeBoxTexture(width = 256, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Industrial battleship grey enamel metal box
    ctx.fillStyle = '#3a3e42';
    ctx.fillRect(0, 0, width, height);

    // Beveled frame
    ctx.strokeStyle = '#5a6068';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Function to draw circular dial gauge
    function drawDial(cx, cy, radius, label, needleAngle = -0.3) {
      // Chrome bezel
      ctx.fillStyle = '#22252a';
      ctx.beginPath(); ctx.arc(cx, cy, radius + 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#717882';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Aged cream dial face
      ctx.fillStyle = '#ece4ce';
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();

      // Tick marks
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1.5;
      for (let a = -Math.PI * 0.75; a <= Math.PI * 0.75; a += Math.PI * 0.15) {
        const x1 = cx + Math.cos(a) * (radius - 8);
        const y1 = cy + Math.sin(a) * (radius - 8);
        const x2 = cx + Math.cos(a) * (radius - 2);
        const y2 = cy + Math.sin(a) * (radius - 2);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }

      // Red warning sector
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 5, Math.PI * 0.35, Math.PI * 0.75);
      ctx.stroke();

      // Label text
      ctx.fillStyle = '#111';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, cy + radius * 0.55);

      // Needle pointer
      ctx.strokeStyle = '#cc1111';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(needleAngle) * (radius - 5), cy + Math.sin(needleAngle) * (radius - 5));
      ctx.stroke();

      // Center pivot cap
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    }

    // 3 Dials matching photo:
    drawDial(75, 75, 42, 'POWER %', -0.5);
    drawDial(180, 75, 42, 'LOAD kW', 0.2);
    drawDial(75, 180, 42, 'BATT V', -0.1);

    // Industrial toggle switch / breaker plate on bottom right
    ctx.fillStyle = '#181b1e';
    ctx.fillRect(150, 150, 60, 60);
    ctx.strokeStyle = '#484e56';
    ctx.strokeRect(150, 150, 60, 60);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(168, 168, 24, 24);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- RETRO PHOSPHOR GREEN CRT MINIMAP (Left Terminal Desk Monitor) ---
  createGreenCRTMinimapTexture(width = 512, height = 384) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Deep dark curved CRT glass background
    ctx.fillStyle = '#050c07';
    ctx.fillRect(0, 0, width, height);

    // Subtle phosphor green glow & scanlines
    for (let y = 0; y < height; y += 4) {
      ctx.fillStyle = 'rgba(20, 70, 35, 0.18)';
      ctx.fillRect(0, y, width, 2);
    }

    // Outer CRT bezel / screen frame
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // Header text
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('FACILITY SECURITY RADAR // ST. JUDE', 30, 40);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('SURVEILLANCE NODE ONLINE  |  PWR: OK', 30, 56);

    // Wireframe Blueprint Layout matching reference image!
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2.5;

    // Sanctuary / Nave (Top Center)
    ctx.strokeRect(190, 80, 130, 110);
    ctx.strokeRect(215, 90, 80, 35);
    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('CAM 01', 235, 112);

    // West Confessional (Top Left)
    ctx.strokeRect(60, 120, 100, 65);
    ctx.fillText('CAM 03', 85, 158);
    // West Corridor Line
    ctx.beginPath(); ctx.moveTo(160, 155); ctx.lineTo(190, 155); ctx.stroke();

    // East Columbarium (Top Right)
    ctx.strokeRect(350, 120, 100, 65);
    ctx.fillText('CAM 02', 375, 158);
    // East Corridor Line
    ctx.beginPath(); ctx.moveTo(320, 155); ctx.lineTo(350, 155); ctx.stroke();

    // HVAC Vent Duct (Cyan/Green dashed line to office)
    ctx.strokeStyle = '#38bdf8';
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(390, 185); ctx.lineTo(390, 270); ctx.lineTo(320, 270);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('CAM 04', 360, 260);

    // Center Hallway / Narthex (CAM 05)
    ctx.fillStyle = '#86efac';
    ctx.fillText('CAM 05', 235, 215);

    // Security Office (Bottom Center)
    ctx.strokeStyle = '#22c55e';
    ctx.strokeRect(190, 230, 130, 80);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(193, 233, 124, 74);
    ctx.fillStyle = '#050c07';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('[ SECURITY OFFICE ]', 198, 275);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- DESK CLIPBOARD PAPERWORK TEXTURE ---
  createDeskPaperworkTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Hardboard clipboard backing
    ctx.fillStyle = '#402a1c';
    ctx.fillRect(20, 20, width - 40, height - 40);
    ctx.strokeStyle = '#24160d';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Aged yellowed paperwork sheets
    ctx.fillStyle = '#ede5ce';
    ctx.fillRect(40, 45, width - 80, height - 75);

    // Top metal spring clip
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(width / 2 - 50, 12, 100, 38);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 50, 12, 100, 38);

    // Printed header
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 14px serif';
    ctx.fillText('ST. JUDE PARISH - NIGHT SECURITY LOG', 65, 80);
    ctx.font = '10px sans-serif';
    ctx.fillText('Shift: 12:00 AM - 06:00 AM  |  Officer On Duty', 65, 100);

    // Ruled lines and handwritten entries
    ctx.strokeStyle = '#d6cca8';
    ctx.lineWidth = 1;
    for (let y = 120; y < height - 60; y += 22) {
      ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(width - 60, y); ctx.stroke();
    }

    // Handwritten shift scribble lines
    ctx.strokeStyle = '#1e3a5f'; // Blue ballpoint pen
    ctx.lineWidth = 1.6;
    for (let l = 135; l < height - 80; l += 44) {
      ctx.beginPath();
      let sx = 65;
      ctx.moveTo(sx, l);
      while (sx < width - 90) {
        sx += 10 + Math.random() * 25;
        ctx.lineTo(sx, l + (Math.random() - 0.5) * 6);
      }
      ctx.stroke();
    }

    // Red rubber stamp "CLASSIFIED / PARISH ARCHIVE"
    ctx.save();
    ctx.translate(width - 150, height - 120);
    ctx.rotate(-0.2);
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 3;
    ctx.strokeRect(-10, -10, 120, 35);
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('CONFIDENTIAL', 5, 14);
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- INDUSTRIAL SLATTED WALL VENTILATION GRILLE ---
  createSlattedVentGrilleTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Dark empty void behind grille
    ctx.fillStyle = '#080a0c';
    ctx.fillRect(0, 0, width, height);

    // Thick steel outer frame
    ctx.fillStyle = '#22262b';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#090b0d';
    ctx.fillRect(25, 25, width - 50, height - 50);

    // Horizontal angled steel louvers
    const slats = 14;
    const slatH = (height - 50) / slats;
    for (let s = 0; s < slats; s++) {
      const sy = 25 + s * slatH;
      // Top edge highlight
      ctx.fillStyle = '#424852';
      ctx.fillRect(25, sy, width - 50, 4);
      // Main louver face
      ctx.fillStyle = '#1e2227';
      ctx.fillRect(25, sy + 4, width - 50, slatH * 0.7);
      // Dark shadow under slat
      ctx.fillStyle = '#050708';
      ctx.fillRect(25, sy + slatH * 0.7 + 4, width - 50, slatH * 0.3 - 4);
    }

    // Corner mounting screws
    const screws = [[14, 14], [width - 14, 14], [14, height - 14], [width - 14, height - 14]];
    screws.forEach(([sx, sy]) => {
      ctx.fillStyle = '#101215';
      ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#606772';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- HEAVY INDUSTRIAL MOTORIZED FIRE SHUTTER (Hazard Stripes & Warning Decals) ---
  createHazardVentShutterTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Heavy dark steel base plate
    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, width, height);

    // Segmented horizontal blast slats
    const numPanels = 6;
    const panelH = height / numPanels;
    for (let p = 0; p < numPanels; p++) {
      const py = p * panelH;
      // Steel bevel highlight
      ctx.fillStyle = '#3a3f47';
      ctx.fillRect(8, py + 2, width - 16, 4);
      // Main steel body
      ctx.fillStyle = '#272b32';
      ctx.fillRect(8, py + 6, width - 16, panelH - 10);
      // Dark panel seam
      ctx.fillStyle = '#101215';
      ctx.fillRect(0, py + panelH - 4, width, 4);

      // Industrial hex bolts along panel edges
      for (let bx = 30; bx < width - 20; bx += 70) {
        ctx.fillStyle = '#14161a';
        ctx.beginPath();
        ctx.arc(bx, py + panelH / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5a626f';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Heavy Yellow & Black Diagonal Caution / Hazard Stripes in center band
    const stripeY = height * 0.42;
    const stripeH = height * 0.22;
    ctx.save();
    ctx.beginPath();
    ctx.rect(12, stripeY, width - 24, stripeH);
    ctx.clip();

    ctx.fillStyle = '#eab308'; // Warning Yellow
    ctx.fillRect(12, stripeY, width - 24, stripeH);

    ctx.fillStyle = '#18181b'; // Black hazard stripes
    const stripeW = 38;
    for (let x = -stripeH; x < width + stripeH; x += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(x, stripeY);
      ctx.lineTo(x + stripeW, stripeY);
      ctx.lineTo(x + stripeW - stripeH, stripeY + stripeH);
      ctx.lineTo(x - stripeH, stripeY + stripeH);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Red warning stencil box: "CAUTION // HVAC FIRE DAMPER // AUTOMATIC"
    ctx.fillStyle = 'rgba(15, 17, 20, 0.85)';
    ctx.fillRect(width * 0.15, stripeY + stripeH * 0.2, width * 0.7, stripeH * 0.6);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(width * 0.15, stripeY + stripeH * 0.2, width * 0.7, stripeH * 0.6);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EMERGENCY FIRE DAMPER // AUTO SEAL', width / 2, stripeY + stripeH * 0.58);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // --- GALVANIZED SHEET METAL AIR DUCT (Matching CAM 04 Interior) ---
  createGalvanizedDuctTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Cold metallic grey steel base
    ctx.fillStyle = '#3c424a';
    ctx.fillRect(0, 0, width, height);

    // Zinc spangles (crystalline galvanized snowflake pattern)
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 6 + Math.random() * 24;
      const shade = Math.floor(45 + (Math.random() - 0.5) * 35);
      ctx.fillStyle = `rgba(${shade + 8}, ${shade + 12}, ${shade + 16}, 0.35)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ribbed sheet metal stiffener beads (corrugated ribs)
    for (let y = 30; y < height; y += 75) {
      // Highlight rib
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(0, y, width, 5);
      // Dark crease
      ctx.fillStyle = 'rgba(10, 12, 16, 0.45)';
      ctx.fillRect(0, y + 5, width, 5);
    }

    // Longitudinal seam rivets
    ctx.fillStyle = '#1c1f24';
    for (let x = 20; x < width; x += 55) {
      ctx.beginPath(); ctx.arc(x, 15, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, height - 15, 4, 0, Math.PI * 2); ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // --- REALISTIC SECURITY WINDOW GLASS (Condensation, smudges, micro-scratches, edge grime) ---
  createWindowGlassTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Faint greenish-blue institutional security glass tint
    ctx.fillStyle = 'rgba(18, 28, 32, 0.08)';
    ctx.fillRect(0, 0, width, height);

    // Subtle edge grime vignette around frame gaskets
    const borderGrad = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.35,
      width / 2, height / 2, width * 0.55
    );
    borderGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    borderGrad.addColorStop(1, 'rgba(12, 16, 20, 0.35)');
    ctx.fillStyle = borderGrad;
    ctx.fillRect(0, 0, width, height);

    // Fine vertical wiping marks & moisture streaks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1.5;
    for (let x = 15; x < width; x += 30 + Math.random() * 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(
        x + (Math.random() - 0.5) * 15, height * 0.3,
        x + (Math.random() - 0.5) * 15, height * 0.7,
        x, height
      );
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
};

window.TextureGen = TextureGen;

