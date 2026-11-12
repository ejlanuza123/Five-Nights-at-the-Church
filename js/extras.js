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
    this.targetCameraZ = 4.2;
    this.currentCameraZ = 4.2;
    this.cameraY = 1.05;
    this.lookAtY = 0.95;
    this.modelElevationOffset = 0.0;
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
        latinName: 'Angelus Lacrimarum ("The Angel of Tears")',
        modelUrl: 'assets/models/weeping_angel_model.glb',
        portrait: 'assets/office/door_peeking_angel.jpg',
        videoKey: 'angel',
        height: 1.70,
        scaleX: 1.0,
        scaleZ: 1.0,
        offsetY: 0.0,
        roughness: 0.52,
        metalness: 0.12,
        color: 0xe2e8f0,
        bio: 'Carved from weathered Carrara marble, the Angel of Tears stands weeping in the central nave. Bound by ancient quantum observation laws, she remains motionless stone while directly observed through the surveillance cameras. The moment the feed is severed or unmonitored, she blinks across the cloister halls at horrifying velocities.'
      },
      {
        id: 'haloedSaint',
        name: 'HALOED SAINT (POSE 1)',
        latinName: 'Sanctus Michael ("Sanctus Vindex / Guard Stance")',
        modelUrl: 'assets/models/saint_michael_model.glb',
        portrait: 'assets/office/door_peeking_saint.jpg',
        videoKey: 'saint',
        height: 1.80,
        scaleX: 1.0,
        scaleZ: 1.0,
        offsetY: 0.0,
        roughness: 0.48,
        metalness: 0.20,
        color: 0xf1f5f9,
        bio: 'A monumental crusader archangel holding a downward stone broadsword and crowned with a golden halo. Consecrated in the reconciliation alcoves, Sanctus Michael guards the sanctuary before advancing down the western cloister corridor.'
      },
      {
        id: 'haloedSaint2',
        name: 'HALOED SAINT (POSE 2)',
        latinName: 'Sanctus Michael ("Sanctus Vindex / Aggressive Stance")',
        modelUrl: 'assets/models/saint_michael_model2.glb',
        portrait: 'assets/office/door_peeking_saint.jpg',
        videoKey: 'saint',
        height: 1.80,
        scaleX: 1.0,
        scaleZ: 1.0,
        offsetY: 0.0,
        roughness: 0.48,
        metalness: 0.20,
        color: 0xf1f5f9,
        bio: 'The alternate aggressive stance of Sanctus Michael. When he breaches through the west cloister corridor to confront the night watchman at the left arched doorway, the archangel alternates between dynamic stances.'
      },
      {
        id: 'veiledMourner',
        name: 'VEILED MOURNER (CRAWLING)',
        latinName: 'The Memorial Penitent ("Saint Mary / HVAC Duct Crawler")',
        modelUrl: 'assets/models/saint_mary_model.glb',
        portrait: 'assets/office/vent_peeking_mourner.jpg',
        videoKey: 'mourner',
        height: 1.25,
        scaleX: 1.05,
        scaleZ: 1.02,
        offsetY: -0.05,
        roughness: 0.65,
        metalness: 0.0,
        materialColor: (typeof THREE !== 'undefined') ? new THREE.Color(2.6, 2.5, 2.4) : null,
        emissiveColor: 0x241d1d,
        emissiveIntensity: 0.42,
        bio: 'A shrouded funeral penitent hailing from the subterranean columbarium memorial niches. Silent and calculating, she crawls through the steel shafts of the parish HVAC return air ducts to reach the office vent.'
      },
      {
        id: 'veiledMournerStanding',
        name: 'VEILED MOURNER (STANDING)',
        latinName: 'The Memorial Penitent ("Saint Mary / Left Arched Door Stance")',
        modelUrl: 'assets/models/saint_mary_model_standing.glb',
        portrait: 'assets/office/window_hallway_mary.jpg',
        videoKey: 'mourner',
        height: 1.80,
        scaleX: 0.95,
        scaleZ: 0.95,
        offsetY: 0.0,
        roughness: 0.65,
        metalness: 0.0,
        materialColor: (typeof THREE !== 'undefined') ? new THREE.Color(2.6, 2.5, 2.4) : null,
        emissiveColor: 0x241d1d,
        emissiveIntensity: 0.42,
        bio: 'The looming standing stance of the Veiled Mourner. No longer confined only to the ventilation shafts, she rises to her full height to flank the security office via the left arched doorway.'
      }
    ];

    this.jumpscareList = [
      {
        id: 'weepingAngel',
        name: 'WEEPING ANGEL',
        latinName: 'Angelus Lacrimarum ("The Angel of Tears")',
        sub: 'Left Arched Door Breach \u2022 Rapid Corridor Lunge',
        still: 'assets/office/door_peeking_angel.jpg',
        videoKey: 'angel'
      },
      {
        id: 'haloedSaint',
        name: 'SANCTUS MICHAEL',
        latinName: 'Sanctus Vindex ("The Archangel")',
        sub: 'Observation Window \u2022 Left Door Ambush',
        still: 'assets/office/door_peeking_saint.jpg',
        videoKey: 'saint'
      },
      {
        id: 'veiledMourner',
        name: 'VEILED MOURNER',
        latinName: 'The Memorial Penitent ("Saint Mary / The Crawler")',
        sub: 'HVAC Air Return Duct \u2022 Office Vent Crawl',
        still: 'assets/office/vent_peeking_mourner.jpg',
        videoKey: 'mourner'
      }
    ];
    this.selectedJumpscareIndex = 0;

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

    // Confidential Tapes Lore Archive & Audio Telemetry
    this.confidentialTapes = [
      {
        id: 1,
        night: 1,
        title: 'TAPE 01: NIGHT 1 ORIENTATION',
        classification: 'PARISH ARCHIVE // LEVEL 1',
        date: 'November 1983',
        speaker: 'FATHER THOMAS REYES (RECTOR)',
        duration: '00:38',
        photoCam: 'cam01',
        photoTitle: 'CAM 01 // SANCTUARY DAIS',
        photoThumb: 'assets/cctv/church_cam_normal.png',
        summary: 'Fr. Thomas welcomes the new night watchman, outlining diocesan energy quotas, the magnetic iron threshold door, and the disturbing tendency of the Angel of Tears to vacate the high altar dais when unwatched.',
        transcript: [
          "If you're hearing this, you survived your first few minutes in the parish security office.",
          "Now, don't worry about the rumors. The diocese has us on a strict energy quota, so keep an eye on that backup battery.",
          "That arched door on your left? It's on a magnetic lock.",
          "Lock it if you hear heavy stone steps in the corridor, but don't waste power leaving it shut.",
          "Watch the altar camera. One of the statues... she likes to wander when nobody is watching.",
          "Keep checking the cameras. God be with you tonight."
        ]
      },
      {
        id: 2,
        night: 2,
        title: 'TAPE 02: NIGHT 2 THREAT ESCALATION',
        classification: 'PARISH ARCHIVE // LEVEL 2',
        date: 'November 1983',
        speaker: 'FATHER THOMAS REYES (RECTOR)',
        duration: '00:46',
        photoCam: 'cam05',
        photoTitle: 'CAM 05 // WEST CLOISTER NARTHEX',
        photoThumb: 'assets/cctv/church_cam_05_saint_hallway.png',
        summary: 'Warning concerning Sanctus Michael (The Archangel) prowling outside the security office observation window. Instructions on conserving office power while using the desk halogen spotlight beam to repel his aggressive patrols.',
        transcript: [
          "Hello again! Glad to see you back for Night Two.",
          "Listen closely: you've probably noticed the big observation window right in front of your desk.",
          "Outside is the cloister hallway. Sanctus Michael... the martyr with the halo... he stalks that corridor.",
          "If you look through that glass and see him standing in the gloom, do NOT panic.",
          "Hit that halogen spotlight switch right on your desk. The beam blinds him and forces his effigy back.",
          "Keep your light usage conservative though... and check the vent. We've had strange sounds in the ductwork."
        ]
      },
      {
        id: 3,
        night: 3,
        title: 'TAPE 03: SUB-BASEMENT & DUCT PENETRATION',
        classification: 'PARISH ARCHIVE // LEVEL 3',
        date: 'November 1983',
        speaker: 'FATHER THOMAS REYES (RECTOR)',
        duration: '00:52',
        photoCam: 'cam04',
        photoTitle: 'CAM 04 // HVAC RETURN AIR DUCT',
        photoThumb: 'assets/cctv/church_cam_04_vent_anomaly.png',
        summary: 'Notice regarding the crypt seal breach. The Veiled Mourner has entered the HVAC ventilation shafts. Protocol commands switching on the duct inspection beam and pulling the emergency fire shutter when she approaches the grille.',
        transcript: [
          "Uh, hello? Okay, listen. Night Three is usually when things... escalate.",
          "The maintenance crew sealed the crypt, but the return air duct on your right connects into the sub-basement.",
          "There's an effigy down there—the Veiled Penitent. If you hear metallic clanging in the ductwork, she's crawling inside.",
          "Turn on that duct inspection light. If she's peeking right out of the grate... pull the emergency fire shutter immediately.",
          "Hold it shut until you hear her stone fingers slide back. Stay calm."
        ]
      },
      {
        id: 4,
        night: 4,
        title: 'TAPE 04: ARCHWAY BREACH & PANIC LOG',
        classification: 'PARISH ARCHIVE // CRITICAL',
        date: 'November 1983',
        speaker: 'FATHER THOMAS REYES (FINAL RECORDING)',
        duration: '00:34',
        photoCam: 'cam05',
        photoTitle: 'CAM 05 // DUAL ENTITY THRESHOLD',
        photoThumb: 'assets/cctv/church_cam_05_saint_angel.png',
        summary: 'Fr. Thomas in acute panic during a simultaneous breach. Static distortions, warning of Latin whispers outside the office window, and a violent impact before the recording violently cuts off.',
        transcript: [
          "Hello? (heavy static) Can you hear me? Listen... I don't have much time.",
          "They're... they're moving together now. If the power cuts, the generator won't kick in.",
          "The candles won't protect you in the dark.",
          "If you hear Latin whispering outside your window... flash the light immediately! Don't look away from CAM 01!",
          "(distant loud stone crash) Oh God... they're outside the archway... Lock the door! Lock the—",
          "(harsh tape static cut)"
        ]
      },
      {
        id: 5,
        night: 5,
        title: 'TAPE 05: VATICAN CONGREGATION DOSSIER 1892',
        classification: 'VATICAN HOLY OFFICE // CLASSIFIED',
        date: 'October 1892',
        speaker: 'MONSIGNOR VALERIUS (VATICAN INQUISITOR)',
        duration: '01:05',
        photoCam: 'cam02',
        photoTitle: 'CAM 02 // COLUMBARIUM PLAGUE VAULT',
        photoThumb: 'assets/cctv/church_cam_02_columbarium.png',
        summary: 'The secret origin of the church curse: During the 1888 plague, an unholy binding ritual bound malevolent entities into the sanctuary effigies. Explains why holy water and prayers fail, and why direct observation forces them to lock into rigid stone.',
        transcript: [
          "Vatican Congregation of Rites, October 1892. Dictated by Monsignor Valerius.",
          "Our investigation into the Parish of Saint Jude has revealed an unspeakable desecration.",
          "During the plague of 1888, the previous rector attempted an unholy binding ritual in the catacombs.",
          "Rather than commending the departed to consecrated ground, demonic entities were channeled into the sanctuary's marble effigies.",
          "The Weeping Angel, Sanctus Michael, and the Veiled Mourner... they are no longer inert stone.",
          "They are physical anchors for ancient malevolent spirits that hunger for human warmth.",
          "Holy water cannot exorcise them; prayers only agitate the stone.",
          "They can only be immobilized by direct observation. When perceived, their vessel locks into rigid mineral form.",
          "May the Lord have mercy on anyone left in this church after midnight."
        ]
      },
      {
        id: 6,
        night: 6,
        title: 'TAPE 06: POLICE CORONER INCIDENT REPORT 1983',
        classification: 'COUNTY CORONER // CASE 83-409',
        date: 'November 1983',
        speaker: 'DETECTIVE MARCUS VANCE (COUNTY INVESTIGATOR)',
        duration: '00:58',
        photoCam: 'cam01',
        photoTitle: 'CAM 01 // VACATED SANCTUARY DAIS',
        photoThumb: 'assets/cctv/church_cam_01_empty.png',
        summary: 'Official police post-mortem examination of night watchman Thomas Reyes found dead against the security door. Zero physical trauma, frozen expression of pure terror, sub-zero skin, and marble dust residue on his throat.',
        transcript: [
          "County Coroner's Audio Log. Case File 83-409. Detective Marcus Vance recording.",
          "We are inspecting the basement security annex beneath the parish nave.",
          "The night watchman, Thomas Reyes, was discovered sitting upright against the magnetic iron door.",
          "There are no puncture wounds, no lacerations, and no blunt force trauma on the body.",
          "However, the victim's facial expression is locked in a state of catastrophic shock.",
          "His skin was sub-zero to the touch, and microscopic traces of powdered marble dust were found on his neck.",
          "The facility's circuit breakers had tripped at 03:42 AM. The backup batteries were completely depleted.",
          "The church elders refused to answer questions regarding why the marble altar statue was missing from CAM 01.",
          "Case classified pending diocesan review. Tape concluded."
        ]
      }
    ];

    this.selectedTapeIndex = 0;
    this.isTapePlaying = false;
    this.isTapePaused = false;
    this.tapeElapsedSeconds = 0;
    this.tapeTimerInterval = null;
    this.tapeVuAnimId = null;

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

    // Global ESC & Arrow Navigation Keys
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isJumpscarePlaying) {
          this.closeJumpscare();
          e.preventDefault();
        } else if (this.isOpen) {
          const lightbox = document.getElementById('cctv-lightbox');
          if (lightbox && !lightbox.classList.contains('hidden')) {
            this.closeCCTVLightbox();
          } else {
            this.close();
          }
          e.preventDefault();
        }
      } else if (this.isOpen) {
        const lightbox = document.getElementById('cctv-lightbox');
        const isLightboxOpen = lightbox && !lightbox.classList.contains('hidden');

        if (e.key === 'ArrowLeft') {
          if (isLightboxOpen) {
            this.navigateCCTVLightbox(-1);
            e.preventDefault();
          } else if (this.currentTab === 'models') {
            document.getElementById('btn-model-prev')?.click();
            e.preventDefault();
          } else if (this.currentTab === 'jumpscares') {
            document.getElementById('btn-jumpscare-prev')?.click();
            e.preventDefault();
          }
        } else if (e.key === 'ArrowRight') {
          if (isLightboxOpen) {
            this.navigateCCTVLightbox(1);
            e.preventDefault();
          } else if (this.currentTab === 'models') {
            document.getElementById('btn-model-next')?.click();
            e.preventDefault();
          } else if (this.currentTab === 'jumpscares') {
            document.getElementById('btn-jumpscare-next')?.click();
            e.preventDefault();
          }
        } else if (e.key === ' ' || e.key === 'Enter') {
          if (this.currentTab === 'jumpscares' && !this.isJumpscarePlaying) {
            this.playActiveJumpscare();
            e.preventDefault();
          }
        }
      }
    });

    // Sidebar Navigation Tabs
    const tabButtons = this.screen.querySelectorAll('.extras-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab === 'jumpscares' && this.currentTab === 'jumpscares') {
          this.playActiveJumpscare();
          return;
        }
        this.switchTab(tab);
      });
    });

    // Subsystems
    this.initStaticCanvas();
    this.init3DViewer();
    this.initJumpscaresGallery();
    this.initConfidentialTapes();
    // CCTV archive removed from Confidential Tapes
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
    this.stopStageJumpscares();
    this.closeJumpscare();
    this.stopActiveTape();
    window.Sound?.stopCassetteTape();

    this.closeCCTVLightbox();
  }

  switchTab(tabName) {
    this.closeCCTVLightbox();

    // Stop cassette tape if navigating away from confidential tapes
    if (this.currentTab === 'tapes' && tabName !== 'tapes') {
      this.stopActiveTape();
      window.Sound?.stopCassetteTape();
    }

    this.currentTab = tabName;

    // Stop in-stage jumpscares if navigating away
    if (tabName !== 'jumpscares') {
      this.stopStageJumpscares();
    }

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
      const item = this.jumpscareList[this.selectedJumpscareIndex];
      if (titleEl && item) titleEl.textContent = item.name;
      if (subEl && item) subEl.textContent = item.latinName;
      if (hintEl) hintEl.textContent = '[ TAP SCREEN TO REPLAY // USE < > TO SWITCH ]';
    } else if (tabName === 'tapes' || tabName === 'cctv') {
      if (titleEl) titleEl.textContent = 'CONFIDENTIAL TAPES';
      if (subEl) subEl.textContent = 'Parish Audio Archives & Vatican Incident Dossiers';
      if (hintEl) hintEl.textContent = '[ SELECT CASSETTE TAPE TO PLAY // TAP STOP TO HALT ]';
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
    } else if (tabName === 'jumpscares') {
      this.stopRendering();
      this.displayJumpscare(this.selectedJumpscareIndex, true);
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
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    this.camera.position.set(0, this.cameraY, this.currentCameraZ);
    this.camera.lookAt(0, this.lookAtY, 0);

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

    // 4. Carved Weathered Marble Altar Pedestal (Lowered & Proportioned)
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
    const baseGeo = new THREE.CylinderGeometry(1.25, 1.35, 0.08, 48);
    const baseMesh = new THREE.Mesh(baseGeo, pedestalMat);
    baseMesh.position.y = 0.04;
    baseMesh.receiveShadow = true;
    this.pedestalGroup.add(baseMesh);

    // Column plinth
    const colGeo = new THREE.CylinderGeometry(1.05, 1.20, 0.12, 48);
    const colMesh = new THREE.Mesh(colGeo, pedestalMat);
    colMesh.position.y = 0.14;
    colMesh.receiveShadow = true;
    this.pedestalGroup.add(colMesh);

    // Decorative ring
    const ringGeo = new THREE.TorusGeometry(1.08, 0.02, 16, 64);
    const ringMesh = new THREE.Mesh(ringGeo, ironMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.20;
    this.pedestalGroup.add(ringMesh);

    this.scene.add(this.pedestalGroup);

    // 5. Model Pivot Group (Entity center grounded on plinth at y = 0.20)
    this.modelPivot = new THREE.Group();
    this.modelPivot.position.set(0, 0.20, 0);
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
      this.targetCameraZ = Math.max(2.4, Math.min(5.5, this.targetCameraZ + zoomDelta));
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

    // Framing & Height Adjustment Controls (Creepy Gothic Toolbar)
    const btnHeightUp = document.getElementById('btn-model-height-up');
    const btnHeightDown = document.getElementById('btn-model-height-down');
    const btnZoomIn = document.getElementById('btn-model-zoom-in');
    const btnZoomOut = document.getElementById('btn-model-zoom-out');
    const btnResetFrame = document.getElementById('btn-model-reset-frame');

    if (btnHeightUp) {
      btnHeightUp.addEventListener('click', (e) => {
        e.stopPropagation();
        this.modelElevationOffset = Math.min(0.50, this.modelElevationOffset + 0.06);
        window.Sound?.playLightClick();
      });
    }

    if (btnHeightDown) {
      btnHeightDown.addEventListener('click', (e) => {
        e.stopPropagation();
        this.modelElevationOffset = Math.max(-0.50, this.modelElevationOffset - 0.06);
        window.Sound?.playLightClick();
      });
    }

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.targetCameraZ = Math.max(2.4, this.targetCameraZ - 0.35);
        window.Sound?.playLightClick();
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', (e) => {
        e.stopPropagation();
        this.targetCameraZ = Math.min(5.5, this.targetCameraZ + 0.35);
        window.Sound?.playLightClick();
      });
    }

    if (btnResetFrame) {
      btnResetFrame.addEventListener('click', (e) => {
        e.stopPropagation();
        this.modelElevationOffset = 0.0;
        this.targetCameraZ = 4.2;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        window.Sound?.playMechanicalClick();
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
        this.modelPivot.position.y = 0.20 + this.modelElevationOffset;
      }

      if (this.camera) {
        this.camera.position.z = this.currentCameraZ;
        this.camera.position.y = this.cameraY;
        this.camera.lookAt(0, this.lookAtY, 0);
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
  // 2. JUMPSCARES (RIGHT-SIDE STAGE SCREEN, AUTOMATIC PLAYBACK & NEXT/PREV CYCLING)
  // =========================================================================
  initJumpscaresGallery() {
    // 1. Sidebar Arrow Navigation (< and > right beside Jumpscares button)
    const btnPrev = document.getElementById('btn-jumpscare-prev');
    const btnNext = document.getElementById('btn-jumpscare-next');

    if (btnPrev) {
      btnPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentTab !== 'jumpscares') {
          this.switchTab('jumpscares');
        }
        const newIdx = (this.selectedJumpscareIndex - 1 + this.jumpscareList.length) % this.jumpscareList.length;
        this.displayJumpscare(newIdx, true);
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentTab !== 'jumpscares') {
          this.switchTab('jumpscares');
        }
        const newIdx = (this.selectedJumpscareIndex + 1) % this.jumpscareList.length;
        this.displayJumpscare(newIdx, true);
      });
    }

    // 2. Stage On-Screen Turn / Cycle Arrows
    const btnStagePrev = document.getElementById('btn-jumpscare-stage-prev');
    const btnStageNext = document.getElementById('btn-jumpscare-stage-next');

    if (btnStagePrev) {
      btnStagePrev.addEventListener('click', (e) => {
        e.stopPropagation();
        const newIdx = (this.selectedJumpscareIndex - 1 + this.jumpscareList.length) % this.jumpscareList.length;
        this.displayJumpscare(newIdx, true);
      });
    }

    if (btnStageNext) {
      btnStageNext.addEventListener('click', (e) => {
        e.stopPropagation();
        const newIdx = (this.selectedJumpscareIndex + 1) % this.jumpscareList.length;
        this.displayJumpscare(newIdx, true);
      });
    }

    // 3. Click / Tap Video Screen on Right Side to Restart Attack Animation
    const stageViewport = document.getElementById('extras-jumpscare-viewport');
    if (stageViewport) {
      stageViewport.addEventListener('click', (e) => {
        this.displayJumpscare(this.selectedJumpscareIndex, true);
      });
    }
  }

  displayJumpscare(index, playSound = true) {
    if (index < 0 || index >= this.jumpscareList.length) return;
    this.selectedJumpscareIndex = index;
    const item = this.jumpscareList[index];

    // 1. Update Top Right Entity Name & Latin Subtitle (Above the screen on right)
    const titleEl = document.getElementById('model-entity-name');
    const subEl = document.getElementById('model-entity-latin');
    const hintEl = document.getElementById('extras-fnaf-hint');

    if (titleEl) titleEl.textContent = item.name;
    if (subEl) subEl.textContent = item.latinName;
    if (hintEl) hintEl.textContent = '[ TAP SCREEN TO REPLAY // USE < > TO SWITCH ]';

    // 2. Update Bottom Bio Description Card
    const bioEl = document.getElementById('jumpscare-stage-bio');
    if (bioEl) bioEl.textContent = item.sub;

    // 3. Play Dedicated Video on the Right Side Screen
    const videoMap = {
      weepingAngel: document.getElementById('extras-video-angel'),
      haloedSaint: document.getElementById('extras-video-saint'),
      veiledMourner: document.getElementById('extras-video-mourner')
    };

    const targetVideo = videoMap[item.id] || videoMap.weepingAngel;

    Object.values(videoMap).forEach(v => {
      if (v) {
        try {
          v.pause();
        } catch (e) {}
        if (v !== targetVideo) {
          v.classList.add('hidden');
        }
      }
    });

    if (targetVideo) {
      targetVideo.classList.remove('hidden');
      targetVideo.muted = true;
      targetVideo.playsInline = true;
      targetVideo.setAttribute('playsinline', '');
      targetVideo.setAttribute('webkit-playsinline', '');
      targetVideo.loop = false;
      targetVideo.removeAttribute('loop');

      try {
        targetVideo.currentTime = 0;
      } catch (e) {}

      const playPromise = targetVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('[Extras] In-stage video play error:', err);
          targetVideo.load();
          targetVideo.play().catch(e => console.warn('[Extras] Secondary attempt:', e));
        });
      }
    }

    // 4. Trigger authentic screeching audio through WebAudio
    if (playSound) {
      window.Sound?.playEntityJumpscare(item.id);
    }
  }

  stopStageJumpscares() {
    const videoMap = {
      weepingAngel: document.getElementById('extras-video-angel'),
      haloedSaint: document.getElementById('extras-video-saint'),
      veiledMourner: document.getElementById('extras-video-mourner')
    };

    Object.values(videoMap).forEach(v => {
      if (v) {
        try {
          v.pause();
          v.currentTime = 0;
        } catch (e) {}
        v.classList.add('hidden');
      }
    });
  }

  playActiveJumpscare() {
    this.displayJumpscare(this.selectedJumpscareIndex, true);
  }

  playJumpscare(entityId) {
    if (this.isJumpscarePlaying) {
      this.closeJumpscare();
    }

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
  // 3. CONFIDENTIAL TAPES ARCHIVE (Interactive Vintage Cassette Player & Lore)
  // =========================================================================
  initConfidentialTapes() {
    this.renderTapesRack();

    // Transport buttons
    const btnPlay = document.getElementById('btn-tape-play');
    const btnPause = document.getElementById('btn-tape-pause');
    const btnStop = document.getElementById('btn-tape-stop');
    const btnRewind = document.getElementById('btn-tape-rewind');

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        if (this.isTapePaused) {
          this.resumeActiveTape();
        } else {
          this.playActiveTape();
        }
      });
    }

    if (btnPause) {
      btnPause.addEventListener('click', () => {
        this.pauseActiveTape();
      });
    }

    if (btnStop) {
      btnStop.addEventListener('click', () => {
        this.stopActiveTape();
      });
    }

    if (btnRewind) {
      btnRewind.addEventListener('click', () => {
        this.stopActiveTape();
        this.tapeElapsedSeconds = 0;
        this.updateTapeTimerDisplay(0);
        window.Sound?.playTapeDeckClick(false);
      });
    }

    // Full transcript drawer toggle
    const btnToggleTranscript = document.getElementById('btn-toggle-transcript');
    const transcriptEl = document.getElementById('deck-full-transcript');
    if (btnToggleTranscript && transcriptEl) {
      btnToggleTranscript.addEventListener('click', () => {
        const isHidden = transcriptEl.classList.toggle('hidden');
        btnToggleTranscript.textContent = isHidden ? 'VIEW FULL TRANSCRIPT' : 'HIDE FULL TRANSCRIPT';
        window.Sound?.playLightClick();
      });
    }



    // Initialize with first tape ready
    this.selectTape(0, false);
  }

  renderTapesRack() {
    const list = document.getElementById('tapes-rack-list');
    if (!list) return;

    list.innerHTML = '';
    this.confidentialTapes.forEach((tape, index) => {
      const card = document.createElement('div');
      card.className = `tape-card-item ${index === this.selectedTapeIndex ? 'active' : ''}`;
      card.dataset.index = index;

      card.innerHTML = `
        <div class="tape-card-cassette-mini">
          <div class="mini-tape-window">
            <div class="mini-spool"></div>
            <div class="mini-bridge"></div>
            <div class="mini-spool"></div>
          </div>
          <span class="mini-tape-number">TAPE 0${tape.id}</span>
        </div>
        <div class="tape-card-info">
          <div class="tape-card-toprow">
            <span class="tape-card-class">${tape.classification}</span>
            <span class="tape-card-duration">${tape.duration}</span>
          </div>
          <div class="tape-card-title">${tape.title}</div>
          <div class="tape-card-meta">${tape.date} &bull; ${tape.speaker}</div>
          <div class="tape-card-lore">${tape.summary}</div>
        </div>
        <div class="tape-evidence-thumb" title="Click to view attached CCTV photographic evidence">
          <img src="${tape.photoThumb}" alt="Evidence" class="tape-evidence-img" loading="lazy" />
          <div class="tape-evidence-scanlines"></div>
          <span class="tape-evidence-badge">${tape.photoCam.toUpperCase()}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        if (this.selectedTapeIndex !== index || (!this.isTapePlaying && !this.isTapePaused)) {
          this.selectTape(index, true);
        }
      });

      const evidenceThumb = card.querySelector('.tape-evidence-thumb');
      if (evidenceThumb) {
        evidenceThumb.addEventListener('click', (e) => {
          e.stopPropagation();
          const cctvIdx = this.cctvGallery.findIndex(c => c.src === tape.photoThumb || c.cam === tape.photoCam);
          if (cctvIdx >= 0) {
            this.openCCTVLightbox(cctvIdx);
          }
        });
      }

      list.appendChild(card);
    });
  }

  selectTape(index, autoPlay = false) {
    if (this.isTapePlaying || this.isTapePaused) {
      this.stopActiveTape();
    }

    this.selectedTapeIndex = index;
    const tape = this.confidentialTapes[index];
    if (!tape) return;

    // Highlight active card
    const cards = document.querySelectorAll('#tapes-rack-list .tape-card-item');
    cards.forEach((c, idx) => {
      c.classList.toggle('active', idx === index);
    });

    // Update cassette deck HUD
    const titleEl = document.getElementById('deck-tape-title');
    const classEl = document.getElementById('deck-tape-class');
    const speakerEl = document.getElementById('deck-speaker-name');
    const timerEl = document.getElementById('deck-timer-osd');
    const statusEl = document.getElementById('tape-status-text');
    const subtitleEl = document.getElementById('deck-subtitle-text');
    const transcriptEl = document.getElementById('deck-full-transcript');

    if (titleEl) titleEl.textContent = tape.title;
    if (classEl) classEl.textContent = tape.classification;
    if (speakerEl) speakerEl.textContent = `SPEAKER: ${tape.speaker}`;
    if (timerEl) timerEl.textContent = '00:00';
    if (statusEl) {
      statusEl.textContent = 'READY TO PLAY';
      statusEl.className = 'tape-status-indicator status-ready';
    }
    if (subtitleEl) {
      subtitleEl.textContent = `Select PLAY to initiate audio transcription for ${tape.title}...`;
    }

    // Populate full transcript drawer
    if (transcriptEl) {
      transcriptEl.innerHTML = `
        <div class="transcript-header">// FULL AUDIO TRANSCRIPT: ${tape.title}</div>
        <div class="transcript-meta">CLASSIFICATION: ${tape.classification} | RECORDED: ${tape.date}</div>
        <div class="transcript-body">
          ${tape.transcript.map((line, i) => `
            <div class="transcript-line">
              <span class="line-num">[0${i + 1}]</span>
              <span class="line-text">${line}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (autoPlay) {
      this.playActiveTape();
    }
  }

  playActiveTape() {
    const tape = this.confidentialTapes[this.selectedTapeIndex];
    if (!tape) return;

    this.isTapePlaying = true;
    this.isTapePaused = false;
    this.tapeElapsedSeconds = 0;
    this.updateTapeTimerDisplay(0);

    // Deck HUD
    const statusEl = document.getElementById('tape-status-text');
    if (statusEl) {
      statusEl.textContent = 'PLAYING [AUD]';
      statusEl.className = 'tape-status-indicator status-playing';
    }

    const reelLeft = document.getElementById('deck-reel-left');
    const reelRight = document.getElementById('deck-reel-right');
    if (reelLeft) reelLeft.classList.add('spinning');
    if (reelRight) reelRight.classList.add('spinning');

    const vuMeter = document.getElementById('tape-vu-meter');
    if (vuMeter) vuMeter.classList.add('active');
    this.startVuMeter();

    // Start timer interval
    if (this.tapeTimerInterval) clearInterval(this.tapeTimerInterval);
    this.tapeTimerInterval = setInterval(() => {
      this.tapeElapsedSeconds++;
      this.updateTapeTimerDisplay(this.tapeElapsedSeconds);
    }, 1000);

    // Play tape audio via SoundEngine
    window.Sound?.playCassetteTape(
      tape.night,
      (line) => {
        this.onTapeSubtitle(line);
      },
      () => {
        this.onTapeEnded();
      }
    );
  }

  pauseActiveTape() {
    if (!this.isTapePlaying || this.isTapePaused) return;

    this.isTapePaused = true;
    window.Sound?.pauseCassetteTape();

    if (this.tapeTimerInterval) {
      clearInterval(this.tapeTimerInterval);
      this.tapeTimerInterval = null;
    }

    this.stopVuMeter();
    const reelLeft = document.getElementById('deck-reel-left');
    const reelRight = document.getElementById('deck-reel-right');
    if (reelLeft) reelLeft.classList.remove('spinning');
    if (reelRight) reelRight.classList.remove('spinning');

    const statusEl = document.getElementById('tape-status-text');
    if (statusEl) {
      statusEl.textContent = 'PAUSED';
      statusEl.className = 'tape-status-indicator status-paused';
    }
  }

  resumeActiveTape() {
    if (!this.isTapePlaying || !this.isTapePaused) return;

    this.isTapePaused = false;
    window.Sound?.resumeCassetteTape();

    if (this.tapeTimerInterval) clearInterval(this.tapeTimerInterval);
    this.tapeTimerInterval = setInterval(() => {
      this.tapeElapsedSeconds++;
      this.updateTapeTimerDisplay(this.tapeElapsedSeconds);
    }, 1000);

    const reelLeft = document.getElementById('deck-reel-left');
    const reelRight = document.getElementById('deck-reel-right');
    if (reelLeft) reelLeft.classList.add('spinning');
    if (reelRight) reelRight.classList.add('spinning');

    const vuMeter = document.getElementById('tape-vu-meter');
    if (vuMeter) vuMeter.classList.add('active');
    this.startVuMeter();

    const statusEl = document.getElementById('tape-status-text');
    if (statusEl) {
      statusEl.textContent = 'PLAYING [AUD]';
      statusEl.className = 'tape-status-indicator status-playing';
    }
  }

  stopActiveTape() {
    this.isTapePlaying = false;
    this.isTapePaused = false;

    if (this.tapeTimerInterval) {
      clearInterval(this.tapeTimerInterval);
      this.tapeTimerInterval = null;
    }

    this.stopVuMeter();

    const reelLeft = document.getElementById('deck-reel-left');
    const reelRight = document.getElementById('deck-reel-right');
    if (reelLeft) reelLeft.classList.remove('spinning');
    if (reelRight) reelRight.classList.remove('spinning');

    const vuMeter = document.getElementById('tape-vu-meter');
    if (vuMeter) vuMeter.classList.remove('active');

    const statusEl = document.getElementById('tape-status-text');
    if (statusEl) {
      statusEl.textContent = 'DECK IDLE';
      statusEl.className = 'tape-status-indicator';
    }

    this.tapeElapsedSeconds = 0;
    this.updateTapeTimerDisplay(0);

    window.Sound?.stopCassetteTape();
  }

  onTapeSubtitle(line) {
    const subtitleEl = document.getElementById('deck-subtitle-text');
    if (!subtitleEl) return;
    subtitleEl.style.opacity = '0';
    setTimeout(() => {
      subtitleEl.textContent = `"${line}"`;
      subtitleEl.style.opacity = '1';
    }, 120);
  }

  onTapeEnded() {
    this.isTapePlaying = false;
    this.isTapePaused = false;

    if (this.tapeTimerInterval) {
      clearInterval(this.tapeTimerInterval);
      this.tapeTimerInterval = null;
    }

    this.stopVuMeter();

    const reelLeft = document.getElementById('deck-reel-left');
    const reelRight = document.getElementById('deck-reel-right');
    if (reelLeft) reelLeft.classList.remove('spinning');
    if (reelRight) reelRight.classList.remove('spinning');

    const vuMeter = document.getElementById('tape-vu-meter');
    if (vuMeter) vuMeter.classList.remove('active');

    const statusEl = document.getElementById('tape-status-text');
    if (statusEl) {
      statusEl.textContent = 'END OF TAPE';
      statusEl.className = 'tape-status-indicator status-ended';
    }

    const subtitleEl = document.getElementById('deck-subtitle-text');
    if (subtitleEl) {
      subtitleEl.textContent = '[ END OF RECORDING // CASSETTE AUTO-STOP ENGAGED ]';
    }
  }

  updateTapeTimerDisplay(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    const timerEl = document.getElementById('deck-timer-osd');
    if (timerEl) timerEl.textContent = `${mins}:${secs}`;
  }

  startVuMeter() {
    if (this.tapeVuAnimId) return;
    const vuBars = document.querySelectorAll('#tape-vu-meter .vu-bar');
    if (!vuBars || !vuBars.length) return;

    let lastTick = 0;
    const animate = (time) => {
      if (!this.isTapePlaying || this.isTapePaused) {
        this.tapeVuAnimId = null;
        return;
      }
      if (time - lastTick > 90) {
        lastTick = time;
        vuBars.forEach((bar, idx) => {
          const rand = Math.random();
          const heightPct = Math.min(100, Math.max(12, Math.floor(rand * 95) + (idx < 5 ? 15 : 0)));
          bar.style.height = `${heightPct}%`;
        });
      }
      this.tapeVuAnimId = requestAnimationFrame(animate);
    };
    this.tapeVuAnimId = requestAnimationFrame(animate);
  }

  stopVuMeter() {
    if (this.tapeVuAnimId) {
      cancelAnimationFrame(this.tapeVuAnimId);
      this.tapeVuAnimId = null;
    }
    const vuBars = document.querySelectorAll('#tape-vu-meter .vu-bar');
    vuBars.forEach(bar => {
      bar.style.height = '10%';
    });
  }

  // =========================================================================
  // 4. SURVEILLANCE CCTV ARCHIVE & LIGHTBOX
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
    if (btnLightboxClose) {
      const handleClose = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.closeCCTVLightbox();
      };
      btnLightboxClose.addEventListener('click', handleClose);
      btnLightboxClose.addEventListener('touchend', handleClose);
    }

    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('screen-modal')) {
          this.closeCCTVLightbox();
        }
      });
    }

    const btnPrev = document.getElementById('btn-lightbox-prev');
    const btnNext = document.getElementById('btn-lightbox-next');
    if (btnPrev) {
      btnPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateCCTVLightbox(-1);
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateCCTVLightbox(1);
      });
    }

    const btnSidePrev = document.getElementById('btn-lightbox-side-prev');
    const btnSideNext = document.getElementById('btn-lightbox-side-next');
    if (btnSidePrev) {
      btnSidePrev.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateCCTVLightbox(-1);
      });
    }
    if (btnSideNext) {
      btnSideNext.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateCCTVLightbox(1);
      });
    }
  }

  closeCCTVLightbox() {
    const lightbox = document.getElementById('cctv-lightbox');
    if (lightbox && !lightbox.classList.contains('hidden')) {
      lightbox.classList.add('hidden');
      window.Sound?.playLightClick();
    }
  }

  navigateCCTVLightbox(dir) {
    const activeList = this.getFilteredCCTVList();
    if (!activeList || activeList.length === 0) return;
    const currentFilteredIdx = activeList.findIndex(item => item === this.cctvGallery[this.currentLightboxIndex]);
    const safeIdx = currentFilteredIdx >= 0 ? currentFilteredIdx : 0;
    const newFilteredIdx = (safeIdx + dir + activeList.length) % activeList.length;
    const newGlobalIdx = this.cctvGallery.indexOf(activeList[newFilteredIdx]);
    this.openCCTVLightbox(newGlobalIdx >= 0 ? newGlobalIdx : 0);
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
