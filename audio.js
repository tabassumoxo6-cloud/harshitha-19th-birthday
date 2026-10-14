/**
 * HARSHITHA.exe — Procedural Web Audio Engine
 * Pure Web Audio API synthesizers for zero-dependency, 100% offline retro & ambient audio!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientGain = null;
    this.ambientOscs = [];
    this.isAmbientPlaying = false;
    this.hasUserInteracted = false;
    
    // Check local storage for mute preference
    const savedMute = localStorage.getItem('harshitha_mute');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.hasUserInteracted = true;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('harshitha_mute', this.isMuted);
    if (this.isMuted) {
      this.stopAmbient();
    } else {
      // resume ambient if we're in emotional/galaxy scenes
      if (window.currentSceneIndex >= 6) {
        this.startAmbient();
      }
    }
    return this.isMuted;
  }

  // Mechanical Terminal Key Clack
  playKeyClick() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // High frequency click burst
    const freq = 1200 + Math.random() * 800;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.03);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.035);
  }

  // Retro BIOS Boot Beep
  playBootBeep() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
    osc.frequency.setValueAtTime(1760, this.ctx.currentTime + 0.08); // A6

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // Button Click / Selection Chime
  playSelect() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // Buzzer for "Lie Detected" or Wrong Password
  playBuzzer() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.setValueAtTime(120, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // Glitch Noise Burst
  playGlitch() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.2);
  }

  // 8-bit Pickup Sound (Friendship Fragment)
  playPickup() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + idx * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.05);
      osc.stop(this.ctx.currentTime + idx * 0.05 + 0.2);
    });
  }

  // NPC dialogue chirp (Undertale / Animal Crossing style)
  playDialogueChirp() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const pitches = [440, 493.88, 523.25, 587.33, 659.25];
    const pitch = pitches[Math.floor(Math.random() * pitches.length)];

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.045);
  }

  // Password Success Fanfare
  playSuccess() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const chord = [392.00, 493.88, 587.33, 783.99, 987.77]; // G maj9
    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.06);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + i * 0.06);
      osc.stop(this.ctx.currentTime + i * 0.06 + 0.65);
    });
  }

  // Ambient Emotional Pad for Galaxy and Final Letter
  startAmbient() {
    if (this.isMuted || this.isAmbientPlaying) return;
    this.resume();
    if (!this.ctx) return;

    this.isAmbientPlaying = true;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 3.0); // Gentle fade in

    // Multi-oscillator lush pad: F - A - C - E (Fmaj7 chord)
    const baseFreqs = [174.61, 220.00, 261.63, 329.63, 523.25];
    this.ambientOscs = [];

    baseFreqs.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 1.5, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(this.ambientGain);

      osc.start();
      this.ambientOscs.push(osc);
    });

    this.ambientGain.connect(this.ctx.destination);
  }

  stopAmbient() {
    if (!this.isAmbientPlaying) return;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
      setTimeout(() => {
        this.ambientOscs.forEach(osc => {
          try { osc.stop(); } catch(e){}
        });
        this.ambientOscs = [];
        this.isAmbientPlaying = false;
      }, 1050);
    }
  }

  // Red Siren for "Delete Friendship" attempt
  playSiren() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.31);
  }

  // Grand Achievement Fanfare
  playAchievementFanfare() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    arpeggio.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.45);
    });
  }

  // Chiptune / Music-box Happy Birthday Melody Synthesizer
  playBirthdayMelody() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    // Happy Birthday notes and note durations
    const melody = [
      { f: 261.63, d: 0.25 }, // Hap-
      { f: 261.63, d: 0.25 }, // py
      { f: 293.66, d: 0.5 },  // birth-
      { f: 261.63, d: 0.5 },  // day
      { f: 349.23, d: 0.5 },  // to
      { f: 329.63, d: 0.9 },  // you
      { f: 0,      d: 0.2 },  // rest

      { f: 261.63, d: 0.25 }, // Hap-
      { f: 261.63, d: 0.25 }, // py
      { f: 293.66, d: 0.5 },  // birth-
      { f: 261.63, d: 0.5 },  // day
      { f: 392.00, d: 0.5 },  // to
      { f: 349.23, d: 0.9 },  // you
      { f: 0,      d: 0.2 },  // rest

      { f: 261.63, d: 0.25 }, // Hap-
      { f: 261.63, d: 0.25 }, // py
      { f: 523.25, d: 0.5 },  // dear
      { f: 440.00, d: 0.5 },  // Har-
      { f: 349.23, d: 0.4 },  // shi-
      { f: 329.63, d: 0.4 },  // tha
      { f: 293.66, d: 0.8 },  // ...
      { f: 0,      d: 0.2 },  // rest

      { f: 466.16, d: 0.25 }, // Hap-
      { f: 466.16, d: 0.25 }, // py
      { f: 440.00, d: 0.5 },  // birth-
      { f: 349.23, d: 0.5 },  // day
      { f: 392.00, d: 0.6 },  // to
      { f: 349.23, d: 1.2 }   // you!
    ];

    let t = this.ctx.currentTime + 0.1;
    melody.forEach(note => {
      if (note.f > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d * 0.95);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + note.d);
      }
      t += note.d * 1.05;
    });
  }

  // Realistic Balloon Pop Synthesizer
  playPop() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450 + Math.random() * 200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.06);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Soft Candle Whoosh / Blow Sound
  playCandleBlow() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.25);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.26);
  }
}

// Global Sound Instance
const sound = new SoundEngine();
