import { create } from 'zustand'

interface GameState {
  score: number
  lives: number
  setScore: (score: number) => void
  incrementScore: (delta?: number) => void
  loseLife: () => void
  reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  lives: 3,
  setScore: (score) => set({ score }),
  incrementScore: (delta = 1) => set((s) => ({ score: s.score + delta })),
  loseLife: () => set((s) => ({ lives: Math.max(0, s.lives - 1) })),
  reset: () => set({ score: 0, lives: 3 }),
}))
