import { Howl, Howler } from 'howler'
import type { SoundId, SoundConfig, AudioSettings } from './sounds'
import { SOUNDS_CONFIG, DEFAULT_AUDIO_SETTINGS } from './sounds'

export class AudioManager {
  private static instance: AudioManager | null = null
  private sounds: Map<SoundId, Howl> = new Map()
  private settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS }
  private initialized = false
  private loadingPromises: Map<SoundId, Promise<void>> = new Map()
  private pausedSounds: Set<SoundId> = new Set()

  private constructor() {
    this.loadSettings()
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Preload all sounds marked for preloading
      const preloadPromises = Object.values(SOUNDS_CONFIG)
        .filter((config) => config.preload)
        .map((config) => this.loadSound(config))

      await Promise.allSettled(preloadPromises)
      this.initialized = true
      this.applySettings()
    } catch (error) {
      console.warn('Audio initialization failed:', error)
    }
  }

  private loadSound(config: SoundConfig): Promise<void> {
    if (this.sounds.has(config.id)) {
      return Promise.resolve()
    }

    if (this.loadingPromises.has(config.id)) {
      return this.loadingPromises.get(config.id)!
    }

    const promise = new Promise<void>((resolve, reject) => {
      const howl = new Howl({
        src: [config.src],
        volume: config.volume ?? 1.0,
        loop: config.loop ?? false,
        preload: true,
        onload: () => {
          this.sounds.set(config.id, howl)
          this.loadingPromises.delete(config.id)
          resolve()
        },
        onloaderror: (_id, error) => {
          console.warn(`Failed to load sound ${config.id}:`, error)
          this.loadingPromises.delete(config.id)
          reject(new Error(`Failed to load sound ${config.id}`))
        },
      })
    })

    this.loadingPromises.set(config.id, promise)
    return promise
  }

  public async play(
    soundId: SoundId,
    options?: { volume?: number; loop?: boolean; stopPrevious?: boolean },
  ): Promise<void> {
    if (this.settings.muted) return

    let sound = this.sounds.get(soundId)

    if (!sound) {
      const config = SOUNDS_CONFIG[soundId]
      if (!config) {
        console.warn(`Sound config not found: ${soundId}`)
        return
      }

      try {
        await this.loadSound(config)
        sound = this.sounds.get(soundId)
      } catch (error) {
        console.warn(`Failed to load sound on-demand: ${soundId}`, error)
        return
      }
    }

    if (!sound) return

    // Stop previous instance if requested (useful for rapid fire sounds like chomp)
    if (options?.stopPrevious === true) {
      sound.stop()
    }

    // Calculate final volume
    const config = SOUNDS_CONFIG[soundId]
    const baseVolume = options?.volume ?? config.volume ?? 1.0
    const categoryMultiplier =
      config.category === 'music' ? this.settings.musicVolume : this.settings.sfxVolume
    const finalVolume = baseVolume * categoryMultiplier * this.settings.masterVolume

    sound.volume(finalVolume)

    if (options?.loop !== undefined) {
      sound.loop(options.loop)
    }

    sound.play()
  }

  public stop(soundId: SoundId): void {
    const sound = this.sounds.get(soundId)
    if (sound) {
      sound.stop()
    }
  }

  public stopAll(): void {
    this.sounds.forEach((sound) => {
      sound.stop()
    })
  }

  public pause(soundId: SoundId): void {
    const sound = this.sounds.get(soundId)
    if (sound) {
      sound.pause()
      this.pausedSounds.add(soundId)
    }
  }

  public pauseAll(): void {
    this.sounds.forEach((sound, soundId) => {
      sound.pause()
      this.pausedSounds.add(soundId)
    })
  }

  public resume(soundId: SoundId): void {
    const sound = this.sounds.get(soundId)
    if (sound) {
      sound.play()
      this.pausedSounds.delete(soundId)
    }
  }

  public resumeAll(): void {
    this.pausedSounds.forEach((soundId) => {
      const sound = this.sounds.get(soundId)
      if (sound && sound.state() === 'loaded') {
        sound.play()
      }
    })
    this.pausedSounds.clear()
  }

  public isPlaying(soundId: SoundId): boolean {
    const sound = this.sounds.get(soundId)
    return sound ? sound.playing() : false
  }

  public setSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    this.applySettings()
  }

  public getSettings(): AudioSettings {
    return { ...this.settings }
  }

  private applySettings(): void {
    if (this.settings.muted) {
      Howler.mute(true)
    } else {
      Howler.mute(false)
      Howler.volume(this.settings.masterVolume)
    }

    // Update individual sound volumes if they're loaded
    this.sounds.forEach((sound, soundId) => {
      const config = SOUNDS_CONFIG[soundId]
      const baseVolume = config.volume ?? 1.0
      const categoryMultiplier =
        config.category === 'music' ? this.settings.musicVolume : this.settings.sfxVolume
      const finalVolume = baseVolume * categoryMultiplier * this.settings.masterVolume
      sound.volume(finalVolume)
    })
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('pacman-audio-settings')
      if (saved) {
        this.settings = { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error)
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('pacman-audio-settings', JSON.stringify(this.settings))
    } catch (error) {
      console.warn('Failed to save audio settings:', error)
    }
  }

  public destroy(): void {
    this.stopAll()
    this.sounds.forEach((sound) => {
      sound.unload()
    })
    this.sounds.clear()
    this.loadingPromises.clear()
    this.initialized = false
    AudioManager.instance = null
  }
}

export const audioManager = AudioManager.getInstance()
