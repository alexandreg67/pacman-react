/**
 * Z-index constants for layering elements in the game
 * Higher values appear on top of lower values
 */
export const Z_INDEX = {
  // Game elements base layer
  GAME_BACKGROUND: 1,

  // Game entities (incrementally layered)
  FRUIT: 80,
  GHOSTS: 90,
  PACMAN: 100,

  // UI overlays
  MODAL_BACKDROP: 1000,
  GAME_OVER_MODAL: 1001,

  // Critical overlays (should always be on top)
  TOAST_NOTIFICATIONS: 2000,
  DEBUG_OVERLAY: 9000,
} as const

export type ZIndexKey = keyof typeof Z_INDEX
