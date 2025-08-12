export type SoundId =
  // Gameplay sounds
  | 'chomp'
  | 'death'
  | 'eating-ghost'
  | 'eating-fruit'
  | 'extend'
  | 'ghost-normal-move'
  | 'ghost-return-to-home'
  | 'ghost-spurt-move-1'
  | 'ghost-spurt-move-2'
  | 'ghost-spurt-move-3'
  | 'ghost-spurt-move-4'
  | 'ghost-turn-to-blue'
  // Music
  | 'start-music'
  | 'coffee-break-music'
  // UI
  | 'credit'

export type SoundCategory = 'gameplay' | 'music' | 'ui'

export interface SoundConfig {
  id: SoundId
  src: string
  category: SoundCategory
  loop?: boolean
  volume?: number
  preload?: boolean
}

export const SOUNDS_CONFIG: Record<SoundId, SoundConfig> = {
  // Gameplay sounds
  chomp: {
    id: 'chomp',
    src: '/audio/gameplay/chomp.mp3',
    category: 'gameplay',
    volume: 0.9, // Plus fort pour dominer l'ambiance
    loop: false,
    preload: true,
  },
  death: {
    id: 'death',
    src: '/audio/gameplay/death.mp3',
    category: 'gameplay',
    volume: 0.8,
    preload: true,
  },
  'eating-ghost': {
    id: 'eating-ghost',
    src: '/audio/gameplay/eating-ghost.mp3',
    category: 'gameplay',
    volume: 0.8,
    preload: true,
  },
  'eating-fruit': {
    id: 'eating-fruit',
    src: '/audio/gameplay/eating-fruit.mp3',
    category: 'gameplay',
    volume: 0.8,
    preload: true,
  },
  extend: {
    id: 'extend',
    src: '/audio/gameplay/extend.mp3',
    category: 'gameplay',
    volume: 0.9,
    preload: true,
  },
  'ghost-normal-move': {
    id: 'ghost-normal-move',
    src: '/audio/gameplay/ghost-normal-move.mp3',
    category: 'gameplay',
    volume: 0.2, // Légèrement plus faible pour l'équilibre
    loop: true,
    preload: true,
  },
  'ghost-return-to-home': {
    id: 'ghost-return-to-home',
    src: '/audio/gameplay/ghost-return-to-home.mp3',
    category: 'gameplay',
    volume: 0.3,
    loop: true,
    preload: true,
  },
  'ghost-spurt-move-1': {
    id: 'ghost-spurt-move-1',
    src: '/audio/gameplay/ghost-spurt-move-1.mp3',
    category: 'gameplay',
    volume: 0.25,
    loop: true,
    preload: true,
  },
  'ghost-spurt-move-2': {
    id: 'ghost-spurt-move-2',
    src: '/audio/gameplay/ghost-spurt-move-2.mp3',
    category: 'gameplay',
    volume: 0.25,
    loop: true,
    preload: true,
  },
  'ghost-spurt-move-3': {
    id: 'ghost-spurt-move-3',
    src: '/audio/gameplay/ghost-spurt-move-3.mp3',
    category: 'gameplay',
    volume: 0.25,
    loop: true,
    preload: true,
  },
  'ghost-spurt-move-4': {
    id: 'ghost-spurt-move-4',
    src: '/audio/gameplay/ghost-spurt-move-4.mp3',
    category: 'gameplay',
    volume: 0.25,
    loop: true,
    preload: true,
  },
  'ghost-turn-to-blue': {
    id: 'ghost-turn-to-blue',
    src: '/audio/gameplay/ghost-turn-to-blue.mp3',
    category: 'gameplay',
    volume: 0.8,
    preload: true,
  },
  // Music
  'start-music': {
    id: 'start-music',
    src: '/audio/music/start-music.mp3',
    category: 'music',
    volume: 0.6,
    preload: true,
  },
  'coffee-break-music': {
    id: 'coffee-break-music',
    src: '/audio/music/coffee-break-music.mp3',
    category: 'music',
    volume: 0.5,
    loop: true,
    preload: true,
  },
  // UI
  credit: {
    id: 'credit',
    src: '/audio/ui/credit.mp3',
    category: 'ui',
    volume: 0.7,
    preload: true,
  },
}

export interface AudioSettings {
  masterVolume: number
  sfxVolume: number
  musicVolume: number
  muted: boolean
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.8,
  sfxVolume: 1.0,
  musicVolume: 1.0,
  muted: false,
}
