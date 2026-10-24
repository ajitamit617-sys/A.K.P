import { midiToFrequency } from './musicTheory';

export type InstrumentType = 'piano' | 'rhodes' | 'organ' | 'synth' | 'guitar';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private isMuted = false;
  private currentInstrument: InstrumentType = 'piano';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setInstrument(type: InstrumentType) {
    this.currentInstrument = type;
  }

  public getInstrument(): InstrumentType {
    return this.currentInstrument;
  }

  public setVolume(val: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Play a single note by MIDI number
  public playNote(midi: number, durationSeconds = 1.2, delaySeconds = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const freq = midiToFrequency(midi);
    const startTime = this.ctx.currentTime + delaySeconds;
    const instrument = this.currentInstrument;

    if (instrument === 'piano') {
      this.synthPiano(freq, startTime, durationSeconds);
    } else if (instrument === 'rhodes') {
      this.synthRhodes(freq, startTime, durationSeconds);
    } else if (instrument === 'organ') {
      this.synthOrgan(freq, startTime, durationSeconds);
    } else if (instrument === 'synth') {
      this.synthAnalogLead(freq, startTime, durationSeconds);
    } else {
      this.synthGuitarPluck(freq, startTime, durationSeconds);
    }
  }

  // Play a chord (array of MIDI numbers) with optional roll/strum effect
  public playChord(midis: number[], isStrummed = true, durationSeconds = 2.0) {
    if (this.isMuted || midis.length === 0) return;
    this.initContext();

    midis.forEach((midi, idx) => {
      const delay = isStrummed ? idx * 0.038 : 0;
      this.playNote(midi, durationSeconds, delay);
    });
  }

  // Play a scale sequence (ascending or descending)
  public playSequence(
    midis: number[],
    stepDelaySeconds = 0.28,
    onStep?: (index: number) => void,
    onComplete?: () => void
  ): () => void {
    if (this.isMuted || midis.length === 0) {
      if (onComplete) onComplete();
      return () => {};
    }
    this.initContext();

    const timeouts: number[] = [];

    midis.forEach((midi, idx) => {
      const t = window.setTimeout(() => {
        this.playNote(midi, 0.7);
        if (onStep) onStep(idx);
        if (idx === midis.length - 1 && onComplete) {
          window.setTimeout(onComplete, 700);
        }
      }, idx * stepDelaySeconds * 1000);
      timeouts.push(t);
    });

    // Return cancel function
    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }

  // Start continuous pedal/drone tone for ear training
  public startDrone(midi: number) {
    this.stopDrone();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const freq = midiToFrequency(midi);
    this.droneOsc = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();

    this.droneOsc.type = 'triangle';
    this.droneOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Warm low-pass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.droneGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.8);

    this.droneOsc.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc.start();
  }

  public stopDrone() {
    if (this.droneOsc && this.droneGain && this.ctx) {
      try {
        this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, this.ctx.currentTime);
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
        const osc = this.droneOsc;
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        }, 350);
      } catch {}
      this.droneOsc = null;
      this.droneGain = null;
    }
  }

  // --- Timbre Synthesizers ---

  // 1. Acoustic Concert Grand Piano timbre (additive synthesis with harmonics)
  private synthPiano(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const harmonics = [
      { mult: 1, gain: 0.6 },
      { mult: 2, gain: 0.25 },
      { mult: 3, gain: 0.12 },
      { mult: 4, gain: 0.05 },
      { mult: 5, gain: 0.02 },
    ];

    harmonics.forEach(({ mult, gain: hGain }) => {
      const osc = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();

      osc.type = mult === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq * mult, startTime);

      // Acoustic envelope: quick attack, natural exponential decay
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(hGain * 0.45, startTime + 0.008);
      gainNode.gain.exponentialRampToValueAtTime(hGain * 0.1, startTime + duration * 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  // 2. Rhodes Electric Piano (bell-like tine + warm body)
  private synthRhodes(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    // Fundamental body
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(freq, startTime);

    bodyGain.gain.setValueAtTime(0.0001, startTime);
    bodyGain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.015);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 1.2);

    // High tine shimmer (7th harmonic bell)
    const tineOsc = this.ctx.createOscillator();
    const tineGain = this.ctx.createGain();
    tineOsc.type = 'triangle';
    tineOsc.frequency.setValueAtTime(freq * 4.02, startTime);

    tineGain.gain.setValueAtTime(0.0001, startTime);
    tineGain.gain.exponentialRampToValueAtTime(0.08, startTime + 0.005);
    tineGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

    bodyOsc.connect(bodyGain);
    tineOsc.connect(tineGain);
    bodyGain.connect(this.masterGain);
    tineGain.connect(this.masterGain);

    bodyOsc.start(startTime);
    tineOsc.start(startTime);
    bodyOsc.stop(startTime + duration + 0.1);
    tineOsc.stop(startTime + 0.4);
  }

  // 3. Jazz Organ (Drawbar additive tone)
  private synthOrgan(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const drawbars = [
      { mult: 0.5, gain: 0.15 }, // Sub
      { mult: 1, gain: 0.3 },    // Principal
      { mult: 1.5, gain: 0.12 }, // Quint
      { mult: 2, gain: 0.18 },   // Octave
      { mult: 3, gain: 0.08 },   // Tierce
    ];

    drawbars.forEach(({ mult, gain: dGain }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * mult, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(dGain * 0.4, startTime + 0.02);
      gain.gain.setValueAtTime(dGain * 0.4, startTime + duration * 0.85);
      gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  // 4. Analog Synth Lead / Pad
  private synthAnalogLead(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 1.006, startTime); // subtle detune for warmth

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 1.2, startTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 3.5, startTime + 0.08);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + duration);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.05);
    osc2.stop(startTime + duration + 0.05);
  }

  // 5. Acoustic Guitar Pluck
  private synthGuitarPluck(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 5.0, startTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.0, startTime + 0.25);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }
}

export const soundEngine = new AudioEngine();
