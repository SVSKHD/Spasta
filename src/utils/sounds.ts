export class SoundManager {
  private static instance: SoundManager;
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private enabled = true;

  private constructor() {
    this.sounds = {
      drag: new Audio("/sounds/drag.mp3"),
      drop: new Audio("/sounds/drop.mp3"),
      complete: new Audio("/sounds/complete.mp3"),
    };

    // Preload sounds
    Object.values(this.sounds).forEach((sound) => {
      sound.load();
      sound.volume = 0.5; // Set default volume to 50%
    });
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public play(soundName: "drag" | "drop" | "complete"): void {
    if (!this.enabled) return;

    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((error) => {
        console.warn("Sound playback failed:", error);
      });
    }
  }

  public toggle(): void {
    this.enabled = !this.enabled;
  }

  public setVolume(volume: number): void {
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = Math.max(0, Math.min(1, volume));
    });
  }
}

export const soundManager = SoundManager.getInstance();
