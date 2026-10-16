/**
 * Five Nights at the Church - Modern 3D Models & Scene Architecture
 * Contemporary Catholic Church, Modern Parish Security Office, and Sacred Statues
 */

class WorldBuilder {
  constructor(scene) {
    this.scene = scene;
    this.materials = {};
    this.nodes = {};
    this.lights = {};
    this.statues = {};
  }

  initMaterials() {
    // Generate specialized textures matching reference photo
    const floorTex = TextureGen.createTerrazzoFloorTexture();
    const wallTex = TextureGen.createGrungyPlasterWallTexture();
    const ceilTex = TextureGen.createDropCeilingTileTexture();
    const doorTex = TextureGen.createArchedChurchDoorTexture();
    const brickTex = TextureGen.createBrickArchTexture();
    const vaultTex = TextureGen.createVaultedStoneTexture();
    const marbleTex = TextureGen.createCarraraMarbleTexture();
    const woodTex = TextureGen.createModernWoodTexture();
    const glassTex = TextureGen.createModernStainedGlassTexture();
    const steelTex = TextureGen.createBrushedSteelTexture();
    const gaugeTex = TextureGen.createIndustrialGaugeBoxTexture();
    const greenCrtTex = TextureGen.createGreenCRTMinimapTexture();
    const paperTex = TextureGen.createDeskPaperworkTexture();
    const ventGrilleTex = TextureGen.createSlattedVentGrilleTexture();
    const bulletinTex = TextureGen.createBulletinBoardTexture();

    // Floor: Dark aged concrete / terrazzo tile
    this.materials.floor = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.6,
      metalness: 0.15
    });

    // Walls: Grungy greenish-grey plaster with water stains
    this.materials.wall = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.9,
      metalness: 0.05
    });

    // Drop-Ceiling: Acoustic grid tiles
    this.materials.dropCeiling = new THREE.MeshStandardMaterial({
      map: ceilTex,
      roughness: 0.95,
      metalness: 0.05
    });

    // Arched Church Door: Solid oak planks with black iron strap hinges
    this.materials.archedDoor = new THREE.MeshStandardMaterial({
      map: doorTex,
      roughness: 0.7,
      metalness: 0.2
    });

    // Cloister Hallway: Red brick pillars
    this.materials.brick = new THREE.MeshStandardMaterial({
      map: brickTex,
      roughness: 0.9,
      metalness: 0.05
    });

    // Cloister Hallway: Vaulted stone arches
    this.materials.vaultStone = new THREE.MeshStandardMaterial({
      map: vaultTex,
      roughness: 0.85,
      metalness: 0.05
    });

    // Polished Carrara Marble for Statues & Altar
    this.materials.marble = new THREE.MeshStandardMaterial({
      map: marbleTex,
      roughness: 0.3,
      metalness: 0.1
    });

    // Dark Iron & Steel (Frames, hinges, pipes)
    this.materials.darkIron = new THREE.MeshStandardMaterial({
      color: 0x181a1d,
      roughness: 0.55,
      metalness: 0.75
    });

    this.materials.brushedSteel = new THREE.MeshStandardMaterial({
      map: steelTex,
      roughness: 0.45,
      metalness: 0.8
    });

    // Heavy Rustic Timber (Desk, side tables)
    this.materials.wood = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.65,
      metalness: 0.05
    });

    // Industrial Electrical Gauge Box
    this.materials.gaugeBox = new THREE.MeshStandardMaterial({
      map: gaugeTex,
      roughness: 0.45,
      metalness: 0.4
    });

    // Retro Green CRT Terminal Screen (Facility Radar Minimap)
    this.materials.greenCRT = new THREE.MeshBasicMaterial({
      map: greenCrtTex
    });

    // Desk Clipboard & Paperwork Sheets
    this.materials.paperwork = new THREE.MeshStandardMaterial({
      map: paperTex,
      roughness: 0.8,
      metalness: 0.05
    });

    // Slatted Ventilation Grille
    this.materials.ventGrille = new THREE.MeshStandardMaterial({
      map: ventGrilleTex,
      roughness: 0.6,
      metalness: 0.45
    });

    // Observation Window Plate Glass
    this.materials.plateGlass = new THREE.MeshPhysicalMaterial({
      color: 0xc8d8e4,
      transparent: true,
      opacity: 0.16,
      roughness: 0.04,
      transmission: 0.94,
      ior: 1.5
    });

    // Modern Stained Glass for Sanctuary
    this.materials.stainedGlass = new THREE.MeshBasicMaterial({
      map: glassTex,
      transparent: true,
      opacity: 0.95
    });

    this.materials.bulletin = new THREE.MeshStandardMaterial({
      map: bulletinTex,
      roughness: 0.7
    });

    // Retro CRT TV Surveillance Monitor Screen (CCTV Feed)
    const crtFeedTex = new THREE.TextureLoader().load('assets/cctv/church_cam_normal.png');
    this.materials.crtTVFeed = new THREE.MeshBasicMaterial({
      map: crtFeedTex
    });
    this.nodes.crtTvScreenMat = this.materials.crtTVFeed;
    this.nodes.crtScreenMat = this.materials.crtTVFeed;

    // Golden Halo Ring
    this.materials.haloGold = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85
    });
  }

  // ================= 1. SECURITY OFFICE (MATCHING USER REFERENCE PHOTO) =================
  buildOffice() {
    const officeGroup = new THREE.Group();
    officeGroup.name = 'officeGroup';

    const w = 7.2; // width
    const d = 5.6; // depth
    const h = 3.6; // height

    // Floor: Dark aged concrete / terrazzo
    const floorGeo = new THREE.PlaneGeometry(w, d);
    const floor = new THREE.Mesh(floorGeo, this.materials.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    officeGroup.add(floor);

    // Ceiling: Drop-ceiling grid with acoustic tiles
    const ceilGeo = new THREE.PlaneGeometry(w, d);
    const ceiling = new THREE.Mesh(ceilGeo, this.materials.dropCeiling);
    ceiling.position.y = h;
    ceiling.rotation.x = Math.PI / 2;
    officeGroup.add(ceiling);

    // Back wall (behind player)
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), this.materials.wall);
    backWall.position.set(0, h / 2, d / 2);
    backWall.rotation.y = Math.PI;
    backWall.receiveShadow = true;
    officeGroup.add(backWall);

    // --- FRONT WALL & LARGE OBSERVATION WINDOW ---
    const winW = 4.3;
    const winH = 2.2;
    const winBottomY = 0.85;

    // Front Wall Left section
    const fwSideW = (w - winW) / 2;
    const fwLeft = new THREE.Mesh(new THREE.BoxGeometry(fwSideW, h, 0.3), this.materials.wall);
    fwLeft.position.set(-w / 2 + fwSideW / 2, h / 2, -d / 2);
    officeGroup.add(fwLeft);

    // Front Wall Right section
    const fwRight = new THREE.Mesh(new THREE.BoxGeometry(fwSideW, h, 0.3), this.materials.wall);
    fwRight.position.set(w / 2 - fwSideW / 2, h / 2, -d / 2);
    officeGroup.add(fwRight);

    // Front Wall Top section
    const fwTopH = h - (winBottomY + winH);
    const fwTop = new THREE.Mesh(new THREE.BoxGeometry(winW, fwTopH, 0.3), this.materials.wall);
    fwTop.position.set(0, winBottomY + winH + fwTopH / 2, -d / 2);
    officeGroup.add(fwTop);

    // Front Wall Bottom Sill section
    const fwBottom = new THREE.Mesh(new THREE.BoxGeometry(winW, winBottomY, 0.3), this.materials.wall);
    fwBottom.position.set(0, winBottomY / 2, -d / 2);
    officeGroup.add(fwBottom);

    // Thick Dark Steel Window Frame
    const frameMat = this.materials.darkIron;
    const frameT = 0.08;
    const frameD = 0.16;
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(winW + frameT * 2, frameT, frameD), frameMat);
    topFrame.position.set(0, winBottomY + winH, -d / 2);
    officeGroup.add(topFrame);

    const botFrame = new THREE.Mesh(new THREE.BoxGeometry(winW + frameT * 2, frameT, frameD), frameMat);
    botFrame.position.set(0, winBottomY, -d / 2);
    officeGroup.add(botFrame);

    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(frameT, winH, frameD), frameMat);
    leftFrame.position.set(-winW / 2, winBottomY + winH / 2, -d / 2);
    officeGroup.add(leftFrame);

    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(frameT, winH, frameD), frameMat);
    rightFrame.position.set(winW / 2, winBottomY + winH / 2, -d / 2);
    officeGroup.add(rightFrame);

    // High-Resolution Photorealistic Observation Window Backdrop Plane
    // (Binds dynamically to CAM 05 Cloister Hallway textures generated from Gemini Flash Image)
    // Equipped with custom ShaderMaterial for realistic nocturnal darkness & halogen beam optics
    const windowBackdropGeo = new THREE.PlaneGeometry(winW, winH);
    const initialHallwayTex = new THREE.TextureLoader().load('assets/office/window_hallway_empty.jpg');

    const windowBackdropMat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: initialHallwayTex },
        lightIntensity: { value: 0.0 }, // 0.0 (Pitch-black night) -> 1.0 (Halogen beam)
        flicker: { value: 1.0 },
        aspect: { value: winW / winH },
        time: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float lightIntensity;
        uniform float flicker;
        uniform float aspect;
        uniform float time;
        varying vec2 vUv;

        void main() {
          vec4 texColor = texture2D(map, vUv);

          // 1. Dark Cloister Nocturnal Gloom (Flashlight OFF):
          // Authentic pitch-black church darkness with faint midnight-blue contours
          vec3 darkAmbient = texColor.rgb * vec3(0.05, 0.055, 0.08);

          // 2. High-Power Halogen Spotlight Beam Projection (Flashlight ON):
          // Centered directly down the cloister corridor
          vec2 beamCenter = vec2(0.50, 0.46);
          vec2 uvDiff = vUv - beamCenter;
          uvDiff.x *= aspect * 0.72; // Optical circular beam correction
          float dist = length(uvDiff);

          // Intensely focused central core hotspot
          float hotSpot = smoothstep(0.40, 0.02, dist);

          // Broad reflector spill light
          float broadSpill = smoothstep(0.92, 0.15, dist);

          // Halogen parabolic reflector edge ring
          float ring = smoothstep(0.38, 0.48, dist) * smoothstep(0.58, 0.48, dist) * 0.22;

          // Composite beam profile: bright central illumination (~2.4x) with realistic falloff
          float beamProfile = hotSpot * 1.60 + broadSpill * 0.78 + ring;

          // Authentic Halogen Color Temperature (Warm incandescent core with crisp daylight spill)
          vec3 halogenColor = mix(vec3(1.42, 1.38, 1.25), vec3(1.22, 1.26, 1.32), smoothstep(0.0, 0.65, dist));
          vec3 litColor = texColor.rgb * halogenColor * beamProfile * flicker;

          // Seamless transition between pitch-dark hallway and illuminated beam
          vec3 finalColor = mix(darkAmbient, litColor, lightIntensity);

          // Subtle architectural frame vignette
          vec2 edge = abs(vUv - 0.5) * 2.0;
          float edgeVignette = 1.0 - smoothstep(0.85, 1.0, max(edge.x, edge.y)) * 0.45;
          finalColor *= edgeVignette;

          gl_FragColor = vec4(finalColor, texColor.a);
        }
      `
    });
    // Set fallback property map so standard texture routines can inspect it
    windowBackdropMat.map = initialHallwayTex;

    const windowBackdrop = new THREE.Mesh(windowBackdropGeo, windowBackdropMat);
    windowBackdrop.position.set(0, winBottomY + winH / 2, -d / 2 - 0.04);
    officeGroup.add(windowBackdrop);
    this.nodes.windowBackdrop = windowBackdrop;
    this.nodes.windowBackdropMat = windowBackdropMat;

    // Realistic Institutional Window Glass Pane (Front of backdrop)
    const glassTex = TextureGen.createWindowGlassTexture();
    const windowGlassMat = new THREE.MeshStandardMaterial({
      map: glassTex,
      transparent: true,
      opacity: 0.35,
      roughness: 0.15,
      metalness: 0.1,
      depthWrite: false
    });
    const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), windowGlassMat);
    windowGlass.position.set(0, winBottomY + winH / 2, -d / 2 + 0.01);
    officeGroup.add(windowGlass);
    this.nodes.windowGlass = windowGlass;
    this.nodes.windowGlassMat = windowGlassMat;

    // Electrical junction box under center window
    const winJuncBox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.14), frameMat);
    winJuncBox.position.set(0.08, winBottomY - 0.22, -d / 2 + 0.15);
    officeGroup.add(winJuncBox);

    // Drooping Black Conduit Cables across the top of the window
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x111315 });
    for (let c = 0; c < 3; c++) {
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-winW / 2 - 0.4, winBottomY + winH + 0.3 + c * 0.06, -d / 2 + 0.05),
        new THREE.Vector3(-1.0, winBottomY + winH + 0.15 + c * 0.04, -d / 2 + 0.08),
        new THREE.Vector3(1.2, winBottomY + winH + 0.18 + c * 0.04, -d / 2 + 0.08),
        new THREE.Vector3(winW / 2 + 0.5, winBottomY + winH + 0.28 + c * 0.06, -d / 2 + 0.05)
      );
      const cableGeo = new THREE.TubeGeometry(curve, 24, 0.015, 6, false);
      const cableMesh = new THREE.Mesh(cableGeo, cableMat);
      officeGroup.add(cableMesh);
    }

    // --- LEFT WALL (ARCHED WOODEN CHURCH DOOR & WEST CLOISTER CORRIDOR) ---
    const doorW = 1.35;
    const doorH = 2.65;
    const doorArchRadius = doorW / 2;
    const doorZ = -0.6;

    // Left Wall surround (Flush with door opening, front wall, and back wall - NO GAPS!)
    const lwFrontLen = (doorZ - doorW / 2) - (-d / 2); // z from -2.8 to -1.275 (length: 1.525)
    const lwFrontZ = (-d / 2 + (doorZ - doorW / 2)) / 2; // center z: -2.0375
    const lwFront = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, lwFrontLen), this.materials.wall);
    lwFront.position.set(-w / 2, h / 2, lwFrontZ);
    officeGroup.add(lwFront);

    const lwBackLen = (d / 2) - (doorZ + doorW / 2); // z from +0.075 to +2.8 (length: 2.725)
    const lwBackZ = ((doorZ + doorW / 2) + d / 2) / 2; // center z: +1.4375
    const lwBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, lwBackLen), this.materials.wall);
    lwBack.position.set(-w / 2, h / 2, lwBackZ);
    officeGroup.add(lwBack);

    const lwTop = new THREE.Mesh(new THREE.BoxGeometry(0.3, h - doorH, doorW), this.materials.wall);
    lwTop.position.set(-w / 2, doorH + (h - doorH) / 2, doorZ);
    officeGroup.add(lwTop);

    // --- OUTER WEST CLOISTER CORRIDOR (Visible through left open doorway) ---
    const corridorGroup = new THREE.Group();
    const corrW = 4.2;
    const corrH = 3.4;
    const corrZBack = doorZ + 1.4; // +0.8 (corner wall behind door)
    const corrZFront = -14.0;      // Extends forward down hallway into dark cathedral fog
    const corrLength = corrZBack - corrZFront; // 14.8m
    const corrCenterZ = (corrZBack + corrZFront) / 2; // -6.6m

    // Corridor stone floor extending down the hallway
    const corrFloor = new THREE.Mesh(new THREE.PlaneGeometry(corrW, corrLength), this.materials.floor);
    corrFloor.rotation.x = -Math.PI / 2;
    corrFloor.position.set(-w / 2 - corrW / 2, 0.01, corrCenterZ);
    corridorGroup.add(corrFloor);

    // Corridor stone ceiling extending down the hallway
    const corrCeil = new THREE.Mesh(new THREE.PlaneGeometry(corrW, corrLength), this.materials.vaultStone);
    corrCeil.rotation.x = Math.PI / 2;
    corrCeil.position.set(-w / 2 - corrW / 2, corrH, corrCenterZ);
    corridorGroup.add(corrCeil);

    // Far west wall extending down the hallway
    const corrFarWall = new THREE.Mesh(new THREE.PlaneGeometry(corrLength, corrH), this.materials.wall);
    corrFarWall.rotation.y = Math.PI / 2;
    corrFarWall.position.set(-w / 2 - corrW, corrH / 2, corrCenterZ);
    corridorGroup.add(corrFarWall);

    // Back corner wall (behind door, stone wall)
    const corrSideWallR = new THREE.Mesh(new THREE.PlaneGeometry(corrW, corrH), this.materials.wall);
    corrSideWallR.rotation.y = Math.PI;
    corrSideWallR.position.set(-w / 2 - corrW / 2, corrH / 2, corrZBack);
    corridorGroup.add(corrSideWallR);

    // (The red brick wall corrSideWallL blocking the way forward has been removed)

    // Hallway ceiling downlight fixture mounted directly above door threshold
    const corrLampMat = this.materials.darkIron;
    const corrLampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.08, 16), corrLampMat);
    corrLampBase.position.set(-w / 2 - 0.7, corrH - 0.04, doorZ);
    corridorGroup.add(corrLampBase);

    const corrBulbMat = new THREE.MeshBasicMaterial({ color: 0xfff0d4 });
    const corrBulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), corrBulbMat);
    corrBulb.position.set(-w / 2 - 0.7, corrH - 0.12, doorZ);
    corridorGroup.add(corrBulb);

    officeGroup.add(corridorGroup);


    // Arched Stone Trim around doorway (Inside Office)
    const archTrimGroup = new THREE.Group();
    archTrimGroup.position.set(-w / 2 + 0.08, 0, doorZ);
    archTrimGroup.rotation.y = Math.PI / 2;

    const jambGeo = new THREE.BoxGeometry(0.12, doorH - doorArchRadius, 0.22);
    const leftJamb = new THREE.Mesh(jambGeo, this.materials.vaultStone);
    leftJamb.position.set(-doorW / 2 - 0.06, (doorH - doorArchRadius) / 2, 0);
    archTrimGroup.add(leftJamb);

    const rightJamb = new THREE.Mesh(jambGeo, this.materials.vaultStone);
    rightJamb.position.set(doorW / 2 + 0.06, (doorH - doorArchRadius) / 2, 0);
    archTrimGroup.add(rightJamb);

    const archHeaderGeo = new THREE.TorusGeometry(doorArchRadius + 0.06, 0.1, 8, 16, Math.PI);
    const archHeader = new THREE.Mesh(archHeaderGeo, this.materials.vaultStone);
    archHeader.position.set(0, doorH - doorArchRadius, 0);
    archTrimGroup.add(archHeader);
    officeGroup.add(archTrimGroup);

    // Heavy Electronic Maglock Box at Top of Doorway Frame
    const magBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.38), frameMat);
    magBox.position.set(-w / 2 + 0.06, doorH - 0.06, doorZ);
    officeGroup.add(magBox);

    // Maglock Armed/Unarmed Status LED Sphere (Red = Locked, Green = Open)
    const magLedMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const magLed = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), magLedMat);
    magLed.position.set(-w / 2 + 0.16, doorH - 0.06, doorZ);
    officeGroup.add(magLed);
    this.nodes.magLedMat = magLedMat;

    // Arched Wooden Church Door with Iron Straps (Door Pivot)
    // Hinge edge is at doorZ - doorW / 2; swings inward into office room!
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-w / 2 + 0.04, 0, doorZ - doorW / 2);

    const doorBaseH = doorH - doorArchRadius;
    const doorBase = new THREE.Mesh(new THREE.BoxGeometry(0.1, doorBaseH, doorW), this.materials.archedDoor);
    doorBase.position.set(0, doorBaseH / 2, doorW / 2);
    doorBase.castShadow = true;
    doorPivot.add(doorBase);

    const doorArchShape = new THREE.Shape();
    doorArchShape.moveTo(-doorArchRadius, 0);
    doorArchShape.absarc(0, 0, doorArchRadius, Math.PI, 0, true);
    doorArchShape.lineTo(-doorArchRadius, 0);
    const doorArchExtrude = new THREE.ExtrudeGeometry(doorArchShape, { depth: 0.1, bevelEnabled: false });
    const doorArchMesh = new THREE.Mesh(doorArchExtrude, this.materials.archedDoor);
    doorArchMesh.rotation.y = Math.PI / 2;
    doorArchMesh.position.set(0.05, doorBaseH, doorW / 2);
    doorPivot.add(doorArchMesh);

    officeGroup.add(doorPivot);
    this.nodes.doorPivot = doorPivot;

    // Left Wall Security Pushbutton Station (Mounted at eye-level on wall beside door)
    const leftStationBox = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.22), frameMat);
    leftStationBox.position.set(-w / 2 + 0.05, 1.45, 0.45);
    officeGroup.add(leftStationBox);

    const leftBtnDoor = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    leftBtnDoor.rotation.z = Math.PI / 2;
    leftBtnDoor.position.set(-w / 2 + 0.1, 1.55, 0.45);
    officeGroup.add(leftBtnDoor);

    const leftBtnLight = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 12), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    leftBtnLight.rotation.z = Math.PI / 2;
    leftBtnLight.position.set(-w / 2 + 0.1, 1.35, 0.45);
    officeGroup.add(leftBtnLight);

    // Wall Light Switch Box with vertical conduit to ceiling (Left of Door)
    const switchBox = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.12), frameMat);
    switchBox.position.set(-w / 2 + 0.06, 1.45, -1.6);
    officeGroup.add(switchBox);

    const toggleLever = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), this.materials.brushedSteel);
    toggleLever.position.set(-w / 2 + 0.12, 1.45, -1.6);
    officeGroup.add(toggleLever);

    const vPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, h - 1.45, 8), frameMat);
    vPipe.position.set(-w / 2 + 0.06, 1.45 + (h - 1.45) / 2, -1.6);
    officeGroup.add(vPipe);

    // Wooden Key Rack on wall
    const keyRack = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.35), this.materials.wood);
    keyRack.position.set(-w / 2 + 0.03, 1.85, 0.95);
    officeGroup.add(keyRack);

    const keyMat = new THREE.MeshStandardMaterial({ color: 0xc8a245, roughness: 0.3, metalness: 0.8 });
    for (let k = 0; k < 6; k++) {
      const ky = 1.95 - Math.floor(k / 3) * 0.14;
      const kz = 0.85 + (k % 3) * 0.1;
      const keyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.08, 6), keyMat);
      keyMesh.position.set(-w / 2 + 0.06, ky, kz);
      officeGroup.add(keyMesh);
    }

    // --- RIGHT WALL (INDUSTRIAL GAUGES & 3D RECESSED HVAC AIR DUCT) ---
    const ventW = 1.35;
    const ventH = 1.15;
    const ventZ = 0.45;

    // Right wall surround (Flush with vent opening, front wall, and back wall - NO GAPS!)
    const rwTop = new THREE.Mesh(new THREE.BoxGeometry(0.3, h - ventH, d), this.materials.wall);
    rwTop.position.set(w / 2, ventH + (h - ventH) / 2, 0);
    officeGroup.add(rwTop);

    // Front section below ventH: from front wall (-d/2 = -2.8) to vent start (ventZ - ventW/2 = -0.225)
    const rwFrontLen = (ventZ - ventW / 2) - (-d / 2); // z from -2.8 to -0.225 (length: 2.575)
    const rwFrontZ = (-d / 2 + (ventZ - ventW / 2)) / 2; // center z: -1.5125
    const rwSideFront = new THREE.Mesh(new THREE.BoxGeometry(0.3, ventH, rwFrontLen), this.materials.wall);
    rwSideFront.position.set(w / 2, ventH / 2, rwFrontZ);
    officeGroup.add(rwSideFront);

    // Back section below ventH: from vent end (ventZ + ventW/2 = +1.125) to back wall (+d/2 = +2.8)
    const rwBackLen = (d / 2) - (ventZ + ventW / 2); // z from +1.125 to +2.8 (length: 1.675)
    const rwBackZ = ((ventZ + ventW / 2) + d / 2) / 2; // center z: +1.9625
    const rwSideBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, ventH, rwBackLen), this.materials.wall);
    rwSideBack.position.set(w / 2, ventH / 2, rwBackZ);
    officeGroup.add(rwSideBack);

    // Industrial Electrical Gauge Box (Top Right Wall)
    const gaugeBoxMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.85, 0.75), this.materials.gaugeBox);
    gaugeBoxMesh.position.set(w / 2 - 0.07, 2.1, -0.65);
    gaugeBoxMesh.rotation.y = -Math.PI / 2;
    officeGroup.add(gaugeBoxMesh);

    // --- 3D RECESSED GALVANIZED METAL HVAC AIR DUCT TUNNEL (Extends 3m into wall!) ---
    const ductTunnelGroup = new THREE.Group();
    const ductDepth = 3.2;

    // Galvanized Duct Floor
    const ductFloor = new THREE.Mesh(new THREE.PlaneGeometry(ductDepth, ventW), this.materials.galvanizedDuct || this.materials.brushedSteel);
    ductFloor.rotation.x = -Math.PI / 2;
    ductFloor.position.set(w / 2 + ductDepth / 2, 0.02, ventZ);
    ductTunnelGroup.add(ductFloor);

    // Galvanized Duct Ceiling
    const ductCeil = new THREE.Mesh(new THREE.PlaneGeometry(ductDepth, ventW), this.materials.galvanizedDuct || this.materials.brushedSteel);
    ductCeil.rotation.x = Math.PI / 2;
    ductCeil.position.set(w / 2 + ductDepth / 2, ventH, ventZ);
    ductTunnelGroup.add(ductCeil);

    // Duct Side Walls (Ribbed galvanized sheet metal)
    const ductSideL = new THREE.Mesh(new THREE.PlaneGeometry(ductDepth, ventH), this.materials.galvanizedDuct || this.materials.brushedSteel);
    ductSideL.position.set(w / 2 + ductDepth / 2, ventH / 2, ventZ - ventW / 2);
    ductTunnelGroup.add(ductSideL);

    const ductSideR = new THREE.Mesh(new THREE.PlaneGeometry(ductDepth, ventH), this.materials.galvanizedDuct || this.materials.brushedSteel);
    ductSideR.rotation.y = Math.PI;
    ductSideR.position.set(w / 2 + ductDepth / 2, ventH / 2, ventZ + ventW / 2);
    ductTunnelGroup.add(ductSideR);

    // Dark vanishing back wall leading toward the crypt
    const ductBack = new THREE.Mesh(new THREE.PlaneGeometry(ventW, ventH), new THREE.MeshBasicMaterial({ color: 0x020406 }));
    ductBack.rotation.y = -Math.PI / 2;
    ductBack.position.set(w / 2 + ductDepth, ventH / 2, ventZ);
    ductTunnelGroup.add(ductBack);

    officeGroup.add(ductTunnelGroup);


    // Heavy Industrial Steel Duct Flange Collar around vent mouth
    const flangeMat = frameMat;
    const flangeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, ventH + 0.16, 0.08), flangeMat);
    flangeL.position.set(w / 2 - 0.04, ventH / 2, ventZ - ventW / 2 - 0.04);
    officeGroup.add(flangeL);

    const flangeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, ventH + 0.16, 0.08), flangeMat);
    flangeR.position.set(w / 2 - 0.04, ventH / 2, ventZ + ventW / 2 + 0.04);
    officeGroup.add(flangeR);

    // Heavy Vertical Shutter Guide Channels on left and right
    const guideGeo = new THREE.BoxGeometry(0.08, ventH * 1.8, 0.06);
    const guideL = new THREE.Mesh(guideGeo, this.materials.darkIron);
    guideL.position.set(w / 2 - 0.02, ventH * 0.9, ventZ - ventW / 2 - 0.03);
    officeGroup.add(guideL);

    const guideR = new THREE.Mesh(guideGeo, this.materials.darkIron);
    guideR.position.set(w / 2 - 0.02, ventH * 0.9, ventZ + ventW / 2 + 0.03);
    officeGroup.add(guideR);

    // Overhead Hydraulic Shutter Cylinder Housing Box
    const shutterHousing = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, ventW + 0.2), frameMat);
    shutterHousing.position.set(w / 2 - 0.05, ventH + 0.65, ventZ);
    officeGroup.add(shutterHousing);

    // Motorized Steel Blast Shutter Damper with Hazard Warning Stripes
    const ventShutter = new THREE.Group();
    ventShutter.position.set(w / 2 - 0.02, 1.85, ventZ); // Open position (pulled up inside housing)

    const shutterMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, ventH, ventW),
      this.materials.hazardVent || this.materials.brushedSteel
    );
    shutterMesh.castShadow = true;
    ventShutter.add(shutterMesh);

    officeGroup.add(ventShutter);
    this.nodes.ventShutter = ventShutter;

    // Right Wall Vent Control Station Box (with illuminated pushbuttons)
    const ventStationBox = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.22), frameMat);
    ventStationBox.position.set(w / 2 - 0.05, 1.45, -0.65);
    officeGroup.add(ventStationBox);

    const ventBtnSeal = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 12), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    ventBtnSeal.rotation.z = Math.PI / 2;
    ventBtnSeal.position.set(w / 2 - 0.1, 1.55, -0.65);
    officeGroup.add(ventBtnSeal);

    const ventBtnLight = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 12), new THREE.MeshBasicMaterial({ color: 0x4ade80 }));
    ventBtnLight.rotation.z = Math.PI / 2;
    ventBtnLight.position.set(w / 2 - 0.1, 1.35, -0.65);
    officeGroup.add(ventBtnLight);

    // --- CENTER EXECUTIVE VINTAGE DESK & HARDWARE ---
    const deskGroup = new THREE.Group();
    deskGroup.position.set(0.15, 0, -1.35);

    // Heavy Rustic Timber Desk
    const deskW = 2.6;
    const deskD = 1.25;
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(deskW, 0.07, deskD), this.materials.wood);
    deskTop.position.set(0, 0.76, 0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    deskGroup.add(deskTop);

    // Desk Legs & Drawers
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.76, deskD - 0.1), this.materials.wood);
    legL.position.set(-deskW / 2 + 0.25, 0.38, 0);
    deskGroup.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.76, deskD - 0.1), this.materials.wood);
    legR.position.set(deskW / 2 - 0.25, 0.38, 0);
    deskGroup.add(legR);

    // 1. Chunky Retro CRT TV Surveillance Monitor (Right Desk)
    const crtTvGroup = new THREE.Group();
    crtTvGroup.position.set(0.72, 0.8, -0.05);
    crtTvGroup.rotation.y = -0.22; // Angled toward player

    // Chunky CRT Television Enclosure
    const crtBody = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.62, 0.52), new THREE.MeshStandardMaterial({ color: 0x54585c, roughness: 0.6, metalness: 0.2 }));
    crtBody.position.y = 0.32;
    crtTvGroup.add(crtBody);

    // Curved CRT Screen displaying live CCTV camera feed
    const crtScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.44), this.materials.crtTVFeed);
    crtScreen.position.set(0, 0.34, 0.265);
    crtTvGroup.add(crtScreen);

    // CRT Control Panel underneath screen (Rotary Knobs & LED)
    const knobMat = new THREE.MeshStandardMaterial({ color: 0x1f2124, roughness: 0.4 });
    const knob1 = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.03, 12), knobMat);
    knob1.rotation.x = Math.PI / 2;
    knob1.position.set(0.18, 0.08, 0.27);
    crtTvGroup.add(knob1);

    const knob2 = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.03, 12), knobMat);
    knob2.rotation.x = Math.PI / 2;
    knob2.position.set(0.24, 0.08, 0.27);
    crtTvGroup.add(knob2);

    // Power indicator LED (Green)
    const pwrLed = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshBasicMaterial({ color: 0x4ade80 }));
    pwrLed.position.set(0.12, 0.08, 0.27);
    crtTvGroup.add(pwrLed);

    deskGroup.add(crtTvGroup);

    // 2. Clipboard with Incident Log Papers (Center Desk)
    const clipboard = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.58), this.materials.paperwork);
    clipboard.rotation.x = -Math.PI / 2;
    clipboard.rotation.z = -0.12; // Natural angle
    clipboard.position.set(-0.02, 0.805, 0.12);
    deskGroup.add(clipboard);

    // Ballpoint Pen lying beside clipboard
    const penMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.18, 8), frameMat);
    penMesh.rotation.x = -Math.PI / 2;
    penMesh.rotation.z = 0.35;
    penMesh.position.set(0.32, 0.81, 0.18);
    deskGroup.add(penMesh);

    // 3. Heavy Tactical Metal Flashlight (Front-Left Desk)
    const flashlightGroup = new THREE.Group();
    flashlightGroup.position.set(-0.48, 0.815, 0.15);
    flashlightGroup.rotation.y = 0.55;

    // Flashlight body
    const flBody = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.26, 12), this.materials.darkIron);
    flBody.rotation.z = Math.PI / 2;
    flashlightGroup.add(flBody);

    // Flashlight bezel head
    const flHead = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.024, 0.08, 12), this.materials.darkIron);
    flHead.rotation.z = Math.PI / 2;
    flHead.position.x = 0.16;
    flashlightGroup.add(flHead);

    // Glowing front glass reflector
    const flLens = new THREE.Mesh(new THREE.CircleGeometry(0.032, 12), new THREE.MeshBasicMaterial({ color: 0xfffae0 }));
    flLens.rotation.y = Math.PI / 2;
    flLens.position.x = 0.201;
    flashlightGroup.add(flLens);

    // Flashlight Beam Forward Spot
    const flLight = new THREE.SpotLight(0xfffae0, 1.8, 6.0, 0.35, 0.3, 1.5);
    flLight.position.set(0.25, 0, 0);
    flLight.target.position.set(4.0, 0, 0);
    flashlightGroup.add(flLight);
    flashlightGroup.add(flLight.target);

    deskGroup.add(flashlightGroup);

    // 4. Vintage CB Radio / Intercom Transceiver (Left Desk)
    const cbRadio = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.24), new THREE.MeshStandardMaterial({ color: 0x363a3d, roughness: 0.5 }));
    cbRadio.position.set(-0.52, 0.87, -0.22);
    deskGroup.add(cbRadio);

    // 5. Ceramic Coffee Mug (Right Desk beside CRT)
    const mugGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.12, 16);
    const mug = new THREE.Mesh(mugGeo, new THREE.MeshStandardMaterial({ color: 0xd8d4cb, roughness: 0.3 }));
    mug.position.set(0.72, 0.86, 0.38);
    deskGroup.add(mug);

    // Coiled black cable across desk
    const deskCableCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.35, 0.805, -0.22),
      new THREE.Vector3(0.05, 0.805, -0.05),
      new THREE.Vector3(0.25, 0.805, 0.28),
      new THREE.Vector3(0.55, 0.805, 0.32)
    );
    const deskCable = new THREE.Mesh(new THREE.TubeGeometry(deskCableCurve, 16, 0.008, 6, false), cableMat);
    deskGroup.add(deskCable);

    officeGroup.add(deskGroup);

    // --- MOODY RETRO ATMOSPHERIC LIGHTING RIG ---
    // 1. Desaturated Greenish-Grey Ambient Fill (Matches photo color grade)
    const ambientLight = new THREE.AmbientLight(0x18241f, 0.55);
    officeGroup.add(ambientLight);

    // 2. Warm Desk Overhead Pool Light (Illuminates documents & flashlight)
    const deskTaskLight = new THREE.PointLight(0xffe6b0, 1.4, 4.5);
    deskTaskLight.position.set(0.1, 2.2, -1.2);
    deskTaskLight.castShadow = true;
    officeGroup.add(deskTaskLight);
    this.lights.candleLight = deskTaskLight; // Mapped to desk task light

    // 3. Faint Green CRT Monitor Phosphor Screen Glow
    const crtGlow = new THREE.PointLight(0x4ade80, 0.45, 2.8);
    crtGlow.position.set(0.72, 1.1, -0.05); // Beside CRT monitor on desk
    officeGroup.add(crtGlow);

    // 4. Center Window Spotlight (Flashes outside into vaulted cloister)
    const windowSpot = new THREE.SpotLight(0xfffae8, 0, 18, Math.PI / 3.2, 0.4, 1.2);
    windowSpot.position.set(0, winBottomY + winH - 0.05, -d / 2 + 0.15);
    windowSpot.target.position.set(0, winBottomY + 0.4, -d / 2 - 4.0);
    officeGroup.add(windowSpot);
    officeGroup.add(windowSpot.target);
    this.lights.windowSpot = windowSpot;

    // 5. Left Corridor Downlight (Arched Door)
    const doorLight = new THREE.PointLight(0xfff0d4, 0, 10, 1.2);
    doorLight.position.set(-w / 2 - 0.7, corrH - 0.25, -0.6);
    officeGroup.add(doorLight);
    this.lights.doorLight = doorLight;

    // 6. Right Ventilation Inspection Light
    const ventLight = new THREE.PointLight(0xddeeff, 0, 7);
    ventLight.position.set(w / 2 + 1.2, 0.85, 0.45);
    officeGroup.add(ventLight);
    this.lights.ventLight = ventLight;

    this.scene.add(officeGroup);
  }

  // ================= 2. VAULTED CLOISTER CORRIDOR (OUTSIDE WINDOW) =================
  buildWindowHallway() {
    // The observation window view into the cloister corridor is rendered 100%
    // photorealistically via this.nodes.windowBackdrop (Gemini Flash Image).
    // An empty group is preserved for scene hierarchy.
    const hallGroup = new THREE.Group();
    hallGroup.name = 'windowHallway';
    this.scene.add(hallGroup);
  }

  // ================= 3. SURVEILLANCE ROOMS (MODERN PARISH CCTV) =================
  // CAM 01: Modern Sanctuary & Altar
  buildCam01Altar() {
    const altarGroup = new THREE.Group();
    altarGroup.position.set(0, 0, -35);

    // Polished Terrazzo Sanctuary Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 28), this.materials.floor);
    floor.rotation.x = -Math.PI / 2;
    altarGroup.add(floor);

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(18, 28), this.materials.wall);
    ceil.position.y = 8.5;
    ceil.rotation.x = Math.PI / 2;
    altarGroup.add(ceil);

    // Back Sanctuary Wall with Modern Geometric Stained Glass Ribbon
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 8.5), this.materials.wall);
    backWall.position.set(0, 4.25, -13.5);
    altarGroup.add(backWall);

    const ribbonGeo = new THREE.PlaneGeometry(14, 2.2);
    const ribbon = new THREE.Mesh(ribbonGeo, this.materials.stainedGlass);
    ribbon.position.set(0, 5.8, -13.4);
    altarGroup.add(ribbon);

    // Raised White Carrara Marble Sanctuary Dais
    const dais = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.4, 5.0), this.materials.marble);
    dais.position.set(0, 0.2, -9.0);
    altarGroup.add(dais);

    // Modern Minimalist White Carrara Marble Altar Table
    const altarTable = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.95, 1.4), this.materials.marble);
    altarTable.position.set(0, 0.88, -9.0);
    altarGroup.add(altarTable);

    // Modern Contemporary Wall Crucifix (Suspended sleek cross)
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 0.1), this.materials.wood);
    crossV.position.set(0, 3.8, -13.2);
    altarGroup.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 0.1), this.materials.wood);
    crossH.position.set(0, 4.6, -13.2);
    altarGroup.add(crossH);

    // Minimalist Modern Oak Pews
    for (let pz = -4; pz <= 9; pz += 2.6) {
      const pewL = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.8, 0.5), this.materials.wood);
      pewL.position.set(-4.5, 0.4, pz);
      altarGroup.add(pewL);

      const pewR = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.8, 0.5), this.materials.wood);
      pewR.position.set(4.5, 0.4, pz);
      altarGroup.add(pewR);
    }

    // Modern Sanctuary Recessed Downlight
    const sanctuaryLight = new THREE.PointLight(0xffeaad, 1.1, 15);
    sanctuaryLight.position.set(0, 5.5, -9.0);
    altarGroup.add(sanctuaryLight);

    this.scene.add(altarGroup);
  }

  // CAM 02: Modern Parish Columbarium & Memorial Chapel
  buildCam02Catacombs() {
    const columbGroup = new THREE.Group();
    columbGroup.position.set(35, 0, -30);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), this.materials.floor);
    floor.rotation.x = -Math.PI / 2;
    columbGroup.add(floor);

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), this.materials.wall);
    ceil.position.y = 3.8;
    ceil.rotation.x = Math.PI / 2;
    columbGroup.add(ceil);

    // Modern Marble Niche Memorial Walls
    for (let nx of [-4.5, 4.5]) {
      const nicheWall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.2, 12), this.materials.marble);
      nicheWall.position.set(nx, 1.6, 0);
      columbGroup.add(nicheWall);
    }

    // Brass railing / memorial display stand
    const stand = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 1.2), this.materials.blackAluminum);
    stand.position.set(0, 0.45, -2);
    columbGroup.add(stand);

    // Modern clean wall sconces
    const columbLight = new THREE.PointLight(0x77bbee, 0.7, 10);
    columbLight.position.set(0, 2.8, -1.0);
    columbGroup.add(columbLight);

    this.scene.add(columbGroup);
  }

  // CAM 03: Modern Reconciliation Chapel (Confession Room)
  buildCam03Confessional() {
    const confGroup = new THREE.Group();
    confGroup.position.set(-35, 0, -30);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 16), this.materials.floor);
    floor.rotation.x = -Math.PI / 2;
    confGroup.add(floor);

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(12, 16), this.materials.wall);
    ceil.position.y = 3.8;
    ceil.rotation.x = Math.PI / 2;
    confGroup.add(ceil);

    // Modern Acoustic Slatted Wood Privacy Screen
    const screenGeo = new THREE.BoxGeometry(2.8, 3.0, 0.15);
    const screen = new THREE.Mesh(screenGeo, this.materials.wood);
    screen.position.set(-2.5, 1.5, -2);
    confGroup.add(screen);

    // Contemporary Consultation Table & Modern Cross
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.75, 0.9), this.materials.wood);
    table.position.set(2.2, 0.38, -2);
    confGroup.add(table);

    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.04), this.materials.haloGold);
    cross.position.set(2.2, 1.4, -4.5);
    confGroup.add(cross);

    const confLight = new THREE.PointLight(0xffcc88, 0.8, 9);
    confLight.position.set(0, 2.8, -2.0);
    confGroup.add(confLight);

    this.scene.add(confGroup);
  }

  // ================= 4. MODERN SACRED STATUES (POLISHED CARRARA MARBLE & 3D GLB MODELS) =================

  // --- STATUE 1: OUR LADY / WEEPING MARBLE ANGEL ("Mater Dolorosa") ---
  createWeepingAngel() {
    const angel = new THREE.Group();
    angel.name = 'WeepingAngel';

    // Procedural Fallback Group (rendered immediately while 3D GLB downloads)
    const fallback = new THREE.Group();
    fallback.name = 'proceduralFallback';

    // Modern minimalist pedestal
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.18, 24), this.materials.marble);
    base.position.y = 0.09;
    fallback.add(base);

    // Flowing robed skirt (Sacred Marian sculpture)
    const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.46, 1.45, 24), this.materials.marble);
    skirt.position.y = 0.82;
    fallback.add(skirt);

    // Torso with draped cowl
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.75, 16), this.materials.marble);
    torso.position.y = 1.68;
    fallback.add(torso);

    // Serene head with mourning veil
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), this.materials.marble);
    head.position.y = 2.18;
    fallback.add(head);

    // Sculpted Marian veil over head
    const veil = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.55, 16), this.materials.marble);
    veil.position.set(0, 2.22, -0.05);
    fallback.add(veil);

    // High-Resolution Textured Billboard Plane (Authentic CCTV Marian Sculpture)
    const angelTex = new THREE.TextureLoader().load('assets/entities/angel_cutout.png');
    const angelBillboardMat = new THREE.MeshStandardMaterial({
      map: angelTex,
      transparent: true,
      roughness: 0.75,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const angelBillboard = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 2.45), angelBillboardMat);
    angelBillboard.position.set(0, 1.25, 0.05);
    fallback.add(angelBillboard);

    // Sleek Polished Marble Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(-0.75, 1.3);
    wingShape.lineTo(-1.15, 1.7);
    wingShape.lineTo(-1.3, 1.4);
    wingShape.lineTo(-0.85, 0.6);
    wingShape.closePath();

    const extrudeSettings = { depth: 0.06, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.02, bevelThickness: 0.02 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);

    const wingGroupL = new THREE.Group();
    wingGroupL.position.set(-0.22, 1.8, -0.12);
    wingGroupL.add(new THREE.Mesh(wingGeo, this.materials.marble));
    fallback.add(wingGroupL);

    const wingGroupR = new THREE.Group();
    wingGroupR.position.set(0.22, 1.8, -0.12);
    const wingMeshR = new THREE.Mesh(wingGeo, this.materials.marble);
    wingMeshR.scale.x = -1;
    wingGroupR.add(wingMeshR);
    fallback.add(wingGroupR);

    // Clasped praying hands / reaching arms
    const armGroupL = new THREE.Group();
    armGroupL.position.set(-0.26, 1.85, 0);
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.6, 8), this.materials.marble);
    armL.position.set(0.12, 0.2, 0.18);
    armL.rotation.set(-1.1, 0.4, -0.6);
    armGroupL.add(armL);
    fallback.add(armGroupL);

    const armGroupR = new THREE.Group();
    armGroupR.position.set(0.26, 1.85, 0);
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.6, 8), this.materials.marble);
    armR.position.set(-0.12, 0.2, 0.18);
    armR.rotation.set(-1.1, -0.4, 0.6);
    armGroupR.add(armR);
    fallback.add(armGroupR);

    angel.add(fallback);

    // Glowing cyan-white teardrop eye embers (pierce darkness in hallway and doorway!)
    const eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0x88d4ff });
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeGlowMat);
    eye1.position.set(-0.07, 2.15, 0.22);
    fallback.add(eye1);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeGlowMat);
    eye2.position.set(0.07, 2.15, 0.22);
    fallback.add(eye2);

    this.statues.weepingAngel = angel;
    this.scene.add(angel);
    return angel;
  }

  // --- STATUE 2: THE MODERN SAINT ("Sanctus Vindex / Saint Michael") ---
  createHaloedSaint() {
    const saint = new THREE.Group();
    saint.name = 'HaloedSaint';

    const fallback = new THREE.Group();
    fallback.name = 'proceduralFallback';

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.16, 0.85), this.materials.marble);
    base.position.y = 0.08;
    fallback.add(base);

    // Elegant parish robes
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.52, 1.95, 20), this.materials.marble);
    robe.position.y = 1.08;
    fallback.add(robe);

    // High-Resolution Textured Billboard Plane (Authentic Sanctus Michael)
    const saintTex = new THREE.TextureLoader().load('assets/entities/saint_cutout.png');
    const saintBillboardMat = new THREE.MeshStandardMaterial({
      map: saintTex,
      transparent: true,
      roughness: 0.75,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const saintBillboard = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.45), saintBillboardMat);
    saintBillboard.position.set(0, 1.25, 0.05);
    fallback.add(saintBillboard);

    // Carved Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 18), this.materials.marble);
    head.position.y = 2.2;
    fallback.add(head);

    // Modern Floating Golden Halo Disc
    const haloGroup = new THREE.Group();
    haloGroup.position.set(0, 2.32, -0.06);

    const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.025, 8, 32), this.materials.haloGold);
    haloGroup.add(haloRing);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.18, 6), this.materials.haloGold);
      blade.position.set(Math.cos(angle) * 0.44, Math.sin(angle) * 0.44, 0);
      blade.rotation.z = angle - Math.PI / 2;
      haloGroup.add(blade);
    }
    fallback.add(haloGroup);

    // Modern Bronze Cross Blade
    const crossGroup = new THREE.Group();
    crossGroup.position.set(0.35, 1.4, 0.2);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.8, 8), this.materials.haloGold);
    shaft.position.y = 0.5;
    crossGroup.add(shaft);

    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.06), this.materials.haloGold);
    crossBar.position.y = 1.1;
    crossGroup.add(crossBar);
    fallback.add(crossGroup);

    saint.add(fallback);

    // Glowing Ember Eyes
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa22 });
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), glowMat);
    eye1.position.set(-0.06, 2.22, 0.22);
    fallback.add(eye1);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), glowMat);
    eye2.position.set(0.06, 2.22, 0.22);
    fallback.add(eye2);

    this.statues.haloedSaint = saint;
    this.scene.add(saint);
    return saint;
  }

  // --- STATUE 3: THE MEMORIAL VEILED PENITENT ("The Crawler") ---
  createVeiledMourner() {
    const mourner = new THREE.Group();
    mourner.name = 'VeiledMourner';

    const fallback = new THREE.Group();
    fallback.name = 'proceduralFallback';

    // Draped white marble funeral veil
    const veil = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.25, 18), this.materials.marble);
    veil.position.y = 0.72;
    fallback.add(veil);

    // High-Resolution Textured Billboard Plane (Crawling Penitent in Vent)
    const mournerTex = new THREE.TextureLoader().load('assets/entities/mourner_vent_cutout.png');
    const mournerBillboardMat = new THREE.MeshStandardMaterial({
      map: mournerTex,
      transparent: true,
      roughness: 0.85,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const mournerBillboard = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.1), mournerBillboardMat);
    mournerBillboard.position.set(0, 0.55, 0.15);
    fallback.add(mournerBillboard);

    // Deep hollow pitch-black void under veil
    const voidMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const voidFace = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 0.1), voidMat);
    voidFace.position.set(0, 0.96, 0.2);
    fallback.add(voidFace);

    // Crawling marble limbs (HVAC duct crawl posture)
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.9, 8), this.materials.marble);
    armL.position.set(-0.35, 0.4, 0.3);
    armL.rotation.set(0.8, 0.2, -0.4);
    fallback.add(armL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.9, 8), this.materials.marble);
    armR.position.set(0.35, 0.4, 0.3);
    armR.rotation.set(0.8, -0.2, 0.4);
    fallback.add(armR);

    mourner.add(fallback);

    // Ghostly piercing red-white phantom eyes deep inside the veil void
    const mournerEyeMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
    const mEye1 = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), mournerEyeMat);
    mEye1.position.set(-0.06, 0.98, 0.26);
    fallback.add(mEye1);
    const mEye2 = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), mournerEyeMat);
    mEye2.position.set(0.06, 0.98, 0.26);
    fallback.add(mEye2);

    this.statues.veiledMourner = mourner;
    this.scene.add(mourner);
    return mourner;
  }

  // --- STATUE 4: COLUMBARIUM MARY STATUE ---
  createMaryStatue() {
    const mary = new THREE.Group();
    mary.name = 'MaryStatue';
    mary.visible = false;
    mary.position.set(38, 0.8, -32); // In CAM 02 Columbarium, far from office!

    const maryTex = new THREE.TextureLoader().load('assets/entities/mary_cutout.png');
    const maryMat = new THREE.MeshStandardMaterial({
      map: maryTex,
      transparent: true,
      roughness: 0.75,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const maryPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 2.3), maryMat);
    maryPlane.position.set(0, 1.15, 0.05);
    mary.add(maryPlane);

    this.statues.maryStatue = mary;
    return mary;
  }

  // ================= 5. ASYNC 3D GLB MODEL LOADER & INTEGRATION =================
  loadEntityGLB(url, targetGroup, options = {}) {
    if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
      console.warn('[WorldBuilder] GLTFLoader not available, using procedural fallback for', targetGroup.name);
      return;
    }

    const {
      targetHeight = 2.4,
      rotX = 0,
      rotY = 0,
      rotZ = 0,
      offsetY = 0,
      onLoaded = null
    } = options;

    const loader = new THREE.GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        try {
          const rawScene = gltf.scene;
          if (!rawScene) return;

          // Apply coordinate orientation transforms if needed
          if (rotX !== 0) rawScene.rotation.x = rotX;
          if (rotY !== 0) rawScene.rotation.y = rotY;
          if (rotZ !== 0) rawScene.rotation.z = rotZ;
          rawScene.updateMatrixWorld(true);

          // Calculate oriented bounding box
          const rawBox = new THREE.Box3().setFromObject(rawScene);
          const rawSize = rawBox.getSize(new THREE.Vector3());
          const rawCenter = rawBox.getCenter(new THREE.Vector3());

          // Uniform scale to match canonical entity height
          const scale = targetHeight / (rawSize.y || 1);
          const container = new THREE.Group();
          container.name = 'glbModel';
          container.scale.set(scale, scale, scale);

          // Ground feet at y = 0 and center horizontally at (0, 0)
          rawScene.position.set(-rawCenter.x, -rawBox.min.y + offsetY, -rawCenter.z);
          container.add(rawScene);

          // Enable shadows and configure PBR materials
          rawScene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.side = THREE.DoubleSide;
                if (child.material.roughness !== undefined) {
                  child.material.roughness = Math.max(child.material.roughness, 0.4);
                }
              }
            }
          });

          // Gracefully hide procedural fallback geometry
          const fallback = targetGroup.getObjectByName('proceduralFallback');
          if (fallback) {
            fallback.visible = false;
          }

          // Add the realistic 3D model to the entity group
          targetGroup.add(container);
          console.log(`[WorldBuilder] Successfully loaded 3D GLB model for ${targetGroup.name} from ${url} (Height: ${targetHeight}m)`);

          if (typeof onLoaded === 'function') {
            onLoaded(container, gltf);
          }
        } catch (err) {
          console.error(`[WorldBuilder] Error processing 3D GLB for ${targetGroup.name}:`, err);
        }
      },
      undefined,
      (err) => {
        console.warn(`[WorldBuilder] Could not load 3D GLB from ${url}. Retaining procedural fallback.`, err);
      }
    );
  }

  load3DModels() {
    // 1. Weeping Angel (Mater Dolorosa)
    if (this.statues.weepingAngel) {
      this.loadEntityGLB('assets/models/weeping_angel_model.glb', this.statues.weepingAngel, {
        targetHeight: 2.35,
        rotX: 0
      });
    }

    // 2. Sanctus Michael (Haloed Saint)
    if (this.statues.haloedSaint) {
      this.loadEntityGLB('assets/models/saint_michael_model.glb', this.statues.haloedSaint, {
        targetHeight: 2.45,
        rotX: 0
      });
    }

    // 3. The Penitent / Veiled Mourner (Saint Mary - Crawling Entity)
    if (this.statues.veiledMourner) {
      this.loadEntityGLB('assets/models/saint_mary_model.glb', this.statues.veiledMourner, {
        targetHeight: 0.92,
        rotX: 0
      });
    }
  }

  buildAll() {
    this.initMaterials();
    this.buildOffice();
    this.buildWindowHallway();
    this.buildCam01Altar();
    this.buildCam02Catacombs();
    this.buildCam03Confessional();
    this.createWeepingAngel();
    this.createHaloedSaint();
    this.createVeiledMourner();
    this.load3DModels();
  }
}

window.WorldBuilder = WorldBuilder;
