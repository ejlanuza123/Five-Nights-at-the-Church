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

    // Background Chant & Church Ambiance Music
    this.bgmAudio = null;
    this.bgmBlobUrl = null;
    this.bgmLoaded = false;
    this.bgmBaseVolume = 0.65;
    this.bgmPlaying = false;
    this.initBGM();
  }

  initBGM() {
    try {
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio(this.bgmBlobUrl || 'assets/audio/Dark Ambient - Horror.mp3');
        this.bgmAudio.loop = true;
        this.bgmAudio.preload = 'auto';
        this.updateBGMVolume();
      }
    } catch (e) {
      console.warn('Could not initialize BGM audio element:', e);
    }
  }

  setupAudioElement(src) {
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio();
      this.bgmAudio.loop = true;
      this.bgmAudio.preload = 'auto';
    }
    this.bgmAudio.src = src;
    this.updateBGMVolume();
  }

  async preloadBGM(onProgress = null) {
    if (this.bgmLoaded && this.bgmBlobUrl) {
      if (onProgress) onProgress(1.0, 'Ambiance audio 100% cached');
      return true;
    }

    const candidateUrls = [
      'assets/audio/Dark Ambient - Horror.mp3',
      'assets/audio/Dark%20Ambient%20-%20Horror.mp3',
      'assets/audio/church_theme_ambiance.mp3',
      'assets/audio/Creepy Church Choir Music.mp3',
      'assets/audio/Creepy%20Church%20Choir%20Music.mp3'
    ];

    let response = null;
    let chosenUrl = candidateUrls[0];
    for (const url of candidateUrls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          response = res;
          chosenUrl = url;
          break;
        }
      } catch (e) {}
    }

    if (!response) {
      console.warn('[SoundEngine] Could not fetch audio track via network, falling back to direct URL');
      this.setupAudioElement(candidateUrls[0]);
      this.bgmLoaded = true;
      if (onProgress) onProgress(1.0, 'Ambiance Audio Ready');
      return false;
    }

    try {
      const contentLengthHeader = response.headers.get('content-length');
      const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 24005622;

      if (!response.body) {
        const blob = await response.blob();
        this.bgmBlobUrl = URL.createObjectURL(blob);
        this.setupAudioElement(this.bgmBlobUrl);
        this.bgmLoaded = true;
        if (onProgress) onProgress(1.0, 'Ambiance audio 100% cached');
        return true;
      }

      const reader = response.body.getReader();
      let receivedBytes = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedBytes += value.length;
        const progressRatio = Math.min(1.0, receivedBytes / totalBytes);
        if (onProgress) {
          const mbReceived = (receivedBytes / (1024 * 1024)).toFixed(1);
          const mbTotal = (totalBytes / (1024 * 1024)).toFixed(1);
          onProgress(progressRatio, `Preloading Dark Ambient Horror Track (${mbReceived} MB / ${mbTotal} MB)`);
        }
      }

      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      this.bgmBlobUrl = URL.createObjectURL(blob);
      this.setupAudioElement(this.bgmBlobUrl);
      this.bgmLoaded = true;
      if (onProgress) onProgress(1.0, 'Dark Horror Ambience 100% Loaded in Memory');
      return true;
    } catch (err) {
      console.warn('[SoundEngine] Fetch audio preload error, fallback to direct streaming:', err);
      this.setupAudioElement(chosenUrl);
      this.bgmLoaded = true;
      if (onProgress) onProgress(1.0, 'Ambiance Audio Ready');
      return false;
    }
  }

  updateBGMVolume() {
    if (!this.bgmAudio) return;
    try {
      const vol = this.isMuted ? 0 : Math.max(0, Math.min(1, this.masterVolume * this.musicVolume * this.bgmBaseVolume));
      this.bgmAudio.volume = vol;
    } catch (e) {}
  }

  startBGM() {
    this.initBGM();
    if (!this.bgmAudio) return;
    this.updateBGMVolume();
    if (this.bgmAudio.paused) {
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.bgmPlaying = true;
        }).catch((err) => {
          // Autoplay will be unlocked on user gesture
          this.bgmPlaying = false;
        });
      }
    }
  }

  stopBGM(fade = true) {
    if (!this.bgmAudio || this.bgmAudio.paused) return;
    if (fade) {
      const startVol = this.bgmAudio.volume;
      const startTime = performance.now();
      const fadeDuration = 700;
      const fadeStep = () => {
        const elapsed = performance.now() - startTime;
        if (elapsed < fadeDuration && !this.bgmAudio.paused) {
          this.bgmAudio.volume = Math.max(0, startVol * (1 - elapsed / fadeDuration));
          requestAnimationFrame(fadeStep);
        } else {
          this.bgmAudio.pause();
          this.updateBGMVolume();
          this.bgmPlaying = false;
        }
      };
      requestAnimationFrame(fadeStep);
    } else {
      this.bgmAudio.pause();
      this.bgmPlaying = false;
    }
  }

  pauseBGM() {
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.bgmAudio.pause();
      this.bgmPlaying = false;
    }
  }

  resumeBGM() {
    if (this.bgmAudio && this.bgmAudio.paused) {
      this.startBGM();
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
}

window.Sound = new SoundEngine();
