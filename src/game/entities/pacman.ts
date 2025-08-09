import type { Direction, GameState } from '../types'
import { isWall } from '../logic/collision'

export function dirToDelta(dir: Direction): { dx: number; dy: number } {
  switch (dir) {
    case 'up':
      return { dx: 0, dy: -1 }
    case 'down':
      return { dx: 0, dy: 1 }
    case 'left':
      return { dx: -1, dy: 0 }
    case 'right':
      return { dx: 1, dy: 0 }
  }
}

/**
 * Résultat du wrap horizontal avec information sur le wrapping
 */
type HorizontalWrapResult = { x: number; wrapped: boolean }

/**
 * Gère le wrap horizontal (tunnel gauche-droite) avec détection dynamique.
 * Utilise les tunnels détectés automatiquement par computeTunnelRows() pour
 * déterminer si Pac-Man peut traverser d'un côté à l'autre de l'écran.
 *
 * La détection dynamique analyse la grille en temps réel :
 * - Identifie les lignes où la première OU dernière cellule n'est pas un mur
 * - S'adapte automatiquement à toute configuration de grille
 * - Élimine le besoin d'indices hardcodés
 *
 * @param state L'état actuel du jeu (contient tunnelRows calculés dynamiquement)
 * @param nx Position X calculée (peut être hors limites)
 * @param ny Position Y
 * @returns Un objet contenant la position X ajustée et un booléen indiquant si le wrap a eu lieu
 */
function handleHorizontalWrap(state: GameState, nx: number, ny: number): HorizontalWrapResult {
  const w = state.grid[0]?.length ?? 0

  // Vérifier si on est sur une ligne de tunnel (détectée dynamiquement)
  if (!state.tunnelRows.includes(ny)) {
    return { x: nx, wrapped: false } // Pas de wrap sur cette ligne
  }

  if (nx < 0) {
    // Tentative de sortie par la gauche -> wrap à droite si possible
    if (!isWall(state.grid, w - 1, ny)) {
      return { x: w - 1, wrapped: true }
    }
  } else if (nx >= w) {
    // Tentative de sortie par la droite -> wrap à gauche si possible
    if (!isWall(state.grid, 0, ny)) {
      return { x: 0, wrapped: true }
    }
  }

  return { x: nx, wrapped: false } // Position normale ou wrap impossible
}

/**
 * Gère le wrap vertical (tunnel haut-bas).
 * Pour le gameplay classique, cette fonction ne fait rien.
 * Elle est prête pour une future extension si nécessaire.
 * @param state L'état actuel du jeu
 * @param nx Position X
 * @param ny Position Y calculée (peut être hors limites)
 * @returns Position Y ajustée ou null si le wrap n'est pas possible
 */
function handleVerticalWrap(state: GameState, _nx: number, ny: number): number | null {
  const h = state.grid.length

  // Pour le gameplay classique Pac-Man, pas de wrap vertical
  // Cette logique pourrait être activée dans le futur via une configuration
  if (ny < 0 || ny >= h) {
    return null // Pas de wrap vertical dans le gameplay classique
  }

  return ny // Position normale
}

/**
 * Try to move in the input direction. If blocked by a wall, attempt to
 * continue moving in the current direction (classic buffered turning behavior).
 */
export function attemptMove(state: GameState, inputDir: Direction): GameState {
  const tryDir = (dir: Direction): GameState | null => {
    const { dx, dy } = dirToDelta(dir)
    const rawX = state.pacman.x + dx
    const rawY = state.pacman.y + dy

    // Gestion du wrap horizontal (tunnels gauche-droite)
    const { x: wrappedX, wrapped } = handleHorizontalWrap(state, rawX, rawY)

    // Gestion du wrap vertical (pour future extension)
    const wrappedY = handleVerticalWrap(state, wrappedX, rawY)
    if (wrappedY === null) return null

    const finalX = wrappedX
    const finalY = wrappedY

    // Vérification finale des collisions
    if (isWall(state.grid, finalX, finalY)) return null

    // Retourner le nouvel état avec info de wrap pour optimisations UI
    return { ...state, pacman: { x: finalX, y: finalY }, dir, justWrapped: wrapped }
  }

  const turned = tryDir(inputDir)
  if (turned) return turned

  // If turn blocked, try to continue in current direction
  const continued = tryDir(state.dir)
  if (continued) return continued

  // Completely blocked; update facing to input even if not moving (so UI rotates)
  return { ...state, dir: inputDir }
}
