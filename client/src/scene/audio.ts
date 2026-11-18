export class SpatialAudioSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOscA: OscillatorNode | null = null;
  private droneOscB: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private enabled = false;

  public setEnabled(next: boolean): void {
    this.enabled = next;
    if (next) {
      this.ensureContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0.16, this.ctx.currentTime, 0.25);
      }
    } else if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.2);
    }
  }

  private ensureContext(): void {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 340;
    filter.Q.value = 1.2;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.22;
    filter.connect(droneGain);
    droneGain.connect(master);

    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.value = 65.41; // C2

    const oscB = ctx.createOscillator();
    oscB.type = 'triangle';
    oscB.frequency.value = 98.0; // G2

    oscA.connect(filter);
    oscB.connect(filter);
    oscA.start();
    oscB.start();

    this.ctx = ctx;
    this.masterGain = master;
    this.droneFilter = filter;
    this.droneOscA = oscA;
    this.droneOscB = oscB;
  }

  public playImpulseChime(frequencyHz = 329.63, strength = 1): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const harmonic = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequencyHz, now);
    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(frequencyHz * 2.0, now);

    const harmonicGain = this.ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.18, now);

    const peak = Math.min(0.28, 0.14 * strength);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(peak, now + 0.025);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);

    osc.connect(env);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(env);
    env.connect(this.masterGain);

    osc.start(now);
    harmonic.start(now);
    osc.stop(now + 1.5);
    harmonic.stop(now + 1.5);
  }

  public modulateFilter(waveEnergy: number): void {
    if (!this.enabled || !this.ctx || !this.droneFilter) return;
    const targetFreq = 260 + waveEnergy * 240;
    this.droneFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
  }

  public dispose(): void {
    try {
      this.droneOscA?.stop();
      this.droneOscB?.stop();
      void this.ctx?.close();
    } catch {
      // Ignore already closed audio contexts
    }
    this.ctx = null;
    this.masterGain = null;
    this.droneOscA = null;
    this.droneOscB = null;
    this.droneFilter = null;
  }
}
