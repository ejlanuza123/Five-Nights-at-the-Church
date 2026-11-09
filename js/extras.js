/**
 * Five Nights at the Church - Standalone Extras Page
 * Authentic FNAF-style Extra Archive:
 *  - 3D Model Viewer on Center Pedestal (Rotatable 360° Sidewards, Entity Switcher, Lore)
 *  - Fullscreen Hardware-Accelerated Video Jumpscares with Screaming Audio & Strobe
 *  - High-Resolution CCTV Surveillance Photo Gallery & Lightbox Viewer
 *  - Night Modifiers & Cheats (Radar Map Tracker, Fast Nights, Unlimited Power, Instant Shift Jump)
 * Zero emojis, authentic creepy dark gothic atmosphere.
 */

class ExtrasManager {
  constructor() {
    this.screen = null;
    this.mainMenu = null;
    this.isOpen = false;
    this.currentTab = 'models';
    this.selectedEntityIndex = 0;

    // 3D Model Viewer components
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.pedestalGroup = null;
    this.modelPivot = null;
    this.activeModel = null;
    this.cachedModels = {};
    this.isRendering = false;
    this.animationFrameId = null;

    // Interaction state (Rotation 360° Sidewards)
    this.isDragging = false;
    this.prevPointerX = 0;
    this.prevPointerY = 0;
    this.targetRotationY = 0;
    this.targetRotationX = 0;
    this.currentRotationY = 0;
    this.currentRotationX = 0;
    this.rotVelocityY = 0;
    this.targetCameraZ = 3.6;
    this.currentCameraZ = 3.6;
    this.isAutoRotating = true;
    this.autoRotateSpeed = 0.35;
    this.touchPinchDist = null;

    // Static Noise state
    this.staticCanvas = null;
    this.staticCtx = null;
    this.staticAnimId = null;

    // Jumpscare active state
    this.isJumpscarePlaying = false;
    this.activeJumpscareVideo = null;

    // Cheats configuration
    this.cheats = {
      radarMap: false,
      fastNights: false,
      infiniteBattery: false
    };

    this.entities = [
      {
        id: 'weepingAngel',
        name: 'WEEPING ANGEL',
        latinName: 'Mater Dolorosa ("Our Lady of Sorrows")',
        modelUrl: 'assets/models/weeping_angel_model.glb',
        portrait: 'assets/office/door_peeking_angel.jpg',
        videoKey: 'angel',
        height: 2.30,
        scaleX: 1.0,
        scaleZ: 1.0,
        offsetY: 0.0,
        roughness: 0.52,
        metalness: 0.12,
        color: 0xe2e8f0,
        bio: 'Carved from weathered Carrara marble, Our Lady of Sorrows stands weeping in the central nave. Bound by ancient quantum observation laws, she remains motionless stone while directly observed through the surveillance cameras. The moment the feed is severed or unmonitored, she blinks across the cloister halls at horrifying velocities.'
      },
      {
        id: 'haloedSaint',
        name: 'HALOED SAINT',
        latinName: 'Sanctus Michael ("Sanctus Vindex / The Archangel")',
        modelUrl: 'assets/models/saint_michael_model.glb',
        portrait: 'assets/office/door_peeking_saint.jpg',
        videoKey: 'saint',
        height: 2.40,
        scaleX: 1.0,
        scaleZ: 1.0,
        offsetY: 0.0,
        roughness: 0.48,
        metalness: 0.20,
        color: 0xf1f5f9,
        bio: 'A monumental crusader archangel holding a downward stone broadsword and crowned with a golden halo. Originally consecrated in the reconciliation alcoves, Sanctus Michael is prone to sudden, hyper-aggressive territorial patrols towards the security desk.'
      },
      {
        id: 'veiledMourner',
        name: 'VEILED MOURNER',
        latinName: 'The Memorial Penitent ("Saint Mary / The Crawler")',
        modelUrl: 'assets/models/saint_mary_model.glb',
        portrait: 'assets/office/vent_peeking_mourner.jpg',
        videoKey: 'mourner',
        height: 1.55,
        scaleX: 1.05,
        scaleZ: 1.02,
        offsetY: -0.15,
        roughness: 0.65,
        metalness: 0.0,
        materialColor: (typeof THREE !== 'undefined') ? new THREE.Color(2.6, 2.5, 2.4) : null,
        emissiveColor: 0x241d1d,
        emissiveIntensity: 0.42,
        bio: 'A shrouded funeral penitent hailing from the subterranean columbarium memorial niches. Silent and calculating, she avoids open corridors, choosing instead to crawl through the narrow steel shafts of the parish HVAC return air ducts.'
      }
    ];

    this.cctvGallery = [
      { id: 'cam01_normal', cam: 'cam01', title: 'CAM 01 // SANCTUARY NAVE', sub: 'Dormant Weeping Angel on high marble dais', src: 'assets/cctv/church_cam_normal.png' },
      { id: 'cam01_angel_awake', cam: 'cam01', title: 'CAM 01 // SANCTUARY DAIS (AWAKENED)', sub: 'Weeping Angel turning head towards CCTV', src: 'assets/cctv/church_cam_01_angel_pedestal_awake.png' },
      { id: 'cam01_angel_nave', cam: 'cam01', title: 'CAM 01 // CENTRAL NAVE AISLE', sub: 'Angel advanced down church center aisle', src: 'assets/cctv/church_cam_01_angel_nave.png' },
      { id: 'cam01_dual_mourner', cam: 'cam01', title: 'CAM 01 // DUAL ANOMALY INCIDENT', sub: 'Veiled Mourner standing in nave beside Angel dais', src: 'assets/cctv/church_cam_01_angel_normal_mourner.png' },
      { id: 'cam01_dual_saint', cam: 'cam01', title: 'CAM 01 // CONSECRATED NAVE CONFLICT', sub: 'Sanctus Michael patrolling front of central altar', src: 'assets/cctv/church_cam_01_angel_normal_saint.png' },
      { id: 'cam01_empty', cam: 'cam01', title: 'CAM 01 // HIGH DAIS (VACATED)', sub: 'Pedestal empty; Weeping Angel has breached sanctuary', src: 'assets/cctv/church_cam_01_empty.png' },

      { id: 'cam02_crypt', cam: 'cam02', title: 'CAM 02 // COLUMBARIUM CRYPT', sub: 'Veiled Mourner dormant beside funeral vault niche', src: 'assets/cctv/church_cam_02_columbarium.png' },
      { id: 'cam02_empty', cam: 'cam02', title: 'CAM 02 // MEMORIAL VAULT (VACATED)', sub: 'Pedestal vacant; Mourner crawling inside HVAC shafts', src: 'assets/cctv/church_cam_02_empty.png' },
      { id: 'cam02_angel_crypt', cam: 'cam02', title: 'CAM 02 // UNHOLY FLANK (ANGEL IN CRYPT)', sub: 'Weeping Angel prowling the columbarium vault', src: 'assets/cctv/church_cam_02_angel_crypt.png' },
      { id: 'cam02_dual', cam: 'cam02', title: 'CAM 02 // CRYPT DUAL CONVERGENCE', sub: 'Veiled Mourner and Weeping Angel converging together', src: 'assets/cctv/church_cam_02_mourner_normal_angel.png' },

      { id: 'cam03_saint', cam: 'cam03', title: 'CAM 03 // RECONCILIATION CHAPEL', sub: 'Sanctus Michael standing upright inside arch niche', src: 'assets/cctv/church_cam_03_confessional.png' },
      { id: 'cam03_empty', cam: 'cam03', title: 'CAM 03 // CHAPEL ALCOVE (VACATED)', sub: 'Niche empty; Saint patrolling cloister hallways', src: 'assets/cctv/church_cam_03_empty.png' },
      { id: 'cam03_dual', cam: 'cam03', title: 'CAM 03 // CONFESSIONAL DUAL VISITATION', sub: 'Veiled Mourner standing alongside Sanctus Michael', src: 'assets/cctv/church_cam_03_saint_normal_mourner.png' },

      { id: 'cam04_empty', cam: 'cam04', title: 'CAM 04 // HVAC DUCT (PHASE 1)', sub: 'Clean return air duct; entity has not entered', src: 'assets/cctv/church_cam_04_vent.png' },
      { id: 'cam04_far', cam: 'cam04', title: 'CAM 04 // HVAC DUCT (PHASE 2 FAR)', sub: 'Veiled Mourner crawling deep inside ductwork', src: 'assets/cctv/church_cam_04_vent_far.png' },
      { id: 'cam04_near', cam: 'cam04', title: 'CAM 04 // HVAC DUCT (PHASE 3 CLOSE)', sub: 'Veiled Mourner close up at surveillance lens opening', src: 'assets/cctv/church_cam_04_vent_anomaly.png' },

      { id: 'cam05_dormant', cam: 'cam05', title: 'CAM 05 // WEST CLOISTER NARTHEX', sub: 'Quiet vaulted corridor leading to office left door', src: 'assets/cctv/church_cam_05_narthex.png' },
      { id: 'cam05_saint', cam: 'cam05', title: 'CAM 05 // SAINT CLOISTER ADVANCE', sub: 'Sanctus Michael advancing down west corridor', src: 'assets/cctv/church_cam_05_saint_hallway.png' },
      { id: 'cam05_angel', cam: 'cam05', title: 'CAM 05 // ANGEL CLOISTER APPROACH', sub: 'Weeping Angel standing beneath vaulted archway', src: 'assets/cctv/church_cam_05_narthex_anomaly.png' },
      { id: 'cam05_dual', cam: 'cam05', title: 'CAM 05 // CLOISTER CONFLICT (BOTH ENTITIES)', sub: 'Both Sanctus Michael & Weeping Angel in same hallway', src: 'assets/cctv/church_cam_05_saint_angel.png' },
      { id: 'cam05_mourner', cam: 'cam05', title: 'CAM 05 // MOURNER CLOISTER FLANK', sub: 'Veiled Mourner flanking outside the left doorway', src: 'assets/cctv/church_cam_05_mary_hallway.png' },

      { id: 'door_angel', cam: 'office', title: 'OFFICE // LEFT DOORWAY THRESHOLD', sub: 'Weeping Angel staring through open door frame', src: 'assets/office/door_peeking_angel.jpg' },
      { id: 'door_saint', cam: 'office', title: 'OFFICE // LEFT DOORWAY THRESHOLD', sub: 'Sanctus Michael standing ready outside door', src: 'assets/office/door_peeking_saint.jpg' },
      { id: 'vent_mourner', cam: 'office', title: 'OFFICE // RIGHT VENTILATION GRILLE', sub: 'Veiled Mourner emerging directly into office', src: 'assets/office/vent_peeking_mourner.jpg' }
    ];

    this.currentLightboxIndex = 0;
    this.currentCctvFilter = 'all';

    this.loadSavedCheats();
  }

  loadSavedCheats() {
    try {
      const raw = localStorage.getItem('fnatc_extras_cheats');
      if (raw) {
        this.cheats = Object.assign(this.cheats, JSON.parse(raw));
      }
    } catch (e) {
      console.warn('[Extras] Could not load saved cheats:', e);
    }
  }

  saveCheats() {
    try {
      localStorage.setItem('fnatc_extras_cheats', JSON.stringify(this.cheats));
    } catch (e) {
      console.warn('[Extras] Could not save cheats:', e);
    }
  }

  isCheatActive(cheatId) {
    return !!this.cheats[cheatId];
  }

  init() {
    this.screen = document.getElementById('extras-screen');
    this.mainMenu = document.getElementById('fnaf-main-menu');
    if (!this.screen) return;

    // Main Menu Trigger
    const btnMenuExtras = document.getElementById('btn-menu-extras');
    if (btnMenuExtras) {
      btnMenuExtras.addEventListener('click', () => {
        this.open();
      });
    }

    // Back to Menu Button
    const btnBack = document.getElementById('btn-extras-back');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        this.close();
      });
    }

    // Global ESC Key Handler
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isJumpscarePlaying) {
          this.closeJumpscare();
          e.preventDefault();
        } else if (this.isOpen) {
          const lightbox = document.getElementById('cctv-lightbox');
          if (lightbox && !lightbox.classList.contains('hidden')) {
            lightbox.classList.add('hidden');
          } else {
            this.close();
          }
          e.preventDefault();
        }
      }
    });

    // Top Navigation Tabs
    const tabButtons = this.screen.querySelectorAll('.extras-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Subsystems
    this.initStaticCanvas();
    this.init3DViewer();
    this.initJumpscaresGallery();
    this.initCCTVArchive();
    this.initCheatsSection();

    // Window Resize
    window.addEventListener('resize', () => {
      if (this.isOpen && this.currentTab === 'models') {
        this.onResize();
      }
    });
  }

  initStaticCanvas() {
    this.staticCanvas = document.getElementById('extras-static-canvas');
    if (!this.staticCanvas) return;
    this.staticCtx = this.staticCanvas.getContext('2d');
    this.staticCanvas.width = 320;
    this.staticCanvas.height = 240;
  }

  startStaticNoise() {
    if (!this.staticCanvas || !this.staticCtx) return;
    const ctx = this.staticCtx;
    const w = this.staticCanvas.width;
    const h = this.staticCanvas.height;
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    let lastDraw = 0;
    const render = (now) => {
      if (!this.isOpen) return;
      if (now - lastDraw > 40) {
        lastDraw = now;
        const len = data.length;
        for (let i = 0; i < len; i += 4) {
          const v = (Math.random() * 255) | 0;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = (Math.random() * 45 + 15) | 0; // Faint, moody noise
        }
        ctx.putImageData(imgData, 0, 0);
      }
      this.staticAnimId = requestAnimationFrame(render);
    };
    this.staticAnimId = requestAnimationFrame(render);
  }

  stopStaticNoise() {
    if (this.staticAnimId) {
      cancelAnimationFrame(this.staticAnimId);
      this.staticAnimId = null;
    }
  }

  open(initialTab = 'models') {
    if (!this.screen) return;
    this.isOpen = true;

    // Transition from Main Menu to Standalone Extras Page
    if (this.mainMenu) {
      this.mainMenu.classList.add('hidden');
    }
    this.screen.classList.remove('hidden');

    window.Sound?.playMenuBlip();
    this.startStaticNoise();
    this.switchTab(initialTab);
  }

  close() {
    if (!this.screen) return;
    this.isOpen = false;

    // Transition back to Main Menu
    this.screen.classList.add('hidden');
    if (this.mainMenu) {
      this.mainMenu.classList.remove('hidden');
    }

    window.Sound?.playMenuBlip();
    this.stopStaticNoise();
    this.stopRendering();
    this.closeJumpscare();

    const lightbox = document.getElementById('cctv-lightbox');
    if (lightbox) lightbox.classList.add('hidden');
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update Tab Navigation Active State
    const tabButtons = this.screen.querySelectorAll('.extras-tab-btn');
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update Top Right Header & Footer Hint
    const titleEl = document.getElementById('model-entity-name');
    const subEl = document.getElementById('model-entity-latin');
    const hintEl = document.getElementById('extras-fnaf-hint');

    if (tabName === 'models') {
      const entity = this.entities[this.selectedEntityIndex];
      if (titleEl && entity) titleEl.textContent = entity.name;
      if (subEl && entity) subEl.textContent = entity.latinName;
      if (hintEl) hintEl.textContent = '[ DRAG TO ROTATE 360\u00B0 ]';
    } else if (tabName === 'cheats') {
      if (titleEl) titleEl.textContent = 'CHEATS';
      if (subEl) subEl.textContent = 'Parish Modifiers & Overrides';
      if (hintEl) hintEl.textContent = '[ ESC ] RETURN TO LOBBY';
    } else if (tabName === 'jumpscares') {
      if (titleEl) titleEl.textContent = 'JUMPSCARES';
      if (subEl) subEl.textContent = 'Attack Sequences';
      if (hintEl) hintEl.textContent = '[ ESC ] RETURN TO LOBBY';
    } else if (tabName === 'cctv') {
      if (titleEl) titleEl.textContent = 'SURVEILLANCE';
      if (subEl) subEl.textContent = 'Security Footage Logs';
      if (hintEl) hintEl.textContent = '[ ESC ] RETURN TO LOBBY';
    }

    // Update Views
    const views = this.screen.querySelectorAll('.extras-view');
    views.forEach(v => {
      if (v.id === `extras-view-${tabName}`) {
        v.classList.remove('hidden');
      } else {
        v.classList.add('hidden');
      }
    });

    window.Sound?.playMechanicalClick();

    if (tabName === 'models') {
      setTimeout(() => {
        this.onResize();
        this.startRendering();
        this.displayEntity(this.selectedEntityIndex);
      }, 50);
    } else {
      this.stopRendering();
    }
  }

  // =========================================================================
  // 1. 3D MODEL VIEWER (360° HORIZONTAL TURNING, PEDESTAL, ENTITY SWITCHER)
  // =========================================================================
  init3DViewer() {
    this.canvas = document.getElementById('extras-model-canvas');
    if (!this.canvas) return;

    if (typeof THREE === 'undefined') {
      console.warn('[Extras] Three.js not loaded for 3D viewer');
      return;
    }

    // 1. Scene & Camera setup
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent canvas on dark CRT backdrop

    const rect = this.canvas.getBoundingClientRect();
    const aspect = (rect.width && rect.height) ? (rect.width / rect.height) : (16 / 9);
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.camera.position.set(0, 1.40, this.currentCameraZ);
    this.camera.lookAt(0, 1.15, 0);

    // 2. WebGL Renderer
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(rect.width || 800, rect.height || 500, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.2;
    } catch (e) {
      console.error('[Extras] Failed to initialize WebGLRenderer:', e);
      return;
    }

    // 3. Atmospheric Lighting
    const ambientLight = new THREE.AmbientLight(0x223048, 1.4);
    this.scene.add(ambientLight);

    // Harsh Cold Key Spotlight
    const keySpot = new THREE.SpotLight(0xf8fafc, 3.2, 18, Math.PI / 4.2, 0.35, 1.2);
    keySpot.position.set(0, 5.5, 2.8);
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    keySpot.shadow.bias = -0.001;
    this.scene.add(keySpot);

    // Cold Cyan Rim Light (Left-Back)
    const rimLeft = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLeft.position.set(-3.5, 2.5, -2.5);
    this.scene.add(rimLeft);

    // Faint Amber Rim Light (Right-Back)
    const rimRight = new THREE.DirectionalLight(0xd97706, 1.2);
    rimRight.position.set(3.5, 2.0, -2.5);
    this.scene.add(rimRight);

    // Front Low Fill
    const fillLight = new THREE.DirectionalLight(0x64748b, 0.65);
    fillLight.position.set(0, 0.4, 3.5);
    this.scene.add(fillLight);

    // 4. Carved Weathered Marble Altar Pedestal
    this.pedestalGroup = new THREE.Group();
    this.pedestalGroup.position.set(0, 0, 0);

    const marbleTex = (typeof TextureGen !== 'undefined') ? TextureGen.createCarraraMarbleTexture() : null;
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      map: marbleTex,
      roughness: 0.45,
      metalness: 0.08
    });

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.6,
      metalness: 0.7
    });

    // Lower tier
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.15, 48);
    const baseMesh = new THREE.Mesh(baseGeo, pedestalMat);
    baseMesh.position.y = 0.075;
    baseMesh.receiveShadow = true;
    this.pedestalGroup.add(baseMesh);

    // Column plinth
    const colGeo = new THREE.CylinderGeometry(1.2, 1.35, 0.25, 48);
    const colMesh = new THREE.Mesh(colGeo, pedestalMat);
    colMesh.position.y = 0.25;
    colMesh.receiveShadow = true;
    this.pedestalGroup.add(colMesh);

    // Decorative ring
    const ringGeo = new THREE.TorusGeometry(1.22, 0.025, 16, 64);
    const ringMesh = new THREE.Mesh(ringGeo, ironMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.375;
    this.pedestalGroup.add(ringMesh);

    this.scene.add(this.pedestalGroup);

    // 5. Model Pivot Group (Entity center at y = 0.38)
    this.modelPivot = new THREE.Group();
    this.modelPivot.position.set(0, 0.38, 0);
    this.scene.add(this.modelPivot);

    // 6. Interactive Horizontal Turn & Zoom Controls
    this.setupViewerControls();

    // 7. Character Switcher
    this.setupEntityControls();
  }

  setupViewerControls() {
    const wrap = document.getElementById('extras-canvas-wrap');
    if (!wrap) return;

    // Mouse & Touch Sidewards Turning
    const onPointerDown = (e) => {
      this.isDragging = true;
      this.isAutoRotating = false;
      this.prevPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      this.prevPointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      this.rotVelocityY = 0;
      wrap.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - this.prevPointerX;
      const deltaY = clientY - this.prevPointerY;

      this.prevPointerX = clientX;
      this.prevPointerY = clientY;

      // Turning sidewards 360° continuously
      this.targetRotationY += deltaX * 0.013;
      this.rotVelocityY = deltaX * 0.013;

      // Slight vertical tilt (clamped)
      this.targetRotationX += deltaY * 0.005;
      this.targetRotationX = Math.max(-0.2, Math.min(0.3, this.targetRotationX));
    };

    const onPointerUp = () => {
      this.isDragging = false;
      wrap.style.cursor = 'grab';
    };

    wrap.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // Touch Support
    wrap.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onPointerDown(e);
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.touchPinchDist = Math.hypot(dx, dy);
      }
    }, { passive: false });

    wrap.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        onPointerMove(e);
      } else if (e.touches.length === 2 && this.touchPinchDist) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.hypot(dx, dy);
        const factor = (this.touchPinchDist - newDist) * 0.008;
        this.targetCameraZ = Math.max(2.0, Math.min(5.2, this.targetCameraZ + factor));
        this.touchPinchDist = newDist;
      }
    }, { passive: false });

    wrap.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) this.touchPinchDist = null;
      if (e.touches.length === 0) onPointerUp();
    });

    // Mouse Wheel Zoom
    wrap.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.0025;
      this.targetCameraZ = Math.max(2.0, Math.min(5.2, this.targetCameraZ + zoomDelta));
    }, { passive: false });

    // On-Screen Directional Turn Arrows
    const btnLeft = document.getElementById('btn-model-rot-left');
    const btnRight = document.getElementById('btn-model-rot-right');

    if (btnLeft) {
      btnLeft.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isAutoRotating = false;
        this.targetRotationY -= Math.PI / 4;
        window.Sound?.playLightClick();
      });
    }

    if (btnRight) {
      btnRight.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isAutoRotating = false;
        this.targetRotationY += Math.PI / 4;
        window.Sound?.playLightClick();
      });
    }
  }

  setupEntityControls() {
    // Prev / Next Character Cycle Buttons
    const btnPrev = document.getElementById('btn-model-prev');
    const btnNext = document.getElementById('btn-model-next');

    if (btnPrev) {
      btnPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentTab !== 'models') {
          this.switchTab('models');
        }
        const newIdx = (this.selectedEntityIndex - 1 + this.entities.length) % this.entities.length;
        this.displayEntity(newIdx);
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentTab !== 'models') {
          this.switchTab('models');
        }
        const newIdx = (this.selectedEntityIndex + 1) % this.entities.length;
        this.displayEntity(newIdx);
      });
    }

    // Direct Character Chips
    const chips = this.screen.querySelectorAll('.extras-chip-btn');
    chips.forEach((chip, index) => {
      chip.addEventListener('click', () => {
        this.displayEntity(index);
      });
    });
  }

  displayEntity(index) {
    if (index < 0 || index >= this.entities.length) return;
    this.selectedEntityIndex = index;
    const entity = this.entities[index];

    // Update Chips Active Class
    const chips = this.screen.querySelectorAll('.extras-chip-btn');
    chips.forEach((chip, idx) => {
      chip.classList.toggle('active', idx === index);
    });

    // Update Text Elements
    const nameEl = document.getElementById('model-entity-name');
    const latinEl = document.getElementById('model-entity-latin');
    const bioEl = document.getElementById('model-entity-bio');

    if (nameEl) nameEl.textContent = entity.name;
    if (latinEl) latinEl.textContent = entity.latinName;
    if (bioEl) bioEl.textContent = entity.bio;

    window.Sound?.playMechanicalClick();

    // Load or switch 3D model
    this.loadEntityModel(entity);
  }

  loadEntityModel(entity) {
    if (!this.modelPivot) return;

    const loaderBadge = document.getElementById('model-viewer-loader');
    if (loaderBadge) loaderBadge.classList.remove('hidden');

    // Clear previous model from pivot
    while (this.modelPivot.children.length > 0) {
      this.modelPivot.remove(this.modelPivot.children[0]);
    }

    // Cached model reuse
    if (this.cachedModels[entity.id]) {
      this.activeModel = this.cachedModels[entity.id].clone();
      this.modelPivot.add(this.activeModel);
      if (loaderBadge) loaderBadge.classList.add('hidden');
      return;
    }

    // GLTF / GLB Loader
    if (typeof THREE.GLTFLoader === 'undefined') {
      this.createFallbackModel(entity);
      if (loaderBadge) loaderBadge.classList.add('hidden');
      return;
    }

    const loader = new THREE.GLTFLoader();
    loader.load(
      entity.modelUrl,
      (gltf) => {
        try {
          const rawScene = gltf.scene;
          if (!rawScene) {
            this.createFallbackModel(entity);
            return;
          }

          rawScene.updateMatrixWorld(true);
          const rawBox = new THREE.Box3().setFromObject(rawScene);
          const rawSize = rawBox.getSize(new THREE.Vector3());
          const rawCenter = rawBox.getCenter(new THREE.Vector3());

          const targetHeight = entity.height || 2.4;
          const scale = targetHeight / (rawSize.y || 1);

          const container = new THREE.Group();
          container.scale.set(scale * (entity.scaleX || 1), scale, scale * (entity.scaleZ || 1));

          // Center horizontally and ground on plinth
          rawScene.position.set(-rawCenter.x, -rawBox.min.y + (entity.offsetY || 0), -rawCenter.z);
          container.add(rawScene);

          // Configure materials and shadows
          rawScene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((mat) => {
                if (!mat) return;
                mat.side = THREE.FrontSide;
                if (entity.roughness !== undefined) mat.roughness = entity.roughness;
                if (entity.metalness !== undefined) mat.metalness = entity.metalness;
                if (entity.materialColor && mat.color) mat.color.set(entity.materialColor);
                if (entity.emissiveColor && mat.emissive) {
                  mat.emissive.set(entity.emissiveColor);
                  mat.emissiveIntensity = entity.emissiveIntensity || 0.3;
                }
              });
            }
          });

          this.cachedModels[entity.id] = container;
          this.activeModel = container.clone();
          this.modelPivot.add(this.activeModel);

          if (loaderBadge) loaderBadge.classList.add('hidden');
        } catch (err) {
          console.error('[Extras] Error parsing model for', entity.name, err);
          this.createFallbackModel(entity);
          if (loaderBadge) loaderBadge.classList.add('hidden');
        }
      },
      undefined,
      (err) => {
        console.warn('[Extras] Could not load GLB for', entity.name, err);
        this.createFallbackModel(entity);
        if (loaderBadge) loaderBadge.classList.add('hidden');
      }
    );
  }

  createFallbackModel(entity) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: entity.color || 0xd1d5db,
      roughness: 0.5,
      metalness: 0.1
    });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, entity.height || 2.2, 24), mat);
    body.position.y = (entity.height || 2.2) / 2;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), mat);
    head.position.y = (entity.height || 2.2) + 0.18;
    head.castShadow = true;
    group.add(head);

    this.activeModel = group;
    this.modelPivot.add(group);
  }

  startRendering() {
    if (this.isRendering) return;
    this.isRendering = true;

    const renderLoop = () => {
      if (!this.isRendering) return;

      // Slow auto-rotate when idle
      if (this.isAutoRotating) {
        this.targetRotationY += this.autoRotateSpeed * 0.016;
      } else if (!this.isDragging) {
        // Inertia damping
        this.targetRotationY += this.rotVelocityY;
        this.rotVelocityY *= 0.92;
        if (Math.abs(this.rotVelocityY) < 0.0001) this.rotVelocityY = 0;
      }

      // Smooth interpolation (lerp)
      this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.12;
      this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.12;
      this.currentCameraZ += (this.targetCameraZ - this.currentCameraZ) * 0.14;

      if (this.modelPivot) {
        this.modelPivot.rotation.y = this.currentRotationY;
        this.modelPivot.rotation.x = this.currentRotationX;
      }

      if (this.camera) {
        this.camera.position.z = this.currentCameraZ;
        this.camera.lookAt(0, 1.25, 0);
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      this.animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }

  stopRendering() {
    this.isRendering = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  // =========================================================================
  // 2. JUMPSCARES (HARDWARE ACCELERATED VIDEO & FULLSCREEN CINEMA)
  // =========================================================================
  initJumpscaresGallery() {
    const playBtns = this.screen.querySelectorAll('.btn-play-jumpscare');
    playBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const entityId = btn.dataset.entity || btn.closest('.extras-jumpscare-card')?.dataset.entity;
        if (entityId) {
          this.playJumpscare(entityId);
        }
      });
    });

    const cards = this.screen.querySelectorAll('.extras-jumpscare-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-play-jumpscare')) return;
        const entityId = card.dataset.entity;
        if (entityId) {
          this.playJumpscare(entityId);
        }
      });
    });

    const skipBtn = document.getElementById('jumpscare-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeJumpscare();
      });
    }
  }

  playJumpscare(entityId) {
    if (this.isJumpscarePlaying) return;

    const videoMap = {
      weepingAngel: document.getElementById('jumpscare-video-angel'),
      haloedSaint: document.getElementById('jumpscare-video-saint'),
      veiledMourner: document.getElementById('jumpscare-video-mourner')
    };

    const targetVideo = videoMap[entityId] || videoMap.weepingAngel;
    const container = document.getElementById('jumpscare-video-container');
    const flash = document.getElementById('jumpscare-flash');

    if (!container || !targetVideo) {
      console.warn('[Extras] Jumpscare elements not available');
      return;
    }

    this.isJumpscarePlaying = true;
    this.activeJumpscareVideo = targetVideo;

    // Direct fallback video sources
    const directSrcs = {
      weepingAngel: 'assets/jumpscares/angel_jumpscare.mp4',
      haloedSaint: 'assets/jumpscares/michael_jumpscare.mp4',
      veiledMourner: 'assets/jumpscares/mary_jumpscare.mp4'
    };
    if (!targetVideo.src || targetVideo.src === window.location.href || targetVideo.src.endsWith('/')) {
      targetVideo.src = directSrcs[entityId] || directSrcs.weepingAngel;
    }

    // Hide all other jumpscare videos
    Object.values(videoMap).forEach(v => {
      if (v) {
        v.pause();
        if (v !== targetVideo) {
          v.classList.remove('active');
          v.classList.add('hidden');
        }
      }
    });

    // Muted video guarantees mobile/WebView playback without autoplay policy rejection
    targetVideo.muted = true;
    targetVideo.playsInline = true;
    targetVideo.setAttribute('playsinline', '');
    targetVideo.setAttribute('webkit-playsinline', '');

    try {
      targetVideo.currentTime = 0;
    } catch (e) {}

    // Reveal container and target video
    container.classList.remove('hidden');
    container.classList.add('active');
    targetVideo.classList.remove('hidden');
    targetVideo.classList.add('active');

    // Trigger authentic screaming jumpscare audio through WebAudio
    window.Sound?.playEntityJumpscare(entityId);

    // Red horror strobe flash
    if (flash) {
      flash.classList.remove('active');
      void flash.offsetWidth; // Force reflow to replay flash
      flash.classList.add('active');
    }

    // Mobile vibration burst
    if (navigator.vibrate) {
      try {
        navigator.vibrate([180, 60, 350, 80, 500]);
      } catch (e) {}
    }

    // Play video
    try {
      const playPromise = targetVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('[Extras] Jumpscare video play error, attempting load & retry:', err);
          targetVideo.load();
          targetVideo.play().catch(e => console.error('[Extras] Second play attempt failed:', e));
        });
      }
    } catch (err) {
      console.warn('[Extras] targetVideo.play() error:', err);
    }

    // Cleanup when video naturally finishes
    targetVideo.onended = () => {
      this.closeJumpscare();
    };

    // Safety timeout in case video ends or stalls on mobile (~3.6 seconds)
    if (this._jumpscareTimer) clearTimeout(this._jumpscareTimer);
    this._jumpscareTimer = setTimeout(() => {
      if (this.isJumpscarePlaying) {
        this.closeJumpscare();
      }
    }, 3800);

    // Skip handler: Protect against immediate accidental trigger during click propagation!
    const triggerTime = Date.now();
    const handleSkip = (e) => {
      // Ignore taps for the first 750ms so the tap that initiated the jumpscare CANNOT close it!
      if (Date.now() - triggerTime < 750) {
        return;
      }
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.closeJumpscare();
    };

    container.onclick = handleSkip;
    container.ontouchend = handleSkip;
  }

  closeJumpscare() {
    this.isJumpscarePlaying = false;
    if (this._jumpscareTimer) {
      clearTimeout(this._jumpscareTimer);
      this._jumpscareTimer = null;
    }

    const container = document.getElementById('jumpscare-video-container');
    const flash = document.getElementById('jumpscare-flash');

    if (container) {
      container.classList.remove('active');
      container.classList.add('hidden');
      container.onclick = null;
      container.ontouchend = null;
    }

    if (this.activeJumpscareVideo) {
      try {
        this.activeJumpscareVideo.pause();
        this.activeJumpscareVideo.currentTime = 0;
      } catch (e) {}
      this.activeJumpscareVideo.classList.remove('active');
      this.activeJumpscareVideo.classList.add('hidden');
      this.activeJumpscareVideo.onended = null;
      this.activeJumpscareVideo = null;
    }

    if (flash) flash.classList.remove('active');
  }

  // =========================================================================
  // 3. SURVEILLANCE CCTV ARCHIVE & LIGHTBOX
  // =========================================================================
  initCCTVArchive() {
    const grid = document.getElementById('cctv-gallery-grid');
    if (!grid) return;

    this.renderCCTVGrid('all');

    // CCTV Filter Buttons
    const filterChips = this.screen.querySelectorAll('.cctv-filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const filter = chip.dataset.filter || 'all';
        this.currentCctvFilter = filter;
        filterChips.forEach(c => c.classList.toggle('active', c === chip));
        this.renderCCTVGrid(filter);
        window.Sound?.playLightClick();
      });
    });

    // Lightbox Controls
    const lightbox = document.getElementById('cctv-lightbox');
    const btnLightboxClose = document.getElementById('btn-lightbox-close');
    if (btnLightboxClose && lightbox) {
      btnLightboxClose.addEventListener('click', () => {
        lightbox.classList.add('hidden');
        window.Sound?.playLightClick();
      });
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          lightbox.classList.add('hidden');
        }
      });
    }

    const btnPrev = document.getElementById('btn-lightbox-prev');
    const btnNext = document.getElementById('btn-lightbox-next');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        const activeList = this.getFilteredCCTVList();
        const currentFilteredIdx = activeList.findIndex(item => item === this.cctvGallery[this.currentLightboxIndex]);
        const newFilteredIdx = (currentFilteredIdx - 1 + activeList.length) % activeList.length;
        const newGlobalIdx = this.cctvGallery.indexOf(activeList[newFilteredIdx]);
        this.openCCTVLightbox(newGlobalIdx);
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const activeList = this.getFilteredCCTVList();
        const currentFilteredIdx = activeList.findIndex(item => item === this.cctvGallery[this.currentLightboxIndex]);
        const newFilteredIdx = (currentFilteredIdx + 1) % activeList.length;
        const newGlobalIdx = this.cctvGallery.indexOf(activeList[newFilteredIdx]);
        this.openCCTVLightbox(newGlobalIdx);
      });
    }
  }

  getFilteredCCTVList() {
    if (this.currentCctvFilter === 'all') {
      return this.cctvGallery;
    }
    return this.cctvGallery.filter(item => item.cam === this.currentCctvFilter);
  }

  renderCCTVGrid(filter = 'all') {
    const grid = document.getElementById('cctv-gallery-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const list = (filter === 'all') ? this.cctvGallery : this.cctvGallery.filter(item => item.cam === filter);

    list.forEach((item) => {
      const globalIndex = this.cctvGallery.indexOf(item);
      const card = document.createElement('div');
      card.className = 'cctv-gallery-card';
      card.innerHTML = `
        <div class="cctv-card-thumb-wrap">
          <img src="${item.src}" alt="${item.title}" class="cctv-card-thumb" loading="lazy" />
          <div class="cctv-card-scanlines"></div>
          <span class="cctv-card-badge">${item.cam.toUpperCase()}</span>
        </div>
        <div class="cctv-card-meta">
          <div class="cctv-card-title">${item.title}</div>
          <div class="cctv-card-sub">${item.sub}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.openCCTVLightbox(globalIndex);
      });

      grid.appendChild(card);
    });
  }

  openCCTVLightbox(index) {
    const lightbox = document.getElementById('cctv-lightbox');
    const img = document.getElementById('cctv-lightbox-img');
    const title = document.getElementById('cctv-lightbox-title');
    const desc = document.getElementById('cctv-lightbox-desc');
    const count = document.getElementById('cctv-lightbox-counter');
    if (!lightbox || !img) return;

    this.currentLightboxIndex = index;
    const item = this.cctvGallery[index];

    img.src = item.src;
    if (title) title.textContent = item.title;
    if (desc) desc.textContent = item.sub;
    if (count) count.textContent = `${index + 1} / ${this.cctvGallery.length}`;

    lightbox.classList.remove('hidden');
    window.Sound?.playCameraBeep();
  }

  // =========================================================================
  // 4. CHEATS & MODIFIERS (RADAR MAP, FAST NIGHTS, UNLIMITED BATTERY)
  // =========================================================================
  initCheatsSection() {
    const toggleRadar = document.getElementById('cheat-toggle-radar');
    const toggleFast = document.getElementById('cheat-toggle-fast');
    const toggleBattery = document.getElementById('cheat-toggle-battery');

    if (toggleRadar) {
      toggleRadar.checked = this.cheats.radarMap;
      toggleRadar.addEventListener('change', (e) => {
        this.cheats.radarMap = e.target.checked;
        this.saveCheats();
        window.Sound?.playMechanicalClick();
      });
    }

    if (toggleFast) {
      toggleFast.checked = this.cheats.fastNights;
      toggleFast.addEventListener('change', (e) => {
        this.cheats.fastNights = e.target.checked;
        this.saveCheats();
        window.Sound?.playMechanicalClick();
      });
    }

    if (toggleBattery) {
      toggleBattery.checked = this.cheats.infiniteBattery;
      toggleBattery.addEventListener('change', (e) => {
        this.cheats.infiniteBattery = e.target.checked;
        this.saveCheats();
        window.Sound?.playMechanicalClick();
      });
    }

    // Direct Shift Deployment Jump
    const nightBtns = this.screen.querySelectorAll('.extras-night-jump-btn');
    nightBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const night = parseInt(btn.dataset.night, 10);
        const game = window.Game || window.game;
        if (game) {
          this.close();
          game.currentNight = night;
          game.isCustomNight = false;
          game.startShift();
        }
      });
    });
  }
}

// Global Singleton Instance
window.Extras = new ExtrasManager();
window.addEventListener('DOMContentLoaded', () => {
  window.Extras.init();
});
