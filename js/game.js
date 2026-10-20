/**
 * Five Nights at the Church - Modern Gameplay & Security Engine
 * AI Statues, Digital CCTV Surveillance, Modern Maglock & HVAC Controls
 */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.world = null;

    // Game State
    this.isRunning = false;
    this.isNightTransitioning = false;
    this.isPaused = false;
    this.currentNight = 1;
    this.hour = 0; // 0 = 12 AM, 1 = 1 AM, ..., 6 = 6 AM
    this.nightTimer = 0;
    this.fnafStandardHour = 86; // Authentic FNAF 1 PC hour duration (86.0s = 516s / 8m 36s shift)
    this.hourDuration = 86;     // Standard 86s per hour on Normal speed
    this.timeSpeed = 1;         // Shift speed multiplier
    this._lastFrameTime = 0;
    this.power = 100.0;
    this.isBlackout = false;
    this.gameOver = false;
    this.victory = false;

    // Player View Controls
    this.cameraYaw = 0;
    this.cameraPitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.isMouseDown = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.keysDown = {};

    // Modern Office Defense States
    this.isLeftDoorClosed = false;    // Electronic Maglock Security Door
    this.isLeftDoorLightOn = false;   // Left Corridor Downlight
    this.isVentClosed = false;        // Motorized HVAC Fire Shutter
    this.isVentLightOn = false;       // Duct Inspection LED
    this.isWindowSpotOn = false;      // Observation Window High-Power Spotlight
    this.windowSpotIntensity = 0.0;   // Dynamic light intensity (0.0 night -> 1.0 lit)
    this.windowSpotIgnitionTimer = 0.0; // Filament surge ignition timer
    this.isWindowSpotFlickering = false; // Horror halogen strobe flicker when catching entities
    this._windowSpotPreFlickerTimer = null;
    this._windowSpotRetreatTimer = null;

    // Digital Surveillance Monitor (CCTV)
    this.isCCTVOpen = false;
    this.activeCameraId = 1;
    this.cameraStaticTimer = 0;
    this.cameraErrorTimers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.cctvLossOfSignal = false;
    this._staticCanvasTex = null;
    this._lastAngelStage = 0;
    this._lastSaintStage = 0;
    this._lastMournerStage = 0;

    // AI Entities & Levels (Strictly tracked unique locations)
    this.aiConfig = {
      weepingAngel: { level: 2, stage: 0, location: 'CAM_01', timer: 0, attackTimer: 0, awakened: false },
      haloedSaint: { level: 1, stage: 0, location: 'CAM_03', timer: 0, attackTimer: 0, awakened: false },
      veiledMourner: { level: 0, stage: 0, location: 'CAM_02', timer: 0, attackTimer: 0, awakened: false }
    };

    // Modern 3D Camera Viewpoints
    this.cctvViews = {
      1: { name: 'CAM 01 - SANCTUARY & ALTAR', pos: new THREE.Vector3(0, 4.5, -26), lookAt: new THREE.Vector3(0, 1.8, -35), room: 'altar' },
      2: { name: 'CAM 02 - MEMORIAL COLUMBARIUM', pos: new THREE.Vector3(35, 2.9, -25), lookAt: new THREE.Vector3(35, 1.2, -32), room: 'columbarium' },
      3: { name: 'CAM 03 - RECONCILIATION CHAPEL', pos: new THREE.Vector3(-35, 2.9, -24), lookAt: new THREE.Vector3(-35, 1.3, -32), room: 'confessional' },
      4: { name: 'CAM 04 - HVAC RETURN AIR DUCT', pos: new THREE.Vector3(6.0, 0.75, 0.2), lookAt: new THREE.Vector3(3.2, 0.65, 0), room: 'hvac' },
      5: { name: 'CAM 05 - NARTHEX & CORRIDOR', pos: new THREE.Vector3(0, 2.8, -8.0), lookAt: new THREE.Vector3(0, 1.8, -3.2), room: 'narthex' }
    };

    // Jumpscare Animation
    this.jumpscareActive = false;
    this.jumpscareTimer = 0;
    this.jumpscareEntity = null;

    // Customizable Keybindings & Lobby Preferences
    const defaultKeys = {
      doorToggle: 'q',
      doorLight: 'z',
      windowSpot: 'w',
      ventToggle: 'e',
      ventLight: 'r',
      cctvToggle: ' ',
      nightVision: 'l'
    };
    try {
      const savedKeys = localStorage.getItem('fnaf_church_keybinds');
      this.keyBindings = savedKeys ? Object.assign(defaultKeys, JSON.parse(savedKeys)) : defaultKeys;
    } catch (e) {
      this.keyBindings = defaultKeys;
    }

    try {
      const savedHour = parseInt(localStorage.getItem('fnaf_church_hour_duration'), 10);
      if (savedHour && [86, 60, 30].includes(savedHour)) {
        this.hourDuration = savedHour;
      } else {
        const savedSpeed = parseInt(localStorage.getItem('fnaf_church_speed'), 10);
        if (savedSpeed === 2) this.hourDuration = 60;
        else if (savedSpeed === 4) this.hourDuration = 30;
        else this.hourDuration = 86;
      }
    } catch (e) {}

    this.activeRebindingAction = null;

    // Shift Progression, Night 6 & Custom Night (20/20/20 Mode)
    this.isCustomNight = false;
    this.customAI = { angel: 10, saint: 10, mourner: 10 };
    this.stars = { night5: false, night6: false, mode20: false };

    this.init();
  }

  init() {
    this.setupThreeJS();
    this.setupEventListeners();
    this.setupStaticCanvas();
    this.setupAnalogTvGlitch();
    this.setupFnafMenu();
    this.setupCustomNightModal();
    this.setupSettingsModal();
    this.loadStars();
    this.updateNightDifficulty();
    this.initPreloader();
    this.renderLoop();
  }

  initPreloader() {
    const preloader = document.getElementById('game-preloader');
    const barInner = document.getElementById('preloader-bar-inner');
    const statusText = document.getElementById('preloader-status-text');
    const percentBadge = document.getElementById('preloader-percent-badge');
    const btnLaunch = document.getElementById('preloader-launch-btn');

    if (!preloader) {
      this.preloadCCTVFeeds();
      return;
    }

    let isDismissed = false;

    const showWarningAndEnter = () => {
      if (isDismissed) return;
      isDismissed = true;
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);

      const warningScreen = document.getElementById('warning-screen');
      if (warningScreen) {
        warningScreen.classList.remove('hidden');
        let warningDismissed = false;

        const dismissWarning = () => {
          if (warningDismissed) return;
          warningDismissed = true;
          window.removeEventListener('keydown', onWarningKey);
          warningScreen.classList.add('fade-out');

          window.Sound.init();
          window.Sound.resume();
          window.Sound.startLobbyMusic();
          if (!this.isRunning && !this._menuAudioStarted) {
            this._menuAudioStarted = true;
            window.Sound.startMenuDrone();
          }

          setTimeout(() => {
            warningScreen.style.display = 'none';
            warningScreen.classList.add('hidden');
          }, 600);
        };

        const onWarningKey = (e) => {
          dismissWarning();
        };

        document.getElementById('btn-warning-continue')?.addEventListener('click', (e) => {
          e.stopPropagation();
          dismissWarning();
        });
        warningScreen.addEventListener('click', dismissWarning);
        window.addEventListener('keydown', onWarningKey);
      } else {
        window.Sound.init();
        window.Sound.resume();
        window.Sound.startLobbyMusic();
        if (!this.isRunning && !this._menuAudioStarted) {
          this._menuAudioStarted = true;
          window.Sound.startMenuDrone();
        }
      }
    };

    btnLaunch?.addEventListener('click', (e) => {
      e.stopPropagation();
      showWarningAndEnter();
    });

    const onUserKeyOrClick = (e) => {
      if (btnLaunch && !btnLaunch.classList.contains('hidden') && !isDismissed) {
        showWarningAndEnter();
      }
    };
    window.addEventListener('keydown', onUserKeyOrClick);
    preloader.addEventListener('click', onUserKeyOrClick);

    // Track audio, jumpscare videos, and image caching
    let audioRatio = 0.0;
    let videoRatio = 0.0;
    let imagesRatio = 0.0;
    let audioStatus = 'PREPARING SACRED AUDIO ENGINE...';

    const updateUI = () => {
      // 40% audio, 40% video jumpscares, 20% textures
      const totalRatio = Math.min(1.0, (audioRatio * 0.40) + (videoRatio * 0.40) + (imagesRatio * 0.20));
      const percent = Math.floor(totalRatio * 100);

      if (barInner) barInner.style.width = `${percent}%`;
      if (percentBadge) percentBadge.textContent = `${percent}%`;

      if (totalRatio < 1.0) {
        if (statusText) {
          if (videoRatio < 1.0 && audioRatio >= 1.0) {
            statusText.textContent = 'CACHING HIGH-DEF JUMPSCARE SEQUENCES...';
          } else {
            statusText.textContent = audioStatus;
          }
        }
      } else {
        if (barInner) barInner.style.width = '100%';
        if (percentBadge) percentBadge.textContent = '100%';
        if (statusText) statusText.textContent = 'ALL SACRED ARCHIVES 100% SYNCHRONIZED — READY';
        if (btnLaunch) {
          btnLaunch.classList.remove('hidden');
        }
      }
    };

    // 1. Preload Audio with live progress reporting
    const audioPromise = window.Sound.preloadBGM((ratio, text) => {
      audioRatio = ratio;
      audioStatus = text;
      updateUI();
    }).then(() => {
      audioRatio = 1.0;
      updateUI();
    }).catch(() => {
      audioRatio = 1.0;
      updateUI();
    });

    // 2. Preload Jumpscare MP4 Videos into dedicated in-memory video elements
    const jumpscareVideos = [
      { key: 'weepingAngel', id: 'jumpscare-video-angel', src: 'assets/jumpscares/angel_jumpscare.mp4?v=20261019_v48' },
      { key: 'haloedSaint', id: 'jumpscare-video-saint', src: 'assets/jumpscares/michael_jumpscare.mp4?v=20261019_v48' },
      { key: 'veiledMourner', id: 'jumpscare-video-mourner', src: 'assets/jumpscares/mary_jumpscare.mp4?v=20261019_v48' }
    ];
    this.jumpscareUrls = {};
    let loadedVideos = 0;

    const videoPromises = jumpscareVideos.map(item => {
      const vidEl = document.getElementById(item.id);
      return fetch(item.src)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          this.jumpscareUrls[item.key] = blobUrl;
          if (vidEl) {
            vidEl.src = blobUrl;
            vidEl.load();
          }
          loadedVideos++;
          videoRatio = loadedVideos / jumpscareVideos.length;
          updateUI();
        })
        .catch(err => {
          console.warn(`Fallback direct url for jumpscare ${item.key}:`, err);
          this.jumpscareUrls[item.key] = item.src;
          if (vidEl) {
            vidEl.src = item.src;
            vidEl.load();
          }
          loadedVideos++;
          videoRatio = loadedVideos / jumpscareVideos.length;
          updateUI();
        });
    });

    // 3. Preload CCTV Feeds & Textures
    const feeds = [
      'assets/cctv/church_cam_normal.png',
      'assets/cctv/church_cam_anomaly.png',
      'assets/cctv/church_cam_01_empty.png',
      'assets/cctv/church_cam_01_mary_altar.png',
      'assets/cctv/church_cam_01_saint_nave.png',
      'assets/cctv/church_cam_02_columbarium.png',
      'assets/cctv/church_cam_02_columbarium_anomaly.png',
      'assets/cctv/church_cam_02_empty.png',
      'assets/cctv/church_cam_02_angel_crypt.png',
      'assets/cctv/church_cam_03_confessional.png',
      'assets/cctv/church_cam_03_confessional_anomaly.png',
      'assets/cctv/church_cam_03_empty.png',
      'assets/cctv/church_cam_03_mary_chapel.png',
      'assets/cctv/church_cam_04_vent.png',
      'assets/cctv/church_cam_04_vent_crawl.png',
      'assets/cctv/church_cam_04_vent_anomaly.png',
      'assets/cctv/church_cam_05_narthex.png',
      'assets/cctv/church_cam_05_narthex_anomaly.png',
      'assets/cctv/church_cam_05_saint_hallway.png',
      'assets/cctv/church_cam_05_mary_hallway.png',
      'assets/entities/angel_cutout.png',
      'assets/entities/saint_cutout.png',
      'assets/entities/mary_cutout.png',
      'assets/entities/mourner_vent_cutout.png',
      'assets/office/window_hallway_empty.jpg',
      'assets/office/window_hallway_angel_far.jpg',
      'assets/office/window_hallway_angel.jpg',
      'assets/office/window_hallway_saint_far.jpg',
      'assets/office/window_hallway_saint.jpg',
      'assets/office/window_hallway_mary.jpg',
      'assets/office/door_peeking_angel.jpg',
      'assets/office/door_peeking_saint.jpg',
      'assets/office/vent_peeking_mourner.jpg'
    ];
    this._preloadedImages = {};
    let loadedCount = 0;
    const totalImages = feeds.length;

    feeds.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        imagesRatio = loadedCount / totalImages;
        updateUI();
      };
      img.onerror = () => {
        loadedCount++;
        imagesRatio = loadedCount / totalImages;
        updateUI();
      };
      img.src = src;
      this._preloadedImages[src] = img;
    });

    // In case assets load instantly from cache, ensure 100% threshold check
    Promise.all([audioPromise, ...videoPromises]).then(() => {
      audioRatio = 1.0;
      videoRatio = 1.0;
      updateUI();
    });
  }

  preloadCCTVFeeds() {
    // Retained for backwards-compatibility
  }

  setupStaticCanvas() {
    const canvas = document.getElementById('cctv-static-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const w = 320;
    const h = 240;
    canvas.width = w;
    canvas.height = h;

    const imgData = ctx.createImageData(w, h);
    const data32 = new Uint32Array(imgData.data.buffer);
    const totalPixels = w * h;

    // Precomputed CRT grayscale palette for maximum performance
    const palette = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      palette[i] = 0xFF000000 | (i << 16) | (i << 8) | i;
    }

        // Precomputed subtle CRT sensor grain frames for normal mode (eliminates 150k+ Math.random calls per frame)
    const normalGrainFrames = [];
    for (let f = 0; f < 4; f++) {
      const gBuf = new Uint32Array(totalPixels);
      for (let i = 0; i < totalPixels; i++) {
        const v = (Math.random() * 255) | 0;
        const a = (Math.random() * 30 + 8) | 0;
        gBuf[i] = (a << 24) | (v << 16) | (v << 8) | v;
      }
      normalGrainFrames.push(gBuf);
    }
    let normalGrainIdx = 0;

    let lastDraw = 0;
    let rollBarY = 0;

    const renderStatic = (now) => {
      if (this.isCCTVOpen && (now - lastDraw > 24)) { // ~40 FPS authentic CRT refresh
        lastDraw = now;

        const isSignalLoss = this.cctvLossOfSignal || (this.cameraErrorTimers && (this.cameraErrorTimers[this.activeCameraId] || 0) > 0);

        if (isSignalLoss) {
          // --- FULL ANALOG TV LOSS-OF-SIGNAL SNOW ---
          if (!canvas.classList.contains('loss-of-signal')) {
            canvas.classList.add('loss-of-signal');
          }

          // Advance rolling 60Hz AC hum bar (sinusoidal analog brightness wave)
          rollBarY = (rollBarY + 3.8) % h;
          const rollBar2Y = (rollBarY + h * 0.52) % h;

          // Horizontal tracking sync tear (jittering RF sync drift bands)
          const hasTear = Math.random() < 0.88;
          const tearY = (Math.random() * h) | 0;
          const tearH = ((Math.random() * 26) + 8) | 0;
          const tearShift = ((Math.random() - 0.5) * 40) | 0;

          // Occasional horizontal scanline blackout/dropout line
          const dropoutY = Math.random() < 0.3 ? ((Math.random() * h) | 0) : -1;

          for (let y = 0; y < h; y++) {
            const isTear = hasTear && (y >= tearY && y < tearY + tearH);
            const isDropout = (y === dropoutY || y === dropoutY + 1);
            const shift = isTear ? tearShift : 0;

            // Rolling AC hum bar modulation
            const dist1 = Math.abs(y - rollBarY);
            const dist2 = Math.abs(y - rollBar2Y);
            const humMod = (dist1 < 32 ? (32 - dist1) * 2.2 : 0) + (dist2 < 22 ? -(22 - dist2) * 2.0 : 0);

            for (let x = 0; x < w; x++) {
              const srcX = Math.max(0, Math.min(w - 1, x + shift));
              const idx = y * w + srcX;

              if (isDropout) {
                data32[idx] = 0xFF0A0A0A; // Scanline dropout
              } else {
                // High-contrast snowy distribution (authentic analog TV RF thermal noise)
                const rnd = Math.random();
                let lum;
                if (rnd < 0.42) {
                  lum = (Math.random() * 40) | 0; // Dark pits
                } else if (rnd < 0.72) {
                  lum = ((Math.random() * 65) + 60) | 0; // Phosphor mid-tones
                } else {
                  lum = ((Math.random() * 95) + 160) | 0; // Blinding white snow
                }

                // Add rolling hum bar & clamp
                const finalLum = Math.max(0, Math.min(255, (lum + humMod) | 0));
                data32[idx] = palette[finalLum];
              }
            }
          }
        } else {
          // --- LIVE CCTV NORMAL MODE (Subtle CRT Sensor Grain) ---
          if (canvas.classList.contains('loss-of-signal')) {
            canvas.classList.remove('loss-of-signal');
          }
          data32.set(normalGrainFrames[normalGrainIdx % 4]);
          normalGrainIdx++;
        }
        }

        ctx.putImageData(imgData, 0, 0);

        // Sync with desk 3D CRT monitor during loss of signal
        if (this.world && this.world.nodes && this.world.nodes.crtTvScreenMat && isSignalLoss) {
          if (!this._staticCanvasTex) {
            this._staticCanvasTex = new THREE.CanvasTexture(canvas);
          }
          this._staticCanvasTex.needsUpdate = true;
          this.world.nodes.crtTvScreenMat.map = this._staticCanvasTex;
          this.world.nodes.crtTvScreenMat.needsUpdate = true;
        }
      }
      requestAnimationFrame(renderStatic);
    };
    requestAnimationFrame(renderStatic);
  }

  // --- ANALOG TV LOSS-OF-SIGNAL GLITCH SYSTEM (POST-JUMPSCARE VHS/CRT SEVER) ---
  setupAnalogTvGlitch() {
    this.analogCanvas = document.getElementById('analog-tv-canvas');
    if (!this.analogCanvas) return;
    this.analogCtx = this.analogCanvas.getContext('2d', { alpha: false });
    this.analogWidth = 320;
    this.analogHeight = 240;
    this.analogCanvas.width = this.analogWidth;
    this.analogCanvas.height = this.analogHeight;
    this.analogImgData = this.analogCtx.createImageData(this.analogWidth, this.analogHeight);
    this.analogGlitchActive = false;
    this._analogGlitchRaf = null;
    this._gameOverModalTimer = null;
  }

  triggerAnalogLossOfSignal(reason = 'ANOMALY INFILTRATION') {
    if (this.analogGlitchActive) return;
    this.analogGlitchActive = true;

    const glitchEl = document.getElementById('analog-tv-glitch');
    if (glitchEl) {
      glitchEl.classList.remove('hidden');
      glitchEl.classList.add('active');
    }

    // Play synthesized vintage CRT TV static hiss with 60Hz hum & crackles
    if (window.Sound && typeof window.Sound.playAnalogLossOfSignal === 'function') {
      window.Sound.playAnalogLossOfSignal();
    }

    const w = this.analogWidth || 320;
    const h = this.analogHeight || 240;
    const ctx = this.analogCtx;
    const imgData = this.analogImgData;
    if (!ctx || !imgData) return;

    const data = imgData.data;
    const startTime = performance.now();
    let lastDraw = 0;

    const renderGlitch = (now) => {
      if (!this.analogGlitchActive) return;

      // Throttle to ~50-60 FPS for authentic cathode ray phosphor grain
      if (now - lastDraw > 16) {
        lastDraw = now;
        const elapsed = (now - startTime) / 1000;
        const isInitialShock = elapsed < 2.0;

        // Random horizontal tracking sync error bar
        const tearY = (Math.random() * h) | 0;
        const tearH = ((Math.random() * 28) + 6) | 0;
        const tearShift = isInitialShock ? ((Math.random() - 0.5) * 44) | 0 : ((Math.random() - 0.5) * 12) | 0;

        // Blinding phosphor flash burst or sync dropout
        const flashBurst = isInitialShock && (Math.random() < 0.14);
        const blackoutLine = Math.random() < 0.25 ? ((Math.random() * h) | 0) : -1;

        for (let y = 0; y < h; y++) {
          const isTear = y >= tearY && y < (tearY + tearH);
          const isBlackout = (y >= blackoutLine && y < blackoutLine + 3);
          const shift = isTear ? tearShift : 0;

          for (let x = 0; x < w; x++) {
            const sampleX = Math.max(0, Math.min(w - 1, x + shift));
            const idx = (y * w + sampleX) * 4;

            if (isBlackout) {
              data[idx] = 10;
              data[idx + 1] = 10;
              data[idx + 2] = 12;
            } else if (flashBurst) {
              const b = (Math.random() * 70 + 185) | 0;
              data[idx] = b;
              data[idx + 1] = b;
              data[idx + 2] = b;
            } else {
              // Classic analog CRT static snow (distribution with dark pits and bright specs)
              const r = Math.random();
              let val;
              if (r < 0.35) {
                val = (Math.random() * 45) | 0; // Dark shadows
              } else if (r < 0.75) {
                val = (Math.random() * 140 + 80) | 0; // Mid-grey grain
              } else {
                val = (Math.random() * 55 + 200) | 0; // Pure white snow
              }

              // Subtle chromatic phosphor tinting
              data[idx] = Math.min(255, val + ((Math.random() * 18 - 9) | 0));
              data[idx + 1] = Math.min(255, val + ((Math.random() * 12 - 6) | 0));
              data[idx + 2] = Math.min(255, val + ((Math.random() * 24 - 8) | 0));
            }
            data[idx + 3] = 255;
          }
        }

        ctx.putImageData(imgData, 0, 0);
      }

      this._analogGlitchRaf = requestAnimationFrame(renderGlitch);
    };

    if (this._analogGlitchRaf) cancelAnimationFrame(this._analogGlitchRaf);
    this._analogGlitchRaf = requestAnimationFrame(renderGlitch);

    // After 2.0s of raw loss-of-signal shock, reveal the Game Over modal on top of the static
    if (this._gameOverModalTimer) clearTimeout(this._gameOverModalTimer);
    this._gameOverModalTimer = setTimeout(() => {
      if (!this.gameOver) return;
      const goScreen = document.getElementById('gameover-screen');
      const goReason = document.getElementById('gameover-reason-val');
      if (goReason) goReason.textContent = reason;
      if (goScreen) goScreen.classList.remove('hidden');
    }, 2000);
  }

  stopAnalogLossOfSignal() {
    this.analogGlitchActive = false;
    if (this._analogGlitchRaf) {
      cancelAnimationFrame(this._analogGlitchRaf);
      this._analogGlitchRaf = null;
    }
    if (this._gameOverModalTimer) {
      clearTimeout(this._gameOverModalTimer);
      this._gameOverModalTimer = null;
    }
    const glitchEl = document.getElementById('analog-tv-glitch');
    if (glitchEl) {
      glitchEl.classList.remove('active');
      glitchEl.classList.add('hidden');
    }
    if (window.Sound && typeof window.Sound.stopAnalogLossOfSignal === 'function') {
      window.Sound.stopAnalogLossOfSignal();
    }
  }

  isMobileDevice() {
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || (navigator.maxTouchPoints > 1 && window.innerWidth <= 1024)
      || (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  }

  getOptimalPixelRatio() {
    if (this.isMobileDevice()) {
      // For mobile GPUs like Mali-G57 (Helio G99), cap internal buffer to 1.0 (720p)
      // This reduces fragment shading fill-rate load by up to 75% compared to 2.0x supersampling!
      return Math.min(window.devicePixelRatio || 1, 1.0);
    }
    return Math.min(window.devicePixelRatio || 1, 1.75);
  }

  setupThreeJS() {
    const width = window.innerWidth;
    const height = window.innerHeight;

        const isMobile = this.isMobileDevice();
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !isMobile, // Disable 4x MSAA on high-density mobile screens (saves ~35% bandwidth)
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.getOptimalPixelRatio());
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = isMobile ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06080e);
    this.scene.fog = new THREE.FogExp2(0x06080e, 0.035);

    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    this.camera.position.set(0, 1.45, 0); // Player seated at executive desk

    this.world = new WorldBuilder(this.scene);
    this.world.buildAll();

    // Preload photorealistic window hallway view textures (Gemini Flash Image)
    const texLoader = new THREE.TextureLoader();
    this.windowTextures = {
      empty: texLoader.load('assets/office/window_hallway_empty.jpg'),
      angel_far: texLoader.load('assets/office/window_hallway_angel_far.jpg'),
      angel_close: texLoader.load('assets/office/window_hallway_angel.jpg'),
      saint_far: texLoader.load('assets/office/window_hallway_saint_far.jpg'),
      saint_close: texLoader.load('assets/office/window_hallway_saint.jpg'),
      angel: texLoader.load('assets/office/window_hallway_angel.jpg'),
      saint: texLoader.load('assets/office/window_hallway_saint.jpg'),
      mary: texLoader.load('assets/office/window_hallway_mary.jpg')
    };

    this.positionStatuesInitial();
    this.updateWindowHallwayView();
  }

  // --- STATUE PLACEMENT, STAGES & CAMERA MOTION ERROR SYSTEM ---
  positionStatuesInitial() {
    this.cameraErrorTimers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.clearAngelDoorRetreatTimer();
    this.clearSaintDoorRetreatTimer();
    this.clearMournerVentRetreatTimer();
    this._angelStage3ArrivalTime = 0;
    this._saintStage3ArrivalTime = 0;
    this._mournerStage3ArrivalTime = 0;
    this._angelBanishedOnClose = false;
    this._saintBanishedOnClose = false;
    this._mournerBanishedOnClose = false;
    this._lastAngelStage = undefined;
    this._lastSaintStage = undefined;
    this._lastMournerStage = undefined;
    this.aiConfig.weepingAngel.awakened = false;
    this.aiConfig.haloedSaint.awakened = false;
    this.aiConfig.veiledMourner.awakened = false;
    this.setAngelStage(0);
    this.setSaintStage(0);
    this.setMournerStage(0);
    this._lastAngelStage = 0;
    this._lastSaintStage = 0;
    this._lastMournerStage = 0;
  }

  startAngelDoorRetreatTimer() {
    this.clearAngelDoorRetreatTimer();
    this.aiConfig.weepingAngel.attackTimer = 0;
    this._angelDoorRetreatTimer = setTimeout(() => {
      this._angelDoorRetreatTimer = null;
      if (this.isLeftDoorClosed && this.aiConfig.weepingAngel.stage === 3) {
        this.vibrate([80, 60, 120]);
        window.Sound.playStoneGrind(0.85);
        window.Sound.playLeftFootstep(0.65);
        this.banishAngel();
      }
    }, 3200);
  }

  clearAngelDoorRetreatTimer() {
    if (this._angelDoorRetreatTimer) {
      clearTimeout(this._angelDoorRetreatTimer);
      this._angelDoorRetreatTimer = null;
    }
  }

  startSaintDoorRetreatTimer() {
    this.clearSaintDoorRetreatTimer();
    this.aiConfig.haloedSaint.attackTimer = 0;
    this._saintDoorRetreatTimer = setTimeout(() => {
      this._saintDoorRetreatTimer = null;
      if (this.isLeftDoorClosed && this.aiConfig.haloedSaint.stage === 3) {
        this.vibrate([100, 70, 140]);
        window.Sound.playStoneGrind(0.85);
        window.Sound.playLeftFootstep(0.65);
        this.banishSaint();
      }
    }, 3200);
  }

  clearSaintDoorRetreatTimer() {
    if (this._saintDoorRetreatTimer) {
      clearTimeout(this._saintDoorRetreatTimer);
      this._saintDoorRetreatTimer = null;
    }
  }

  startMournerVentRetreatTimer() {
    this.clearMournerVentRetreatTimer();
    this.aiConfig.veiledMourner.attackTimer = 0;
    this._mournerVentRetreatTimer = setTimeout(() => {
      this._mournerVentRetreatTimer = null;
      if (this.isVentClosed && this.aiConfig.veiledMourner.stage === 3) {
        this.vibrate([60, 50, 90]);
        window.Sound.playStoneGrind(0.7);
        window.Sound.playVentSound(false);
        this.banishMourner();
      }
    }, 3000);
  }

  clearMournerVentRetreatTimer() {
    if (this._mournerVentRetreatTimer) {
      clearTimeout(this._mournerVentRetreatTimer);
      this._mournerVentRetreatTimer = null;
    }
  }

  camLocToId(loc) {
    if (loc === 'CAM_01') return 1;
    if (loc === 'CAM_02') return 2;
    if (loc === 'CAM_03') return 3;
    if (loc === 'CAM_04') return 4;
    if (loc === 'CAM_05') return 5;
    return null;
  }

  triggerCameraMotionError(camId, duration = 3.2) {
    if (!camId || camId < 1 || camId > 5) return;
    this.cameraErrorTimers[camId] = duration;

    // If player is currently viewing this camera on CCTV, immediately trigger violent static burst & error!
    if (this.isCCTVOpen && this.activeCameraId === camId) {
      window.Sound.playCameraErrorStatic(duration, 0.45);
      this.updateCCTVFeed();
    }
  }

  handleEntityMovement(fromLoc, toLoc, entityName) {
    const fromCam = this.camLocToId(fromLoc);
    const toCam = this.camLocToId(toLoc);

    const affected = new Set();
    if (fromCam) affected.add(fromCam);
    if (toCam) affected.add(toCam);

    affected.forEach(camId => {
      this.triggerCameraMotionError(camId, 3.2);
    });
  }

  handleEntityStageMovement(fromLoc, toLoc, entityName, oldStage, newStage) {
    const fromCam = this.camLocToId(fromLoc);
    const toCam = this.camLocToId(toLoc);

    const affected = new Set();
    if (fromCam) affected.add(fromCam);
    if (toCam) affected.add(toCam);

    affected.forEach(camId => {
      this.triggerCameraMotionError(camId, 3.2);
    });
  }

  onCameraErrorResolved(camId) {
    this.cctvLossOfSignal = false;
    if (!this.isCCTVOpen || this.activeCameraId !== camId) return;
    const errorScreen = document.getElementById('cctv-error-screen');
    const anomalyBurst = document.getElementById('cctv-anomaly-burst');
    const imgEl = document.getElementById('cctv-screen-img');
    const recDot = document.getElementById('cctv-rec-dot');
    const recText = document.getElementById('cctv-rec-status-text');
    const statusBadge = document.getElementById('cctv-status-badge');

    if (errorScreen) errorScreen.classList.add('hidden');
    if (anomalyBurst) anomalyBurst.classList.remove('active');
    if (imgEl) imgEl.classList.remove('cam-error-hidden');
    if (recDot) {
      recDot.classList.remove('error-mode');
      recDot.classList.remove('no-signal-mode');
    }
    if (recText) recText.textContent = 'LIVE';
    if (statusBadge) statusBadge.textContent = '1080p HD FEED  |  ENCRYPTION: SECURE';

    window.Sound.playCameraBeep();
    this.updateCCTVFeed();
  }

  setAngelStage(stage) {
    const angel = this.world?.statues?.weepingAngel;
    if (!angel) return;
    const prevLoc = this.aiConfig.weepingAngel.location;
    const prevStage = this.aiConfig.weepingAngel.stage;
    this.aiConfig.weepingAngel.stage = stage;
    if (stage === 0) this.aiConfig.weepingAngel.awakened = false;

    // Strict Unique Location mapping (Angel is only ever in ONE place)
    const locMap = { 0: 'CAM_01', 1: 'CAM_05', 2: 'CAM_05', 3: 'LEFT_DOOR', 4: 'OFFICE' };
    const newLoc = locMap[stage] || 'CAM_01';
    this.aiConfig.weepingAngel.location = newLoc;

    if (this._lastAngelStage !== undefined && (prevStage !== stage || prevLoc !== newLoc)) {
      this.handleEntityStageMovement(prevLoc, newLoc, 'weepingAngel', prevStage, stage);
    }
    this._lastAngelStage = stage;

    switch (stage) {
      case 0: // CAM 01 - Sanctuary Altar (Home base)
        angel.position.set(0, 0.88, -34);
        angel.rotation.set(0, 0, 0);
        angel.visible = true;
        break;
      case 1: // CAM 05 - Cloister Hallway approach
      case 2: // CAM 05 - Narthex Corridor outside office window
        angel.visible = false; // Photorealistically displayed on windowBackdrop!
        break;
      case 3: // Exactly outside the Left Arched Church Doorway threshold in the outer cloister hallway!
        angel.position.set(-4.20, 0.0, -0.60);
        angel.rotation.set(0, Math.PI * 0.46, 0); // Directly facing through the open doorway toward player desk
        angel.visible = true;
        this._angelStage3ArrivalTime = Date.now();
        break;
      case 4: // Inside Office - Attack position
        angel.position.set(-1.2, 0.0, -0.8);
        angel.rotation.set(0, Math.PI * 0.35, 0);
        angel.visible = true;
        break;
    }

    this.updateWindowHallwayView();

    if (this.isCCTVOpen) {
      this.updateCCTVFeed();
    }
  }

  setSaintStage(stage) {
    const saint = this.world?.statues?.haloedSaint;
    if (!saint) return;
    const prevLoc = this.aiConfig.haloedSaint.location;
    const prevStage = this.aiConfig.haloedSaint.stage;
    this.aiConfig.haloedSaint.stage = stage;
    if (stage === 0) this.aiConfig.haloedSaint.awakened = false;

    // Strict Unique Location mapping (Saint is only ever in ONE place)
    const locMap = { 0: 'CAM_03', 1: 'CAM_05', 2: 'CAM_05', 3: 'LEFT_DOOR', 4: 'OFFICE' };
    const newLoc = locMap[stage] || 'CAM_03';
    this.aiConfig.haloedSaint.location = newLoc;

    if (this._lastSaintStage !== undefined && (prevStage !== stage || prevLoc !== newLoc)) {
      this.handleEntityStageMovement(prevLoc, newLoc, 'haloedSaint', prevStage, stage);
    }
    this._lastSaintStage = stage;

    switch (stage) {
      case 0: // CAM 03 - Reconciliation Chapel (Home base)
        saint.position.set(-35, 0.0, -31);
        saint.rotation.set(0, 0, 0);
        saint.visible = true;
        break;
      case 1: // CAM 05 - Cloister Hallway approach
      case 2: // CAM 05 - Right outside observation window
        saint.visible = false; // Photorealistically displayed on windowBackdrop!
        break;
      case 3: // Exactly outside the Left Arched Church Doorway threshold in the outer cloister hallway!
        saint.position.set(-4.20, 0.0, -0.60);
        saint.rotation.set(0, Math.PI * 0.46, 0); // Directly facing through the open doorway toward player desk
        saint.visible = true;
        this._saintStage3ArrivalTime = Date.now();
        break;
      case 4: // Inside Office - Attack position
        saint.position.set(-0.8, 0.0, -0.7);
        saint.rotation.set(0, Math.PI * 0.2, 0);
        saint.visible = true;
        break;
    }

    this.updateWindowHallwayView();

    if (this.isCCTVOpen) {
      this.updateCCTVFeed();
    }
  }

  setMournerStage(stage) {
    const mourner = this.world?.statues?.veiledMourner;
    if (!mourner) return;
    const prevLoc = this.aiConfig.veiledMourner.location;
    const prevStage = this.aiConfig.veiledMourner.stage;
    this.aiConfig.veiledMourner.stage = stage;
    if (stage === 0) this.aiConfig.veiledMourner.awakened = false;

    // Strict Unique Location mapping (Mourner is only ever in ONE place)
    const locMap = { 0: 'CAM_02', 1: 'CAM_04', 2: 'CAM_04', 3: 'RIGHT_VENT', 4: 'OFFICE' };
    const newLoc = locMap[stage] || 'CAM_02';
    this.aiConfig.veiledMourner.location = newLoc;

    if (this._lastMournerStage !== undefined && (prevStage !== stage || prevLoc !== newLoc)) {
      this.handleEntityStageMovement(prevLoc, newLoc, 'veiledMourner', prevStage, stage);
    }
    this._lastMournerStage = stage;

    switch (stage) {
      case 0: // CAM 02 - Memorial Columbarium Stand (Home base)
        mourner.position.set(38, 0.45, -32);
        mourner.rotation.set(0, -Math.PI / 3, 0);
        mourner.visible = true;
        break;
      case 1: // CAM 04 - Entering modern HVAC Air Duct
        mourner.position.set(5.8, 0.02, 0.45);
        mourner.rotation.set(0, -Math.PI / 2, 0); // Head and crawling arms face forward towards office (-X)
        mourner.visible = true;
        break;
      case 2: // CAM 04 - Crawling deep inside HVAC Air Duct
        mourner.position.set(4.6, 0.02, 0.45);
        mourner.rotation.set(0, -Math.PI / 2, 0); // Head and crawling arms face forward towards office (-X)
        mourner.visible = true;
        break;
      case 3: // Peeking directly out of Office HVAC Vent Opening into the office!
        mourner.position.set(4.15, 0.02, 0.45);
        mourner.rotation.set(0, -Math.PI * 0.54, 0); // Head and face looking directly out of vent toward player desk
        mourner.visible = true;
        this._mournerStage3ArrivalTime = Date.now();
        break;
      case 4: // Inside Office - Attack position
        mourner.position.set(1.2, 0.0, -0.6);
        mourner.rotation.set(0, -Math.PI * 0.35, 0); // Face pointed directly at player
        mourner.visible = true;
        break;
    }

    this.updateWindowHallwayView();

    if (this.isCCTVOpen) {
      this.updateCCTVFeed();
    }
  }

  banishAngel() {
    this.clearAngelDoorRetreatTimer();
    const ai = this.aiConfig.weepingAngel;
    const prevLoc = ai.location;
    ai.stage = -1; // Banished to alternate camera (CAM_02 Crypt)
    ai.location = 'CAM_02';
    ai.awakened = false;
    ai.attackTimer = 0;
    ai.timer = 0;
    this._lastAngelStage = -1;
    this.handleEntityMovement(prevLoc, 'CAM_02', 'weepingAngel');

    const angel = this.world?.statues?.weepingAngel;
    if (angel) {
      angel.visible = false;
    }

    this.updateWindowHallwayView();
    if (this.isCCTVOpen) {
      this.updateCCTVFeed();
    }
  }

  banishSaint() {
    this.clearSaintDoorRetreatTimer();
    const ai = this.aiConfig.haloedSaint;
    const prevLoc = ai.location;
    ai.stage = -1; // Banished to alternate camera (CAM_01 Sanctuary Nave)
    ai.location = 'CAM_01';
    ai.awakened = false;
    ai.attackTimer = 0;
    ai.timer = 0;
    this._lastSaintStage = -1;
    this.handleEntityMovement(prevLoc, 'CAM_01', 'haloedSaint');

    const saint = this.world?.statues?.haloedSaint;
    if (saint) {
      saint.visible = false;
    }

    this.updateWindowHallwayView();
    if (this.isCCTVOpen) {
      this.updateCCTVFeed();
    }
  }

  banishMourner() {
    this.clearMournerVentRetreatTimer();
    const ai = this.aiConfig.veiledMourner;
    const prevLoc = ai.location;
    ai.stage = -1; // Banished to alternate camera (CAM_03 Chapel or CAM_01 Sanctuary Altar)
    const banishTarget = (Math.random() < 0.5) ? 'CAM_03' : 'CAM_01';
    ai.location = banishTarget;
    ai.awakened = false;
    ai.attackTimer = 0;
    ai.timer = 0;
    this._lastMournerStage = -1;
    this.handleEntityMovement(prevLoc, banishTarget, 'veiledMourner');

    const mourner = this.world?.statues?.veiledMourner;
    if (mourner) {
      mourner.visible = false;
    }

    this.updateWindowHallwayView();
    if (this.isCCTVOpen) {
      this.updateCCTVFeed();
    }
  }

  updateWindowHallwayView() {
    if (!this.world || !this.world.nodes || !this.world.nodes.windowBackdropMat || !this.windowTextures) return;

    const angelLoc = this.aiConfig.weepingAngel.location;
    const angelStage = this.aiConfig.weepingAngel.stage;
    const saintLoc = this.aiConfig.haloedSaint.location;
    const saintStage = this.aiConfig.haloedSaint.stage;
    const mournerLoc = this.aiConfig.veiledMourner.location;

    let targetTex = this.windowTextures.empty;
    // Multi-stage Cloister Hallway Distance Progression:
    // Priority: Stage 2 (Directly outside window in bright spotlight) > Stage 1 (Distant corridor silhouette)
    if (angelLoc === 'CAM_05' && angelStage === 2) {
      targetTex = this.windowTextures.angel_close;
    } else if (saintLoc === 'CAM_05' && saintStage === 2) {
      targetTex = this.windowTextures.saint_close;
    } else if (angelLoc === 'CAM_05' && angelStage === 1) {
      targetTex = this.windowTextures.angel_far;
    } else if (saintLoc === 'CAM_05' && saintStage === 1) {
      targetTex = this.windowTextures.saint_far;
    } else if (mournerLoc === 'CAM_05') {
      targetTex = this.windowTextures.mary;
    }

    const mat = this.world.nodes.windowBackdropMat;
    if (mat) {
      if (mat.uniforms && mat.uniforms.map) {
        if (mat.uniforms.map.value !== targetTex) {
          mat.uniforms.map.value = targetTex;
        }
      }
      if (mat.map !== targetTex) {
        mat.map = targetTex;
        mat.needsUpdate = true;
      }
    }
  }

  // --- CONTROLS & INTERACTION ---
  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Mouse look panning
    window.addEventListener('mousedown', (e) => {
      if (this.isCCTVOpen || this.gameOver || this.victory) return;
      const modal = document.getElementById('manual-modal');
      if (modal && !modal.classList.contains('hidden')) return;
      const setModal = document.getElementById('settings-modal');
      if (setModal && !setModal.classList.contains('hidden')) return;
      const optModal = document.getElementById('options-modal');
      if (optModal && !optModal.classList.contains('hidden')) return;
      if (e.target.closest('#hud-overlay') || e.target.closest('.screen-modal')) return;
      this.isMouseDown = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isCCTVOpen || this.gameOver || this.victory) return;
      const modal = document.getElementById('manual-modal');
      if (modal && !modal.classList.contains('hidden')) return;
      const setModal = document.getElementById('settings-modal');
      if (setModal && !setModal.classList.contains('hidden')) return;
      const optModal = document.getElementById('options-modal');
      if (optModal && !optModal.classList.contains('hidden')) return;

      if (this.isMouseDown) {
        // High-sensitivity mouse drag
        const deltaX = e.clientX - this.prevMouseX;
        const deltaY = e.clientY - this.prevMouseY;
        this.targetYaw -= deltaX * 0.0075;
        this.targetPitch -= deltaY * 0.0045;
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
      } else {
        // Natural FNAF-style screen cursor tracking: moving cursor left/right turns view directly
        const normX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 (left) to +1 (right)
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;
        this.targetYaw = -normX * (Math.PI * 0.50); // Full 90° pan across door, center window, and vent!
        this.targetPitch = -normY * (Math.PI * 0.12);
      }

      this.targetYaw = THREE.MathUtils.clamp(this.targetYaw, -Math.PI * 0.52, Math.PI * 0.52);
      this.targetPitch = THREE.MathUtils.clamp(this.targetPitch, -Math.PI * 0.12, Math.PI * 0.12);
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    // Touch look panning for mobile & tablet screens
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchActive = false;

    window.addEventListener('touchstart', (e) => {
      if (this.isCCTVOpen || this.gameOver || this.victory) return;
      const modal = document.getElementById('manual-modal');
      if (modal && !modal.classList.contains('hidden')) return;
      const setModal = document.getElementById('settings-modal');
      if (setModal && !setModal.classList.contains('hidden')) return;
      const optModal = document.getElementById('options-modal');
      if (optModal && !optModal.classList.contains('hidden')) return;
      if (e.target.closest('#hud-overlay') || e.target.closest('.screen-modal') || e.target.closest('button')) return;

      if (e.touches && e.touches.length === 1) {
        isTouchActive = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isTouchActive || this.isCCTVOpen || this.gameOver || this.victory) return;
      if (e.touches && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        this.targetYaw -= deltaX * 0.0075;
        this.targetPitch -= deltaY * 0.0045;
        this.targetYaw = THREE.MathUtils.clamp(this.targetYaw, -Math.PI * 0.52, Math.PI * 0.52);
        this.targetPitch = THREE.MathUtils.clamp(this.targetPitch, -Math.PI * 0.12, Math.PI * 0.12);
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isTouchActive = false;
    }, { passive: true });
    window.addEventListener('touchcancel', () => {
      isTouchActive = false;
    }, { passive: true });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.keysDown[e.key.toLowerCase()] = true;

      // Handle interactive key rebinding inside Settings modal
      if (this.activeRebindingAction) {
        e.preventDefault();
        e.stopPropagation();
        this.saveReboundKey(this.activeRebindingAction, e.key === ' ' ? 'Space' : e.key);
        return;
      }

      // Enter key starts shift from menu
      const fnafMenu = document.getElementById('fnaf-main-menu');
      if (!this.isRunning && fnafMenu && !fnafMenu.classList.contains('hidden')) {
        if (e.code === 'Enter') {
          e.preventDefault();
          this.startNightWithTransition(this.currentNight);
          return;
        }
      }

      const k = e.key.toLowerCase();
      const isKey = (action) => {
        const bind = this.keyBindings[action];
        if (!bind) return false;
        if ((bind === ' ' || bind.toLowerCase() === 'space') && e.code === 'Space') return true;
        return k === bind.toLowerCase();
      };

      if (k === 'm') {
        this.muteCassette();
      }

      if (isKey('cctvToggle')) {
        e.preventDefault();
        this.toggleCCTV();
        return;
      }

      if (this.isCCTVOpen) {
        if (e.key === '1') this.switchCamera(1);
        if (e.key === '2') this.switchCamera(2);
        if (e.key === '3') this.switchCamera(3);
        if (e.key === '4') this.switchCamera(4);
        if (e.key === '5') this.switchCamera(5);
        if (isKey('nightVision')) this.toggleNightVision();
      } else if (this.isRunning && !this.gameOver && !this.victory) {
        // Quick Commands for Office Doors & Lights using customizable key mapping
        if (isKey('doorToggle')) this.toggleLeftDoor();
        if (isKey('doorLight')) this.toggleLeftDoorLight();
        if (isKey('windowSpot')) this.toggleWindowSpot();
        if (isKey('ventToggle')) this.toggleVent();
        if (isKey('ventLight')) this.toggleVentLight();
      }

      // Escape key handles modals, CCTV, and in-game pause menu with sound controls
      if (e.key === 'Escape') {
        const customModal = document.getElementById('custom-night-modal');
        if (customModal && !customModal.classList.contains('hidden')) {
          this.toggleCustomNightModal(false);
          return;
        }
        const optModal = document.getElementById('options-modal') || document.getElementById('settings-modal');
        if (optModal && !optModal.classList.contains('hidden')) {
          this.toggleOptionsModal(false);
          return;
        }
        const modal = document.getElementById('manual-modal');
        if (modal && !modal.classList.contains('hidden')) {
          this.toggleManualModal(false);
          return;
        }
        if (this.isCCTVOpen) {
          this.toggleCCTV();
          return;
        }
        if (this.isRunning && !this.gameOver && !this.victory) {
          this.toggleOptionsModal(true, 'tab-audio');
          return;
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown[e.key.toLowerCase()] = false;
    });

    // Father Thomas Cassette Mute Button
    document.getElementById('btn-mute-cassette')?.addEventListener('click', () => this.muteCassette());

    // Modern Pushbutton Wall Controls
    document.getElementById('btn-door-toggle')?.addEventListener('click', () => this.toggleLeftDoor());
    document.getElementById('btn-door-light')?.addEventListener('click', () => this.toggleLeftDoorLight());
    document.getElementById('btn-vent-toggle')?.addEventListener('click', () => this.toggleVent());
    document.getElementById('btn-vent-light')?.addEventListener('click', () => this.toggleVentLight());
    document.getElementById('btn-window-spot')?.addEventListener('click', () => this.toggleWindowSpot());

    // CCTV Trigger Bar & Close Button
    document.getElementById('cctv-flip-bar')?.addEventListener('click', () => this.toggleCCTV());
    document.getElementById('cctv-flip-down-btn')?.addEventListener('click', () => this.toggleCCTV());

    // CCTV Minimap camera buttons
    for (let c = 1; c <= 5; c++) {
      document.getElementById(`cam-btn-${c}`)?.addEventListener('click', () => this.switchCamera(c));
    }

    // CCTV IR Night Vision Button
    document.getElementById('btn-cctv-light')?.addEventListener('click', () => {
      window.Sound.playLightClick();
      this.toggleNightVision();
    });

    // Game Over & Victory restart buttons
    document.getElementById('btn-retry-game')?.addEventListener('click', () => this.restartGame());
    document.getElementById('btn-next-night')?.addEventListener('click', () => this.advanceNight());

    // Raycast interaction with 3D Door / Damper / LCD Screen
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    this.canvas.addEventListener('click', (e) => {
      if (this.isCCTVOpen || this.gameOver || this.victory) return;
      mouseCoord.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseCoord.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, this.camera);
      const intersects = raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        let parent = hit.parent;

        // Click Arched Church Door
        if (parent === this.world.nodes.doorPivot || hit === this.world.nodes.doorPivot || hit.material === this.world.materials?.archedDoor) {
          this.toggleLeftDoor();
          return;
        }

        // Click Industrial Ventilation Grille / Shutter
        if (parent === this.world.nodes.ventShutter || hit === this.world.nodes.ventShutter || hit.material === this.world.materials?.ventGrille) {
          this.toggleVent();
          return;
        }

        // Click Retro CRT TV Monitor on desk
        if (hit.material === this.world.nodes.crtTvScreenMat || hit.material === this.world.nodes.crtScreenMat || (hit.position.x > 0.3 && hit.position.y > 0.7 && hit.position.z > -0.5)) {
          this.toggleCCTV();
          return;
        }

        // Click Tactical Flashlight on desk
        if (hit.position.x < -0.3 && hit.position.x > -0.65 && hit.position.y > 0.75 && hit.position.y < 0.95 && hit.position.z > 0.0) {
          this.toggleWindowSpot();
          return;
        }
      }
    });
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (this.camera && this.renderer) {
      this.camera.aspect = width / height;
      // Adjust FOV for portrait mobile screens so security office elements remain in view
      if (width < height) {
        this.camera.fov = 76; // Wider vertical angle for portrait phones
      } else {
        this.camera.fov = 65;
      }
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(this.getOptimalPixelRatio());
    }
  }

  // --- CLASSIC FNAF MAIN MENU SYSTEM ---
  setupFnafMenu() {
    this.setupMenuStaticCanvas();
    this.setupMenuStatueTwitch();

    // Start menu ambient drone and background music upon interaction with page
    const tryStartMenuSound = () => {
      const preloader = document.getElementById('game-preloader');
      if (preloader && preloader.style.display !== 'none' && !preloader.classList.contains('fade-out')) {
        return; // Wait until user clicks "ENTER SECURITY TERMINAL" on preloader
      }
      window.Sound.init();
      window.Sound.resume();
      if (this.isRunning || this.isNightTransitioning) {
        window.Sound.startGameMusic();
      } else {
        window.Sound.startLobbyMusic();
        if (!this._menuAudioStarted) {
          this._menuAudioStarted = true;
          window.Sound.startMenuDrone();
        }
      }
    };
    window.addEventListener('click', tryStartMenuSound, { once: false });
    window.addEventListener('keydown', tryStartMenuSound, { once: false });
    window.addEventListener('pointerdown', tryStartMenuSound, { once: false });
    window.addEventListener('touchstart', tryStartMenuSound, { once: false });
    window.addEventListener('mousemove', tryStartMenuSound, { once: true });

    // Menu option buttons
    const btnContinue = document.getElementById('btn-menu-continue');
    const btnNewGame = document.getElementById('btn-menu-newgame');
    const btnNight6 = document.getElementById('btn-menu-night6');
    const btnCustomNight = document.getElementById('btn-menu-customnight');
    const btnNightSelect = document.getElementById('btn-menu-nightselect');
    const nightPicker = document.getElementById('menu-night-picker');
    const btnManual = document.getElementById('btn-menu-manual');
    const btnCloseManual = document.getElementById('btn-close-manual');
    const btnFullscreen = document.getElementById('btn-menu-fullscreen');
    const btnGameoverMenu = document.getElementById('btn-gameover-menu');
    const btnVictoryMenu = document.getElementById('btn-victory-menu');

    // Button sound effects on hover
    document.querySelectorAll('.fnaf-menu-item, .night-chip, .star-icon').forEach(el => {
      el.addEventListener('mouseenter', () => {
        window.Sound.playMenuBlip();
      });
    });

    btnContinue?.addEventListener('click', (e) => {
      if (e) e.stopPropagation();
      this.isCustomNight = false;
      this.startNightWithTransition(this.currentNight);
    });

    btnNewGame?.addEventListener('click', (e) => {
      if (e) e.stopPropagation();
      this.isCustomNight = false;
      this.currentNight = 1;
      this.updateNightBadge();
      this.startNightWithTransition(1);
    });

    btnNight6?.addEventListener('click', (e) => {
      if (e) e.stopPropagation();
      this.isCustomNight = false;
      this.currentNight = 6;
      this.updateNightBadge();
      this.startNightWithTransition(6);
    });

    btnCustomNight?.addEventListener('click', () => {
      this.toggleCustomNightModal(true);
    });

    btnNightSelect?.addEventListener('click', () => {
      if (nightPicker) nightPicker.classList.toggle('hidden');
      window.Sound.playMenuBlip();
    });

    document.querySelectorAll('.night-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        const night = parseInt(e.currentTarget.dataset.night, 10);
        document.querySelectorAll('.night-chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.isCustomNight = false;
        this.currentNight = night;
        this.updateNightBadge();
        this.startNightWithTransition(night);
      });
    });

    const btnOptions = document.getElementById('btn-menu-options');
    btnOptions?.addEventListener('click', () => {
      this.toggleOptionsModal(true);
    });

    const modal = document.getElementById('manual-modal');
    const btnModalX = document.getElementById('btn-modal-x');

    btnManual?.addEventListener('click', () => {
      this.toggleOptionsModal(true, 'tab-howtoplay');
    });

    btnCloseManual?.addEventListener('click', () => {
      this.toggleOptionsModal(false);
    });

    btnModalX?.addEventListener('click', () => {
      this.toggleOptionsModal(false);
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.toggleOptionsModal(false);
      }
    });

    // Interactive Tab buttons inside manual
    document.querySelectorAll('.manual-nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        window.Sound.playMenuBlip();
        document.querySelectorAll('.manual-nav-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const targetId = e.currentTarget.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    btnFullscreen?.addEventListener('click', () => {
      window.Sound.playMenuBlip();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    btnGameoverMenu?.addEventListener('click', () => {
      this.returnToMainMenu();
    });

    btnVictoryMenu?.addEventListener('click', () => {
      this.returnToMainMenu();
    });
  }

  loadStars() {
    try {
      const saved = localStorage.getItem('fnaf_church_stars');
      if (saved) {
        this.stars = Object.assign(this.stars, JSON.parse(saved));
      }
    } catch (e) {}
    this.updateStarsUI();
  }

  saveStars() {
    try {
      localStorage.setItem('fnaf_church_stars', JSON.stringify(this.stars));
    } catch (e) {}
  }

  updateStarsUI() {
    const s5 = document.getElementById('star-5');
    const s6 = document.getElementById('star-6');
    const s20 = document.getElementById('star-20');
    if (s5) s5.classList.toggle('hidden', !this.stars.night5);
    if (s6) s6.classList.toggle('hidden', !this.stars.night6);
    if (s20) s20.classList.toggle('hidden', !this.stars.mode20);
  }

  setupCustomNightModal() {
    const modal = document.getElementById('custom-night-modal');
    const btnCustomX = document.getElementById('btn-custom-x');
    const btnCustomBack = document.getElementById('btn-custom-back');
    const btnCustomStart = document.getElementById('btn-custom-start');

    const updateDisplay = () => {
      const angelEl = document.getElementById('ai-val-angel');
      const saintEl = document.getElementById('ai-val-saint');
      const mournerEl = document.getElementById('ai-val-mourner');
      if (angelEl) angelEl.textContent = this.customAI.angel;
      if (saintEl) saintEl.textContent = this.customAI.saint;
      if (mournerEl) mournerEl.textContent = this.customAI.mourner;
    };

    updateDisplay();

    // Spinner adjustments (+/-)
    const spinMap = {
      'btn-angel-dec': () => { this.customAI.angel = Math.max(0, this.customAI.angel - 1); },
      'btn-angel-inc': () => { this.customAI.angel = Math.min(20, this.customAI.angel + 1); },
      'btn-saint-dec': () => { this.customAI.saint = Math.max(0, this.customAI.saint - 1); },
      'btn-saint-inc': () => { this.customAI.saint = Math.min(20, this.customAI.saint + 1); },
      'btn-mourner-dec': () => { this.customAI.mourner = Math.max(0, this.customAI.mourner - 1); },
      'btn-mourner-inc': () => { this.customAI.mourner = Math.min(20, this.customAI.mourner + 1); },
    };

    for (const [id, fn] of Object.entries(spinMap)) {
      document.getElementById(id)?.addEventListener('click', () => {
        window.Sound.playMenuBlip();
        fn();
        updateDisplay();
      });
    }

    // Quick Presets
    document.getElementById('preset-all-0')?.addEventListener('click', () => {
      window.Sound.playMenuBlip();
      this.customAI.angel = 0;
      this.customAI.saint = 0;
      this.customAI.mourner = 0;
      updateDisplay();
    });

    document.getElementById('preset-all-5')?.addEventListener('click', () => {
      window.Sound.playMenuBlip();
      this.customAI.angel = 5;
      this.customAI.saint = 5;
      this.customAI.mourner = 5;
      updateDisplay();
    });

    document.getElementById('preset-all-10')?.addEventListener('click', () => {
      window.Sound.playMenuBlip();
      this.customAI.angel = 10;
      this.customAI.saint = 10;
      this.customAI.mourner = 10;
      updateDisplay();
    });

    document.getElementById('preset-all-20')?.addEventListener('click', () => {
      window.Sound.playMenuBlip();
      this.customAI.angel = 20;
      this.customAI.saint = 20;
      this.customAI.mourner = 20;
      updateDisplay();
    });

    btnCustomX?.addEventListener('click', () => {
      this.toggleCustomNightModal(false);
    });

    btnCustomBack?.addEventListener('click', () => {
      this.toggleCustomNightModal(false);
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.toggleCustomNightModal(false);
      }
    });

    btnCustomStart?.addEventListener('click', () => {
      this.toggleCustomNightModal(false);
      this.isCustomNight = true;
      this.startNightWithTransition(7);
    });
  }

  toggleCustomNightModal(forceState = null) {
    const modal = document.getElementById('custom-night-modal');
    if (!modal) return;
    const isCurrentlyHidden = modal.classList.contains('hidden');
    const shouldOpen = forceState !== null ? forceState : isCurrentlyHidden;
    if (shouldOpen) {
      modal.classList.remove('hidden');
      window.Sound.playMenuBlip();
    } else {
      modal.classList.add('hidden');
      window.Sound.playMenuBlip();
    }
  }

  updateNightBadge() {
    const badge = document.getElementById('menu-night-badge');
    if (badge) {
      if (this.isCustomNight) badge.textContent = 'CUSTOM';
      else if (this.currentNight === 6) badge.textContent = 'NIGHT 6';
      else badge.textContent = `NIGHT ${this.currentNight}`;
    }
  }

  setupMenuStaticCanvas() {
    const canvas = document.getElementById('menu-static-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 240;
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    let lastDraw = 0;
    const render = (now) => {
      if (!this.isRunning && (now - lastDraw > 33)) {
        lastDraw = now;
        const len = data.length;
        for (let i = 0; i < len; i += 4) {
          const v = (Math.random() * 255) | 0;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = (Math.random() * 150 + 35) | 0;
        }
        ctx.putImageData(imgData, 0, 0);
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  setupMenuStatueTwitch() {
    const statueEl = document.getElementById('menu-statue-layer');
    if (!statueEl) return;

    const triggerTwitch = () => {
      if (this.isRunning) return;
      const idx = Math.floor(Math.random() * 3) + 1;
      const twitchClass = `twitch-${idx}`;
      statueEl.classList.add(twitchClass);
      window.Sound.playCameraStatic(0.12, 0.32);

      setTimeout(() => {
        statueEl.classList.remove(twitchClass);
      }, 100 + Math.random() * 120);

      const nextDelay = 2200 + Math.random() * 3200;
      setTimeout(triggerTwitch, nextDelay);
    };

    setTimeout(triggerTwitch, 2400);
  }

  startNightWithTransition(night = 1) {
    this.isNightTransitioning = true;
    if (!this.isCustomNight) {
      this.currentNight = night;
    }
    this.updateNightDifficulty();

    const menu = document.getElementById('fnaf-main-menu');
    const transScreen = document.getElementById('night-transition-screen');
    const nightTitleEl = document.getElementById('night-card-title-val');
    const subLabel = document.getElementById('night-card-sub-val');

    const suffixes = ['', '1st Night', '2nd Night', '3rd Night', '4th Night', '5th Night', 'The Consecration Vigil'];
    if (this.isCustomNight) {
      if (nightTitleEl) nightTitleEl.textContent = 'CUSTOM NIGHT';
      if (subLabel) subLabel.textContent = `AI: ${this.customAI.angel} / ${this.customAI.saint} / ${this.customAI.mourner}`;
    } else {
      if (nightTitleEl) {
        nightTitleEl.textContent = this.currentNight === 6 ? 'NIGHT 6' : `NIGHT ${this.currentNight}`;
      }
      if (subLabel) {
        subLabel.textContent = (suffixes[this.currentNight] || `Night ${this.currentNight}`).toUpperCase();
      }
    }

    window.Sound.init();
    window.Sound.resume();
    window.Sound.stopMenuDrone();
    window.Sound.startGameMusic();
    window.Sound.playNightTransitionChime();

    if (menu) menu.classList.add('hidden');
    if (transScreen) transScreen.classList.remove('hidden');

    setTimeout(() => {
      if (transScreen) transScreen.classList.add('hidden');
      this.startGame();
    }, 2800);
  }

  toggleManualModal(forceState = null) {
    this.toggleOptionsModal(forceState, 'tab-howtoplay');
  }

  // --- OPTIONS, SETTINGS, SURVIVAL PROTOCOLS & AUDIO CONTROLS ---
  setupSettingsModal() {
    this.setupOptionsModal();
  }

  setupOptionsModal() {
    const btnOptions = document.getElementById('btn-menu-options');
    const btnSettings = document.getElementById('btn-menu-settings');
    const modal = document.getElementById('options-modal') || document.getElementById('settings-modal');
    const btnClose = document.getElementById('btn-close-options') || document.getElementById('btn-close-settings');
    const btnX = document.getElementById('btn-options-x') || document.getElementById('btn-settings-x');

    btnOptions?.addEventListener('click', () => {
      this.toggleOptionsModal(true);
    });

    btnSettings?.addEventListener('click', () => {
      this.toggleOptionsModal(true);
    });

    btnClose?.addEventListener('click', () => {
      this.toggleOptionsModal(false);
    });

    btnX?.addEventListener('click', () => {
      this.toggleOptionsModal(false);
    });

    const btnQuit = document.getElementById('btn-quit-to-menu');
    btnQuit?.addEventListener('click', () => {
      window.Sound.playMechanicalClick();
      this.toggleOptionsModal(false);
      this.returnToMainMenu();
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.toggleOptionsModal(false);
      }
    });

    // Tab switching inside Options modal (How to Play, Keybinds, Audio, Speed)
    document.querySelectorAll('.settings-nav-tab, .options-nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        window.Sound.playMenuBlip();
        document.querySelectorAll('.settings-nav-tab, .options-nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.settings-tab-pane, .options-tab-pane').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const targetId = e.currentTarget.dataset.tab;
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Populate keybinding labels on buttons
    this.updateKeybindingLabels();

    // Click handler for keybinding slot buttons
    document.querySelectorAll('.keybind-slot-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        window.Sound.playMenuBlip();
        document.querySelectorAll('.keybind-slot-btn').forEach(b => b.classList.remove('binding-active'));
        const action = e.currentTarget.dataset.action;
        this.activeRebindingAction = action;
        e.currentTarget.classList.add('binding-active');
        e.currentTarget.textContent = 'PRESS KEY...';
      });
    });

    // Reset default keybinds button
    document.getElementById('btn-reset-keybinds')?.addEventListener('click', () => {
      window.Sound.playMenuBlip();
      this.keyBindings = {
        doorToggle: 'q',
        doorLight: 'z',
        windowSpot: 'w',
        ventToggle: 'e',
        ventLight: 'r',
        cctvToggle: ' ',
        nightVision: 'l'
      };
      try {
        localStorage.setItem('fnaf_church_keybinds', JSON.stringify(this.keyBindings));
      } catch (e) {}
      this.activeRebindingAction = null;
      document.querySelectorAll('.keybind-slot-btn').forEach(b => b.classList.remove('binding-active'));
      this.updateKeybindingLabels();
    });

    // Audio volume controls & persistence
    const masterSlider = document.getElementById('slider-master-vol');
    const masterVal = document.getElementById('val-master-vol');
    const sfxSlider = document.getElementById('slider-sfx-vol');
    const sfxVal = document.getElementById('val-sfx-vol');
    const musicSlider = document.getElementById('slider-music-vol');
    const musicVal = document.getElementById('val-music-vol');
    const muteChk = document.getElementById('chk-mute-sound');
    const btnTestSound = document.getElementById('btn-test-sound');

    try {
      const savedMaster = localStorage.getItem('fnaf_church_master_vol');
      if (savedMaster !== null && masterSlider && masterVal) {
        masterSlider.value = savedMaster;
        masterVal.textContent = `${savedMaster}%`;
        window.Sound.setMasterVolume(parseInt(savedMaster, 10) / 100);
      }
      const savedSfx = localStorage.getItem('fnaf_church_sfx_vol');
      if (savedSfx !== null && sfxSlider && sfxVal) {
        sfxSlider.value = savedSfx;
        sfxVal.textContent = `${savedSfx}%`;
        window.Sound.setSFXVolume(parseInt(savedSfx, 10) / 100);
      }
      const savedMusic = localStorage.getItem('fnaf_church_music_vol');
      if (savedMusic !== null && musicSlider && musicVal) {
        musicSlider.value = savedMusic;
        musicVal.textContent = `${savedMusic}%`;
        window.Sound.setMusicVolume(parseInt(savedMusic, 10) / 100);
      }
      const savedMute = localStorage.getItem('fnaf_church_muted');
      if (savedMute !== null && muteChk) {
        muteChk.checked = savedMute === '1';
        window.Sound.setMuted(muteChk.checked);
      }
    } catch (e) {}

    masterSlider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (masterVal) masterVal.textContent = `${val}%`;
      window.Sound.setMasterVolume(val / 100);
      try { localStorage.setItem('fnaf_church_master_vol', val); } catch (e) {}
    });

    sfxSlider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (sfxVal) sfxVal.textContent = `${val}%`;
      window.Sound.setSFXVolume(val / 100);
      try { localStorage.setItem('fnaf_church_sfx_vol', val); } catch (e) {}
    });

    musicSlider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (musicVal) musicVal.textContent = `${val}%`;
      window.Sound.setMusicVolume(val / 100);
      try { localStorage.setItem('fnaf_church_music_vol', val); } catch (e) {}
    });

    muteChk?.addEventListener('change', (e) => {
      window.Sound.setMuted(e.target.checked);
      try { localStorage.setItem('fnaf_church_muted', e.target.checked ? '1' : '0'); } catch (e) {}
    });

    btnTestSound?.addEventListener('click', () => {
      window.Sound.init();
      window.Sound.resume();
      window.Sound.playMechanicalClick();
      window.Sound.playChurchBell(0.8, 1);
    });

    // Shift Speed Options (Lobby selection)
    const speedCards = document.querySelectorAll('.speed-option-card');
    speedCards.forEach(card => {
      const spd = parseInt(card.dataset.speed, 10);
      const isCardActive = (spd === 1 && this.hourDuration === 86) ||
                           (spd === 2 && this.hourDuration === 60) ||
                           (spd === 4 && this.hourDuration === 30);
      card.classList.toggle('active', isCardActive);
      card.addEventListener('click', () => {
        window.Sound.playMenuBlip();
        speedCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        if (spd === 1) {
          this.hourDuration = 86; // Authentic FNAF 1 PC (86s / hr = 516s / ~8m 36s shift)
          this.timeSpeed = 1;
        } else if (spd === 2) {
          this.hourDuration = 60; // Modern Fast (60s / hr = 360s / 6m shift)
          this.timeSpeed = 1;
        } else if (spd === 4) {
          this.hourDuration = 30; // Turbo Speed (30s / hr = 180s / 3m shift)
          this.timeSpeed = 1;
        }
        try {
          localStorage.setItem('fnaf_church_hour_duration', this.hourDuration);
          localStorage.setItem('fnaf_church_speed', spd);
        } catch (e) {}
      });
    });
  }

  formatKeyName(key) {
    if (!key) return '';
    if (key === ' ' || key.toLowerCase() === 'space') return 'SPACE';
    if (key.length === 1) return key.toUpperCase();
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  updateKeybindingLabels() {
    for (const [action, key] of Object.entries(this.keyBindings)) {
      const btn = document.getElementById(`keybind-${action}`);
      if (btn) {
        btn.textContent = this.formatKeyName(key);
      }
    }

    const doorKey = this.formatKeyName(this.keyBindings.doorToggle || 'q');
    const doorLightKey = this.formatKeyName(this.keyBindings.doorLight || 'z');
    const winSpotKey = this.formatKeyName(this.keyBindings.windowSpot || 'w');
    const ventKey = this.formatKeyName(this.keyBindings.ventToggle || 'e');
    const ventLightKey = this.formatKeyName(this.keyBindings.ventLight || 'r');
    const cctvKey = this.formatKeyName(this.keyBindings.cctvToggle || ' ');
    const nvKey = this.formatKeyName(this.keyBindings.nightVision || 'l');

    // Office HUD Control Buttons (Live HUD Shortcut Labels)
    const btnDoor = document.getElementById('btn-door-toggle');
    if (btnDoor) {
      const span = btnDoor.querySelector('span');
      if (span) span.innerHTML = `LOCK DOOR<span class="key-hint"> [${doorKey}]</span>`;
      btnDoor.title = `Lock / Unlock Heavy Wooden Church Door [${doorKey}]`;
    }

    const btnDoorLight = document.getElementById('btn-door-light');
    if (btnDoorLight) {
      const span = btnDoorLight.querySelector('span');
      if (span) span.innerHTML = `DOOR LIGHT<span class="key-hint"> [${doorLightKey}]</span>`;
      btnDoorLight.title = `Toggle Door Downlight [${doorLightKey}]`;
    }

    const btnWinSpot = document.getElementById('btn-window-spot');
    if (btnWinSpot) {
      const span = btnWinSpot.querySelector('span');
      if (span) span.innerHTML = `WINDOW SPOTLIGHT<span class="key-hint"> [${winSpotKey}]</span>`;
      btnWinSpot.title = `Toggle Window Spotlight [${winSpotKey}]`;
    }

    const btnVent = document.getElementById('btn-vent-toggle');
    if (btnVent) {
      const span = btnVent.querySelector('span');
      if (span) span.innerHTML = `SEAL VENT<span class="key-hint"> [${ventKey}]</span>`;
      btnVent.title = `Seal / Open Steel Shutter Damper [${ventKey}]`;
    }

    const btnVentLight = document.getElementById('btn-vent-light');
    if (btnVentLight) {
      const span = btnVentLight.querySelector('span');
      if (span) span.innerHTML = `VENT LIGHT<span class="key-hint"> [${ventLightKey}]</span>`;
      btnVentLight.title = `Toggle Vent Duct Light [${ventLightKey}]`;
    }

    // CCTV flip bar and minimize button
    const cctvSubtext = document.querySelector('#cctv-flip-bar .flip-subtext');
    if (cctvSubtext) cctvSubtext.textContent = `[${cctvKey}]`;

    const cctvFlipDown = document.getElementById('cctv-flip-down-btn');
    if (cctvFlipDown) cctvFlipDown.innerHTML = `MINIMIZE FEED<span class="key-hint"> [${cctvKey}]</span>`;

    const btnCctvLight = document.getElementById('btn-cctv-light');
    if (btnCctvLight) {
      const span = btnCctvLight.querySelector('span');
      if (span) span.innerHTML = `IR NIGHT VISION<span class="key-hint"> [${nvKey}]</span>`;
      btnCctvLight.title = `Toggle Camera Night Vision [${nvKey}]`;
    }

    // How to Play guide badges
    const badgesDoor = document.querySelectorAll('.badge-door');
    if (badgesDoor.length > 0) badgesDoor[0].textContent = doorKey;
    if (badgesDoor.length > 1) badgesDoor[1].textContent = doorLightKey;

    const badgesWin = document.querySelectorAll('.badge-window');
    if (badgesWin.length > 0) badgesWin[0].textContent = winSpotKey;

    const badgesVent = document.querySelectorAll('.badge-vent');
    if (badgesVent.length > 0) badgesVent[0].textContent = ventKey;
    if (badgesVent.length > 1) badgesVent[1].textContent = ventLightKey;

    const badgesCctv = document.querySelectorAll('.badge-cctv');
    badgesCctv.forEach(b => { b.textContent = cctvKey; });
  }

  saveReboundKey(action, key) {
    if (!action) return;
    if (key !== 'Escape') {
      const cleanKey = (key.length === 1) ? key.toLowerCase() : key;
      this.keyBindings[action] = cleanKey;
      try {
        localStorage.setItem('fnaf_church_keybinds', JSON.stringify(this.keyBindings));
      } catch (e) {}
      window.Sound.playMechanicalClick();
    }
    this.activeRebindingAction = null;
    document.querySelectorAll('.keybind-slot-btn').forEach(b => b.classList.remove('binding-active'));
    this.updateKeybindingLabels();
  }

  toggleOptionsModal(forceState = null, defaultTab = null) {
    const modal = document.getElementById('options-modal') || document.getElementById('settings-modal');
    if (!modal) return;
    const isCurrentlyHidden = modal.classList.contains('hidden');
    const shouldOpen = forceState !== null ? forceState : isCurrentlyHidden;

    this.activeRebindingAction = null;
    document.querySelectorAll('.keybind-slot-btn').forEach(b => b.classList.remove('binding-active'));
    this.updateKeybindingLabels();

    const quitBtn = document.getElementById('btn-quit-to-menu');

    if (shouldOpen) {
      // Pause in-game simulation when options modal is displayed
      if (this.isRunning && !this.gameOver && !this.victory) {
        this.isPaused = true;
        if (quitBtn) quitBtn.style.display = 'inline-flex';
      } else {
        if (quitBtn) quitBtn.style.display = 'none';
      }

      modal.classList.remove('hidden');
      window.Sound.playMenuBlip();
      if (defaultTab) {
        document.querySelectorAll('.settings-nav-tab, .options-nav-tab').forEach(t => {
          t.classList.toggle('active', t.dataset.tab === defaultTab);
        });
        document.querySelectorAll('.settings-tab-pane, .options-tab-pane').forEach(p => {
          p.classList.toggle('active', p.id === defaultTab);
        });
      }
      const scrollContent = modal.querySelector('.settings-scroll-content') || modal.querySelector('.options-scroll-content');
      if (scrollContent) scrollContent.scrollTop = 0;
    } else {
      modal.classList.add('hidden');
      window.Sound.playMenuBlip();
      // Resume simulation and BGM if active in-game
      if (this.isRunning && !this.gameOver && !this.victory) {
        this.isPaused = false;
        window.Sound.resumeBGM();
      }
    }
  }

  toggleSettingsModal(forceState = null) {
    this.toggleOptionsModal(forceState, 'tab-keybinds');
  }

  returnToMainMenu() {
    this.stopAnalogLossOfSignal();
    this.isNightTransitioning = false;
    this.isRunning = false;
    this.isPaused = false;
    this.gameOver = false;
    this.victory = false;
    this.muteCassette();
    if (this.isCCTVOpen) this.toggleCCTV();

    // Reset active defense toggles
    if (this.isLeftDoorClosed) {
      this.isLeftDoorClosed = false;
      const btn = document.getElementById('btn-door-toggle');
      if (btn) btn.classList.remove('active', 'door-active');
      if (this.world.nodes.magLedMat) this.world.nodes.magLedMat.color.setHex(0x22c55e);
    }
    if (this.isLeftDoorLightOn) {
      this.isLeftDoorLightOn = false;
      const btn = document.getElementById('btn-door-light');
      if (btn) btn.classList.remove('active', 'light-active');
      if (this.world.lights.doorLight) this.world.lights.doorLight.intensity = 0;
    }
    if (this.isVentClosed) {
      this.isVentClosed = false;
      const btn = document.getElementById('btn-vent-toggle');
      if (btn) btn.classList.remove('active', 'door-active');
    }
    if (this.isVentLightOn) {
      this.isVentLightOn = false;
      const btn = document.getElementById('btn-vent-light');
      if (btn) btn.classList.remove('active', 'light-active');
      if (this.world.lights.ventLight) this.world.lights.ventLight.intensity = 0;
    }
    if (this.isWindowSpotOn) {
      this.toggleWindowSpot();
    }

    window.Sound.stopAmbientOrgan();
    window.Sound.stopHeartbeat();
    window.Sound.startMenuDrone();
    window.Sound.startLobbyMusic();

    document.getElementById('gameover-screen')?.classList.add('hidden');
    document.getElementById('victory-screen')?.classList.add('hidden');
    document.getElementById('night-transition-screen')?.classList.add('hidden');
    document.getElementById('manual-modal')?.classList.add('hidden');
    document.getElementById('settings-modal')?.classList.add('hidden');
    document.getElementById('options-modal')?.classList.add('hidden');
    document.getElementById('custom-night-modal')?.classList.add('hidden');

    const videoContainer = document.getElementById('jumpscare-video-container');
    if (videoContainer) videoContainer.classList.add('hidden');
    ['jumpscare-video-angel', 'jumpscare-video-saint', 'jumpscare-video-mourner'].forEach(id => {
      const v = document.getElementById(id);
      if (v) {
        v.pause();
        v.currentTime = 0;
        v.classList.add('hidden');
      }
    });
    const hud = document.getElementById('hud-overlay');
    if (hud) hud.style.display = '';

    const menu = document.getElementById('fnaf-main-menu');
    if (menu) menu.classList.remove('hidden');

    this.updateNightBadge();
  }

  muteCassette() {
    window.Sound.stopCassetteTape();
    const widget = document.getElementById('cassette-call-widget');
    if (widget) {
      widget.classList.add('hidden');
      widget.style.display = 'none';
    }
  }

  // --- GAME START & RESTART ---
  startGame() {
    this.stopAnalogLossOfSignal();
    this.isNightTransitioning = false;
    this.isRunning = true;
    window.Sound.init();
    window.Sound.resume();
    window.Sound.startGameMusic();
    window.Sound.startAmbientOrgan();
    window.Sound.playChurchBell(1.0, 1);

    document.getElementById('fnaf-main-menu')?.classList.add('hidden');
    document.getElementById('night-transition-screen')?.classList.add('hidden');
    document.getElementById('manual-modal')?.classList.add('hidden');
    document.getElementById('settings-modal')?.classList.add('hidden');
    document.getElementById('options-modal')?.classList.add('hidden');
    document.getElementById('custom-night-modal')?.classList.add('hidden');
    document.getElementById('gameover-screen')?.classList.add('hidden');
    document.getElementById('victory-screen')?.classList.add('hidden');
    document.getElementById('cctv-error-screen')?.classList.add('hidden');
    document.getElementById('cctv-anomaly-burst')?.classList.remove('active');

    const videoContainer = document.getElementById('jumpscare-video-container');
    if (videoContainer) videoContainer.classList.add('hidden');
    ['jumpscare-video-angel', 'jumpscare-video-saint', 'jumpscare-video-mourner'].forEach(id => {
      const v = document.getElementById(id);
      if (v) {
        v.pause();
        v.currentTime = 0;
        v.classList.add('hidden');
      }
    });
    const hud = document.getElementById('hud-overlay');
    if (hud) hud.style.display = '';

    this.isRunning = true;
    this.gameOver = false;
    this.victory = false;
    this.isBlackout = false;
    this.hour = 0;
    this.nightTimer = 0;
    this.power = 100.0;
    this.updateHUD();

    this.positionStatuesInitial();
    this.onWindowResize();

    // Start Father Thomas's Cassette Briefing (Nights 1 - 4 only, not on custom night)
    this.muteCassette();
    const cassetteWidget = document.getElementById('cassette-call-widget');
    const cassetteSub = document.getElementById('cassette-subtitle-text');
    if (!this.isCustomNight && this.currentNight <= 4) {
      if (cassetteWidget) {
        cassetteWidget.classList.remove('hidden');
        cassetteWidget.style.display = 'block';
      }
      if (cassetteSub) cassetteSub.textContent = 'CONNECTING CASSETTE PLAYBACK...';
      window.Sound.playCassetteTape(
        this.currentNight,
        (sub) => {
          if (cassetteSub) cassetteSub.textContent = sub;
        },
        () => {
          if (cassetteWidget) {
            cassetteWidget.classList.add('hidden');
            cassetteWidget.style.display = 'none';
          }
        }
      );
    } else {
      if (cassetteWidget) {
        cassetteWidget.classList.add('hidden');
        cassetteWidget.style.display = 'none';
      }
    }
  }

  restartGame() {
    this.stopAnalogLossOfSignal();
    this.muteCassette();
    document.getElementById('gameover-screen')?.classList.add('hidden');
    window.Sound.startGameMusic();
    this.startNightWithTransition(this.isCustomNight ? 7 : this.currentNight);
  }

  advanceNight() {
    this.muteCassette();
    if (this.isCustomNight) {
      this.returnToMainMenu();
      return;
    }
    if (this.currentNight < 6) {
      this.currentNight++;
    }
    document.getElementById('victory-screen')?.classList.add('hidden');
    window.Sound.startGameMusic();
    this.startNightWithTransition(this.currentNight);
  }

  updateNightDifficulty() {
    const nightMap = {
      1: { angel: 2, saint: 1, mourner: 0 },
      2: { angel: 4, saint: 3, mourner: 2 },
      3: { angel: 7, saint: 6, mourner: 5 },
      4: { angel: 11, saint: 9, mourner: 8 },
      5: { angel: 15, saint: 14, mourner: 13 },
      6: { angel: 18, saint: 16, mourner: 15 }
    };

    if (this.isCustomNight) {
      this.aiConfig.weepingAngel.level = this.customAI.angel;
      this.aiConfig.haloedSaint.level = this.customAI.saint;
      this.aiConfig.veiledMourner.level = this.customAI.mourner;
      const nightEl = document.getElementById('hud-night-val');
      if (nightEl) nightEl.textContent = 'CUSTOM NIGHT';
      return;
    }

    const cfg = nightMap[this.currentNight] || nightMap[1];
    this.aiConfig.weepingAngel.level = cfg.angel;
    this.aiConfig.haloedSaint.level = cfg.saint;
    this.aiConfig.veiledMourner.level = cfg.mourner;

    const nightEl = document.getElementById('hud-night-val');
    if (nightEl) {
      nightEl.textContent = this.currentNight === 6 ? 'NIGHT 6 (VIGIL)' : `NIGHT ${this.currentNight}`;
    }
  }

  // Mobile Haptic Vibration helper (PWA & Mobile Webkit / Chromium / Capacitor)
  vibrate(pattern) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (!this.isCCTVOpen) {
      try {
        this.renderer.render(this.scene, this.camera);
      } catch (renderErr) {
        console.error('ThreeJS render error:', renderErr);
      }
    } catch (renderErr) {
      console.error('ThreeJS render error:', renderErr);
    }
  }

  updateHUD() {
    const timeEl = document.getElementById('hud-time-val');
    if (timeEl) timeEl.textContent = '12:00 AM';
    const subEl = document.getElementById('hud-time-sub-val');
    if (subEl) subEl.textContent = '00:00 / 06:00';
    const progressFill = document.getElementById('shift-progress-fill');
    if (progressFill) progressFill.style.width = '0%';
    const nightEl = document.getElementById('hud-night-val');
    if (nightEl) nightEl.textContent = `NIGHT ${this.currentNight}`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.Game = new GameEngine();
});
