/**
 * Audio Synthesizer Engine for AP RTC Bus Simulator
 * Uses Web Audio API for 100% reliable, zero-latency, interactive sounds:
 * - Multi-harmonic heavy diesel engine sound that responds to RPM and load
 * - Air brakes pneumatic release hiss
 * - Indian dual-tone / air horn
 * - Indicator relay tick
 * - Pneumatic doors open/close
 * - Conductor whistle and bell
 * - Toll beep, diesel refueling, bus wash jets, rain
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private oscLow: OscillatorNode | null = null;
  private oscMid: OscillatorNode | null = null;
  private oscSub: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private hornOsc1: OscillatorNode | null = null;
  private hornOsc2: OscillatorNode | null = null;
  private hornGain: GainNode | null = null;
  private isHornPlaying: boolean = false;
  private isEngineRunning: boolean = false;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch {
      console.warn('Web Audio API not supported');
    }
  }

  private ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startEngine() {
    this.ensureContext();
    if (!this.ctx || this.isEngineRunning) return;

    try {
      const t = this.ctx.currentTime;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.22, t);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(180, t);

      // Low rumble (diesel piston combustion)
      this.oscLow = this.ctx.createOscillator();
      this.oscLow.type = 'sawtooth';
      this.oscLow.frequency.setValueAtTime(26, t); // ~750 RPM idle

      // Sub bass rumble
      this.oscSub = this.ctx.createOscillator();
      this.oscSub.type = 'triangle';
      this.oscSub.frequency.setValueAtTime(13, t);

      // Mid harmonic engine resonance
      this.oscMid = this.ctx.createOscillator();
      this.oscMid.type = 'sawtooth';
      this.oscMid.frequency.setValueAtTime(52, t);

      // Exhaust air hiss
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(140, t);
      noiseFilter.Q.setValueAtTime(2.0, t);

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.04, t);

      this.noiseNode.connect(noiseFilter);
      noiseFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.engineGain);

      this.oscLow.connect(this.engineFilter);
      this.oscSub.connect(this.engineFilter);
      this.oscMid.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.oscLow.start();
      this.oscSub.start();
      this.oscMid.start();
      this.noiseNode.start();

      this.isEngineRunning = true;
    } catch (e) {
      console.warn('Engine audio start error', e);
    }
  }

  public updateEngine(rpm: number, throttle: number, speedKmh: number) {
    if (!this.ctx || !this.isEngineRunning || !this.oscLow || !this.engineFilter) return;

    try {
      const t = this.ctx.currentTime;
      // Idle ~700 RPM -> Max ~2600 RPM
      const baseFreq = 22 + (rpm / 2400) * 48;
      this.oscLow.frequency.setTargetAtTime(baseFreq, t, 0.05);
      if (this.oscSub) this.oscSub.frequency.setTargetAtTime(baseFreq * 0.5, t, 0.05);
      if (this.oscMid) this.oscMid.frequency.setTargetAtTime(baseFreq * 2.0, t, 0.05);

      // Filter opens up as throttle opens
      const filterCutoff = 150 + throttle * 280 + (speedKmh / 100) * 120;
      this.engineFilter.frequency.setTargetAtTime(filterCutoff, t, 0.08);

      if (this.engineGain) {
        const vol = this.isMuted ? 0 : 0.18 + throttle * 0.12 + Math.min(speedKmh / 120, 0.1);
        this.engineGain.gain.setTargetAtTime(vol, t, 0.05);
      }
    } catch {
      // Audio node might be closing
    }
  }

  public stopEngine() {
    try {
      this.oscLow?.stop();
      this.oscSub?.stop();
      this.oscMid?.stop();
      this.noiseNode?.stop();
      this.isEngineRunning = false;
    } catch {}
  }

  public playAirBrakeHiss() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      source.start();
    } catch {}
  }

  public startHorn() {
    this.ensureContext();
    if (!this.ctx || this.isHornPlaying || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      // Indian RTC electric dual-tone horn (370 Hz & 440 Hz)
      this.hornOsc1 = this.ctx.createOscillator();
      this.hornOsc1.type = 'sawtooth';
      this.hornOsc1.frequency.setValueAtTime(370, t);

      this.hornOsc2 = this.ctx.createOscillator();
      this.hornOsc2.type = 'sawtooth';
      this.hornOsc2.frequency.setValueAtTime(440, t);

      const hornFilter = this.ctx.createBiquadFilter();
      hornFilter.type = 'lowpass';
      hornFilter.frequency.setValueAtTime(1200, t);

      this.hornGain = this.ctx.createGain();
      this.hornGain.gain.setValueAtTime(0.0, t);
      this.hornGain.gain.linearRampToValueAtTime(0.35, t + 0.05);

      this.hornOsc1.connect(hornFilter);
      this.hornOsc2.connect(hornFilter);
      hornFilter.connect(this.hornGain);
      this.hornGain.connect(this.ctx.destination);

      this.hornOsc1.start();
      this.hornOsc2.start();
      this.isHornPlaying = true;
    } catch {}
  }

  public stopHorn() {
    if (!this.ctx || !this.isHornPlaying) return;
    try {
      const t = this.ctx.currentTime;
      if (this.hornGain) {
        this.hornGain.gain.cancelScheduledValues(t);
        this.hornGain.gain.setValueAtTime(this.hornGain.gain.value, t);
        this.hornGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      }
      setTimeout(() => {
        try {
          this.hornOsc1?.stop();
          this.hornOsc2?.stop();
        } catch {}
        this.isHornPlaying = false;
      }, 90);
    } catch {
      this.isHornPlaying = false;
    }
  }

  public playIndicatorClick() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {}
  }

  public playDoorSound(open: boolean) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.9;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(open ? 900 : 650, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.85);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      source.start();
    } catch {}
  }

  public playConductorWhistle() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.linearRampToValueAtTime(2600, t + 0.15);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch {}
  }

  public playConductorBell() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      // Two quick bell chimes: "Ting-Ting"
      [0, 0.16].forEach((delay) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, t + delay);
        gain.gain.setValueAtTime(0.22, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.15);
      });
    } catch {}
  }

  public playSpeedBreakerThud(intensity: number) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(65, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.18);
      const volume = Math.min(0.4, 0.1 + intensity * 0.25);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch {}
  }

  public playTollBeep() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1320, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch {}
  }

  public playWashSound() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 2.0);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      source.start();
    } catch {}
  }

  public setWeatherRain(isRaining: boolean) {
    if (!this.ctx) return;
    if (isRaining && !this.rainSource) {
      try {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        this.rainSource = this.ctx.createBufferSource();
        this.rainSource.buffer = buffer;
        this.rainSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, this.ctx.currentTime);

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, this.ctx.currentTime);

        this.rainSource.connect(filter);
        filter.connect(this.rainGain);
        this.rainGain.connect(this.ctx.destination);
        this.rainSource.start();
      } catch {}
    } else if (!isRaining && this.rainSource) {
      try {
        this.rainSource.stop();
        this.rainSource = null;
      } catch {}
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.engineGain) {
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.22, this.ctx?.currentTime || 0);
    }
    if (this.rainGain) {
      this.rainGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, this.ctx?.currentTime || 0);
    }
    return this.isMuted;
  }

  public isSoundMuted() {
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();
