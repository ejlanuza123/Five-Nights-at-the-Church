/**
 * Five Nights at the Church - Extras Menu & 3D Animatronic Showcase
 * Classic FNAF-style Extras:
 *  - 3D Entity Model Viewer (rotatable 360°, zoomable, inspection pedestal)
 *  - Fullscreen Jumpscares Cinema with authentic audio
 *  - High-Resolution CCTV Surveillance Photo Archive & Lightbox
 *  - Sound Test & Father Thomas Cassette Audio Deck with animated reels
 *  - Night Modifiers & Cheats (Radar Map Tracker, Fast Nights, Unlimited Battery)
 */

class ExtrasManager {
  constructor() {
    this.modal = null;
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

    // Interaction state (Rotation & Zoom)
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
    this.autoRotateSpeed = 0.45;
    this.touchPinchDist = null;

    // Jumpscares state
    this.activeJumpscareVideo = null;

    // Audio test state
    this.currentAudio = null;
    this.audioSource = null;
    this.audioGain = null;
    this.audioContext = null;
    this.isAudioPlaying = false;
    this.equalizerInterval = null;

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
        category: 'THE WEEPING STATUE',
        modelUrl: 'assets/models/weeping_angel_model.glb',
        portrait: 'assets/office/door_peeking_angel.jpg',
        jumpscareVideo: 'assets/jumpscares/angel_jumpscare.mp4',
        soundId: 'weepingAngel',
        height: 2.30,
        scaleX: 1.0,
        scaleZ: 1.0,
        offsetY: 0.0,
        roughness: 0.52,
        metalness: 0.12,
        color: 0xe2e8f0,
        baseCam: 'CAM 01 (Sanctuary Altar)',
        patrolRoute: 'CAM 01 (Altar) → CAM 05 (Cloister Narthex) → Left Church Door / Window',
        threatRating: 'CRITICAL • RELENTLESS [4 / 5]',
        bio: 'Carved from weathered Carrara marble, Our Lady of Sorrows stands weeping in the central nave. Bound by ancient quantum observation laws, she remains motionless stone while directly observed through the surveillance cameras. The moment the feed is severed or unmonitored, she blinks across the cloister halls at horrifying velocities.',
        tactics: 'Regularly cycle CAM 01 and CAM 05 to stall her approach. Listen intently for distant wailing and heavy marble footsteps on the left. If she appears standing framed inside the open left doorway, immediately lock the arched wooden door before checking your monitors.'
      },
      {
        id: 'haloedSaint',
        name: 'HALOED SAINT',
        latinName: 'Sanctus Michael ("Sanctus Vindex / The Archangel")',
        category: 'THE ARMORED CRUSADER',
        modelUrl: 'assets/models/saint_michael_model.glb',
        portrait: 'assets/office/door_peeking_saint.jpg',
        jumpscareVideo: 'assets/jumpscares/michael_jumpscare.mp4',
        soundId: 'haloedSaint',
        height: 2.40,
        scaleX: 1.0,
        scaleZ: 1.0,
        offsetY: 0.0,
        roughness: 0.48,
        metalness: 0.20,
        color: 0xf1f5f9,
        baseCam: 'CAM 03 (Reconciliation Chapel)',
        patrolRoute: 'CAM 03 (Confessional) → Center Observation Window → CAM 05 → Left Church Door',
        threatRating: 'LETHAL • UNPREDICTABLE [5 / 5]',
        bio: 'A monumental crusader archangel holding a downward stone broadsword and crowned with a golden halo. Originally consecrated in the reconciliation alcoves, Sanctus Michael is prone to sudden, hyper-aggressive territorial patrols towards the security desk.',
        tactics: 'Sanctus Michael stalks the office exterior and stares directly through the reinforced center window glass. When his carved face appears at the window, immediately illuminate him with the Halogen Window Spotlight to repel him. If he reaches the left doorway, slam the wooden door shut.'
      },
      {
        id: 'veiledMourner',
        name: 'VEILED MOURNER',
        latinName: 'The Memorial Penitent ("Saint Mary / The Crawler")',
        category: 'THE VENTILATION INFILTRATOR',
        modelUrl: 'assets/models/saint_mary_model.glb',
        portrait: 'assets/office/vent_peeking_mourner.jpg',
        jumpscareVideo: 'assets/jumpscares/mary_jumpscare.mp4',
        soundId: 'veiledMourner',
        height: 1.55,
        scaleX: 1.05,
        scaleZ: 1.02,
        offsetY: -0.15,
        roughness: 0.65,
        metalness: 0.0,
        materialColor: new THREE.Color(2.6, 2.5, 2.4),
        emissiveColor: 0x241d1d,
        emissiveIntensity: 0.42,
        baseCam: 'CAM 02 (Columbarium Crypt)',
        patrolRoute: 'CAM 02 (Crypt Stand) → CAM 04 (Air Duct: Phase 2 Far → Phase 3 Close) → Right Vent Grille',
        threatRating: 'EXTREME • SILENT BREACHER [5 / 5]',
        bio: 'A shrouded funeral penitent hailing from the subterranean columbarium memorial niches. Silent and calculating, she avoids open corridors, choosing instead to crawl through the narrow steel shafts of the parish HVAC return air ducts.',
        tactics: 'Monitor CAM 04 to track her crawl progression: Phase 1 (empty duct), Phase 2 (distant silhouette crawling), and Phase 3 (close up at duct camera opening). When CAM 04 statics out or empties, flash the right vent light. If her veiled face peers into your room, seal the ventilation shutter damper to push her backwards.'
      }
    ];

    this.cctvGallery = [
      { id: 'cam01_normal', title: 'CAM 01 // SANCTUARY NAVE', sub: 'Dormant Weeping Angel on high marble dais', src: 'assets/cctv/church_cam_normal.png' },
      { id: 'cam01_angel_awake', title: 'CAM 01 // SANCTUARY DAIS (AWAKENED)', sub: 'Weeping Angel turning head towards CCTV', src: 'assets/cctv/church_cam_01_angel_pedestal_awake.png' },
      { id: 'cam01_angel_nave', title: 'CAM 01 // CENTRAL NAVE AISLE', sub: 'Angel advanced down church center aisle', src: 'assets/cctv/church_cam_01_angel_nave.png' },
      { id: 'cam01_dual_mourner', title: 'CAM 01 // DUAL ANOMALY INCIDENT', sub: 'Veiled Mourner standing in nave beside Angel dais', src: 'assets/cctv/church_cam_01_angel_normal_mourner.png' },
      { id: 'cam01_dual_saint', title: 'CAM 01 // CONSECRATED NAVE CONFLICT', sub: 'Sanctus Michael patrolling front of central altar', src: 'assets/cctv/church_cam_01_angel_normal_saint.png' },
      { id: 'cam01_empty', title: 'CAM 01 // HIGH DAIS (VACATED)', sub: 'Pedestal empty; Weeping Angel has breached sanctuary', src: 'assets/cctv/church_cam_01_empty.png' },

      { id: 'cam02_crypt', title: 'CAM 02 // COLUMBARIUM CRYPT', sub: 'Veiled Mourner dormant beside funeral vault niche', src: 'assets/cctv/church_cam_02_columbarium.png' },
      { id: 'cam02_empty', title: 'CAM 02 // MEMORIAL VAULT (VACATED)', sub: 'Pedestal vacant; Mourner crawling inside HVAC shafts', src: 'assets/cctv/church_cam_02_empty.png' },
      { id: 'cam02_angel_crypt', title: 'CAM 02 // UNHOLY FLANK (ANGEL IN CRYPT)', sub: 'Weeping Angel prowling the columbarium vault', src: 'assets/cctv/church_cam_02_angel_crypt.png' },
      { id: 'cam02_dual', title: 'CAM 02 // CRYPT DUAL CONVERGENCE', sub: 'Veiled Mourner and Weeping Angel converging together', src: 'assets/cctv/church_cam_02_mourner_normal_angel.png' },

      { id: 'cam03_saint', title: 'CAM 03 // RECONCILIATION CHAPEL', sub: 'Sanctus Michael standing upright inside arch niche', src: 'assets/cctv/church_cam_03_confessional.png' },
      { id: 'cam03_empty', title: 'CAM 03 // CHAPEL ALCOVE (VACATED)', sub: 'Niche empty; Saint patrolling cloister hallways', src: 'assets/cctv/church_cam_03_empty.png' },
      { id: 'cam03_dual', title: 'CAM 03 // CONFESSIONAL DUAL VISITATION', sub: 'Veiled Mourner standing alongside Sanctus Michael', src: 'assets/cctv/church_cam_03_saint_normal_mourner.png' },

      { id: 'cam04_empty', title: 'CAM 04 // HVAC DUCT (PHASE 1)', sub: 'Clean return air duct; entity has not entered', src: 'assets/cctv/church_cam_04_vent.png' },
      { id: 'cam04_far', title: 'CAM 04 // HVAC DUCT (PHASE 2 FAR)', sub: 'Veiled Mourner crawling deep inside ductwork', src: 'assets/cctv/church_cam_04_vent_far.png' },
      { id: 'cam04_near', title: 'CAM 04 // HVAC DUCT (PHASE 3 CLOSE)', sub: 'Veiled Mourner close up at surveillance lens opening', src: 'assets/cctv/church_cam_04_vent_anomaly.png' },

      { id: 'cam05_dormant', title: 'CAM 05 // WEST CLOISTER NARTHEX', sub: 'Quiet vaulted corridor leading to office left door', src: 'assets/cctv/church_cam_05_narthex.png' },
      { id: 'cam05_saint', title: 'CAM 05 // SAINT CLOISTER ADVANCE', sub: 'Sanctus Michael advancing down west corridor', src: 'assets/cctv/church_cam_05_saint_hallway.png' },
      { id: 'cam05_angel', title: 'CAM 05 // ANGEL CLOISTER APPROACH', sub: 'Weeping Angel standing beneath vaulted archway', src: 'assets/cctv/church_cam_05_narthex_anomaly.png' },
      { id: 'cam05_dual', title: 'CAM 05 // CLOISTER CONFLICT (BOTH ENTITIES)', sub: 'Both Sanctus Michael & Weeping Angel in same hallway!', src: 'assets/cctv/church_cam_05_saint_angel.png' },
      { id: 'cam05_mourner', title: 'CAM 05 // MOURNER CLOISTER FLANK', sub: 'Veiled Mourner flanking outside the left doorway', src: 'assets/cctv/church_cam_05_mary_hallway.png' },

      { id: 'door_angel', title: 'OFFICE // LEFT DOORWAY THRESHOLD', sub: 'Weeping Angel staring through open door frame', src: 'assets/office/door_peeking_angel.jpg' },
      { id: 'door_saint', title: 'OFFICE // LEFT DOORWAY THRESHOLD', sub: 'Sanctus Michael standing ready outside door', src: 'assets/office/door_peeking_saint.jpg' },
      { id: 'vent_mourner', title: 'OFFICE // RIGHT VENTILATION GRILLE', sub: 'Veiled Mourner emerging directly into office', src: 'assets/office/vent_peeking_mourner.jpg' }
    ];

    this.audioTracks = [
      { id: 'bgm_theme', title: 'Church Theme Ambiance', type: 'music', src: 'assets/audio/church_theme_ambiance.mp3', desc: 'Atmospheric cathedral lobby chant & choir' },
      { id: 'bgm_horror', title: 'Dark Ambient Horror', type: 'music', src: 'assets/audio/dark_ambient_horror.mp3', desc: 'Eerie low-frequency night shift background drone' },
      { id: 'sfx_bell', title: 'Cathedral Carillon Bell', type: 'sfx', desc: 'Resonant midnight church bells echoing over the parish', action: () => window.Sound?.playChurchBell(1.0, 3) },
      { id: 'sfx_stone', title: 'Heavy Stone Grind', type: 'sfx', desc: 'Ancient carved marble sliding across cold flagstones', action: () => window.Sound?.playStoneGrind(1.0) },
      { id: 'sfx_vent', title: 'Air Vent Scraping & Clatter', type: 'sfx', desc: 'Entity scraping along galvanized sheet-metal air ducts', action: () => window.Sound?.playVentClatter(0.95) },
      { id: 'sfx_whisper', title: 'Observation Window Whisper', type: 'sfx', desc: 'Chilling paranormal breath against reinforced glass', action: () => window.Sound?.playWindowWhisper(0.85) },
      { id: 'sfx_footsteps', title: 'Heavy Cloister Footsteps', type: 'sfx', desc: 'Approaching stone footsteps in the left hallway', action: () => window.Sound?.playLeftFootstep(0.9) },
      { id: 'sfx_weeping', title: 'Distant Weeping Cry', type: 'sfx', desc: 'Unnerving weeping sorrow of Mater Dolorosa', action: () => window.Sound?.playDistantWeeping('far', 0.0, 1.0) },
      { id: 'sfx_door_shut', title: 'Heavy Arched Door Lock', type: 'sfx', desc: 'Solid oak door slamming shut and locking tight', action: () => window.Sound?.playDoorSound(true) },
      { id: 'sfx_vent_shut', title: 'Steel Vent Shutter Slam', type: 'sfx', desc: 'Heavy steel damper sealing the air intake', action: () => window.Sound?.playVentSound(true) },
      { id: 'sfx_static', title: 'CCTV Static & Loss of Signal', type: 'sfx', desc: 'Surveillance video corruption burst', action: () => window.Sound?.playCameraStatic(1.2, 0.7) },
      { id: 'tape_night1', title: 'Briefing Tape // Night 1', type: 'tape', night: 1, desc: 'Father Thomas: Welcome & parish surveillance basics' },
      { id: 'tape_night2', title: 'Briefing Tape // Night 2', type: 'tape', night: 2, desc: 'Father Thomas: The weeping angel & cloister defense' },
      { id: 'tape_night3', title: 'Briefing Tape // Night 3', type: 'tape', night: 3, desc: 'Father Thomas: Sanctus Michael & the window spotlight' },
      { id: 'tape_night4', title: 'Briefing Tape // Night 4', type: 'tape', night: 4, desc: 'Father Thomas: Ventilation breaches & the mourner' },
      { id: 'tape_night5', title: 'Briefing Tape // Night 5', type: 'tape', night: 5, desc: 'Father Thomas: Final consecration vigil' },
      { id: 'jump_angel', title: 'Jumpscare Scream // Angel', type: 'shriek', entity: 'weepingAngel', desc: 'High-pitched screaming horror burst' },
      { id: 'jump_saint', title: 'Jumpscare Scream // Saint', type: 'shriek', entity: 'haloedSaint', desc: 'Violent metallic impact roar' },
      { id: 'jump_mourner', title: 'Jumpscare Scream // Mourner', type: 'shriek', entity: 'veiledMourner', desc: 'Guttural ventilation screech' }
    ];

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
    this.modal = document.getElementById('extras-modal');
    if (!this.modal) return;

    // Hook main menu button
    const btnMenuExtras = document.getElementById('btn-menu-extras');
    if (btnMenuExtras) {
      btnMenuExtras.addEventListener('click', () => {
        this.open();
      });
    }

    // Hook close buttons
    const btnClose = document.getElementById('btn-extras-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        this.close();
      });
    }
    const btnCloseX = document.getElementById('btn-extras-x');
    if (btnCloseX) {
      btnCloseX.addEventListener('click', () => {
        this.close();
      });
    }

    // Hook tab navigation
    const tabButtons = this.modal.querySelectorAll('.extras-nav-tab');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Setup sub-systems
    this.init3DViewer();
    this.initJumpscaresGallery();
    this.initCCTVArchive();
    this.initSoundTest();
    this.initCheatsSection();

    // Listen to resize
    window.addEventListener('resize', () => {
      if (this.isOpen && this.currentTab === 'models') {
        this.onResize();
      }
    });
  }

  open(initialTab = 'models') {
    if (!this.modal) return;
    this.isOpen = true;
    this.modal.classList.remove('hidden');
    window.Sound?.playMenuBlip();

    this.switchTab(initialTab);
  }

  close() {
    if (!this.modal) return;
    this.isOpen = false;
    this.modal.classList.add('hidden');
    window.Sound?.playMenuBlip();

    this.stopRendering();
    this.stopAudio();
    this.closeJumpscare();
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update active tab buttons
    const tabButtons = this.modal.querySelectorAll('.extras-nav-tab');
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update active viewports
    const sections = this.modal.querySelectorAll('.extras-tab-view');
    sections.forEach(sec => {
      if (sec.id === `extras-view-${tabName}`) {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    });

    window.Sound?.playMechanicalClick();

    // Specific tab activations
    if (tabName === 'models') {
      this.startRendering();
      this.onResize();
      this.displayEntity(this.selectedEntityIndex);
    } else {
      this.stopRendering();
    }

    if (tabName !== 'audio') {
      this.stopAudio();
    }
  }

  // =========================================================================
  // 1. 3D MODEL VIEWER (ROTATION, ZOOM, PEDESTAL, LIGHTING)
  // =========================================================================
  init3DViewer() {
    this.canvas = document.getElementById('extras-model-canvas');
    if (!this.canvas) return;

    if (typeof THREE === 'undefined') {
      console.warn('[Extras] Three.js not found for 3D Model Viewer');
      return;
    }

    // 1. Scene & Camera setup
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent, canvas overlaid on dark CRT background

    const rect = this.canvas.getBoundingClientRect();
    const aspect = (rect.width && rect.height) ? (rect.width / rect.height) : (16 / 9);
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
    this.camera.position.set(0, 1.45, this.currentCameraZ);
    this.camera.lookAt(0, 1.15, 0);

    // 2. WebGL Renderer
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(rect.width || 640, rect.height || 420, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;
    } catch (e) {
      console.error('[Extras] Failed to initialize WebGLRenderer:', e);
      return;
    }

    // 3. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x334155, 1.35); // Soft fill preventing pure black shadows
    this.scene.add(ambientLight);

    // Overhead Key Spotlight
    const keySpot = new THREE.SpotLight(0xfff7ed, 2.8, 16, Math.PI / 4.5, 0.35, 1.2);
    keySpot.position.set(0, 5.0, 2.5);
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    keySpot.shadow.bias = -0.001;
    this.scene.add(keySpot);

    // Cyan Rim Light (Left-Back)
    const rimLightLeft = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLightLeft.position.set(-3.5, 2.8, -2.5);
    this.scene.add(rimLightLeft);

    // Warm Amber Candle Rim Light (Right-Back)
    const rimLightRight = new THREE.DirectionalLight(0xf59e0b, 1.4);
    rimLightRight.position.set(3.5, 2.2, -2.5);
    this.scene.add(rimLightRight);

    // Subtle Front Low Fill Light
    const frontFill = new THREE.DirectionalLight(0x94a3b8, 0.7);
    frontFill.position.set(0, 0.4, 3.5);
    this.scene.add(frontFill);

    // 4. Carved Marble Altar Pedestal
    this.pedestalGroup = new THREE.Group();
    this.pedestalGroup.position.set(0, 0, 0);

    const marbleTex = (typeof TextureGen !== 'undefined') ? TextureGen.createCarraraMarbleTexture() : null;
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      map: marbleTex,
      roughness: 0.4,
      metalness: 0.1
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.35,
      metalness: 0.85
    });

    // Lower wide tiered plinth
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.15, 48);
    const baseMesh = new THREE.Mesh(baseGeo, pedestalMat);
    baseMesh.position.y = 0.075;
    baseMesh.receiveShadow = true;
    this.pedestalGroup.add(baseMesh);

    // Upper column pedestal
    const colGeo = new THREE.CylinderGeometry(1.2, 1.35, 0.25, 48);
    const colMesh = new THREE.Mesh(colGeo, pedestalMat);
    colMesh.position.y = 0.25;
    colMesh.receiveShadow = true;
    this.pedestalGroup.add(colMesh);

    // Gold decorative torus rim
    const ringGeo = new THREE.TorusGeometry(1.22, 0.025, 16, 64);
    const ringMesh = new THREE.Mesh(ringGeo, goldMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.375;
    this.pedestalGroup.add(ringMesh);

    this.scene.add(this.pedestalGroup);

    // 5. Model Pivot Group (Centered on top of pedestal at y = 0.38)
    this.modelPivot = new THREE.Group();
    this.modelPivot.position.set(0, 0.38, 0);
    this.scene.add(this.modelPivot);

    // 6. Interactive Drag & Touch Controls
    this.setupViewerControls();

    // 7. Entity Selector Chips & Info UI
    this.setupEntitySelector();
  }

  setupViewerControls() {
    const canvasWrap = document.getElementById('extras-canvas-wrap');
    if (!canvasWrap) return;

    // Mouse & Touch Dragging for 360° Horizontal Turning & Slight Vertical Tilt
    const onPointerDown = (e) => {
      this.isDragging = true;
      this.isAutoRotating = false;
      this.prevPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      this.prevPointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      this.rotVelocityY = 0;
      if (canvasWrap) canvasWrap.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - this.prevPointerX;
      const deltaY = clientY - this.prevPointerY;

      this.prevPointerX = clientX;
      this.prevPointerY = clientY;

      // Turning sidewards (Rotation around Y-axis)
      this.targetRotationY += deltaX * 0.012;
      this.rotVelocityY = deltaX * 0.012;

      // Slight vertical tilt (Clamped to prevent flipping)
      this.targetRotationX += deltaY * 0.005;
      this.targetRotationX = Math.max(-0.25, Math.min(0.35, this.targetRotationX));
    };

    const onPointerUp = () => {
      this.isDragging = false;
      if (canvasWrap) canvasWrap.style.cursor = 'grab';
    };

    canvasWrap.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // Touch support (1-finger rotate, 2-finger pinch zoom)
    canvasWrap.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onPointerDown(e);
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.touchPinchDist = Math.hypot(dx, dy);
      }
    }, { passive: false });

    canvasWrap.addEventListener('touchmove', (e) => {
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

    canvasWrap.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) this.touchPinchDist = null;
      if (e.touches.length === 0) onPointerUp();
    });

    // Mouse Wheel Zoom
    canvasWrap.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.0025;
      this.targetCameraZ = Math.max(2.0, Math.min(5.2, this.targetCameraZ + zoomDelta));
    }, { passive: false });

    // On-screen control buttons
    const btnRotLeft = document.getElementById('btn-model-rot-left');
    const btnRotRight = document.getElementById('btn-model-rot-right');
    const btnAutoRot = document.getElementById('btn-model-auto-rot');
    const btnZoomIn = document.getElementById('btn-model-zoom-in');
    const btnZoomOut = document.getElementById('btn-model-zoom-out');
    const btnReset = document.getElementById('btn-model-reset');

    if (btnRotLeft) {
      btnRotLeft.addEventListener('click', () => {
        this.isAutoRotating = false;
        this.targetRotationY -= Math.PI / 4;
        window.Sound?.playLightClick();
      });
    }

    if (btnRotRight) {
      btnRotRight.addEventListener('click', () => {
        this.isAutoRotating = false;
        this.targetRotationY += Math.PI / 4;
        window.Sound?.playLightClick();
      });
    }

    if (btnAutoRot) {
      btnAutoRot.addEventListener('click', () => {
        this.isAutoRotating = !this.isAutoRotating;
        btnAutoRot.classList.toggle('active', this.isAutoRotating);
        window.Sound?.playMechanicalClick();
      });
    }

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        this.targetCameraZ = Math.max(2.0, this.targetCameraZ - 0.45);
        window.Sound?.playLightClick();
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        this.targetCameraZ = Math.min(5.2, this.targetCameraZ + 0.45);
        window.Sound?.playLightClick();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.targetRotationY = 0;
        this.targetRotationX = 0;
        this.targetCameraZ = 3.6;
        this.isAutoRotating = true;
        if (btnAutoRot) btnAutoRot.classList.add('active');
        window.Sound?.playMechanicalClick();
      });
    }
  }

  setupEntitySelector() {
    const chips = this.modal.querySelectorAll('.model-entity-chip');
    chips.forEach((chip, index) => {
      chip.addEventListener('click', () => {
        this.displayEntity(index);
      });
    });

    const btnPreviewJumpscare = document.getElementById('btn-model-preview-jumpscare');
    if (btnPreviewJumpscare) {
      btnPreviewJumpscare.addEventListener('click', () => {
        const entity = this.entities[this.selectedEntityIndex];
        if (entity) {
          this.playJumpscare(entity.id);
        }
      });
    }
  }

  displayEntity(index) {
    if (index < 0 || index >= this.entities.length) return;
    this.selectedEntityIndex = index;
    const entity = this.entities[index];

    // Update chips active state
    const chips = this.modal.querySelectorAll('.model-entity-chip');
    chips.forEach((chip, idx) => {
      chip.classList.toggle('active', idx === index);
    });

    // Update info text
    const nameEl = document.getElementById('model-entity-name');
    const latinEl = document.getElementById('model-entity-latin');
    const threatEl = document.getElementById('model-entity-threat');
    const routeEl = document.getElementById('model-entity-route');
    const bioEl = document.getElementById('model-entity-bio');
    const tacticsEl = document.getElementById('model-entity-tactics');

    if (nameEl) nameEl.textContent = entity.name;
    if (latinEl) latinEl.textContent = entity.latinName;
    if (threatEl) threatEl.textContent = entity.threatRating;
    if (routeEl) routeEl.textContent = entity.patrolRoute;
    if (bioEl) bioEl.textContent = entity.bio;
    if (tacticsEl) tacticsEl.textContent = entity.tactics;

    window.Sound?.playMechanicalClick();

    // Load or switch 3D model
    this.loadEntityModel(entity);
  }

  loadEntityModel(entity) {
    if (!this.modelPivot) return;

    // Hide loading badge
    const loaderBadge = document.getElementById('model-viewer-loader');
    if (loaderBadge) loaderBadge.classList.remove('hidden');

    // Remove existing active model
    while (this.modelPivot.children.length > 0) {
      this.modelPivot.remove(this.modelPivot.children[0]);
    }

    // Check cache
    if (this.cachedModels[entity.id]) {
      this.activeModel = this.cachedModels[entity.id].clone();
      this.modelPivot.add(this.activeModel);
      if (loaderBadge) loaderBadge.classList.add('hidden');
      return;
    }

    // Load GLTF / GLB model
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

          // Center horizontally and ground feet
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

          // Cache and display
          this.cachedModels[entity.id] = container;
          this.activeModel = container.clone();
          this.modelPivot.add(this.activeModel);

          if (loaderBadge) loaderBadge.classList.add('hidden');
        } catch (err) {
          console.error('[Extras] Error parsing 3D model for', entity.name, err);
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

      // Smooth auto-rotation when idle
      if (this.isAutoRotating) {
        this.targetRotationY += this.autoRotateSpeed * 0.016;
      } else if (!this.isDragging) {
        // Apply inertia drag damping
        this.targetRotationY += this.rotVelocityY;
        this.rotVelocityY *= 0.92;
        if (Math.abs(this.rotVelocityY) < 0.0001) this.rotVelocityY = 0;
      }

      // Smooth interpolation (lerp) for rotation and camera zoom
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
    const width = rect.width || 640;
    const height = rect.height || 420;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  // =========================================================================
  // 2. JUMPSCARES GALLERY (CINEMATIC FULLSCREEN PLAYBACK)
  // =========================================================================
  initJumpscaresGallery() {
    const cards = this.modal.querySelectorAll('.jumpscare-card');
    cards.forEach(card => {
      const entityId = card.dataset.entity;
      const playBtn = card.querySelector('.btn-play-jumpscare');
      if (playBtn) {
        playBtn.addEventListener('click', () => {
          this.playJumpscare(entityId);
        });
      }
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-play-jumpscare')) {
          this.playJumpscare(entityId);
        }
      });
    });

    const playerCloseBtn = document.getElementById('btn-jumpscare-player-close');
    if (playerCloseBtn) {
      playerCloseBtn.addEventListener('click', () => {
        this.closeJumpscare();
      });
    }

    const playerOverlay = document.getElementById('extras-jumpscare-player');
    if (playerOverlay) {
      playerOverlay.addEventListener('click', (e) => {
        if (e.target === playerOverlay || e.target.classList.contains('jumpscare-player-inner')) {
          this.closeJumpscare();
        }
      });
    }
  }

  playJumpscare(entityId) {
    const player = document.getElementById('extras-jumpscare-player');
    const video = document.getElementById('extras-jumpscare-video');
    const strobe = document.getElementById('extras-jumpscare-strobe');
    if (!player || !video) return;

    const entity = this.entities.find(e => e.id === entityId) || this.entities[0];

    // Show player overlay
    player.classList.remove('hidden');
    if (strobe) strobe.classList.add('active');

    // Vibrate device
    if (navigator.vibrate) {
      navigator.vibrate([180, 60, 350, 80, 500]);
    }

    // Play authentic horror screech sound
    window.Sound?.playEntityJumpscare(entity.id);

    // Play video
    video.src = entity.jumpscareVideo;
    video.currentTime = 0;
    video.muted = true; // Video tracks are muted; audio handled by high-fidelity WebAudio Sound system
    video.play().catch(err => console.warn('[Extras] Jumpscare video play error:', err));

    this.activeJumpscareVideo = video;

    // Auto-close when ended
    video.onended = () => {
      this.closeJumpscare();
    };
  }

  closeJumpscare() {
    const player = document.getElementById('extras-jumpscare-player');
    const video = document.getElementById('extras-jumpscare-video');
    const strobe = document.getElementById('extras-jumpscare-strobe');

    if (player) player.classList.add('hidden');
    if (strobe) strobe.classList.remove('active');

    if (video) {
      video.pause();
      video.currentTime = 0;
      video.onended = null;
    }
    this.activeJumpscareVideo = null;
  }

  // =========================================================================
  // 3. CCTV ARCHIVE & LIGHTBOX
  // =========================================================================
  initCCTVArchive() {
    const grid = document.getElementById('cctv-gallery-grid');
    if (!grid) return;

    grid.innerHTML = '';
    this.cctvGallery.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'cctv-gallery-card';
      card.dataset.index = index;
      card.innerHTML = `
        <div class="cctv-card-thumb-wrap">
          <img src="${item.src}" alt="${item.title}" class="cctv-card-thumb" loading="lazy" />
          <div class="cctv-card-scanlines"></div>
          <span class="cctv-card-badge">ARCHIVE RECORD</span>
        </div>
        <div class="cctv-card-meta">
          <div class="cctv-card-title">${item.title}</div>
          <div class="cctv-card-sub">${item.sub}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.openCCTVLightbox(index);
      });

      grid.appendChild(card);
    });

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
        const newIdx = (this.currentLightboxIndex - 1 + this.cctvGallery.length) % this.cctvGallery.length;
        this.openCCTVLightbox(newIdx);
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const newIdx = (this.currentLightboxIndex + 1) % this.cctvGallery.length;
        this.openCCTVLightbox(newIdx);
      });
    }
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
  // 4. SOUND TEST & CASSETTE AUDIO DECK
  // =========================================================================
  initSoundTest() {
    const soundList = document.getElementById('soundtest-list');
    if (!soundList) return;

    soundList.innerHTML = '';
    this.audioTracks.forEach((track, index) => {
      const row = document.createElement('div');
      row.className = 'soundtest-row';
      row.dataset.index = index;

      const typeBadgeClass = track.type === 'music' ? 'badge-music' :
                             track.type === 'tape' ? 'badge-tape' :
                             track.type === 'shriek' ? 'badge-shriek' : 'badge-sfx';

      row.innerHTML = `
        <div class="soundtest-row-left">
          <button class="soundtest-play-btn" data-index="${index}" title="Play Track">▶</button>
          <div class="soundtest-track-info">
            <span class="soundtest-track-title">${track.title}</span>
            <span class="soundtest-track-desc">${track.desc}</span>
          </div>
        </div>
        <span class="soundtest-type-badge ${typeBadgeClass}">${track.type.toUpperCase()}</span>
      `;

      const playBtn = row.querySelector('.soundtest-play-btn');
      playBtn.addEventListener('click', () => {
        this.playSoundTrack(track, playBtn);
      });

      soundList.appendChild(row);
    });

    const btnStopAll = document.getElementById('btn-soundtest-stop');
    if (btnStopAll) {
      btnStopAll.addEventListener('click', () => {
        this.stopAudio();
        window.Sound?.playMechanicalClick();
      });
    }
  }

  playSoundTrack(track, btnEl) {
    this.stopAudio();

    // Toggle active state on buttons
    const allBtns = this.modal.querySelectorAll('.soundtest-play-btn');
    allBtns.forEach(b => {
      b.textContent = '▶';
      b.classList.remove('playing');
    });

    if (btnEl) {
      btnEl.textContent = '■';
      btnEl.classList.add('playing');
    }

    // Spin cassette reels
    const reels = this.modal.querySelectorAll('.extras-tape-reel');
    reels.forEach(r => r.classList.add('spinning'));

    // Animate equalizer bars
    const nowPlayingText = document.getElementById('soundtest-now-playing');
    if (nowPlayingText) nowPlayingText.textContent = `PLAYING: ${track.title.toUpperCase()}`;

    // Play action
    if (track.action) {
      track.action();
      this.isAudioPlaying = true;
      setTimeout(() => {
        if (!this.currentAudio) {
          reels.forEach(r => r.classList.remove('spinning'));
          if (btnEl) {
            btnEl.textContent = '▶';
            btnEl.classList.remove('playing');
          }
          if (nowPlayingText) nowPlayingText.textContent = 'IDLE • SELECT TRACK TO PLAY';
        }
      }, 3500);
    } else if (track.src) {
      this.currentAudio = new Audio(track.src);
      this.currentAudio.play().catch(e => console.warn('[Extras] Audio playback error:', e));
      this.currentAudio.onended = () => {
        this.stopAudio();
      };
      this.isAudioPlaying = true;
    } else if (track.type === 'tape' && track.night) {
      window.Sound?.playCassetteTape(track.night);
      this.isAudioPlaying = true;
    } else if (track.type === 'shriek' && track.entity) {
      window.Sound?.playEntityJumpscare(track.entity);
      this.isAudioPlaying = true;
      setTimeout(() => {
        this.stopAudio();
      }, 3000);
    }
  }

  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    window.Sound?.muteCassette();

    const reels = this.modal.querySelectorAll('.extras-tape-reel');
    reels.forEach(r => r.classList.remove('spinning'));

    const allBtns = this.modal.querySelectorAll('.soundtest-play-btn');
    allBtns.forEach(b => {
      b.textContent = '▶';
      b.classList.remove('playing');
    });

    const nowPlayingText = document.getElementById('soundtest-now-playing');
    if (nowPlayingText) nowPlayingText.textContent = 'IDLE • SELECT TRACK TO PLAY';
    this.isAudioPlaying = false;
  }

  // =========================================================================
  // 5. CHEATS & MODIFIERS (RADAR MAP, FAST NIGHTS, UNLIMITED POWER)
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

    // Direct Night Select shortcuts
    const nightBtns = this.modal.querySelectorAll('.extras-night-jump-btn');
    nightBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const night = parseInt(btn.dataset.night, 10);
        if (window.game) {
          this.close();
          window.game.currentNight = night;
          window.game.isCustomNight = false;
          window.game.startShift();
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
