// Audio synthesis and playback

import { AUDIO_CUES } from "../constants";

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private muted = false;

  constructor() {
    // Audio context needs user gesture
    document.addEventListener("click", this.arm);
    document.addEventListener("keydown", this.arm);
    document.addEventListener("touchstart", this.arm);
  }

  private arm = () => {
    if (this.audioContext) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AC();
    } catch {
      console.warn("Audio context not available");
    }

    document.removeEventListener("click", this.arm);
    document.removeEventListener("keydown", this.arm);
    document.removeEventListener("touchstart", this.arm);
  };

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  playCue(cueName: string): void {
    if (this.muted || !this.audioContext) return;

    // Use a simple approach to generate different sounds
    switch (cueName) {
      case AUDIO_CUES.PADDLE_HIT:
        this.playSound(400, 0.05, 0.1);
        break;
      case AUDIO_CUES.WALL_BOUNCE:
        this.playSound(300, 0.03, 0.08);
        break;
      case AUDIO_CUES.OBSTACLE_BOUNCE:
        this.playSound(350, 0.03, 0.08);
        break;
      case AUDIO_CUES.SCORE:
        this.playSound(600, 0.1, 0.2);
        break;
    }
  }

  private playSound(frequency: number, duration: number, volume: number): void {
    if (!this.audioContext || this.muted) return;

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.frequency.value = frequency;
    osc.type = "sine";

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  destroy(): void {
    document.removeEventListener("click", this.arm);
    document.removeEventListener("keydown", this.arm);
    document.removeEventListener("touchstart", this.arm);
  }
}
