/**
 * Five Nights at the Church - Modern Audio Synthesizer Engine
 * Web Audio API Engine for Modern Church & Office Ambiance, Maglocks, Servos, and Jumpscares
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.hvacGain = null;
    this.choirGain = null;
    this.hvacSources = [];
    this.menuDroneSources = [];
    this.menuGain = null;
    this.isInitialized = false;
    this.heartbeatTimer = null;
    this.flashlightHumGain = null;
    this.flashlightHumSources = [];
    this.masterVolume = 0.85;
    this.sfxVolume = 0.90;
    this.musicVolume = 0.80;

    // Dual Ambient Soundtracks:
    // 1. Lobby: Sacred Church Theme Ambience (church_theme_ambiance.mp3)
    // 2. In-Game: Dark Horror Ambience (dark_ambient_horror.mp3)
    this.lobbyAudio = null;
    this.gameAudio = null;
    this.activeTrack = null; // 'lobby' | 'game' | null
    this.lobbyBaseVolume = 0.70;
    this.gameBaseVolume = 0.75;
    this.audioLoaded = false;
    this.initAudioElements();
  }

  get bgmAudio() {
    return this.activeTrack === 'game' ? this.gameAudio : this.lobbyAudio;
  }

  initAudioElements() {
    try {
      if (!this.lobbyAudio) {
        this.lobbyAudio = new Audio('assets/audio/church_theme_ambiance.mp3');
        this.lobbyAudio.loop = true;
        this.lobbyAudio.preload = 'auto';
      }
      if (!this.gameAudio) {
        this.gameAudio = new Audio('assets/audio/Dark%20Ambient%20-%20Horror.mp3');
        this.gameAudio.loop = true;
        this.gameAudio.preload = 'auto';
        this.gameAudio.addEventListener('error', () => {
          if (this.gameAudio && !this.gameAudio.src.includes('Horror.mp3')) {
            this.gameAudio.src = 'assets/audio/Dark Ambient - Horror.mp3';
            this.gameAudio.load();
          }
        }, { once: true });
      }
      this.updateBGMVolume();
    } catch (e) {
      console.warn('Could not initialize audio elements:', e);
    }
  }

  initBGM() {
    this.initAudioElements();
  }

  setupAudioElement(src) {
    this.initAudioElements();
    if (this.gameAudio) this.gameAudio.src = src;
    this.updateBGMVolume();
  }

  async preloadBGM(onProgress = null) {
    this.initAudioElements();
    if (onProgress) onProgress(0.2, 'Preparing Cathedral Ambience & Horror Audio...');

    try {
      if (this.lobbyAudio) this.lobbyAudio.load();
      if (this.gameAudio) this.gameAudio.load();
    } catch (e) {}

    const audioTracks = [
      { name: 'Cathedral Lobby Ambience', url: 'assets/audio/church_theme_ambiance.mp3' },
      { name: 'Dark In-Game Horror Ambience', url: 'assets/audio/Dark%20Ambient%20-%20Horror.mp3' }
    ];

    let completed = 0;
    for (const track of audioTracks) {
      try {
        await fetch(track.url, { method: 'HEAD' });
        completed++;
        if (onProgress) {
          onProgress(0.2 + (completed / audioTracks.length) * 0.8, `Preloaded ${track.name} (Ready)`);
        }
      } catch (e) {
        completed++;
        if (onProgress) {
          onProgress(0.2 + (completed / audioTracks.length) * 0.8, `Buffered ${track.name}`);
        }
      }
    }

    this.audioLoaded = true;
    if (onProgress) onProgress(1.0, 'Cathedral & In-Game Soundtracks Ready');
    return true;
  }

  updateBGMVolume() {
    try {
      const masterMult = this.isMuted ? 0 : Math.max(0, Math.min(1, this.masterVolume * this.musicVolume));
      if (this.lobbyAudio) {
        this.lobbyAudio.volume = masterMult * this.lobbyBaseVolume;
      }
      if (this.gameAudio) {
        this.gameAudio.volume = masterMult * this.gameBaseVolume;
      }
    } catch (e) {}
  }

  startLobbyMusic() {
    this.initAudioElements();
    this.activeTrack = 'lobby';
    this.updateBGMVolume();

    // Smoothly stop in-game audio if playing
    if (this.gameAudio && !this.gameAudio.paused) {
      this.fadeAudioOut(this.gameAudio, 400);
    }

    if (this.lobbyAudio && this.lobbyAudio.paused) {
      const playPromise = this.lobbyAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Will unlock automatically on next user gesture
        });
      }
    }
  }

  startGameMusic() {
    this.initAudioElements();
    this.activeTrack = 'game';
    this.updateBGMVolume();

    // Smoothly stop lobby audio if playing
    if (this.lobbyAudio && !this.lobbyAudio.paused) {
      this.fadeAudioOut(this.lobbyAudio, 400);
    }

    if (this.gameAudio && this.gameAudio.paused) {
      const playPromise = this.gameAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Will unlock automatically on next user gesture
        });
      }
    }
  }

  startBGM(type) {
    if (type === 'game') {
      this.startGameMusic();
    } else if (type === 'lobby') {
      this.startLobbyMusic();
    } else {
      if (this.activeTrack === 'game') {
        this.startGameMusic();
      } else {
        this.startLobbyMusic();
      }
    }
  }

  fadeAudioOut(audioEl, duration = 400) {
    if (!audioEl || audioEl.paused) return;
    const startVol = audioEl.volume;
    const startTime = performance.now();
    const fadeStep = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed < duration && !audioEl.paused) {
        audioEl.volume = Math.max(0, startVol * (1 - elapsed / duration));
        requestAnimationFrame(fadeStep);
      } else {
        audioEl.pause();
        audioEl.currentTime = 0;
        this.updateBGMVolume();
      }
    };
    requestAnimationFrame(fadeStep);
  }

  stopBGM(fade = true) {
    this.activeTrack = null;
    if (fade) {
      if (this.lobbyAudio && !this.lobbyAudio.paused) this.fadeAudioOut(this.lobbyAudio, 500);
      if (this.gameAudio && !this.gameAudio.paused) this.fadeAudioOut(this.gameAudio, 500);
    } else {
      if (this.lobbyAudio) {
        this.lobbyAudio.pause();
        this.lobbyAudio.currentTime = 0;
      }
      if (this.gameAudio) {
        this.gameAudio.pause();
        this.gameAudio.currentTime = 0;
      }
    }
  }

  pauseBGM() {
    if (this.lobbyAudio && !this.lobbyAudio.paused) this.lobbyAudio.pause();
    if (this.gameAudio && !this.gameAudio.paused) this.gameAudio.pause();
  }

  resumeBGM() {
    if (this.activeTrack === 'game') {
      this.startGameMusic();
    } else {
      this.startLobbyMusic();
    }
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      const initialVol = this.isMuted ? 0.0 : this.masterVolume;
      this.masterGain.gain.setValueAtTime(initialVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = (typeof THREE !== 'undefined' && THREE.MathUtils) ? THREE.MathUtils.clamp(val, 0, 1) : Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setValueAtTime(target, this.ctx.currentTime);
    }
    this.updateBGMVolume();
  }

  setSFXVolume(val) {
    this.sfxVolume = (typeof THREE !== 'undefined' && THREE.MathUtils) ? THREE.MathUtils.clamp(val, 0, 1) : Math.max(0, Math.min(1, val));
  }

  setMusicVolume(val) {
    this.musicVolume = (typeof THREE !== 'undefined' && THREE.MathUtils) ? THREE.MathUtils.clamp(val, 0, 1) : Math.max(0, Math.min(1, val));
    if (this.menuGain && this.ctx) {
      this.menuGain.gain.setValueAtTime(0.32 * this.musicVolume, this.ctx.currentTime);
    }
    this.updateBGMVolume();
  }

  setMuted(muted) {
    this.isMuted = !!muted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setValueAtTime(target, this.ctx.currentTime);
    }
    this.updateBGMVolume();
  }

  // --- FNAF CLASSIC TITLE MENU EERIE DRONE ---
  startMenuDrone() {
    if (!this.ctx) return;
    this.stopMenuDrone();

    const now = this.ctx.currentTime;
    this.menuGain = this.ctx.createGain();
    this.menuGain.gain.setValueAtTime(0.01, now);
    this.menuGain.gain.linearRampToValueAtTime(0.32, now + 1.2);
    this.menuGain.connect(this.masterGain);

    // 1. Deep low-frequency sub drone (48Hz + 72Hz beating chord)
    const subOsc1 = this.ctx.createOscillator();
    subOsc1.type = 'sawtooth';
    subOsc1.frequency.setValueAtTime(48.5, now);

    const subOsc2 = this.ctx.createOscillator();
    subOsc2.type = 'triangle';
    subOsc2.frequency.setValueAtTime(72.8, now);

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(110, now);
    lowpass.Q.setValueAtTime(2.0, now);

    subOsc1.connect(lowpass);
    subOsc2.connect(lowpass);
    lowpass.connect(this.menuGain);
    subOsc1.start(now);
    subOsc2.start(now);
    this.menuDroneSources.push(subOsc1, subOsc2);

    // 2. High-tension electric CRT coil buzz (faint 15.7kHz undertone)
    const coilOsc = this.ctx.createOscillator();
    coilOsc.type = 'sine';
    coilOsc.frequency.setValueAtTime(120, now);
    const coilGain = this.ctx.createGain();
    coilGain.gain.setValueAtTime(0.04, now);
    coilOsc.connect(coilGain);
    coilGain.connect(this.menuGain);
    coilOsc.start(now);
    this.menuDroneSources.push(coilOsc);

    // 3. Filtered vinyl/tape noise hiss
    const bufSize = this.ctx.sampleRate * 2;
    const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuf;
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.Q.setValueAtTime(0.8, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.menuGain);
    noiseSource.start(now);
    this.menuDroneSources.push(noiseSource);
  }

  stopMenuDrone() {
    if (this.menuGain && this.ctx) {
      try {
        this.menuGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
        setTimeout(() => {
          this.menuDroneSources.forEach(s => {
            try { s.stop(); s.disconnect(); } catch (e) {}
          });
          this.menuDroneSources = [];
        }, 700);
      } catch (e) {}
    }
  }

  // Snappy classic FNAF UI cursor blip
  playMenuBlip() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(940, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // The iconic 12:00 AM Night Transition Deep Bell Toll
  playNightTransitionChime() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Resonant grandfather clock church carillon fundamental (130.81 Hz - C3)
    const baseFreq = 130.81;
    const harmonics = [1, 2.02, 2.76, 3.98, 5.4];
    const gains = [0.65, 0.35, 0.22, 0.12, 0.06];

    harmonics.forEach((h, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * h, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gains[idx], now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 4.0);
    });

    // Deep sub impact
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(65.4, now);
    subOsc.frequency.exponentialRampToValueAtTime(32.7, now + 1.2);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.7, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 1.8);
  }

  // --- MODERN OFFICE HVAC AIR CONDITIONING & CHRUCH REVERB AMBIENCE ---
  startAmbientOrgan() {
    if (!this.ctx) return;
    this.stopAmbientOrgan();

    const now = this.ctx.currentTime;

    // 1. Modern Building HVAC Drone (Low-frequency smooth air displacement)
    this.hvacGain = this.ctx.createGain();
    this.hvacGain.gain.setValueAtTime(0.01, now);
    this.hvacGain.gain.linearRampToValueAtTime(0.18, now + 2.0);
    this.hvacGain.connect(this.masterGain);

    // Pink/Brown noise filtered for air conditioning
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const hvacFilter = this.ctx.createBiquadFilter();
    hvacFilter.type = 'lowpass';
    hvacFilter.frequency.setValueAtTime(140, now);
    hvacFilter.Q.setValueAtTime(1.2, now);

    noiseSource.connect(hvacFilter);
    hvacFilter.connect(this.hvacGain);
    noiseSource.start(now);
    this.hvacSources.push(noiseSource);

    // Subtle 60Hz server power transformer hum
    const humOsc = this.ctx.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.setValueAtTime(60, now);
    const humGain = this.ctx.createGain();
    humGain.gain.value = 0.035;
    humOsc.connect(humGain);
    humGain.connect(this.hvacGain);
    humOsc.start(now);
    this.hvacSources.push(humOsc);

    // 2. Distant Ethereal Church Reverb / Modern Sacred Choral Drone
    this.startLiturgicalWhispers();
  }

  stopAmbientOrgan() {
    if (this.hvacGain && this.ctx) {
      try {
        this.hvacGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
        setTimeout(() => {
          this.hvacSources.forEach(s => { try { s.stop(); } catch(e){} });
          this.hvacSources = [];
        }, 1000);
      } catch(e) {}
    }
  }

  // --- DISTANT MODERN CATHOLIC CHORAL HARMONY ---
  startLiturgicalWhispers() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Soft resonant harmonic choir drone (Modern cathedral acoustics)
    const choirNotes = [110, 164.8, 220, 293.7]; // A2, E3, A3, D4
    choirNotes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, now);
      filter.Q.setValueAtTime(6.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.025 / (idx + 1), now + 3.0);

      // Slow gentle shimmer
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.15 + idx * 0.08;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.01;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      this.hvacSources.push(osc);
    });
  }

  // --- POLISHED MARBLE SCRAPE / STATUE DISPLACEMENT ---
  playStoneGrind(intensity = 1.0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // High density marble friction sound
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.6;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.linearRampToValueAtTime(750 * intensity, now + 0.3);
    filter.Q.setValueAtTime(4.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4 * intensity, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  // --- MODERN ELECTRONIC MAGLOCK DOOR (Magnetic Lock & Hydraulic Closer) ---
  playDoorSound(isClosing) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (isClosing) {
      // 1. Hydraulic door closer whoosh
      const hissOsc = this.ctx.createOscillator();
      hissOsc.type = 'triangle';
      hissOsc.frequency.setValueAtTime(120, now);
      hissOsc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
      const hissGain = this.ctx.createGain();
      hissGain.gain.setValueAtTime(0.15, now);
      hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      hissOsc.connect(hissGain);
      hissGain.connect(this.masterGain);
      hissOsc.start(now);
      hissOsc.stop(now + 0.3);

      // 2. Heavy magnetic lock engagement slam & solenoid snap
      setTimeout(() => {
        if (!this.ctx) return;
        const slamTime = this.ctx.currentTime;

        // Heavy steel door latch impact
        const impact = this.ctx.createOscillator();
        impact.type = 'sine';
        impact.frequency.setValueAtTime(95, slamTime);
        impact.frequency.exponentialRampToValueAtTime(30, slamTime + 0.25);
        const impGain = this.ctx.createGain();
        impGain.gain.setValueAtTime(0.65, slamTime);
        impGain.gain.exponentialRampToValueAtTime(0.001, slamTime + 0.25);
        impact.connect(impGain);
        impGain.connect(this.masterGain);
        impact.start(slamTime);
        impact.stop(slamTime + 0.25);

        // Electronic maglock confirmation beep
        const beep = this.ctx.createOscillator();
        beep.type = 'sine';
        beep.frequency.setValueAtTime(1760, slamTime + 0.05); // A6 beep
        const beepGain = this.ctx.createGain();
        beepGain.gain.setValueAtTime(0.12, slamTime + 0.05);
        beepGain.gain.exponentialRampToValueAtTime(0.001, slamTime + 0.15);
        beep.connect(beepGain);
        beepGain.connect(this.masterGain);
        beep.start(slamTime + 0.05);
        beep.stop(slamTime + 0.15);
      }, 250);
    } else {
      // Door unlatch: Maglock disengage beep & mechanical click
      const beep = this.ctx.createOscillator();
      beep.type = 'sine';
      beep.frequency.setValueAtTime(880, now);
      const beepGain = this.ctx.createGain();
      beepGain.gain.setValueAtTime(0.15, now);
      beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      beep.connect(beepGain);
      beepGain.connect(this.masterGain);
      beep.start(now);
      beep.stop(now + 0.1);

      this.playMechanicalClick();
    }
  }

  // --- MOTORIZED HVAC FIRE SHUTTER (Electric Servos & Slat Slide) ---
  playVentSound(isClosing) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Motorized electric gear whine
    const servo = this.ctx.createOscillator();
    servo.type = 'sawtooth';
    servo.frequency.setValueAtTime(isClosing ? 320 : 420, now);
    servo.frequency.linearRampToValueAtTime(isClosing ? 260 : 360, now + 0.35);

    const servoFilter = this.ctx.createBiquadFilter();
    servoFilter.type = 'bandpass';
    servoFilter.frequency.setValueAtTime(600, now);
    servoFilter.Q.setValueAtTime(3.0, now);

    const servoGain = this.ctx.createGain();
    servoGain.gain.setValueAtTime(0.18, now);
    servoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    servo.connect(servoFilter);
    servoFilter.connect(servoGain);
    servoGain.connect(this.masterGain);
    servo.start(now);
    servo.stop(now + 0.35);

    // Steel damper bottom impact
    if (isClosing) {
      setTimeout(() => {
        if (!this.ctx) return;
        const impTime = this.ctx.currentTime;
        const imp = this.ctx.createOscillator();
        imp.type = 'triangle';
        imp.frequency.setValueAtTime(140, impTime);
        imp.frequency.exponentialRampToValueAtTime(40, impTime + 0.2);

        const impGain = this.ctx.createGain();
        impGain.gain.setValueAtTime(0.45, impTime);
        impGain.gain.exponentialRampToValueAtTime(0.001, impTime + 0.2);

        imp.connect(impGain);
        impGain.connect(this.masterGain);
        imp.start(impTime);
        imp.stop(impTime + 0.2);
      }, 280);
    }
  }

  // --- MODERN DIGITAL SWITCH & PUSHBUTTON CLICKS ---
  playLightClick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Modern tactile pushbutton click
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  playMechanicalClick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // --- REALISTIC HALOGEN SPOTLIGHT SWITCH & ELECTRICAL HUM ---
  playFlashlightSwitch(isOn) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Heavy physical rocker toggle switch snap
    const snap = this.ctx.createOscillator();
    snap.type = 'triangle';
    snap.frequency.setValueAtTime(isOn ? 1600 : 900, now);
    snap.frequency.exponentialRampToValueAtTime(80, now + 0.04);
    const snapGain = this.ctx.createGain();
    snapGain.gain.setValueAtTime(0.28, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    snap.connect(snapGain);
    snapGain.connect(this.masterGain);
    snap.start(now);
    snap.stop(now + 0.045);

    if (isOn) {
      // 2. High-voltage halogen ballast ignition burst (instant capacitor charging ring)
      const surge = this.ctx.createOscillator();
      surge.type = 'sine';
      surge.frequency.setValueAtTime(2200, now + 0.01);
      surge.frequency.exponentialRampToValueAtTime(320, now + 0.12);
      const surgeGain = this.ctx.createGain();
      surgeGain.gain.setValueAtTime(0.16, now + 0.01);
      surgeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      surge.connect(surgeGain);
      surgeGain.connect(this.masterGain);
      surge.start(now + 0.01);
      surge.stop(now + 0.12);
    }
  }

  // --- REALISTIC ELECTRICAL ARC & HALOGEN LIGHT FLICKER ---
  playLightFlicker(duration = 0.85) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Rapid erratic electrical sparks and buzzing pops
    const burstCount = 7;
    for (let i = 0; i < burstCount; i++) {
      const burstTime = now + (i / burstCount) * (duration * 0.9) + (Math.random() * 0.04);
      const osc = this.ctx.createOscillator();
      osc.type = Math.random() > 0.5 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(75 + Math.random() * 260, burstTime);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.22 + Math.random() * 0.12, burstTime);
      g.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.05);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(burstTime);
      osc.stop(burstTime + 0.055);
    }
  }

  startFlashlightHum() {
    if (!this.ctx) return;
    this.stopFlashlightHum();

    const now = this.ctx.currentTime;
    this.flashlightHumGain = this.ctx.createGain();
    this.flashlightHumGain.gain.setValueAtTime(0.001, now);
    this.flashlightHumGain.gain.linearRampToValueAtTime(0.032, now + 0.15);
    this.flashlightHumGain.connect(this.masterGain);

    // Deep 60Hz transformer electrical hum with 120Hz secondary harmonic
    const hum60 = this.ctx.createOscillator();
    hum60.type = 'sawtooth';
    hum60.frequency.setValueAtTime(60, now);

    const humFilter = this.ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(140, now);

    hum60.connect(humFilter);
    humFilter.connect(this.flashlightHumGain);
    hum60.start(now);
    this.flashlightHumSources.push(hum60);
  }

  stopFlashlightHum() {
    if (!this.flashlightHumGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      this.flashlightHumGain.gain.linearRampToValueAtTime(0.0001, now + 0.08);
      setTimeout(() => {
        this.flashlightHumSources.forEach(s => {
          try { s.stop(); s.disconnect(); } catch(e) {}
        });
        this.flashlightHumSources = [];
        this.flashlightHumGain = null;
      }, 90);
    } catch(e) {
      this.flashlightHumSources = [];
      this.flashlightHumGain = null;
    }
  }

  // --- MODERN CCTV MONITOR FLIP & DIGITAL ARTIFACTS ---
  playCameraFlip(isUp) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Sleek digital interface UI sound
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isUp ? 440 : 880, now);
    osc.frequency.exponentialRampToValueAtTime(isUp ? 880 : 330, now + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.14);

    this.playCameraStatic(0.12, 0.2);
  }

  playCameraStatic(duration = 0.15, volume = 0.25) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Digital packet loss noise burst
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.7;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  playCameraBeep() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.setValueAtTime(2000, now + 0.02);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // --- AUTHENTIC FNAF CAMERA MOTION DISRUPTION & ERROR STATIC ---
  playCameraErrorStatic(duration = 3.2, volume = 0.45) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Harsh high-density White & Pink Noise burst with electrical pops
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink filter algorithm
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      const pink = b0 + b1 + b2 + white * 0.5362;
      const pop = Math.random() < 0.003 ? (Math.random() * 2 - 1) * 2.2 : 0.0;
      data[i] = (pink * 0.45 + pop) * 0.65;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Resonant bandpass filter for telephone/CRT antenna interference
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.linearRampToValueAtTime(2600, now + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(1600, now + duration);
    filter.Q.setValueAtTime(1.4, now);

    // 2. 60Hz Electrical AC interference hum
    const hum = this.ctx.createOscillator();
    hum.type = 'sawtooth';
    hum.frequency.setValueAtTime(60, now);
    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.09, now);

    // 3. Stuttering Glitch Gain Envelope (amplitude modulation for VHS/CCTV packet loss flutter)
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 1.1, now);
    masterGain.gain.setValueAtTime(volume * 0.7, now + 0.15);
    masterGain.gain.setValueAtTime(volume * 1.0, now + 0.35);
    masterGain.gain.setValueAtTime(volume * 0.6, now + 0.65);
    masterGain.gain.setValueAtTime(volume * 0.95, now + 1.2);
    masterGain.gain.setValueAtTime(volume * 0.8, now + 2.0);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    hum.connect(humGain);
    humGain.connect(masterGain);
    noise.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(this.masterGain);

    hum.start(now);
    hum.stop(now + duration);
    noise.start(now);
    noise.stop(now + duration);

    // Initial alert chirp
    this.playCameraBeep();
  }

  // --- MODERN PARISH CARILLON BELLS ---
  playChurchBell(pitch = 1.0, count = 1) {
    if (!this.ctx) return;
    for (let n = 0; n < count; n++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const fundamental = 220 * pitch; // Modern bell chime
        const partials = [
          { mult: 1.0, gain: 0.6, decay: 3.2 },
          { mult: 1.25, gain: 0.45, decay: 2.6 },
          { mult: 1.5, gain: 0.35, decay: 2.0 },
          { mult: 2.0, gain: 0.5, decay: 1.6 },
          { mult: 2.5, gain: 0.2, decay: 1.1 }
        ];

        partials.forEach(p => {
          const osc = this.ctx.createOscillator();
          const pGain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(fundamental * p.mult, now);

          pGain.gain.setValueAtTime(p.gain * 0.35, now);
          pGain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

          osc.connect(pGain);
          pGain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + p.decay);
        });
      }, n * 1600);
    }
  }

  // --- HEARTBEAT PULSE ---
  startHeartbeat(fast = false) {
    if (this.heartbeatTimer) return;
    const interval = fast ? 600 : 1100;
    const trigger = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.playHeartThud(now, 58, 0.4);
      this.playHeartThud(now + 0.18, 48, 0.28);
    };
    trigger();
    this.heartbeatTimer = setInterval(trigger, interval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  playHeartThud(time, freq, vol) {
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(25, time + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.18);
  }

  // --- TOTAL FACILITY POWER FAILURE ---
  playPowerShutdown() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.stopAmbientOrgan();
    this.stopHeartbeat();

    // Electrical inverter capacitor discharge
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(15, now + 1.6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + 1.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.8);

    // Emergency backup fail tone
    setTimeout(() => {
      this.playChurchBell(0.7, 1);
    }, 2000);
  }

  // --- JUMPSCARE STINGER ---
  playJumpscare() {
    if (!this.ctx) return;
    this.stopHeartbeat();
    const now = this.ctx.currentTime;

    // Screamer chord: Dissonant high-frequency screech + digital distortion
    const screamPitches = [920, 1100, 1380, 1650, 2200, 3100];
    screamPitches.forEach((pitch, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.linearRampToValueAtTime(pitch + (Math.random() - 0.5) * 160, now + 0.9);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.2);
    });

    // Sub-bass heavy transient hit
    const sub = this.ctx.createOscillator();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(160, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + 0.9);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.95, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 0.9);

    // White noise feedback burst
    const bufferSize = this.ctx.sampleRate * 1.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1800, now);
    noiseFilter.Q.setValueAtTime(1.2, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.75, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);
  }

  // --- VICTORY 06:00:00 AM FANFARE ---
  playVictoryFanfare() {
    if (!this.ctx) return;
    this.stopAmbientOrgan();
    this.stopHeartbeat();

    // Contemporary parish carillon chime sequence
    const notes = [392.00, 440.00, 493.88, 587.33, 659.25, 783.99]; // G4, A4, B4, D5, E5, G5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 2.5);
      }, idx * 420);
    });

    setTimeout(() => {
      this.playChurchBell(1.0, 3);
    }, 2800);
  }

  // --- 3D STEREO DIRECTIONAL ACOUSTIC WARNING CUES ---
  createPanner(pan = 0.0) {
    if (!this.ctx) return null;
    if (this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), this.ctx.currentTime);
      return panner;
    }
    return null;
  }

  // 1. LEFT DOOR: Heavy grinding stone footsteps echoing down the west cloister corridor
  playLeftFootstep(intensity = 0.85) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const panner = this.createPanner(-0.88); // Hard left in headphones

    // Low sub-bass stone floor impact
    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(65, now);
    sub.frequency.exponentialRampToValueAtTime(24, now + 0.35);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.42 * intensity, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    sub.connect(subGain);

    // Gritty marble dragging friction scrape
    const bufLen = Math.floor(this.ctx.sampleRate * 0.45);
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(380, now);
    noiseFilter.frequency.linearRampToValueAtTime(180, now + 0.45);
    noiseFilter.Q.setValueAtTime(3.5, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.35 * intensity, now + 0.08);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    if (panner) {
      subGain.connect(panner);
      noiseGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      subGain.connect(this.masterGain);
      noiseGain.connect(this.masterGain);
    }

    sub.start(now);
    sub.stop(now + 0.35);
    noise.start(now);
  }

  // 2. RIGHT VENT: Metallic duct clattering and hollow scraping vibrations
  playVentClatter(intensity = 0.85) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const panner = this.createPanner(0.88); // Hard right in headphones

    // Resonant sheet metal pop/ping
    const metalFrequencies = [280, 440, 780, 1150];
    metalFrequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      const delay = idx * 0.06;
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + delay + 0.2);

      const mGain = this.ctx.createGain();
      mGain.gain.setValueAtTime(0.18 * intensity, now + delay);
      mGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);

      osc.connect(mGain);
      if (panner) {
        mGain.connect(panner);
      } else {
        mGain.connect(this.masterGain);
      }
      osc.start(now + delay);
      osc.stop(now + delay + 0.2);
    });

    // Metallic scratching / hollow duct air rumble
    const bufLen = Math.floor(this.ctx.sampleRate * 0.35);
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.45;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(5.0, now);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.24 * intensity, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(nGain);

    if (panner) {
      nGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      nGain.connect(this.masterGain);
    }

    noise.start(now);
  }

  // 3. CENTER WINDOW: Haunting whispered Latin chant outside the glass
  playWindowWhisper(intensity = 0.75) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const panner = this.createPanner(0.0); // Center

    // Dual detuned eerie vocal drone
    [218, 222, 328].forEach(freq => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.96, now + 1.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09 * intensity, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      if (panner) gain.connect(panner);
      else gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.2);
    });

    // Airy whispered vocal formant breath
    const bufLen = Math.floor(this.ctx.sampleRate * 0.9);
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const formant = this.ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(850, now);
    formant.Q.setValueAtTime(6.0, now);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.001, now);
    nGain.gain.linearRampToValueAtTime(0.12 * intensity, now + 0.25);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    noise.connect(formant);
    formant.connect(nGain);

    if (panner) {
      nGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      nGain.connect(this.masterGain);
    }
    noise.start(now);
  }

  // --- FATHER THOMAS'S CASSETTE TAPE RECORDER ("PHONE GUY") ---
  getCassetteScript(night) {
    const scripts = {
      1: [
        "Hello? Hello! Ah, Father Thomas here.",
        "If you're hearing this, you survived your first few minutes in the parish security office.",
        "Now, don't worry about the rumors. The diocese has us on a strict energy quota, so keep an eye on that backup battery.",
        "That arched door on your left? It's on a magnetic lock.",
        "Lock it if you hear heavy stone steps in the corridor, but don't waste power leaving it shut.",
        "Watch the altar camera. One of the statues... she likes to wander when nobody is watching.",
        "Keep checking the cameras. God be with you tonight."
      ],
      2: [
        "Hello again! Glad to see you back for Night Two.",
        "Listen closely: you've probably noticed the big observation window right in front of your desk.",
        "Outside is the cloister hallway. Sanctus Michael... the martyr with the halo... he stalks that corridor.",
        "If you look through that glass and see him standing in the gloom, do NOT panic.",
        "Hit that halogen spotlight switch right on your desk. The beam blinds him and forces his effigy back.",
        "Keep your light usage conservative though... and check the vent. We've had strange sounds in the ductwork."
      ],
      3: [
        "Uh, hello? Okay, listen. Night Three is usually when things... escalate.",
        "The maintenance crew sealed the crypt, but the return air duct on your right connects into the sub-basement.",
        "There's an effigy down there—the Veiled Penitent. If you hear metallic clanging in the ductwork, she's crawling inside.",
        "Turn on that duct inspection light. If she's peeking right out of the grate... pull the emergency fire shutter immediately.",
        "Hold it shut until you hear her stone fingers slide back. Stay calm."
      ],
      4: [
        "Hello? (heavy static) Can you hear me? Listen... I don't have much time.",
        "They're... they're moving together now. If the power cuts, the generator won't kick in.",
        "The candles won't protect you in the dark.",
        "If you hear Latin whispering outside your window... flash the light immediately! Don't look away from CAM 01!",
        "(distant loud stone crash) Oh God... they're outside the archway... Lock the door! Lock the—",
        "(harsh tape static cut)"
      ]
    };
    return scripts[night] || null;
  }

  playCassetteTape(night, onSubtitleCallback, onEndCallback) {
    this.stopCassetteTape();
    const script = this.getCassetteScript(night);
    if (!script || !script.length) {
      if (onEndCallback) onEndCallback();
      return;
    }

    this.isCassettePlaying = true;
    this.activeCassetteNight = night;
    this._cassetteEndCallback = onEndCallback;

    // 1. Heavy physical tape deck engagement CLACK
    this.playTapeDeckClick(true);

    // 2. Continuous analog tape hiss and motor whir
    this.startCassetteHiss();

    // 3. Spoken voice line progression with typewriter subtitles
    let lineIdx = 0;

    const speakNextLine = () => {
      if (!this.isCassettePlaying || lineIdx >= script.length) {
        this.stopCassetteTape();
        return;
      }

      const phrase = script[lineIdx];
      lineIdx++;

      if (onSubtitleCallback) {
        onSubtitleCallback(phrase);
      }

      let advanced = false;
      const advanceLine = () => {
        if (advanced) return;
        advanced = true;
        if (this._cassetteLineTimer) {
          clearTimeout(this._cassetteLineTimer);
          this._cassetteLineTimer = null;
        }
        if (this.isCassettePlaying) {
          this._cassetteLineTimer = setTimeout(speakNextLine, 650);
        }
      };

      // Watchdog fallback timer (in case speech synthesis is blocked, muted, or stalls)
      const fallbackMs = Math.max(3200, phrase.length * 85);
      this._cassetteLineTimer = setTimeout(advanceLine, fallbackMs);

      if ('speechSynthesis' in window && !this.isMuted) {
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(phrase);
          utter.rate = 0.88;
          utter.pitch = 0.82;
          utter.volume = Math.min(1.0, this.masterVolume * this.sfxVolume * 0.95);

          // Pick deep male or natural voice if available
          const voices = window.speechSynthesis.getVoices();
          const priestlyVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Natural')));
          if (priestlyVoice) utter.voice = priestlyVoice;

          utter.onend = () => advanceLine();
          utter.onerror = () => advanceLine();
          window.speechSynthesis.speak(utter);
        } catch (e) {
          // Fallback timer will advance line
        }
      }
    };

    setTimeout(speakNextLine, 800);
  }

  playTapeDeckClick(isStart = true) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(isStart ? 850 : 520, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  startCassetteHiss() {
    if (!this.ctx) return;
    this.stopCassetteHiss();

    const now = this.ctx.currentTime;
    const bufLen = this.ctx.sampleRate * 2.0;
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;

    // Vintage telephone/cassette bandpass filter (350Hz to 3200Hz)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.Q.setValueAtTime(1.2, now);

    this.cassetteHissGain = this.ctx.createGain();
    this.cassetteHissGain.gain.setValueAtTime(0.001, now);
    this.cassetteHissGain.gain.linearRampToValueAtTime(0.045, now + 0.3);

    noise.connect(filter);
    filter.connect(this.cassetteHissGain);
    this.cassetteHissGain.connect(this.masterGain);
    noise.start(now);
    this.cassetteHissSource = noise;
  }

  stopCassetteHiss() {
    if (this.cassetteHissSource) {
      try { this.cassetteHissSource.stop(); } catch (e) {}
      this.cassetteHissSource = null;
    }
    this.cassetteHissGain = null;
  }

  stopCassetteTape() {
    this.isCassettePlaying = false;
    this.activeCassetteNight = null;
    if (this._cassetteLineTimer) {
      clearTimeout(this._cassetteLineTimer);
      this._cassetteLineTimer = null;
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    this.stopCassetteHiss();
    this.playTapeDeckClick(false);
    if (this._cassetteEndCallback) {
      const cb = this._cassetteEndCallback;
      this._cassetteEndCallback = null;
      try { cb(); } catch (e) {}
    }
  }
}

window.Sound = new SoundEngine();
